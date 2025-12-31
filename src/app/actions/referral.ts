'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { nanoid } from 'nanoid'

export const getReferralData = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let { data: refData } = await supabase.from('user_referrals').select('*').eq('user_id', user.id).single()

    // Generate Code if none
    if (!refData) {
        const code = nanoid(8).toUpperCase()
        const { data, error } = await supabase.from('user_referrals').insert({
            user_id: user.id,
            referral_code: code
        }).select().single()
        
        if (!error) refData = data
    }

    // Get Stats
    const { count } = await supabase.from('referral_conversions').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
    const { data: earnings } = await supabase.from('referral_conversions').select('commission_earned').eq('referrer_id', user.id)
    
    const totalEarnings = earnings?.reduce((acc, curr) => acc + (Number(curr.commission_earned) || 0), 0) || 0

    return {
        code: refData?.referral_code,
        link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cekkirim.com'}?ref=${refData?.referral_code}`,
        total_referred: count || 0,
        total_earnings: totalEarnings
    }
}
