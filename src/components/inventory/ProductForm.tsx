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
                <Button variant={product ? "ghost" : "primary"}>{product ? "Edit" : "Add Product"}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="E.g. ITEM-001" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Product Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Price (Rp)</Label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Min. Stock Alert</Label>
                            <Input type="number" value={formData.min_stock_alert} onChange={e => setFormData({ ...formData, min_stock_alert: Number(e.target.value) })} />
                        </div>
                    </div>
                    <Button onClick={handleSubmit} className="w-full">Save Product</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
