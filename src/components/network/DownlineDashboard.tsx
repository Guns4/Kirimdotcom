'use client';

import { useState } from 'react';
import { NetworkStats } from '@/lib/downline-service';
import { Copy, Users, Wallet, TrendingUp } from 'lucide-react';

export default function DownlineDashboard({ stats }: { stats: NetworkStats }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Downlines</p>
                            <h3 className="text-2xl font-bold">{stats.totalDownlines}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Commission</p>
                            <h3 className="text-2xl font-bold">Rp {stats.totalCommission.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Commission Rate</p>
                            <h3 className="text-2xl font-bold">Rp 25 <span className="text-xs text-gray-400 font-normal">/ trx</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral Link */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
                <h2 className="text-xl font-bold mb-2">Grow Your Network</h2>
                <p className="mb-6 opacity-90">Invite friends and earn Rp 25 for every transaction they make. Forever.</p>

                <div className="flex gap-2 max-w-lg">
                    <input
                        readOnly
                        value={stats.referralLink}
                        className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white/95 focus:outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Copy size={18} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Commissions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats.recentCommissions.length > 0 ? (
                        stats.recentCommissions.map((tx: any, idx: number) => (
                            <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">Commission Reward</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                                <span className="text-green-600 font-bold">+ Rp {tx.amount}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No commissions yet. Start sharing your link!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
