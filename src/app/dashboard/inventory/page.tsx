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
    }, []);  

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
                    action={{ label: "Add First Product", onClick: () => { } }} // Handled by top button
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
                                        if (confirm('Delete product?')) {
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
