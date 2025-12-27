#!/bin/bash

# Setup Rewards Catalog Module
echo "🚀 Setting up Rewards Catalog..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_rewards.sql
CREATE TABLE IF NOT EXISTS rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cost_points INTEGER NOT NULL,
    reward_type TEXT NOT NULL, -- 'VOUCHER', 'DIGITAL_PRODUCT', 'PREMIUM_ACCESS'
    reward_value TEXT, -- The code, link, or duration
    image_url TEXT,
    stock INTEGER DEFAULT 999,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    redeemed_code TEXT,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'USED', 'EXPIRED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "Users manage own rewards" ON user_rewards FOR ALL USING (auth.uid() = user_id);

-- Seed some Data
INSERT INTO rewards (title, description, cost_points, reward_type, reward_value) VALUES
('Voucher Ongkir 10rb', 'Potongan ongkir untuk pengiriman via JNE/JNT.', 100, 'VOUCHER', 'ONGKIR10K'),
('Ebook: Cara Jualan Laris', 'Panduan lengkap marketing online untuk pemula.', 500, 'DIGITAL_PRODUCT', 'https://cekkirim.com/dl/ebook-jualan.pdf'),
('CekKirim Premium 7 Hari', 'Akses fitur premium tanpa iklan selama seminggu.', 200, 'PREMIUM_ACCESS', '7_DAYS');
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/rewards.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { earnPoints } from './loyalty' // Reuse logic to deduct points (negative earn)

export const getRewards = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('rewards').select('*').gt('stock', 0).order('cost_points', { ascending: true })
    return data || []
}

export const redeemReward = async (rewardId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 1. Get Reward Details
        const { data: reward } = await supabase.from('rewards').select('*').eq('id', rewardId).single()
        if (!reward) throw new Error('Reward not found')

        // 2. Check Points
        const { data: userPoints } = await supabase.from('user_points').select('total_points').eq('user_id', user.id).single()
        if (!userPoints || userPoints.total_points < reward.cost_points) {
            throw new Error('Poin tidak cukup')
        }

        // 3. Deduct Points (Negative Earn)
        await earnPoints(-reward.cost_points, 'REDEEM_REWARD', `Tukar Poin: ${reward.title}`)

        // 4. Record Redemption
        const { error } = await supabase.from('user_rewards').insert({
            user_id: user.id,
            reward_id: reward.id,
            redeemed_code: reward.reward_value, // In real app, generate unique code from pool
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
        })

        if (error) throw error
        return { success: true, code: reward.reward_value }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating Rewards Catalog UI..."
mkdir -p src/app/rewards
cat << 'EOF' > src/app/rewards/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getRewards, redeemReward } from '@/app/actions/rewards'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CoinBalance } from '@/components/loyalty/CoinBalance'
import { Gift, Zap } from 'lucide-react'

export default function RewardsPage() {
    const [rewards, setRewards] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRewards().then(data => {
            setRewards(data)
            setLoading(false)
        })
    }, [])

    const handleRedeem = async (item: any) => {
        if (!confirm(`Tukar ${item.cost_points} poin untuk ${item.title}?`)) return
        
        try {
            const res = await redeemReward(item.id)
            if (res.success) {
                toast.success('Berhasil ditukar!', { description: `Kode voucher Anda: ${res.code}` })
            }
        } catch (e: any) {
            toast.error(e.message || 'Gagal menukar poin')
        }
    }

    return (
        <div className="container-custom py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Rewards Catalog</h1>
                    <p className="text-gray-500">Tukarkan poin aktivitasmu dengan hadiah menarik.</p>
                </div>
                <CoinBalance />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards.map(item => (
                    <Card key={item.id} className="hover:shadow-lg transition-all border-indigo-50">
                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <Gift className="w-12 h-12 opacity-80" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                            <div className="flex items-center gap-1 font-bold text-yellow-600 bg-yellow-50 w-fit px-2 py-1 rounded text-sm">
                                <Zap className="w-4 h-4" />
                                {item.cost_points} Poin
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleRedeem(item)}>Tukar Sekarang</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
EOF

echo "✅ Rewards Catalog Setup Complete!"
