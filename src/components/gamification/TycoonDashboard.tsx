'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Duplicate LEVELS here or import shared config if possible. 
// For client side, keeping simple copy for display to avoid server imports issues if any.
const LEVELS = [
    { level: 1, min_xp: 0, name: 'Garasi Rumah', perk: 'Starter Pack' },
    { level: 2, min_xp: 100, name: 'Garasi Rumah (Upgrade)', perk: 'None' },
    { level: 3, min_xp: 300, name: 'Toko Kecil', perk: 'Diskon 5%' },
    { level: 4, min_xp: 600, name: 'Toko Kecil (Ramai)', perk: 'Skin: Blue Truck' },
    { level: 5, min_xp: 1000, name: 'Gudang Sedang', perk: 'Prioritas CS' },
    { level: 6, min_xp: 1500, name: 'Gudang Sedang (Full)', perk: 'Diskon 10%' },
    { level: 7, min_xp: 2200, name: 'Gudang Besar', perk: 'Skin: Gold Truck' },
    { level: 8, min_xp: 3000, name: 'Gudang Besar (Auto)', perk: 'Analisis Bisnis' },
    { level: 9, min_xp: 4000, name: 'Gudang Raksasa', perk: 'Diskon 15%' },
    { level: 10, min_xp: 5500, name: 'Gudang Raksasa (Sultan)', perk: 'FREE ADMIN FEES' },
];

export function TycoonDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [nextLevel, setNextLevel] = useState<any>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('tycoon_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setProfile(data);

                const currentLvlIdx = LEVELS.findIndex(l => l.level === data.level);
                const nextLvl = LEVELS[currentLvlIdx + 1];
                setNextLevel(nextLvl);

                if (nextLvl) {
                    const currentLevelMin = LEVELS[currentLvlIdx].min_xp;
                    const range = nextLvl.min_xp - currentLevelMin;
                    const val = data.xp - currentLevelMin;
                    setProgress(Math.min(100, (val / range) * 100));
                } else {
                    setProgress(100); // Max level
                }
            }
        };

        fetchProfile();
    }, []);

    if (!profile) return <div className="p-4 text-center text-gray-500">Loading Game Data...</div>;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-400" />
                        Logistics Tycoon
                    </h2>
                    <p className="text-slate-400 text-sm">Bangun kerajaan logistikmu!</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-400">Lv. {profile.level}</div>
                    <div className="text-sm text-slate-300">{profile.warehouse_name}</div>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 text-slate-400">
                    <span>XP: {profile.xp}</span>
                    <span>Next: {nextLevel ? nextLevel.min_xp : 'MAX'} XP</span>
                </div>
                <div className="h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {nextLevel && (
                    <div className="mt-2 text-xs text-center text-yellow-300">
                        Next Reward: {nextLevel.perk}
                    </div>
                )}
            </div>

            {/* Stats / Actions */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                    <Truck className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-xs text-slate-400">Truck Skin</div>
                    <div className="font-semibold text-sm truncate">{profile.truck_skin}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-xs text-slate-400">Multiplier</div>
                    <div className="font-semibold text-sm">1.0x</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center border border-white/10">
                    <Package className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="text-xs text-slate-400">Total XP</div>
                    <div className="font-semibold text-sm">{profile.xp}</div>
                </div>
            </div>
        </div>
    );
}
