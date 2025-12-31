'use client'

import { BarcodeScanner } from '@/components/warehouse/BarcodeScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getWarehouseStats } from '@/app/actions/warehouse'

export default function WarehousePage() {
    const [stats, setStats] = useState({ todayIn: 0, todayOut: 0, lowStock: 0 })

    useEffect(() => {
        getWarehouseStats().then(data => setStats(data as any))
    }, [])

    return (
        <div className="container-custom py-8 space-y-6">
            <h1 className="text-3xl font-bold">Warehouse Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            Barang Masuk Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.todayIn}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                            <TrendingDown className="w-4 h-4" />
                            Barang Keluar Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.todayOut}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Stok Rendah
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.lowStock}</p>
                    </CardContent>
                </Card>
            </div>

            <BarcodeScanner />
        </div>
    )
}
