'use client'

import { useEffect, useState } from 'react'
import { getPoints } from '@/app/actions/loyalty'
import { Coins, Crown } from 'lucide-react'

export function CoinBalance() {
    const [stats, setStats] = useState({ total_points: 0, tier_level: 'LOADING' })

    useEffect(() => {
        getPoints().then(data => setStats(data as any))
    }, [])

    if (stats.tier_level === 'LOADING') return <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />

    const tierColors: any = {
        'BRONZE': 'bg-orange-100 text-orange-800',
        'SILVER': 'bg-gray-100 text-gray-800',
        'GOLD': 'bg-yellow-100 text-yellow-800',
        'PLATINUM': 'bg-slate-800 text-slate-100',
    }

    return (
        <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-1.5 text-yellow-600 font-bold">
                <Coins className="w-4 h-4 fill-yellow-500" />
                <span>{stats.total_points}</span>
            </div>
            <div className={`h-4 w-[1px] bg-gray-300`} />
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${tierColors[stats.tier_level] || 'bg-gray-100'}`}>
                <Crown className="w-3 h-3" />
                {stats.tier_level}
            </div>
        </div>
    )
}
