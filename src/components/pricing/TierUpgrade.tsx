'use client';

import { useState } from 'react';
import { performUpgrade, UPGRADE_COSTS } from '@/lib/tier-pricing';
import { useRouter } from 'next/navigation';
import { Crown, Zap, ShieldCheck, Loader2 } from 'lucide-react';

export default function TierUpgrade({ currentTier }: { currentTier: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async (tier: 'RESELLER' | 'VIP') => {
        if (!confirm(`Confirm upgrade to ${tier} for Rp ${UPGRADE_COSTS[tier].toLocaleString()}?`)) return;

        setLoading(true);
        try {
            const result = await performUpgrade(tier);
            if (result.success) {
                alert('Upgrade Successful!');
                router.refresh();
            } else {
                alert('Upgrade Failed: ' + result.message);
            }
        } catch (e) {
            alert('Error processing request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* BASIC */}
            <div className={`relative bg-white rounded-2xl p-8 border-2 ${currentTier === 'BASIC' ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-100'} transition-all`}>
                <div className="absolute top-4 right-4">
                    {currentTier === 'BASIC' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>}
                </div>
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Zap size={32} className="text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <p className="text-gray-500 mb-6">For casual senders</p>
                <div className="text-4xl font-bold mb-6">Rp 1.000<span className="text-lg text-gray-400 font-normal">/trx</span></div>
                <ul className="space-y-3 mb-8 text-gray-600">
                    <li className="flex gap-2"><ShieldCheck size={18} /> Base Shipping Price</li>
                    <li className="flex gap-2"><ShieldCheck size={18} /> Standard Support</li>
                </ul>
            </div>

            {/* RESELLER */}
            <div className={`relative bg-white rounded-2xl p-8 border-2 ${currentTier === 'RESELLER' ? 'border-purple-500 shadow-xl scale-105' : 'border-gray-100'}`}>
                <div className="absolute top-4 right-4">
                    {currentTier === 'RESELLER' && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>}
                </div>
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Crown size={32} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Reseller</h3>
                <p className="text-gray-500 mb-6">For budding entrepreneurs</p>
                <div className="text-4xl font-bold mb-2">Rp 200<span className="text-lg text-gray-400 font-normal">/trx</span></div>
                <p className="text-sm text-purple-600 font-medium mb-6">Save Rp 800 per transaction!</p>

                {currentTier === 'BASIC' ? (
                    <button
                        onClick={() => handleUpgrade('RESELLER')}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-8 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Upgrade (Rp 100k)'}
                    </button>
                ) : currentTier === 'RESELLER' ? (
                    <div className="w-full bg-purple-100 text-purple-700 font-bold py-3 rounded-lg mb-8 text-center">Active Plan</div>
                ) : (
                    <div className="h-12 mb-8"></div>
                )}
            </div>

            {/* VIP */}
            <div className={`relative bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 border-2 ${currentTier === 'VIP' ? 'border-gold-500 shadow-2xl scale-105 ring-2 ring-yellow-500' : 'border-gray-800'}`}>
                <div className="absolute top-4 right-4">
                    {currentTier === 'VIP' && <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">CURRENT</span>}
                </div>
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Crown size={32} className="text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-yellow-500">VIP</h3>
                <p className="text-gray-400 mb-6">Maximum profit margin</p>
                <div className="text-4xl font-bold mb-2">Rp 50<span className="text-lg text-gray-500 font-normal">/trx</span></div>
                <p className="text-sm text-yellow-400 font-medium mb-6">Lowest possible rate.</p>

                {currentTier !== 'VIP' ? (
                    <button
                        onClick={() => handleUpgrade('VIP')}
                        disabled={loading}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg mb-8 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Upgrade (Rp 500k)'}
                    </button>
                ) : (
                    <div className="w-full bg-yellow-500/20 text-yellow-400 font-bold py-3 rounded-lg mb-8 text-center">Active Plan</div>
                )}
            </div>
        </div>
    );
}
