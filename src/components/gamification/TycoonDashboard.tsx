'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Truck, Gift, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    LEVEL_CONFIG,
    getLevelInfo,
    getXPProgress,
    getRarityColor,
    type TycoonProfile,
    type Unlockable
} from '@/lib/tycoon-engine';

interface TycoonDashboardProps {
    profile?: TycoonProfile;
    unlockables?: Unlockable[];
}

export default function TycoonDashboard({ profile, unlockables = [] }: TycoonDashboardProps) {
    // Mock profile for demo
    const mockProfile: TycoonProfile = profile || {
        id: '1',
        user_id: '1',
        current_level: 4,
        current_xp: 450,
        total_xp: 750,
        total_shipments: 45,
        total_spent: 2500000,
        total_savings: 375000,
        unlocked_skins: ['truck_default', 'truck_blue'],
        active_skin: 'truck_blue',
        admin_fee_discount: 5
    };

    const levelInfo = getLevelInfo(mockProfile.current_level);
    const xpProgress = getXPProgress(mockProfile.total_xp);

    // Warehouse images based on level tier
    const getWarehouseEmoji = (level: number) => {
        if (level <= 2) return '🏠';
        if (level <= 4) return '🏪';
        if (level <= 6) return '🏭';
        if (level <= 8) return '🏢';
        return '🏗️';
    };

    return (
        <div className="space-y-6">
            {/* Main Tycoon Card */}
            <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <CardContent className="relative z-10 p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Warehouse Visual */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-7xl border border-white/20 shadow-2xl">
                                {getWarehouseEmoji(mockProfile.current_level)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                                Lv.{mockProfile.current_level}
                            </div>
                        </div>

                        {/* Level Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-sm text-purple-200 mb-1">Logistics Tycoon</div>
                            <h2 className="text-3xl font-bold mb-2">{levelInfo.name}</h2>

                            {/* XP Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-purple-200 mb-1">
                                    <span>XP Progress</span>
                                    <span>{xpProgress.current} / {xpProgress.required}</span>
                                </div>
                                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: `${xpProgress.percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <div className="text-xs text-purple-200">Pengiriman</div>
                                    <div className="text-lg font-bold">{mockProfile.total_shipments}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <div className="text-xs text-purple-200">Total Hemat</div>
                                    <div className="text-lg font-bold">Rp {(mockProfile.total_savings / 1000).toFixed(0)}K</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                                    <div className="text-xs text-purple-200">Diskon Admin</div>
                                    <div className="text-lg font-bold text-green-400">{mockProfile.admin_fee_discount}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Unlockables Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Truck Skins */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600" />
                            Koleksi Truk
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { id: 'truck_default', name: 'Truk Standar', level: 1, rarity: 'COMMON', unlocked: true },
                            { id: 'truck_blue', name: 'Truk Biru', level: 2, rarity: 'COMMON', unlocked: true },
                            { id: 'truck_gold', name: 'Truk Emas', level: 5, rarity: 'RARE', unlocked: mockProfile.current_level >= 5 },
                            { id: 'truck_diamond', name: 'Truk Berlian', level: 8, rarity: 'EPIC', unlocked: mockProfile.current_level >= 8 },
                            { id: 'truck_legendary', name: 'Truk Legenda', level: 10, rarity: 'LEGENDARY', unlocked: mockProfile.current_level >= 10 },
                        ].map(skin => (
                            <div
                                key={skin.id}
                                className={`flex items-center justify-between p-2 rounded-lg border ${skin.unlocked ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚚</span>
                                    <div>
                                        <div className="text-sm font-medium">{skin.name}</div>
                                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRarityColor(skin.rarity)}`}>
                                            {skin.rarity}
                                        </div>
                                    </div>
                                </div>
                                {skin.unlocked ? (
                                    <Button size="sm" variant={mockProfile.active_skin === skin.id ? 'default' : 'outline'}>
                                        {mockProfile.active_skin === skin.id ? '✓ Aktif' : 'Pakai'}
                                    </Button>
                                ) : (
                                    <span className="text-xs text-gray-500">🔒 Lv.{skin.level}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Discounts */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Gift className="w-4 h-4 text-green-600" />
                            Benefit & Diskon
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { id: 'discount_5', name: 'Diskon 5%', level: 3, rarity: 'COMMON', value: 5, unlocked: mockProfile.current_level >= 3 },
                            { id: 'discount_10', name: 'Diskon 10%', level: 6, rarity: 'RARE', value: 10, unlocked: mockProfile.current_level >= 6 },
                            { id: 'discount_15', name: 'Diskon 15%', level: 9, rarity: 'EPIC', value: 15, unlocked: mockProfile.current_level >= 9 },
                            { id: 'discount_max', name: 'FREE Admin!', level: 10, rarity: 'LEGENDARY', value: 100, unlocked: mockProfile.current_level >= 10 },
                        ].map(discount => (
                            <div
                                key={discount.id}
                                className={`flex items-center justify-between p-2 rounded-lg border ${discount.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{discount.unlocked ? '💰' : '🔒'}</span>
                                    <div>
                                        <div className="text-sm font-medium">{discount.name}</div>
                                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRarityColor(discount.rarity)}`}>
                                            {discount.rarity}
                                        </div>
                                    </div>
                                </div>
                                {discount.unlocked ? (
                                    <span className="text-green-600 font-bold text-sm">✓ Aktif</span>
                                ) : (
                                    <span className="text-xs text-gray-500">Level {discount.level}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Level Roadmap */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        Level Roadmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex overflow-x-auto gap-2 pb-2">
                        {Object.entries(LEVEL_CONFIG).map(([level, info]) => {
                            const lvl = parseInt(level);
                            const isCurrentLevel = lvl === mockProfile.current_level;
                            const isUnlocked = lvl <= mockProfile.current_level;

                            return (
                                <div
                                    key={level}
                                    className={`flex-shrink-0 w-20 p-2 rounded-lg text-center border-2 transition-all ${isCurrentLevel
                                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                            : isUnlocked
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200 bg-gray-50 opacity-60'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{info.emoji}</div>
                                    <div className="text-xs font-bold">Lv.{level}</div>
                                    <div className="text-[10px] text-gray-600 truncate">{info.name}</div>
                                    {isCurrentLevel && (
                                        <div className="mt-1">
                                            <Sparkles className="w-3 h-3 text-purple-500 mx-auto" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
