'use server'

import { createClient } from '@/utils/supabase/server'

export async function getFunnelStats() {
    try {
        const supabase = await createClient()

        // 1. Get raw counts for each event type (MVP approach)
        // Group by event_name and count unique session_ids/user_ids

        // Step 1: View Register Page
        const { count: step1 } = await (supabase as any)
            .from('analytics_events')
            .select('id', { count: 'exact' })
            .eq('event_name', 'view_register_page')

        // Step 2: Complete Registration
        const { count: step2 } = await (supabase as any)
            .from('analytics_events')
            .select('id', { count: 'exact' })
            .eq('event_name', 'complete_registration')

        // Step 3: Paid (Payment Success)
        // We can track 'payment_success' event, or count rows in payment_history with status='paid'
        // Let's rely on analytics event 'complete_purchase' for consistency with the funnel concept,
        // assuming we instrument the webhook/success page to log this.
        const { count: step3 } = await (supabase as any)
            .from('analytics_events')
            .select('id', { count: 'exact' })
            .eq('event_name', 'complete_purchase')

        return {
            data: {
                visitors: step1 || 0,
                registered: step2 || 0,
                paid: step3 || 0
            }
        }
    } catch (error) {
        console.error('Error fetching funnel stats:', error)
        return { data: { visitors: 0, registered: 0, paid: 0 } }
    }
}
