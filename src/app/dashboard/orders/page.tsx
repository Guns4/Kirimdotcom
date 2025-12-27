import { getOrders } from '@/app/actions/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateOrderDialog } from '@/components/dashboard/CreateOrderDialog'
import { OrderList } from '@/components/dashboard/OrderList'
import { DollarSign, Package, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrderDashboard() {
    const { data: orders, stats } = await getOrders()

    return (
        <div className="container max-w-6xl py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                    <p className="text-muted-foreground">Catat penjualan dan pantau paket secara otomatis.</p>
                </div>
                <CreateOrderDialog />
            </div>

            {/* Financial Recap */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Omzet</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {stats.revenue.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">Order Paid + Done</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paket Aktif</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Sedang dalam proses pengiriman</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paket Bermasalah</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.returned}</div>
                        <p className="text-xs text-muted-foreground">Retur atau Gagal Kirim</p>
                    </CardContent>
                </Card>
            </div>

            <OrderList orders={orders} />
        </div>
    )
}
