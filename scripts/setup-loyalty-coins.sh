#!/bin/bash

# Setup Loyalty Coins Module
echo "🚀 Setting up Loyalty Coins System..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_loyalty.sql
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier_level TEXT DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, PLATINUM
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for earn, negative for spend
    transaction_type TEXT NOT NULL, -- 'EARN_TRACKING', 'EARN_ORDER', 'REDEEM_REWARD', 'BONUS'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own history" ON point_history FOR SELECT USING (auth.uid() = user_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/loyalty.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const earnPoints = async (amount: number, type: string, description: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return // Silently fail if not logged in (or handle guest points differently)

        // 1. Log History
        const { error: histError } = await supabase.from('point_history').insert({
            user_id: user.id,
            amount,
            transaction_type: type,
            description
        })
        if (histError) throw histError

        // 2. Update Balance (using RPC or direct update if concurrency low)
        // For simple MVP: Fetch, Add, Update. For prod: Use Database Function/RPC called 'increment_points'
        const { data: current } = await supabase.from('user_points').select('total_points, lifetime_points').eq('user_id', user.id).single()
        
        let newTotal = amount
        let newLifetime = amount > 0 ? amount : 0
        
        if (current) {
            newTotal += current.total_points
            if(amount > 0) newLifetime += current.lifetime_points
        }

        // Determine Tier
        let tier = 'BRONZE'
        if (newLifetime > 1000) tier = 'SILVER'
        if (newLifetime > 5000) tier = 'GOLD'
        if (newLifetime > 10000) tier = 'PLATINUM'

        const { error: updateError } = await supabase.from('user_points').upsert({
            user_id: user.id,
            total_points: newTotal,
            lifetime_points: newLifetime,
            tier_level: tier,
            updated_at: new Date().toISOString()
        })
        
        if (updateError) throw updateError
        
        revalidatePath('/dashboard')
        return { success: true, newTotal }
    })
}

export const getPoints = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { total_points: 0, tier_level: 'GUEST' }

    const { data } = await supabase.from('user_points').select('*').eq('user_id', user.id).single()
    return data || { total_points: 0, tier_level: 'BRONZE' }
}
EOF

# 3. Create Hook to Auto-Inject Points (Example usage guide)
# We won't modify existing files safely via bash, but we provide the utility.

# 4. Create UI Component
echo "🎨 Creating Point Balance UI..."
mkdir -p src/components/loyalty
cat << 'EOF' > src/components/loyalty/CoinBalance.tsx
'use client'

import { useEffect, useState } from 'react'
import { getPoints } from '@/app/actions/loyalty'
import { Coins, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
EOF

echo "✅ Loyalty Coins Setup Complete!"
echo "👉 Add 'earnPoints(1, 'EARN_TRACKING', 'Lacak Resi')' to your tracking function."
