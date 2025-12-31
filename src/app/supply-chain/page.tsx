'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, Package, Map } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dynamic import to avoid SSR issues with Three.js
const SupplyChainGlobe = dynamic(
    () => import('@/components/visualization/SupplyChainGlobe').then(mod => mod.SupplyChainGlobe),
    { ssr: false, loading: () => <div className="h-[600px] bg-slate-800 rounded-xl animate-pulse" /> }
)

const SupplyChainMap = dynamic(
    () => import('@/components/visualization/SupplyChainMap').then(mod => mod.SupplyChainMap),
    { ssr: false }
)

export default function SupplyChainPage() {
    return (
        <div className="container-custom py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-600" />
                        3D Supply Chain Visualization
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor global logistics routes in real-time
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Active Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">234</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Active Routes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">12</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Avg Transit Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">3.5d</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="3d" className="w-full">
                <TabsList>
                    <TabsTrigger value="3d">3D Globe View</TabsTrigger>
                    <TabsTrigger value="2d">2D Map View</TabsTrigger>
                </TabsList>
                <TabsContent value="3d">
                    <SupplyChainGlobe />
                </TabsContent>
                <TabsContent value="2d">
                    <SupplyChainMap />
                </TabsContent>
            </Tabs>
        </div>
    )
}
