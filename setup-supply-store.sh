#!/bin/bash

# =============================================================================
# Commerce: Internal Supply Store Setup
# =============================================================================

echo "Initializing Supply Store..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: supply_store_schema.sql"
cat <<EOF > supply_store_schema.sql
-- Products Table
CREATE TABLE IF NOT EXISTS public.supply_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(19,4) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT CHECK (category IN ('lakban', 'plastik', 'printer', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data (Idempotent)
INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Lakban Bening 100 Yard', 8000, 500, 'https://placehold.co/100?text=Lakban', 'lakban'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Lakban Bening 100 Yard');

INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Bubble Wrap 50m', 45000, 100, 'https://placehold.co/100?text=Bubble', 'plastik'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Bubble Wrap 50m');

INSERT INTO public.supply_products (name, price, stock, image_url, category)
SELECT 'Thermal Paper 100x150', 35000, 200, 'https://placehold.co/100?text=Label', 'printer'
WHERE NOT EXISTS (SELECT 1 FROM public.supply_products WHERE name = 'Thermal Paper 100x150');

-- Ledger Entries (Ensure it exists)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(19,4) NOT NULL, -- Negative for purchase
    description TEXT,
    type TEXT, -- PURCHASE, TOPUP, etc.
    reference_id UUID, -- Link to product/order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

# 2. UI Components
echo "2. Creating Components..."
mkdir -p src/components/supply

# QuickBuy Widget
cat <<EOF > src/components/supply/QuickBuyWidget.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShoppingCart, Package, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
}

export function QuickBuyWidget() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const { data } = await supabase.from('supply_products').select('*').limit(3);
        if (data) setProducts(data);
        setLoading(false);
    }

    async function handleBuy(product: Product) {
        setPurchasing(true);
        try {
            // Call API to process purchase
            const res = await fetch('/api/supply/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 })
            });
            const result = await res.json();
            
            if (result.success) {
                toast.success(\`Berhasil membeli \${product.name}\`);
            } else {
                toast.error(result.error || 'Gagal membeli');
            }
        } catch (e) {
            toast.error('Terjadi kesalahan');
        } finally {
            setPurchasing(false);
        }
    }

    if (loading) return <div className="p-4 bg-white rounded-lg shadow-sm animate-pulse h-40"></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Toko Perlengkapan
                </h3>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat Semua</span>
            </div>

            <div className="space-y-3">
                {products.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-md object-cover bg-gray-200" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">Rp {product.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                            onClick={() => handleBuy(product)}
                            disabled={purchasing}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
EOF

# 3. Checkout API
echo "3. Creating API: src/app/api/supply/checkout/route.ts"
mkdir -p src/app/api/supply/checkout

cat <<EOF > src/app/api/supply/checkout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity } = await request.json();

    // 1. Get Product
    const { data: product } = await supabase
        .from('supply_products')
        .select('*')
        .eq('id', productId)
        .single();

    if (!product || product.stock < quantity) {
        return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 });
    }

    const totalPrice = product.price * quantity;

    // 2. Transaction (Ideally use RPC/Transaction for atomicity)
    // Decrement Balance (Record Ledger)
    const { error: ledgerError } = await supabase.from('ledger_entries').insert({
        user_id: user.id,
        amount: -totalPrice,
        type: 'PURCHASE',
        description: \`Pembelian \${product.name} (x\${quantity})\`,
        reference_id: productId
    });

    if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 });
    
    // Decrement Stock
    await supabase.from('supply_products')
        .update({ stock: product.stock - quantity })
        .eq('id', productId);

    return NextResponse.json({ success: true });
}
EOF

echo ""
echo "================================================="
echo "Supply Store Setup Complete!"
echo "1. Run 'supply_store_schema.sql' in SQL Editor."
echo "2. Import <QuickBuyWidget /> in Dashboard."
