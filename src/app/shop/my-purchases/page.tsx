'use client'

import { useEffect, useState } from 'react'
import { getUserPurchases } from '@/app/actions/digital-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Package, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function MyPurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPurchases()
    }, [])

    const loadPurchases = async () => {
        setLoading(true)
        const result = await getUserPurchases()
        if (result?.data) {
            setPurchases(result.data)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="container-custom py-8">Loading...</div>
    }

    return (
        <div className="container-custom py-8 space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="w-8 h-8" />
                My Purchases
            </h1>

            {purchases.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>You haven&apos;t purchased any digital products yet</p>
                        <Link href="/shop">
                            <Button className="mt-4">Browse Store</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {purchases.map(purchase => (
                        <Card key={purchase.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle>{purchase.digital_products.title}</CardTitle>
                                    <Badge className="bg-green-500">Paid</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Download className="w-4 h-4" />
                                    Downloaded: {purchase.download_count} times
                                </div>
                                <Link href={`/shop/download/${purchase.product_id}`}>
                                    <Button className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Again
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
