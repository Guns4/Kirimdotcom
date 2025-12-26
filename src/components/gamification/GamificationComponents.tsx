'use client'

import { useState, useEffect } from 'react'
import { Trophy, Compass, Shield, Star, Zap, Crown } from 'lucide-react'
import { getRankFromXP, getProgressToNextRank, RANKS, type RankName } from '@/app/actions/gamification'

// ============================================
// RANK BADGE COMPONENT
// ============================================

interface RankBadgeProps {
    rankName: RankName | string
    xp?: number
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    showProgress?: boolean
    className?: string
}

export function RankBadge({
    rankName,
    xp = 0,
    size = 'md',
    showLabel = true,
    showProgress = false,
    className = '',
}: RankBadgeProps) {
    const rank = rankName === 'Scout' ? RANKS.SCOUT
        : rankName === 'Navigator' ? RANKS.NAVIGATOR
            : rankName === 'Logistics Master' ? RANKS.MASTER
                : RANKS.SCOUT

    const progress = getProgressToNextRank(xp)

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    }

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    }

    return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
            {/* Rank Icon */}
            <span
                className={`${sizeClasses[size]} ${rank.color}`}
                title={rank.name}
            >
                {rank.icon}
            </span>

            {/* Label */}
            {showLabel && (
                <span className={`font-medium ${sizeClasses[size]} ${rank.color}`}>
                    {rank.name}
                </span>
            )}

            {/* Progress to next */}
            {showProgress && progress.nextRank && (
                <span className="text-xs text-gray-500 ml-1">
                    ({progress.xpNeeded} XP to {progress.nextRank.name})
                </span>
            )}
        </div>
    )
}

// ============================================
// XP PROGRESS BAR
// ============================================

interface XPProgressBarProps {
    xp: number
    showXP?: boolean
    className?: string
}

export function XPProgressBar({ xp, showXP = true, className = '' }: XPProgressBarProps) {
    const rank = getRankFromXP(xp)
    const progress = getProgressToNextRank(xp)

    return (
        <div className={`space-y-1 ${className}`}>
            {/* Labels */}
            <div className="flex items-center justify-between text-xs">
                <span className={rank.color}>{rank.name}</span>
                {progress.nextRank ? (
                    <span className="text-gray-500">
                        {progress.xpNeeded} XP to {progress.nextRank.name}
                    </span>
                ) : (
                    <span className="text-yellow-400">Max Level! 🎉</span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${rank.name === 'Logistics Master'
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                            : rank.name === 'Navigator'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                : 'bg-gradient-to-r from-gray-500 to-gray-400'
                        }`}
                    style={{ width: `${progress.percent}%` }}
                />
            </div>

            {/* XP Count */}
            {showXP && (
                <div className="text-center text-xs text-gray-400">
                    <Zap className="inline w-3 h-3 text-yellow-400 mr-1" />
                    {xp} XP
                </div>
            )}
        </div>
    )
}

// ============================================
// XP EARNED TOAST
// ============================================

interface XPEarnedToastProps {
    xp: number
    message?: string
    rankChanged?: boolean
    newRank?: string
    onClose: () => void
}

export function XPEarnedToast({
    xp,
    message,
    rankChanged,
    newRank,
    onClose,
}: XPEarnedToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, rankChanged ? 5000 : 3000)
        return () => clearTimeout(timer)
    }, [onClose, rankChanged])

    return (
        <div className="fixed bottom-20 right-4 z-50 animate-slide-up">
            <div className={`p-4 rounded-2xl shadow-xl ${rankChanged
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-500'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                }`}>
                <div className="flex items-center gap-3">
                    {rankChanged ? (
                        <Crown className="w-8 h-8 text-white animate-bounce" />
                    ) : (
                        <Star className="w-6 h-6 text-white" />
                    )}

                    <div className="text-white">
                        {rankChanged ? (
                            <>
                                <p className="font-bold text-lg">🎉 Rank Up!</p>
                                <p className="text-sm opacity-90">
                                    Selamat! Anda naik ke <span className="font-semibold">{newRank}</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="font-bold">+{xp} XP</p>
                                {message && <p className="text-sm opacity-90">{message}</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// USER XP CARD (for Dashboard)
// ============================================

interface UserXPCardProps {
    xp: number
    rankName: string
    isPremium?: boolean
    premiumExpiresAt?: string | null
    className?: string
}

export function UserXPCard({
    xp,
    rankName,
    isPremium = false,
    premiumExpiresAt,
    className = '',
}: UserXPCardProps) {
    const rank = getRankFromXP(xp)
    const progress = getProgressToNextRank(xp)

    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Level & XP</h3>
                    <RankBadge rankName={rankName} xp={xp} size="lg" />
                </div>

                {/* Premium Badge */}
                {isPremium && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-full">
                        <Crown className="w-4 h-4 text-white" />
                        <span className="text-xs font-medium text-white">Premium</span>
                    </div>
                )}
            </div>

            {/* XP Progress */}
            <XPProgressBar xp={xp} />

            {/* Premium Expiry */}
            {isPremium && premiumExpiresAt && (
                <p className="mt-3 text-xs text-yellow-400/80">
                    Premium berakhir: {new Date(premiumExpiresAt).toLocaleDateString('id-ID')}
                </p>
            )}

            {/* Rank Benefits */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-2">Keuntungan rank Anda:</p>
                <div className="flex flex-wrap gap-2">
                    {rank.name === 'Logistics Master' && (
                        <>
                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                                🚫 Bebas Iklan
                            </span>
                            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                                ⚡ Prioritas Support
                            </span>
                        </>
                    )}
                    {rank.name === 'Navigator' && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                            📉 Iklan Berkurang
                        </span>
                    )}
                    {rank.name === 'Scout' && (
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                            🔰 Fitur Dasar
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================
// MINI BADGE (for Navbar)
// ============================================

interface MiniBadgeProps {
    rankName: string
    xp: number
    showTooltip?: boolean
}

export function MiniBadge({ rankName, xp, showTooltip = true }: MiniBadgeProps) {
    const [showInfo, setShowInfo] = useState(false)
    const rank = getRankFromXP(xp)

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
        >
            <button className={`flex items-center gap-1 px-2 py-1 rounded-lg ${rank.bgColor} transition-colors hover:opacity-80`}>
                <span className="text-sm">{rank.icon}</span>
                <span className={`text-xs font-medium ${rank.color}`}>{xp}</span>
            </button>

            {/* Tooltip */}
            {showTooltip && showInfo && (
                <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50">
                    <p className={`font-medium ${rank.color}`}>{rank.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{xp} XP total</p>
                    <XPProgressBar xp={xp} showXP={false} className="mt-2" />
                </div>
            )}
        </div>
    )
}

// ============================================
// LEADERBOARD COMPONENT
// ============================================

interface LeaderboardEntry {
    id: string
    display_name: string | null
    avatar_url: string | null
    xp_points: number
    current_rank: string
    position: number
}

interface LeaderboardProps {
    entries: LeaderboardEntry[]
    currentUserId?: string
    className?: string
}

export function Leaderboard({ entries, currentUserId, className = '' }: LeaderboardProps) {
    return (
        <div className={`glass-card overflow-hidden ${className}`}>
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Leaderboard
                </h3>
            </div>

            <div className="divide-y divide-white/5">
                {entries.map((entry) => {
                    const isCurrentUser = entry.id === currentUserId
                    const rank = getRankFromXP(entry.xp_points)

                    return (
                        <div
                            key={entry.id}
                            className={`flex items-center gap-3 p-4 ${isCurrentUser ? 'bg-indigo-600/10' : ''
                                }`}
                        >
                            {/* Position */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.position === 1 ? 'bg-yellow-500 text-black' :
                                    entry.position === 2 ? 'bg-gray-300 text-black' :
                                        entry.position === 3 ? 'bg-amber-600 text-white' :
                                            'bg-white/10 text-gray-400'
                                }`}>
                                {entry.position}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {entry.display_name?.[0]?.toUpperCase() || '?'}
                            </div>

                            {/* Name & Rank */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                                    {entry.display_name || 'Anonymous'}
                                    {isCurrentUser && <span className="text-xs text-gray-500 ml-1">(Anda)</span>}
                                </p>
                                <p className={`text-xs ${rank.color}`}>
                                    {rank.icon} {rank.name}
                                </p>
                            </div>

                            {/* XP */}
                            <div className="text-right">
                                <p className="font-semibold text-white">{entry.xp_points}</p>
                                <p className="text-xs text-gray-500">XP</p>
                            </div>
                        </div>
                    )
                })}

                {entries.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        Belum ada data leaderboard
                    </div>
                )}
            </div>
        </div>
    )
}
