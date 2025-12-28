'use client';

import { useEffect, useState } from 'react';
import { getFunnelStats } from '@/app/actions/funnelActions';
import { Users, UserPlus, CreditCard, ArrowRight, Eye } from 'lucide-react';

export default function FunnelAnalysisWidget() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        getFunnelStats().then(setStats);
    }, []);

    if (!stats) return <div className="p-6 bg-white rounded-xl border animate-pulse h-64"></div>;

    const funnel = [
        { label: 'Visitors', value: stats.view_landing_page || 0, icon: Eye, color: 'bg-blue-100 text-blue-600' },
        { label: 'Interest', value: stats.view_register_page || 0, icon: Users, color: 'bg-indigo-100 text-indigo-600' },
        { label: 'Registered', value: stats.complete_registration || 0, icon: UserPlus, color: 'bg-purple-100 text-purple-600' },
        { label: 'Paid Users', value: stats.complete_purchase || 0, icon: CreditCard, color: 'bg-green-100 text-green-600' },
    ];

    const calculateConversion = (curr: number, prev: number) => {
        if (prev === 0) return 0;
        return ((curr / prev) * 100).toFixed(1);
    };

    const totalConversion = calculateConversion(stats.complete_purchase, stats.view_landing_page);

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center justify-between">
                <span>Conversion Funnel</span>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                    Total Conv: {totalConversion}%
                </span>
            </h3>

            <div className="space-y-2">
                {funnel.map((step, i) => {
                    const prevValue = i > 0 ? funnel[i - 1].value : step.value; // For first item, ratio is 100% relative to self
                    const ratio = i === 0 ? 100 : parseFloat(calculateConversion(step.value, prevValue));

                    // Width relative to max (visitors)
                    const widthPercent = (step.value / funnel[0].value) * 100;

                    return (
                        <div key={step.label} className="relative group">
                            {/* Bar Background */}
                            <div className="absolute inset-0 bg-gray-50 rounded-lg -z-10 w-full h-full"></div>

                            {/* Colored Bar */}
                            <div
                                className={`absolute inset-y-0 left-0 rounded-lg opacity-20 -z-10 transition-all duration-1000 ${step.color.split(' ')[0]}`}
                                style={{ width: `${Math.max(widthPercent, 5)}%` }} // Min width so text is readable
                            ></div>

                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.color}`}>
                                        <step.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{step.label}</div>
                                        <div className="text-xs text-gray-500">
                                            {i > 0 && (
                                                <span className="flex items-center gap-1">
                                                    drop-off: <span className="text-red-500 font-semibold">{(100 - ratio).toFixed(1)}%</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-lg">{step.value.toLocaleString()}</div>
                                    {i > 0 && (
                                        <div className="text-xs font-semibold text-gray-400 bg-white/50 px-1 rounded inline-flex items-center">
                                            {ratio}% <ArrowRight className="w-3 h-3 ml-0.5 rotate-45" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
