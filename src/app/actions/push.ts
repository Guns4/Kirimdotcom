'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const subscribeToPush = async (subscription: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Save subscription to DB (create 'push_subscriptions' table manually or via migration if needed)
        // For now logging to console to demo flow
        console.log('Subscribing user:', user?.id, subscription)
        
        // 2. Send test notification immediately
        const payload = JSON.stringify({ title: 'Welcome!', body: 'You are now subscribed to updates.', url: '/dashboard' })
        await webpush.sendNotification(subscription, payload)

        return { success: true }
    })
}
