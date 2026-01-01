'use client';
import { useState, useEffect } from 'react';

export default function UsageSummary() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Get current user
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch usage stats
            const res = await fetch(`/api/console/stats?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-3 bg-slate-100 rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-slate-100 rounded"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                </div>
            </div>
        );
    }

    const limit = stats?.quota_limit || 10000;
    const used = stats?.month_requests || 0;
    const percentage = (used / limit) * 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Penggunaan Bulan Ini</h3>
                <span className="text-sm font-medium text-slate-500">Resets on {stats?.reset_date || 'Feb 1'}</span>
            </div>

            <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-slate-700">{used.toLocaleString()} Requests</span>
                <span className="text-slate-400">Limit: {limit.toLocaleString()}</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Success Rate</p>
                    <p className="text-lg font-bold text-green-600">{stats?.success_rate || 100}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Avg Latency</p>
                    <p className="text-lg font-bold text-blue-600">{stats?.avg_response_time || 150}ms</p>
                </div>
            </div>
        </div>
    );
}
