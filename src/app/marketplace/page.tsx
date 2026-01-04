'use client'

import { useState, useEffect } from 'react'
import { getVendors } from '@/app/actions/marketplace'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Camera, PenTool, Box, UserCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MarketplacePage() {
    const [vendors, setVendors] = useState<any[]>([])
    const [category, setCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    const loadVendors = async () => {
        setLoading(true)
        const data = await getVendors(category)
        setVendors(data)
        setLoading(false)
    }

    useEffect(() => {
        loadVendors()
    }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

    const categories = [
        { id: 'All', label: 'Semua', icon: null },
        { id: 'Photographer', label: 'Foto Produk', icon: Camera },
        { id: 'Designer', label: 'Desain Logo', icon: PenTool },
        { id: 'Packaging', label: 'Supplier Packing', icon: Box },
        { id: 'Admin', label: 'Jasa Admin', icon: UserCheck },
    ]

    return (
        <div className="space-y-6 container-custom py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Seller Marketplace
                    </h1>
                    <p className="text-muted-foreground">Temukan jasa profesional untuk menumbuhkan bisnis Anda.</p>
                </div>
                <Button>Daftar sebagai Vendor</Button>
            </div>

            <Tabs defaultValue="All" onValueChange={setCategory}>
                <TabsList className="bg-white/50 backdrop-blur-sm border">
                    {categories.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                            {cat.icon && <cat.icon className="w-4 h-4" />}
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {loading ? (
                <div>Loading...</div>
            ) : vendors.length === 0 ? (
                <EmptyState title="Belum ada Vendor" description="Jadilah yang pertama membuka jasa di sini!" icon={UserCheck} />
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {vendors.map(vendor => (
                        <Card key={vendor.id} className="hover:shadow-lg transition-all border-indigo-50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary">{vendor.category}</Badge>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        {vendor.rating}
                                    </div>
                                </div>
                                <CardTitle className="text-xl mt-2">{vendor.business_name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {vendor.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {vendor.vendor_services?.slice(0, 2).map((svc: any) => (
                                        <div key={svc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                            <span>{svc.title}</span>
                                            <span className="font-semibold text-indigo-600">
                                                Rp {svc.price.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    <Button className="w-full mt-4" variant="outline">
                                        Lihat Profil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
