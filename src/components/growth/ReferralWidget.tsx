'use client';

import React from 'react';
import { Copy, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralWidgetProps {
    referralCode: string;
    referralCount: number;
}

export default function ReferralWidget({ referralCode, referralCount }: ReferralWidgetProps) {
    const referralLink = `https://cekkirim.com/waitlist?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Link copied to clipboard! Share it to your friends.');
    };

    // Gamification Logic
    const getBadge = () => {
        if (referralCount >= 5) return { label: 'EARLY ADOPTER', color: 'bg-yellow-500', icon: '👑' };
        if (referralCount >= 1) return { label: 'SUPPORTER', color: 'bg-blue-500', icon: '💎' };
        return { label: 'NEWBIE', color: 'bg-gray-500', icon: '🌱' };
    };

    const badge = getBadge();
    const nextTarget = referralCount >= 5 ? 10 : (referralCount >= 1 ? 5 : 1);
    const progress = Math.min(100, (referralCount / 5) * 100);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md w-full mx-auto mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Status</h3>
                <span className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1`}>
                    {badge.icon} {badge.label}
                </span>
            </div>

            <div className="mb-6 text-center">
                <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1">{referralCount}</div>
                <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Friends Invited</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>Progress to Early Adopter</span>
                    <span>{referralCount}/5</span>
                </div>
                <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                </div>
                <p className="text-xs text-zinc-400 mt-2 text-center">
                    Invite {nextTarget - referralCount} more friends to unlock next tier!
                </p>
            </div>

            {/* Referral Link */}
            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                <code className="flex-1 text-sm font-mono truncate text-zinc-600 dark:text-zinc-300">
                    {referralLink}
                </code>
                <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                >
                    <Copy size={16} />
                </button>
            </div>
        </div>
    );
}
