'use client'

import { useEffect, useState } from 'react'
import { getDigitalProducts, purchaseProduct, checkUserPurchase } from '@/app/actions/digital-store'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Download, FileText, FileSpreadsheet, Palette, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DigitalShopPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set())

    const loadProducts = async () => {
        setLoading(true)
        const result = await getDigitalProducts()
        if (result?.data) {
            setProducts(result.data)

            // Check purchase status for each product
            const purchased = new Set<string>()
            for (const product of result.data) {
                const checkResult = await checkUserPurchase(product.id)
                if (checkResult?.data?.purchased) {
                    purchased.add(product.id)
                }
            }
            setPurchasedIds(purchased)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadProducts()
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePurchase = async (productId: string, productTitle: string) => {
        try {
            const result = await purchaseProduct(productId)
            if (result?.data?.success) {
                toast.success(`Successfully purchased: ${productTitle}`)
                setPurchasedIds(prev => new Set(prev).add(productId))
            }
        } catch (error: any) {
            toast.error(error.message || 'Purchase failed')
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ebook': return <FileText className="w-5 h-5" />
            case 'template': return <FileSpreadsheet className="w-5 h-5" />
            case 'design': return <Palette className="w-5 h-5" />
            default: return <FileText className="w-5 h-5" />
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price)
    }

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container-custom py-8 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <ShoppingCart className="w-10 h-10" />
                    Digital Store
                </h1>
                <p className="mt-2 text-indigo-100">
                    E-books, Templates, dan Desain untuk UMKM
                </p>
            </div>

            {/* Quick Link to Purchases */}
            <div className="flex justify-end">
                <Link href="/shop/my-purchases">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        My Purchases
                    </Button>
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                    const isPurchased = purchasedIds.has(product.id)

                    return (
                        <Card key={product.id} className="hover:shadow-lg transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(product.category)}
                                        <Badge variant="outline" className="capitalize">
                                            {product.category}
                                        </Badge>
                                    </div>
                                    {isPurchased && (
                                        <Badge className="bg-green-500">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Owned
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="mt-3">{product.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                    {product.description}
                                </p>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {formatPrice(product.price)}
                                    </p>
                                    {product.download_count > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {product.download_count} downloads
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isPurchased ? (
                                    <Link href={`/shop/download/${product.id}`} className="w-full">
                                        <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                                            <Download className="w-4 h-4" />
                                            Download Now
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        onClick={() => handlePurchase(product.id, product.title)}
                                        className="w-full gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Buy Now
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No products available at the moment</p>
                </div>
            )}
        </div>
    )
}
