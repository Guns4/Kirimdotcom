'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import { claimMissionAction } from '@/app/actions/mission-actions'; // We need to create this action wrapper
import { toast } from 'sonner';

interface MissionUI {
    id: string;
    title: string;
    description: string;
    progress: number;
    target_count: number;
    xp_reward: number;
    status: string;
}

export function DailyMissionsWidget() {
    const [missions, setMissions] = useState<MissionUI[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMissions = async () => {
        setLoading(true);
        // Call server action to get missions (to avoid exposing direct DB logic if we wanted, but here we can use client or server action. 
        // For simplicity, let's assume we fetch via an API route or server action.
        // Let's use a server action wrapper for consistency.)

        try {
            const res = await fetch('/api/missions'); // Or direct action
            if (res.ok) {
                const data = await res.json();
                setMissions(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleClaim = async (missionId: string) => {
        try {
            const result = await claimMissionAction(missionId);
            if (result.success) {
                toast.success(`Claimed +${result.xp} XP!`);
                fetchMissions(); // Refresh
            } else {
                toast.error(result.error || 'Failed to claim');
            }
        } catch (e) {
            toast.error('Error claiming reward');
        }
    };

    if (loading) return <div className="p-4 bg-gray-50 rounded-lg animate-pulse h-40">Loading Missions...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Gift className="text-purple-500 w-5 h-5" />
                    Daily Missions
                </h3>
                <div className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Ends in 00:00
                </div>
            </div>

            <div className="space-y-3">
                {missions.map((m) => {
                    const pct = Math.min(100, (m.progress / m.target_count) * 100);
                    const isCompleted = m.status === 'COMPLETED';
                    const isClaimed = m.status === 'CLAIMED';

                    return (
                        <div key={m.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">{m.title}</div>
                                    <div className="text-xs text-gray-500">{m.description}</div>
                                </div>
                                <div className="text-xs font-bold text-orange-500">+{m.xp_reward} XP</div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="text-xs text-gray-500 w-12 text-right">
                                    {m.progress}/{m.target_count}
                                </div>
                            </div>

                            {isCompleted && !isClaimed && (
                                <Button
                                    onClick={() => handleClaim(m.id)}
                                    size="sm"
                                    className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white h-8"
                                >
                                    Claim Reward
                                </Button>
                            )}
                            {isClaimed && (
                                <div className="w-full mt-2 text-center text-xs font-semibold text-green-500 flex items-center justify-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Claimed
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
