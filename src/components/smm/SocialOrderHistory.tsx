'use client';

import { useState, useEffect } from 'react';
import {
    Package, RefreshCw, Clock, CheckCircle,
    XCircle, Loader2, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    getStatusColor,
    formatPrice,
    type SocialOrder
} from '@/lib/social-store';

// Mock orders for demo
const MOCK_ORDERS: SocialOrder[] = [
    {
        id: 'ORD-001',
        userId: 'user1',
        productId: 'ig-fol-1k',
        targetUrl: 'https://instagram.com/example',
        quantity: 1000,
        price: 15000,
        status: 'COMPLETED',
        providerOrderId: 'P001',
        startCount: 100,
        currentCount: 1100,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
    },
    {
        id: 'ORD-002',
        userId: 'user1',
        productId: 'tt-like-500',
        targetUrl: 'https://tiktok.com/@example/video/123',
        quantity: 500,
        price: 4000,
        status: 'IN_PROGRESS',
        providerOrderId: 'P002',
        startCount: 50,
        currentCount: 320,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date()
    },
    {
        id: 'ORD-003',
        userId: 'user1',
        productId: 'g-review-5',
        targetUrl: 'https://maps.google.com/place/example',
        quantity: 5,
        price: 100000,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

export default function SocialOrderHistory() {
    const [orders, setOrders] = useState<SocialOrder[]>(MOCK_ORDERS);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // In production: Call API to refresh order statuses
        await new Promise(r => setTimeout(r, 1000));
        setRefreshing(false);
    };

    const getStatusIcon = (status: SocialOrder['status']) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'IN_PROGRESS': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'PROCESSING': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'CANCELLED':
            case 'REFUNDED': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Riwayat Pesanan
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Status
                </Button>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada pesanan</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => (
                        <Card key={order.id}>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="font-medium">{order.id}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <a
                                                    href={order.targetUrl}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="hover:underline flex items-center gap-1"
                                                >
                                                    {order.targetUrl.slice(0, 40)}...
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold">{formatPrice(order.price)}</div>
                                            <div className="text-sm text-gray-500">
                                                {order.quantity.toLocaleString()} items
                                            </div>
                                        </div>

                                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress for in-progress orders */}
                                {order.status === 'IN_PROGRESS' && order.startCount !== undefined && order.currentCount !== undefined && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{order.currentCount - order.startCount} / {order.quantity}</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, ((order.currentCount - order.startCount) / order.quantity) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-gray-400">
                                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
