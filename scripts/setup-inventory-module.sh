#!/bin/bash

# Setup Inventory Module
echo "🚀 Setting up Inventory Management Module..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_inventory.sql
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    stock INTEGER DEFAULT 0,
    min_stock_alert INTEGER DEFAULT 5,
    price NUMERIC DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sku)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own products" ON products
    FOR ALL USING (auth.uid() = user_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/inventory.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const ProductSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    stock: z.number().min(0),
    min_stock_alert: z.number().min(0),
    price: z.number().min(0),
    description: z.string().optional(),
})

export const getProducts = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('*').order('name')
    return data || []
}

export const upsertProduct = async (data: z.infer<typeof ProductSchema> & { id?: string }) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const payload: any = { ...data, user_id: user.id }
        if (data.id) payload.id = data.id

        const { error } = await supabase.from('products').upsert(payload)
        
        if (error) throw error
        revalidatePath('/dashboard/inventory')
        return { success: true }
    })
}

export const deleteProduct = async (id: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/inventory')
        return { success: true }
    })
}

export const updateStock = async (id: string, adjustment: number) => {
    return safeAction(async () => {
        const supabase = await createClient()
        
        // Using RPC or raw SQL is safer for atomic updates, but for Lite version fetch-update is acceptable
        const { data: product } = await supabase.from('products').select('stock').eq('id', id).single()
        if (!product) throw new Error('Product not found')
        
        const newStock = Math.max(0, product.stock + adjustment)
        
        const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', id)
        if (error) throw error
        
        revalidatePath('/dashboard/inventory')
        return { success: true, newStock }
    })
}
EOF

# 3. Create UI Components
echo "🎨 Creating UI Components..."
mkdir -p src/components/inventory
cat << 'EOF' > src/components/inventory/ProductForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { upsertProduct } from '@/app/actions/inventory'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

export function ProductForm({ product, onSuccess }: { product?: any, onSuccess?: () => void }) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        id: product?.id,
        sku: product?.sku || '',
        name: product?.name || '',
        stock: product?.stock || 0,
        min_stock_alert: product?.min_stock_alert || 5,
        price: product?.price || 0,
        description: product?.description || ''
    })

    const handleSubmit = async () => {
        const res = await upsertProduct(formData)
        if (res.success) {
            toast.success('Product saved')
            setOpen(false)
            if (onSuccess) onSuccess()
        } else {
            toast.error('Failed to save product')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={product ? "ghost" : "default"}>{product ? "Edit" : "Add Product"}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="E.g. ITEM-001" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price (Rp)</Label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min. Stock Alert</Label>
                            <Input type="number" value={formData.min_stock_alert} onChange={e => setFormData({...formData, min_stock_alert: Number(e.target.value)})} />
                        </div>
                    </div>
                    <Button onClick={handleSubmit} className="w-full">Save Product</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
EOF

# 4. Create Page
mkdir -p src/app/dashboard/inventory
cat << 'EOF' > src/app/dashboard/inventory/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { getProducts, updateStock, deleteProduct } from '@/app/actions/inventory'
import { ProductForm } from '@/components/inventory/ProductForm'
import { Package, AlertTriangle, Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/badge'

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadProducts = async () => {
        setIsLoading(true)
        const data = await getProducts()
        setProducts(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const handleStockAdjustment = async (id: string, amount: number) => {
        await updateStock(id, amount)
        loadProducts()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Inventory Lite</h1>
                <ProductForm onSuccess={loadProducts} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-100 dark:bg-blue-900/20">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </Card>
                <Card className="p-4 bg-orange-50 border-orange-100 dark:bg-orange-900/20">
                    <p className="text-sm text-gray-500">Low Stock Alert</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {products.filter(p => p.stock <= p.min_stock_alert).length}
                    </p>
                </Card>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : products.length === 0 ? (
                <EmptyState
                    title="No Items"
                    description="Start tracking your stock by adding products."
                    icon={Package}
                    action={{ label: "Add First Product", onClick: () => {} }} // Handled by top button
                />
            ) : (
                <div className="grid gap-4">
                    {products.map(product => (
                        <Card key={product.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-lg ${product.stock <= product.min_stock_alert ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        {product.stock <= product.min_stock_alert && (
                                            <Badge variant="destructive" className="flex items-center gap-1 text-[10px] h-5 px-1.5">
                                                <AlertTriangle className="w-3 h-3" /> Low Stock
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 font-mono">{product.sku} • Rp {product.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 border">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStockAdjustment(product.id, -1)}>
                                        <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className={`w-12 text-center font-bold ${product.stock <= product.min_stock_alert ? 'text-red-600' : ''}`}>
                                        {product.stock}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStockAdjustment(product.id, 1)}>
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>
                                <ProductForm product={product} onSuccess={loadProducts} />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-400 hover:text-red-600"
                                    onClick={async () => {
                                        if(confirm('Delete product?')) {
                                            await deleteProduct(product.id);
                                            loadProducts();
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
EOF

echo "✅ Inventory Module Setup Complete!"
