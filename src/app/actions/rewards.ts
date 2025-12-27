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
