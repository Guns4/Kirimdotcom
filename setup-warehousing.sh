#!/bin/bash

# =============================================================================
# Storage Rental: Warehousing Setup (Task 85)
# =============================================================================

echo "Initializing Warehousing System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: warehousing_schema.sql"
cat <<EOF > warehousing_schema.sql
-- Warehouse Inventory (Users' stored items)
CREATE TABLE IF NOT EXISTS public.warehouse_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    sku TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    last_inbound_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sku)
);

-- Warehouse Logs (History of In/Out)
CREATE TABLE IF NOT EXISTS public.warehouse_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_id UUID REFERENCES public.warehouse_inventory(id),
    type TEXT CHECK (type IN ('INBOUND', 'OUTBOUND', 'ADJUSTMENT')),
    amount INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Log (To track daily deductions)
CREATE TABLE IF NOT EXISTS public.warehouse_billing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    total_items INTEGER NOT NULL,
    total_cost DECIMAL(19,4) NOT NULL,
    billed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

# 2. Inbound Scan API
echo "2. Creating API: src/app/api/warehousing/inbound/route.ts"
mkdir -p src/app/api/warehousing/inbound

cat <<EOF > src/app/api/warehousing/inbound/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Ideally, this endpoint is used by Warehouse Staff (Admin) scanning User's item
    // For demo, we assume User/Staff calls it with authorized session
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { targetUserId, sku, itemName, quantity } = body;

    if (!targetUserId || !sku || !quantity) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Upsert Inventory
    const { data: inventory, error } = await supabase
        .from('warehouse_inventory')
        .select('id, quantity')
        .eq('user_id', targetUserId)
        .eq('sku', sku)
        .single();

    let inventoryId = inventory?.id;
    let newQuantity = (inventory?.quantity || 0) + quantity;

    if (!inventory) {
        // Create new
        const { data: newInv, error: insertError } = await supabase
            .from('warehouse_inventory')
            .insert({
                user_id: targetUserId,
                sku,
                item_name: itemName || sku,
                quantity: quantity,
                last_inbound_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
        inventoryId = newInv.id;
    } else {
        // Update existing
        const { error: updateError } = await supabase
            .from('warehouse_inventory')
            .update({ 
                quantity: newQuantity,
                last_inbound_at: new Date().toISOString()
            })
            .eq('id', inventoryId);
            
        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Log Transaction
    await supabase.from('warehouse_logs').insert({
        inventory_id: inventoryId,
        type: 'INBOUND',
        amount: quantity,
        notes: \`Received by Staff \${user.email}\`
    });

    return NextResponse.json({ success: true, currentStock: newQuantity });
}
EOF

# 3. Daily Billing Cron (Auto-Deduct)
echo "3. Creating Cron: src/app/api/cron/billing/warehouse/route.ts"
mkdir -p src/app/api/cron/billing/warehouse

cat <<EOF > src/app/api/cron/billing/warehouse/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const COST_PER_ITEM = 200; // Rp 200 per item per day

    // 1. Get all active inventory grouped by user
    const { data: inventories } = await supabase
        .from('warehouse_inventory')
        .select('user_id, quantity')
        .gt('quantity', 0);

    if (!inventories || inventories.length === 0) {
        return NextResponse.json({ processed: 0 });
    }

    // Group by User
    const userTotals: Record<string, number> = {};
    inventories.forEach(inv => {
        userTotals[inv.user_id] = (userTotals[inv.user_id] || 0) + inv.quantity;
    });

    let processedCount = 0;

    // 2. Process Billing per User
    for (const [userId, totalItems] of Object.entries(userTotals)) {
        const dailyCost = totalItems * COST_PER_ITEM;

        // Deduct Wallet
        const { error: ledgerError } = await supabase.from('ledger_entries').insert({
            user_id: userId,
            amount: -dailyCost,
            type: 'WAREHOUSE_FEE',
            description: \`Sewa Gudang Harian (\${totalItems} items)\`
        } as any);

        if (!ledgerError) {
            // Log Billing
            await supabase.from('warehouse_billing_logs').insert({
                user_id: userId,
                total_items: totalItems,
                total_cost: dailyCost
            });
            processedCount++;
        }
    }

    return NextResponse.json({ 
        success: true, 
        processedUsers: processedCount, 
        rate: COST_PER_ITEM 
    });
}
EOF

# 4. Inbound Scanner Component
echo "4. Creating Component: src/components/warehousing/InboundScanner.tsx"
mkdir -p src/components/warehousing

cat <<EOF > src/components/warehousing/InboundScanner.tsx
'use client';

import { useState } from 'react';
import { Scan, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';

export function InboundScanner() {
    const [sku, setSku] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    // Mock Target User (Seller) for demo purposes
    // In real app, you'd select from a list or scan a user QR too
    const targetUserId = '00000000-0000-0000-0000-000000000000'; 

    async function handleInbound() {
        if (!sku) return toast.error('Masukkan SKU');
        
        setLoading(true);
        try {
            const res = await fetch('/api/warehousing/inbound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId,
                    sku,
                    itemName: \`Item \${sku}\`, // Auto-name for demo
                    quantity: Number(qty)
                })
            });
            
            const data = await res.json();
            if (data.success) {
                toast.success(\`Inbound Sukses! Stok Skrg: \${data.currentStock}\`);
                setSku(''); // Reset for next scan
            } else {
                toast.error('Gagal: ' + data.error);
            }
        } catch (e) {
            toast.error('Scan Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600" /> Inbound Scanner
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Scan SKU / Barcode</label>
                    <input 
                        type="text" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Scan here..."
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="text-sm font-medium text-gray-700">Jumlah (Qty)</label>
                    <input 
                        type="number" 
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="w-full mt-1 p-2 border rounded-lg"
                        min="1"
                    />
                </div>

                <button 
                    onClick={handleInbound}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                >
                    {loading ? 'Processing...' : <><PackagePlus className="w-4 h-4" /> Masuk Gudang</>}
                </button>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Warehousing Setup Complete!"
echo "1. Run 'warehousing_schema.sql'."
echo "2. Use <InboundScanner /> for receiving items."
