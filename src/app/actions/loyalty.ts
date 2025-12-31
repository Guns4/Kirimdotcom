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
