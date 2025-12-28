'use client';

import { useEffect, useState } from 'react';
import { getFunnelStats } from '@/app/actions/funnelActions';
import { ArrowRight, Filter, Users, UserCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FunnelAnalysisWidget() {
    const [stats, setStats] = useState({ visitors: 0, registered: 0, paid: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { data } = await getFunnelStats();
                setStats(data);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const conversion1 = stats.visitors > 0 ? ((stats.registered / stats.visitors) * 100).toFixed(1) : '0';
    const conversion2 = stats.registered > 0 ? ((stats.paid / stats.registered) * 100).toFixed(1) : '0';
    const totalConversion = stats.visitors > 0 ? ((stats.paid / stats.visitors) * 100).toFixed(1) : '0';

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-2">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    Conversion Funnel (Sales)
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[40%] left-[16%] right-[16%] h-1 bg-gray-100 -z-0"></div>

                {/* Step 1: Visitor */}
                <StepCard
                    label="Register Page"
                    count={stats.visitors}
                    icon={Users}
                    color="bg-blue-100 text-blue-600"
                    isFirst
                />

                {/* Step 2: Registered */}
                <StepCard
                    label="Registered User"
                    count={stats.registered}
                    icon={UserCheck}
                    color="bg-purple-100 text-purple-600"
                    conversion={conversion1}
                />

                {/* Step 3: Paid */}
                <StepCard
                    label="Paid Subscriber"
                    count={stats.paid}
                    icon={CreditCard}
                    color="bg-green-100 text-green-600"
                    conversion={conversion2}
                />
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Total Conversion Rate: <span className="font-semibold text-gray-900">{totalConversion}%</span>
                </p>
            </div>
        </div>
    );
}

function StepCard({ label, count, icon: Icon, color, conversion, isFirst }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center relative z-10"
        >
            {!isFirst && (
                <div className="mb-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1">
                    {conversion}% <ArrowRight className="w-3 h-3" />
                </div>
            )}

            <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-sm`}>
                <Icon className="w-8 h-8" />
            </div>

            <h4 className="font-medium text-gray-900 text-lg">{count.toLocaleString()}</h4>
            <p className="text-sm text-gray-500">{label}</p>
        </motion.div>
    )
}
