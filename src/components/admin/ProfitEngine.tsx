'use client';
import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, TrendingDown, PieChart } from 'lucide-react';

export default function ProfitEngine({ adminKey }: { adminKey: string }) {
    const [profit, setProfit] = useState<any>({
        total_revenue: 0,
        total_cost: 0,
        net_profit: 0,
        profit_margin: 0
    });
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState('30'); // days

    const fetchProfit = async () => {
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(dateRange));

            const params = new URLSearchParams({
                start_date: startDate.toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
            });

            const res = await fetch(`/api/admin/analytics/profit?${params}`, {
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                const data = await res.json();
                setProfit(data);
            }
        } catch (error) {
            console.error('Failed to fetch profit:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchProfit();
    }, [adminKey, dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp size={24} /> Profit Intelligence Engine
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Real profit calculation: Revenue - Costs
                    </p>
                </div>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>

            {/* BIG NET PROFIT CARD */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-2xl shadow-2xl text-white">
                <div className="text-sm font-bold opacity-90 mb-2">NET PROFIT ({dateRange} DAYS)</div>
                <div className="text-5xl font-black mb-4">
                    {formatCurrency(profit.net_profit || 0)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <PieChart size={16} />
                    <span>Profit Margin: {(profit.profit_margin || 0).toFixed(2)}%</span>
                </div>
            </div>

            {/* BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-blue-600 font-bold text-sm mb-1">TOTAL REVENUE</div>
                            <div className="text-3xl font-black text-blue-900">
                                {formatCurrency(profit.total_revenue || 0)}
                            </div>
                        </div>
                        <DollarSign className="text-blue-600" size={32} />
                    </div>
                    <div className="text-xs text-blue-700">
                        Total sales from all orders
                    </div>
                </div>

                <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-red-600 font-bold text-sm mb-1">TOTAL COSTS</div>
                            <div className="text-3xl font-black text-red-900">
                                {formatCurrency(profit.total_cost || 0)}
                            </div>
                        </div>
                        <TrendingDown className="text-red-600" size={32} />
                    </div>
                    <div className="text-xs text-red-700">
                        Base cost of goods sold (COGS)
                    </div>
                </div>
            </div>

            {/* FORMULA EXPLANATION */}
            <div className="bg-slate-50 p-6 rounded-xl border">
                <h4 className="font-bold text-slate-800 mb-3">📊 Profit Calculation Formula</h4>
                <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                        <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                            Revenue
                        </code>
                        <span>=</span>
                        <span>Sum of all completed order totals</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-red-100 px-2 py-1 rounded text-red-800">
                            Costs
                        </code>
                        <span>=</span>
                        <span>Sum of (base_price × quantity) for all products</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                            Net Profit
                        </code>
                        <span>=</span>
                        <span>Revenue - Costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="bg-purple-100 px-2 py-1 rounded text-purple-800">
                            Margin %
                        </code>
                        <span>=</span>
                        <span>(Net Profit / Revenue) × 100</span>
                    </div>
                </div>
            </div>

            {/* PRO TIPS */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <strong>💡 Pro Tips:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Target profit margin: 30-50% for healthy business</li>
                    <li>If margin &lt; 20%, review your pricing or suppliers</li>
                    <li>Track weekly to spot trends early</li>
                </ul>
            </div>
        </div>
    );
}
