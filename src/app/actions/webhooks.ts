'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const createWebhook = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('user_webhooks').insert({
            user_id: user.id,
            ...data
        })

        if (error) throw error
        return { success: true }
    })
}

export const getWebhooks = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase.from('user_webhooks').select('*').eq('user_id', user.id)
    return data || []
}

// Internal function to call (not exposed as action)
export const dispatchWebhook = async (userId: string, event: string, payload: any) => {
    const supabase = await createClient()

    // 1. Find matching webhooks
    const { data: hooks } = await supabase.from('user_webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', event)
        .eq('is_active', true)

    if (!hooks || hooks.length === 0) return

    // 2. Fire and Forget (Async)
    hooks.forEach(async (hook) => {
        try {
            const res = await fetch(hook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': hook.secret || '' },
                body: JSON.stringify({ event, payload, timestamp: new Date() })
            })

            // Log Result
            await supabase.from('webhook_logs').insert({
                webhook_id: hook.id,
                payload,
                response_status: res.status,
                response_body: await res.text().catch(() => '')
            })
        } catch (e: any) {
            console.error('Webhook failed', e)
            await supabase.from('webhook_logs').insert({
                webhook_id: hook.id,
                payload,
                response_status: 0,
                response_body: e.message
            })
        }
    })
}
