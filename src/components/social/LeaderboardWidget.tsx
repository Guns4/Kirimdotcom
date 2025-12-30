'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Crown, Trophy, Medal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
    user_id: string;
    full_name: string;
    avatar_url: string;
    weekly_score: number;
}

export function LeaderboardWidget() {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            const supabase = createClient();
            const { data, error } = await (supabase as any).rpc('get_weekly_leaderboard');

            if (!error && data) {
                setData(data as unknown as LeaderboardEntry[]);
            }
            setLoading(false);
        }
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <Skeleton className="h-64 w-full rounded-xl" />;
    }

    if (data.length === 0) {
        return (
            <div className="bg-card p-6 rounded-xl border text-center text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Belum ada aktivitas minggu ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-bold">Top Sultan Minggu Ini</h3>
                </div>
                <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full">Weekly</span>
            </div>

            {/* List */}
            <div className="divide-y divide-white/5">
                {data.map((user, idx) => {
                    const rank = idx + 1;

                    let RankIcon: React.ReactNode = <span className="font-mono font-bold text-slate-500 w-6 text-center">{rank}</span>;

                    if (rank === 1) RankIcon = <Trophy className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />;
                    if (rank === 2) RankIcon = <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
                    if (rank === 3) RankIcon = <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;

                    return (
                        <div key={user.user_id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex-shrink-0 flex items-center justify-center w-8">
                                {RankIcon}
                            </div>

                            <div className="h-10 w-10 rounded-full border-2 border-transparent group-hover:border-primary transition-all bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{user.full_name?.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate text-sm">{user.full_name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-400">Level {Math.floor(user.weekly_score / 100) + 1}</p>
                            </div>

                            <div className="text-right">
                                <p className="font-mono font-bold text-green-400">+{user.weekly_score}</p>
                                <p className="text-[10px] text-slate-500">POIN</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
