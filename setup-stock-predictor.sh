#!/bin/bash

# =============================================================================
# Seller Assistant AI (Stock Predictor)
# =============================================================================

echo "Initializing Stock Prediction Engine..."
echo "================================================="

# 1. Database Logic (SQL View)
echo "1. Generating SQL Schema: stock_prediction_schema.sql"
cat <<EOF > stock_prediction_schema.sql
-- Assumption: You have 'products' and 'order_items' tables.
-- If not, please adjust the table names in this view.

CREATE OR REPLACE VIEW public.inventory_forecast AS
WITH daily_sales_last_7_days AS (
    SELECT 
        product_id, 
        SUM(quantity) as total_sold
    FROM public.order_items
    JOIN public.orders ON order_items.order_id = orders.id
    WHERE orders.created_at >= (now() - interval '7 days')
      AND orders.status = 'COMPLETED' -- Only count actual sales
    GROUP BY product_id
),
product_velocity AS (
    SELECT
        p.id as product_id,
        p.name as product_name,
        p.stock as current_stock,
        p.image_url,
        -- Calculate Daily Average (Moving Average 7-Day)
        COALESCE(ds.total_sold, 0) / 7.0 as daily_run_rate
    FROM public.products p
    LEFT JOIN daily_sales_last_7_days ds ON p.id = ds.product_id
)
SELECT
    product_id,
    product_name,
    current_stock,
    image_url,
    ROUND(daily_run_rate, 2) as daily_run_rate,
    
    -- Calculation: Days Until Out of Stock
    CASE 
        WHEN daily_run_rate <= 0 THEN 999 -- No sales, safe
        ELSE FLOOR(current_stock / daily_run_rate)::integer
    END as days_remaining,
    
    -- Alert Flag
    CASE 
        WHEN daily_run_rate > 0 AND (current_stock / daily_run_rate) < 3 THEN 'CRITICAL'
        WHEN daily_run_rate > 0 AND (current_stock / daily_run_rate) < 7 THEN 'WARNING'
        ELSE 'SAFE'
    END as status

FROM product_velocity
WHERE daily_run_rate > 0; -- Only analyze active products

-- Grant access
GRANT SELECT ON public.inventory_forecast TO authenticated;
EOF
echo "   [?] Schema (View) created."

# 2. UI Widget
echo "2. Creating Dashboard Widget: src/components/inventory/StockAlertWidget.tsx"
mkdir -p src/components/inventory

cat <<EOF > src/components/inventory/StockAlertWidget.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StockForecast {
    product_id: string;
    product_name: string;
    current_stock: number;
    days_remaining: number;
    status: 'CRITICAL' | 'WARNING';
}

export function StockAlertWidget() {
    const [alerts, setAlerts] = useState<StockForecast[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForecast = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('inventory_forecast')
                .select('*')
                .in('status', ['CRITICAL', 'WARNING'])
                .order('days_remaining', { ascending: true })
                .limit(5);

            if (data) setAlerts(data as StockForecast[]);
            setLoading(false);
        };

        fetchForecast();
    }, []);

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;
    if (alerts.length === 0) return null; // No alerts, hide widget

    return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-red-900">Restock Alert</h3>
                    <p className="text-xs text-red-700">Stok menipis berdasarkan kecepatan penjualan.</p>
                </div>
            </div>

            <div className="space-y-2">
                {alerts.map((item) => (
                    <div 
                        key={item.product_id}
                        className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded">
                                <Package className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-900">{item.product_name}</p>
                                <p className="text-xs text-gray-500">
                                    Sisa Stok: <span className="font-mono font-bold">{item.current_stock}</span>
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                <TrendingDown className="w-3.5 h-3.5" />
                                {item.days_remaining} Hari
                            </div>
                            <p className="text-[10px] text-red-400">Estimasi Habis</p>
                        </div>
                    </div>
                ))}
            </div>

            <Link 
                href="/dashboard/inventory" 
                className="mt-3 block text-center text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
                Lihat Semua Inventory
            </Link>
        </div>
    );
}
EOF
echo "   [?] Widget created."

echo ""
echo "================================================="
echo "Stock Predictor Setup Complete!"
echo "1. Run 'stock_prediction_schema.sql' in Supabase."
echo "   (Make sure 'products' and 'order_items' tables exist)"
echo "2. Import <StockAlertWidget /> in your Seller Dashboard."
