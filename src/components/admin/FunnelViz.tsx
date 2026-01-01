'use client';
import React, { useState, useEffect } from 'react';
import { TrendingDown, HelpCircle } from 'lucide-react';

export default function FunnelViz({ adminKey }: { adminKey: string }) {
    const [funnel, setFunnel] = useState<any[]>([]);

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/marketing/funnel', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => setFunnel(data.funnel || []));
        }
    }, [adminKey]);

    return (
        <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingDown size={20} className="text-blue-600" />
                    <h4 className="font-bold">Conversion Funnel</h4>
                    <div className="group relative">
                        <HelpCircle size={16} className="text-slate-400 cursor-help" />
                        <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg -top-2 left-6">
                            Funnel menunjukkan berapa % user yang lanjut ke tahap berikutnya. Drop besar = ada masalah!
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {funnel.map((step, idx) => {
                    const width = parseFloat(step.conversion_rate || 0);
                    const dropRate = idx > 0 ? 100 - width : 0;
                    return (
                        <div key={step.step_name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">{step.step_name}</span>
                                <span>{step.user_count.toLocaleString()} users ({width.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-8 relative">
                                <div
                                    className={`h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${width > 50 ? 'bg-green-500' : width > 20 ? 'bg-orange-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${width}%` }}
                                >
                                    {width.toFixed(1)}%
                                </div>
                            </div>
                            {dropRate > 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                    ⚠️ Drop-off: {dropRate.toFixed(1)}% hilang di tahap ini
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
