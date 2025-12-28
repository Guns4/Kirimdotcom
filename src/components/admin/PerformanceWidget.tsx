'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Activity, Zap, Download } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data mechanism until we have real aggregations
// Ideally this would be a server action, keeping it client-side heavy for MVP as requested by 'user preference' pattern seen so far
// BUT, to be performant, let's just fetch last few events and avg them or show placeholder

export default function PerformanceWidget() {
    const [metrics, setMetrics] = useState<any>({
        LCP: { value: 0, count: 0 },
        CLS: { value: 0, count: 0 },
        INP: { value: 0, count: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            const supabase = createClient();

            // Fetch last 100 vital events
            const { data } = await supabase
                .from('analytics_events')
                .select('properties')
                .eq('event_name', 'web_vitals')
                .order('created_at', { ascending: false })
                .limit(200);

            if (data && data.length > 0) {
                const newMetrics = {
                    LCP: { value: 0, count: 0 },
                    CLS: { value: 0, count: 0 },
                    INP: { value: 0, count: 0 }
                };

                data.forEach((row: any) => {
                    const p = row.properties;
                    if (p && p.metric_name && newMetrics[p.metric_name as keyof typeof newMetrics]) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        newMetrics[p.metric_name].value += Number(p.value);
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        newMetrics[p.metric_name].count += 1;
                    }
                });

                // Calculate averages
                setMetrics({
                    LCP: {
                        value: newMetrics.LCP.count ? Math.round(newMetrics.LCP.value / newMetrics.LCP.count) : 0,
                        count: newMetrics.LCP.count
                    },
                    CLS: {
                        value: newMetrics.CLS.count ? (newMetrics.CLS.value / newMetrics.CLS.count / 1000).toFixed(3) : 0,
                        count: newMetrics.CLS.count
                    }, // Remember we normalized CLS * 1000
                    INP: {
                        value: newMetrics.INP.count ? Math.round(newMetrics.INP.value / newMetrics.INP.count) : 0,
                        count: newMetrics.INP.count
                    }
                });
            }
            setLoading(false);
        };

        fetchMetrics();
    }, []);

    const getStatus = (metric: string, value: number) => {
        if (metric === 'LCP') return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
        if (metric === 'CLS') return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
        if (metric === 'INP') return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
        return 'unknown';
    };

    const getColor = (status: string) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-50 border-green-200';
            case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'poor': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-3 lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Core Web Vitals (Real-time)
            </h3>

            <div className="space-y-4">
                <MetricRow
                    label="LCP (Loading)"
                    sub="Largest Contentful Paint"
                    value={metrics.LCP.value ? `${(metrics.LCP.value / 1000).toFixed(1)}s` : '-'}
                    status={getStatus('LCP', metrics.LCP.value)}
                    icon={Download}
                    getColor={getColor}
                />

                <MetricRow
                    label="INP (Interactivity)"
                    sub="Interaction to Next Paint"
                    value={metrics.INP.value ? `${metrics.INP.value}ms` : '-'}
                    status={getStatus('INP', metrics.INP.value)}
                    icon={Zap}
                    getColor={getColor}
                />

                <MetricRow
                    label="CLS (Stability)"
                    sub="Cumulative Layout Shift"
                    value={metrics.CLS.value || '-'}
                    status={getStatus('CLS', Number(metrics.CLS.value))}
                    icon={Activity}
                    getColor={getColor}
                />
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">Based on last {metrics.LCP.count + metrics.CLS.count + metrics.INP.count} events</p>
            </div>
        </div>
    );
}

function MetricRow({ label, sub, value, status, icon: Icon, getColor }: any) {
    const colorClasses = getColor(status);

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/50 rounded-lg">
                    <Icon className="w-5 h-5 opacity-80" />
                </div>
                <div>
                    <h4 className="font-semibold text-sm">{label}</h4>
                    <p className="text-[10px] opacity-70 uppercase tracking-wider">{sub}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">{value}</p>
                <span className="text-[10px] font-medium uppercase px-2 py-0.5 bg-white/50 rounded-full">
                    {status.replace('-', ' ')}
                </span>
            </div>
        </div>
    )
}
