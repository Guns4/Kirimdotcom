'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidateTag } from 'next/cache'

export async function toggleFeatureFlag(key: string, isEnabled: boolean) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Upsert logic (mocking schema for now since user needs to run migration script)
    // assuming table 'feature_flags' exists: key (pk), is_enabled, description
    const { error } = await (supabase.from('feature_flags') as any).upsert({
        key,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
    })

    if (error) {
        console.error('Toggle error:', error)
        return { success: false, error: 'Gagal update flag' }
    }

    revalidateTag('feature_flags')
    return { success: true }
}

export async function createFeatureFlag(key: string, description: string) {
    const supabase = await createClient()
    const { error } = await (supabase.from('feature_flags') as any).insert({
        key,
        description,
        is_enabled: false, // Default off
        percentage: 100
    })

    if (error) return { success: false, error: error.message }

    revalidateTag('feature_flags')
    return { success: true }
}
