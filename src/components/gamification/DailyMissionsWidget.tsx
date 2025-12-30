'use client';

import { useState, useEffect } from 'react';
import { Gift, Check, Clock, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    getDifficultyColor,
    getMissionIcon,
    claimMissionReward,
    type DailyMission
} from '@/lib/mission-engine';

interface DailyMissionsWidgetProps {
    missions?: DailyMission[];
}

export default function DailyMissionsWidget({ missions: propMissions }: DailyMissionsWidgetProps) {
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [claiming, setClaiming] = useState<string | null>(null);

    // Mock missions for demo
    useEffect(() => {
        if (propMissions) {
            setMissions(propMissions);
        } else {
            // Mock data
            setMissions([
                {
                    id: '1',
                    user_id: '1',
                    mission_template_id: '1',
                    current_progress: 1,
                    target_count: 1,
                    is_completed: true,
                    is_claimed: true,
                    xp_reward: 5,
                    coin_reward: 10,
                    mission_date: new Date().toISOString().split('T')[0],
                    mission_templates: {
                        id: '1',
                        mission_type: 'LOGIN',
                        title: 'Login Hari Ini',
                        description: 'Masuk ke akun CekKirim',
                        target_count: 1,
                        xp_reward: 5,
                        coin_reward: 10,
                        difficulty: 'EASY'
                    }
                },
                {
                    id: '2',
                    user_id: '1',
                    mission_template_id: '2',
                    current_progress: 2,
                    target_count: 3,
                    is_completed: false,
                    is_claimed: false,
                    xp_reward: 20,
                    coin_reward: 30,
                    mission_date: new Date().toISOString().split('T')[0],
                    mission_templates: {
                        id: '2',
                        mission_type: 'CEK_RESI',
                        title: 'Cek 3 Resi',
                        description: 'Tracking 3 nomor resi berbeda',
                        target_count: 3,
                        xp_reward: 20,
                        coin_reward: 30,
                        difficulty: 'EASY'
                    }
                },
                {
                    id: '3',
                    user_id: '1',
                    mission_template_id: '3',
                    current_progress: 0,
                    target_count: 1,
                    is_completed: false,
                    is_claimed: false,
                    xp_reward: 30,
                    coin_reward: 50,
                    mission_date: new Date().toISOString().split('T')[0],
                    mission_templates: {
                        id: '3',
                        mission_type: 'SHARE',
                        title: 'Share ke WhatsApp',
                        description: 'Bagikan hasil tracking ke WA',
                        target_count: 1,
                        xp_reward: 30,
                        coin_reward: 50,
                        difficulty: 'EASY'
                    }
                },
                {
                    id: '4',
                    user_id: '1',
                    mission_template_id: '4',
                    current_progress: 1,
                    target_count: 1,
                    is_completed: true,
                    is_claimed: false,
                    xp_reward: 50,
                    coin_reward: 100,
                    mission_date: new Date().toISOString().split('T')[0],
                    mission_templates: {
                        id: '4',
                        mission_type: 'TOPUP',
                        title: 'Topup Saldo Rp 50rb',
                        description: 'Isi saldo minimal Rp 50.000',
                        target_count: 1,
                        xp_reward: 50,
                        coin_reward: 100,
                        difficulty: 'MEDIUM'
                    }
                }
            ]);
        }
    }, [propMissions]);

    const handleClaim = async (missionId: string) => {
        setClaiming(missionId);
        try {
            // In production, use actual API
            // const result = await claimMissionReward(missionId);

            // Mock claim
            await new Promise(resolve => setTimeout(resolve, 500));

            setMissions(prev =>
                prev.map(m => m.id === missionId ? { ...m, is_claimed: true } : m)
            );

            const mission = missions.find(m => m.id === missionId);
            toast.success('Reward Claimed!', {
                description: `+${mission?.xp_reward} XP, +${mission?.coin_reward} Coins`
            });
        } catch (error) {
            toast.error('Failed to claim reward');
        } finally {
            setClaiming(null);
        }
    };

    const completedCount = missions.filter(m => m.is_completed).length;
    const totalXP = missions.filter(m => m.is_claimed).reduce((sum, m) => sum + m.xp_reward, 0);

    // Time until reset
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursLeft = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-500" />
                        Misi Harian
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Reset: {hoursLeft}j {minutesLeft}m
                    </div>
                </div>
                {/* Progress summary */}
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                            style={{ width: `${(completedCount / missions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium">{completedCount}/{missions.length}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {missions.map(mission => {
                    const template = mission.mission_templates;
                    const progress = (mission.current_progress / mission.target_count) * 100;

                    return (
                        <div
                            key={mission.id}
                            className={`p-3 rounded-lg border transition-all ${mission.is_claimed
                                    ? 'bg-gray-50 border-gray-100 opacity-60'
                                    : mission.is_completed
                                        ? 'bg-green-50 border-green-200 ring-2 ring-green-200'
                                        : 'bg-white border-gray-200 hover:border-orange-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`text-2xl flex-shrink-0 ${mission.is_claimed ? 'grayscale' : ''}`}>
                                    {getMissionIcon(template?.mission_type || '')}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm truncate">{template?.title}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getDifficultyColor(template?.difficulty || '')}`}>
                                            {template?.difficulty}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    {!mission.is_claimed && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${mission.is_completed ? 'bg-green-500' : 'bg-orange-400'
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-500">
                                                {mission.current_progress}/{mission.target_count}
                                            </span>
                                        </div>
                                    )}

                                    {/* Rewards */}
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600">
                                        <span className="flex items-center gap-0.5">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            +{mission.xp_reward} XP
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            🪙 +{mission.coin_reward}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex-shrink-0">
                                    {mission.is_claimed ? (
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    ) : mission.is_completed ? (
                                        <Button
                                            size="sm"
                                            className="bg-green-500 hover:bg-green-600 text-xs px-3"
                                            onClick={() => handleClaim(mission.id)}
                                            disabled={claiming === mission.id}
                                        >
                                            {claiming === mission.id ? '...' : (
                                                <>
                                                    <Gift className="w-3 h-3 mr-1" />
                                                    Claim
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" className="text-xs px-3" disabled>
                                            {Math.round(progress)}%
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Total XP earned today */}
                {totalXP > 0 && (
                    <div className="text-center pt-2 border-t text-sm text-gray-600">
                        Hari ini: <span className="font-bold text-orange-600">+{totalXP} XP</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
