'use client';
import React, { useState, useEffect } from 'react';
import { Users, Crown, AlertTriangle, Coffee, HelpCircle } from 'lucide-react';

export default function CustomerSegmentation({ adminKey }: { adminKey: string }) {
    const [distribution, setDistribution] = useState<any[]>([]);

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/marketing/rfm', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => setDistribution(data.distribution || []));
        }
    }, [adminKey]);

    const getSegmentStyle = (segment: string) => {
        switch (segment) {
            case 'CHAMPIONS': return { bg: 'from-yellow-400 to-orange-500', icon: Crown, desc: '🏆 Best customers! Give VIP treatment.' };
            case 'LOYAL': return { bg: 'from-blue-500 to-purple-500', icon: Users, desc: '💙 Regular buyers, nurture them!' };
            case 'AT_RISK': return { bg: 'from-red-500 to-pink-500', icon: AlertTriangle, desc: '⚠️ About to leave, re-engage!' };
            case 'HIBERNATING': return { bg: 'from-gray-400 to-gray-500', icon: Coffee, desc: '💤 Sleeping giants, wake them up!' };
            default: return { bg: 'from-slate-400 to-slate-500', icon: Users, desc: 'Regular segment' };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center gap-2 mb-4">
                <h4 className="font-bold">Customer Segmentation (RFM)</h4>
                <div className="group relative">
                    <HelpCircle size={16} className="text-slate-400 cursor-help" />
                    <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg -top-2 left-6">
                        <strong>RFM Analysis:</strong> Membagi user berdasarkan Recency (kapan terakhir beli), Frequency (seberapa sering), Monetary (total uang).
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {distribution.map((seg) => {
                    const style = getSegmentStyle(seg.segment_name);
                    const Icon = style.icon;
                    return (
                        <div key={seg.segment_name} className={`bg-gradient-to-r ${style.bg} p-4 rounded-lg text-white`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={20} />
                                <span className="font-bold text-sm">{seg.segment_name}</span>
                            </div>
                            <div className="text-2xl font-black">{seg.user_count} users</div>
                            <div className="text-xs opacity-90 mt-1">{seg.percentage}% of total</div>
                            <div className="text-xs opacity-75 mt-2">{style.desc}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
