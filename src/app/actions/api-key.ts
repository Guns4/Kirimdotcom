'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function generateApiKey() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Generate secure random key
    const prefix = 'ck_live_'
    const randomBytes = crypto.randomBytes(24).toString('hex')
    const secretKey = `${prefix}${randomBytes}`

    const { error } = await supabase.from('api_keys').insert({
        user_id: user.id,
        secret_key: secretKey,
        monthly_quota: 1000, // Default Free Tier
        status: 'active'
    })

    if (error) {
        console.error('Failed to generate key:', error)
        return { success: false, error: 'Failed to generate API Key' }
    }

    revalidatePath('/dashboard/developer')
    return { success: true }
}

export async function revokeApiKey(keyId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', keyId)
        .eq('user_id', user.id)

    if (error) {
        return { success: false, error: 'Failed to revoke key' }
    }

    revalidatePath('/dashboard/developer')
    return { success: true }
}
