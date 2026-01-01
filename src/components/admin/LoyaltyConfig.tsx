'use client';
import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Users } from 'lucide-react';

export default function LoyaltyConfig({ adminKey }: { adminKey: string }) {
    const [tiers, setTiers] = useState<any[]>([]);
    const [distribution, setDistribution] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/gamification/tiers', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setTiers(data.tiers || []);
                setDistribution(data.distribution || []);
            }
        } catch (error) {
            console.error('Failed to fetch tiers:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchData();
    }, [adminKey]);

    const handleUpdateTier = async (tierId: number, field: string, value: any) => {
        try {
            const res = await fetch('/api/admin/gamification/tiers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    tier_id: tierId,
                    updates: { [field]: value }
                })
            });

            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getTierColor = (code: string) => {
        switch (code) {
            case 'DIAMOND': return 'from-cyan-400 to-blue-500';
            case 'GOLD': return 'from-yellow-400 to-orange-500';
            case 'SILVER': return 'from-gray-300 to-gray-400';
            case 'BRONZE': return 'from-amber-600 to-amber-700';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* TIER DISTRIBUTION */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl text-white">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Users size={20} />
                    User Distribution by Tier
                </h4>
                <div className="grid grid-cols-4 gap-4">
                    {distribution.map((dist: any) => (
                        <div key={dist.tier_name} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                            <div className="text-xs opacity-90 mb-1">{dist.tier_name}</div>
                            <div className="text-2xl font-black">{dist.percentage}%</div>
                            <div className="text-xs opacity-75 mt-1">{dist.user_count} users</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TIER CONFIG */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Crown size={20} className="text-yellow-500" />
                    Loyalty Tier Configuration
                </h4>
                <div className="space-y-6">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`p-5 rounded-xl bg-gradient-to-r ${getTierColor(tier.tier_code)} text-white`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h5 className="text-xl font-black">{tier.tier_name}</h5>
                                    <p className="text-sm opacity-90 mt-1">{tier.benefit_desc}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-90">
                                        Minimal Belanja (untuk naik tier)
                                    </label>
                                    <input
                                        type="number"
                                        value={tier.min_spending}
                                        onChange={(e) => handleUpdateTier(tier.id, 'min_spending', parseFloat(e.target.value))}
                                        className="w-full border rounded px-3 py-2 text-slate-800 font-bold"
                                        placeholder="0"
                                    />
                                    <div className="text-xs opacity-75 mt-1">
                                        {formatCurrency(tier.min_spending)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-90">
                                        Gacha Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={tier.gacha_discount_percent}
                                        onChange={(e) => handleUpdateTier(tier.id, 'gacha_discount_percent', parseFloat(e.target.value))}
                                        min="0"
                                        max="100"
                                        className="w-full border rounded px-3 py-2 text-slate-800 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-90">
                                        Cashback (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={tier.cashback_percent}
                                        onChange={(e) => handleUpdateTier(tier.id, 'cashback_percent', parseFloat(e.target.value))}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full border rounded px-3 py-2 text-slate-800 font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INFO */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <strong>💎 Loyalty Tier Strategy:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Naikkan threshold Diamond jika terlalu banyak user masuk (keep eksklusif)</li>
                    <li>Gacha discount = User VIP bayar lebih murah per spin</li>
                    <li>Cashback otomatis setiap order selesai</li>
                    <li>User tier dihitung otomatis berdasarkan total belanja</li>
                </ul>
            </div>
        </div>
    );
}
