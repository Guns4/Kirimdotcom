'use client';

import { useEffect, useState } from 'react';
import { getTopCouriers } from '@/app/actions/analyticsActions';
import { Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopCouriersWidget() {
    const [couriers, setCouriers] = useState<{ name: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getTopCouriers(5);
                setCouriers(data || []);
            } catch (error) {
                console.error('Failed to fetch top couriers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Top Kurir Dicari
                </h3>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            ) : couriers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    Belum ada data tracking
                </div>
            ) : (
                <div className="space-y-4">
                    {couriers.map((item, index) => {
                        const max = couriers[0].count;
                        const percentage = (item.count / max) * 100;

                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700 uppercase">{item.name}</span>
                                    <span className="text-gray-500">{item.count} cek</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
