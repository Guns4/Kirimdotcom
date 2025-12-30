'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Package, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StockForecast {
    product_id: string;
    product_name: string;
    current_stock: number;
    days_remaining: number;
    daily_run_rate: number;
    recommended_restock: number;
    status: 'CRITICAL' | 'WARNING' | 'SAFE';
}

export function StockAlertWidget() {
    const [alerts, setAlerts] = useState<StockForecast[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchForecast = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data } = await (supabase as any)
            .from('inventory_forecast')
            .select('*')
            .in('status', ['CRITICAL', 'WARNING'])
            .order('days_remaining', { ascending: true })
            .limit(5);

        if (data) setAlerts(data as StockForecast[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchForecast();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-900">Stok Aman</h3>
                        <p className="text-xs text-green-700">Semua produk memiliki stok yang cukup.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">Restock Alert</h3>
                        <p className="text-xs text-red-700">Stok menipis berdasarkan kecepatan penjualan.</p>
                    </div>
                </div>
                <button
                    onClick={fetchForecast}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4 text-red-600" />
                </button>
            </div>

            <div className="space-y-2">
                {alerts.map((item) => (
                    <div
                        key={item.product_id}
                        className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded ${item.status === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                <Package className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product_name}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span>
                                        Sisa: <span className="font-mono font-bold text-gray-700">{item.current_stock}</span>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Laju: <span className="font-mono font-bold text-gray-700">{item.daily_run_rate.toFixed(1)}/hari</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right ml-3">
                            <div className={`flex items-center gap-1 font-bold text-sm ${item.status === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'}`}>
                                <TrendingDown className="w-3.5 h-3.5" />
                                {item.days_remaining} Hari
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                Restock: {item.recommended_restock} unit
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href="/dashboard/inventory"
                className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
                Lihat Semua Inventory
                <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
