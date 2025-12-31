'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==========================================
// TypeScript Interfaces
// ==========================================

interface OrderItem {
    id: string;
    product_name: string;
    product_type: string;
    qty: number;
    price_at_purchase: number;
    subtotal: number;
    status: string;
}

interface Order {
    id: string;
    trx_id: string;
    total_amount: number;
    payment_status: string;
    order_status: string;
    payment_method: string;
    tracking_number?: string;
    courier_used?: string;
    created_at: string;
    shipped_at?: string;
    completed_at?: string;
    marketplace_order_items: OrderItem[];
}

interface OrderListProps {
    userId: string;
}

// ==========================================
// OrderList Component
// ==========================================

export default function OrderList({ userId }: OrderListProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[OrderList] Fetching orders for user:', userId);

            const { data, error: fetchError } = await supabase
                .from('marketplace_orders')
                .select('*, marketplace_order_items(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            console.log('[OrderList] Found', data?.length || 0, 'orders');
            setOrders(data || []);

        } catch (err: any) {
            console.error('[OrderList] Error:', err);
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PENDING':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'CANCELED':
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return '✅';
            case 'SHIPPED':
                return '🚚';
            case 'PROCESSING':
                return '⏳';
            case 'PENDING':
                return '⏰';
            default:
                return '📦';
        }
    };

    const handleTrackPackage = (trackingNumber: string, courier: string) => {
        // Navigate to tracking page
        window.open(`/tracking?waybill=${trackingNumber}&courier=${courier.toLowerCase()}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading riwayat belanja...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-800">❌ {error}</p>
                <button
                    onClick={fetchOrders}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Belum ada pesanan</h3>
                <p className="text-gray-600 mb-4">Mulai belanja sekarang!</p>
                <a
                    href="/marketplace"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                    Browse Products
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Riwayat Pesanan</h2>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                    🔄 Refresh
                </button>
            </div>

            {orders.map((order) => (
                <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{order.trx_id}</h3>
                            <p className="text-xs text-gray-500">
                                {format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}
                            </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                    order.order_status
                                )}`}
                            >
                                {getStatusIcon(order.order_status)} {order.order_status}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                        {order.marketplace_order_items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm">
                                        {item.qty}x {item.product_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.product_type === 'PHYSICAL' ? '📦 Physical' : '⚡ Digital'} •
                                        Status: <span className="font-semibold">{item.status}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">
                                        Rp {item.subtotal.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        @Rp {item.price_at_purchase.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tracking Info */}
                    {order.tracking_number && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold mb-1">📍 Tracking Number</p>
                                    <p className="font-bold text-blue-900">{order.tracking_number}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Kurir: {order.courier_used?.toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleTrackPackage(order.tracking_number!, order.courier_used!)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Lacak Paket
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-600">Total Pembayaran</p>
                            <p className="text-2xl font-bold text-green-600">
                                Rp {order.total_amount.toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-gray-500">
                                via {order.payment_method} • {order.payment_status}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {order.order_status === 'COMPLETED' && (
                                <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700">
                                    ⭐ Review
                                </button>
                            )}
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded hover:bg-gray-300">
                                📄 Detail
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Load More (if needed) */}
            {orders.length >= 10 && (
                <div className="text-center pt-4">
                    <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        Load More Orders
                    </button>
                </div>
            )}
        </div>
    );
}

// ==========================================
// Export Component
// ==========================================

export type { Order, OrderItem, OrderListProps };
