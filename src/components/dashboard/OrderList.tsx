'use client'

import { Order, refreshActiveOrders } from '@/app/actions/orders'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Truck, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'

interface OrderListProps {
    orders: Order[]
}

export function OrderList({ orders }: OrderListProps) {
    const [refreshing, setRefreshing] = useState(false)

    async function handleRefresh() {
        setRefreshing(true)
        const res = await refreshActiveOrders()
        setRefreshing(false)
        if (res?.success) {
            toast.success(`Berhasil memperbarui ${res.data?.count || 0} paket!`)
        } else {
            toast.info('Tidak ada paket aktif untuk diperbarui.')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid': return <Badge className="bg-blue-500">Paid</Badge>
            case 'Shipped': return <Badge className="bg-yellow-500">Shipped</Badge>
            case 'Done': return <Badge className="bg-green-500">Done</Badge>
            case 'Returned': return <Badge variant="destructive">Returned</Badge>
            default: return <Badge variant="secondary">Unpaid</Badge>
        }
    }

    const getTrackingIcon = (status: string) => {
        if (status === 'DELIVERED') return <CheckCircle className="h-4 w-4 text-green-500" />
        if (status === 'PENDING') return <Clock className="h-4 w-4 text-gray-400" />
        return <Truck className="h-4 w-4 text-blue-500" />
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Status Paket
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Status Order</TableHead>
                            <TableHead>Logistik</TableHead>
                            <TableHead>Resi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex justify-center items-center h-full">
                                        <EmptyState
                                            title="Belum ada order"
                                            description="Mulai catat penjualanmu dan lacak paket secara otomatis."
                                            icon="package"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                                    <TableCell>{order.product_name}</TableCell>
                                    <TableCell>Rp {Number(order.price).toLocaleString('id-ID')}</TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getTrackingIcon(order.tracking_status)}
                                            <span className="text-xs uppercase">{order.tracking_status || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{order.resi_number || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
