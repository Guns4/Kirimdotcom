#!/bin/bash

# =============================================================================
# Startup Valuation & Health Dashboard (CEO View)
# =============================================================================

echo "Initializing Valuation Metrics Dashboard..."
echo "================================================="

# 1. Database Logic (SQL Metrics)
echo "1. Generating SQL Schema: valuation_metrics.sql"
cat <<EOF > valuation_metrics.sql
-- 1. Create Subscriptions Table (If not exists, for context)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    plan_name text,
    status text, -- 'active', 'cancelled', 'past_due'
    amount numeric, -- Monthly price
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. View: Monthly Metrics (MRR, Active Users)
CREATE OR REPLACE VIEW public.saas_monthly_metrics AS
WITH monthly_data AS (
    SELECT
        date_trunc('month', created_at) as month,
        COUNT(DISTINCT user_id) FILTER (WHERE status = 'active') as active_users,
        COUNT(DISTINCT user_id) FILTER (WHERE status = 'cancelled' AND date_trunc('month', end_date) = date_trunc('month', created_at)) as churned_users,
        SUM(amount) FILTER (WHERE status = 'active') as mrr
    FROM public.subscriptions
    WHERE created_at >= (now() - interval '12 months')
    GROUP BY 1
)
SELECT
    month,
    COALESCE(mrr, 0) as mrr,
    COALESCE(active_users, 0) as active_users,
    
    -- Calculate ARPU
    CASE 
        WHEN active_users > 0 THEN ROUND(COALESCE(mrr, 0) / active_users, 0)
        ELSE 0 
    END as arpu,
    
    -- Calculate Churn Rate (%)
    CASE 
        WHEN (active_users + churned_users) > 0 THEN 
            ROUND((churned_users::numeric / NULLIF(active_users + churned_users, 0)) * 100, 2)
        ELSE 0 
    END as churn_rate
FROM monthly_data
ORDER BY month ASC;

-- Grant access
GRANT SELECT ON public.saas_monthly_metrics TO authenticated;
EOF
echo "   [?] Schema created."

# 2. UI Dashboard Component
echo "2. Creating Dashboard Component: src/components/analytics/ValuationDashboard.tsx"
mkdir -p src/components/analytics

cat <<EOF > src/components/analytics/ValuationDashboard.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency'; // Assumes you ran setup-i18n-structure.sh

interface MetricData {
    month: string;
    mrr: number;
    active_users: number;
    arpu: number;
    churn_rate: number;
}

export function ValuationDashboard() {
    const [data, setData] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('saas_monthly_metrics')
                .select('*')
                .order('month', { ascending: true }); // 12 month trend

            if (data) {
                // Format month for chart
                const formattedData = data.map(item => ({
                    ...item,
                    displayMonth: new Date(item.month).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
                }));
                setData(formattedData);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Helper to get latest metrics
    const latest = data[data.length - 1] || { mrr: 0, churn_rate: 0, arpu: 0 };
    const previous = data[data.length - 2] || { mrr: 0 };
    const mrrGrowth = previous.mrr > 0 ? ((latest.mrr - previous.mrr) / previous.mrr) * 100 : 0;

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Financial Data...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Financial Health (CEO View)</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    Live Data
                </span>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. MRR */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={\`flex items-center text-xs font-bold \${mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
                            {mrrGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {Math.abs(mrrGrowth).toFixed(1)}% vs Last Month
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Monthly Recurring Revenue (MRR)</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {formatCurrency({ amount: latest.mrr, currency: 'IDR' })}
                    </h3>
                </div>

                {/* 2. ARPU */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Avg. Revenue Per User (ARPU)</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {formatCurrency({ amount: latest.arpu, currency: 'IDR' })}
                    </h3>
                </div>

                {/* 3. Churn Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <Activity className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            Target: &lt; 2%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Monthly Churn Rate</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                        {latest.churn_rate}%
                    </h3>
                </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    MRR Growth (Last 12 Months)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="displayMonth" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                fontSize={12}
                                tickFormatter={(val) => \`\${val / 1000000}M\`}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                formatter={(val: number) => formatCurrency({ amount: val })}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="mrr" 
                                stroke="#2563eb" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorMrr)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [?] Dashboard Component created."

echo ""
echo "================================================="
echo "Valuation Dashboard Setup Complete!"
echo "1. Run 'valuation_metrics.sql' in Supabase to create the analytics view."
echo "2. Add '<ValuationDashboard />' to your Admin Dashboard."
echo "   (Make sure 'recharts' is installed: npm i recharts)"
