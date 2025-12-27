'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

export const getVendors = async (category?: string) => {
    const supabase = await createClient()
    let q = supabase.from('vendors').select('*, vendor_services(*)')

    if (category && category !== 'All') {
        q = q.eq('category', category)
    }

    const { data } = await q.order('rating', { ascending: false })
    return data || []
}

export const registerVendor = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('vendors').insert({
            user_id: user.id,
            ...data
        })

        if (error) throw error
        return { success: true }
    })
}
