'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function logEvent(eventName: string, properties: any = {}) {
    try {
        const supabase = await createClient()
        const headersList = await headers()

        const userAgent = headersList.get('user-agent') || 'unknown'
        const referer = headersList.get('referer') || 'unknown'

        // Get user if logged in
        const { data: { user } } = await supabase.auth.getUser()

        const eventData = {
            event_name: eventName,
            properties,
            user_id: user?.id || null,
            user_agent: userAgent,
            page_url: referer,
            // session_id handled via properties or could be cookie-based if needed
        }

        const { error } = await (supabase as any).from('analytics_events').insert(eventData)

        if (error) {
            console.error('Error logging event:', error)
            // Fail silently to not impact user experience
        }
    } catch (error) {
        console.error('System error logging event:', error)
    }
}

export async function getTopCouriers(limit = 5) {
    try {
        const supabase = await createClient()

        // This requires 'click_cek_resi' event to have a 'courier' property
        // Note: Complex aggregation might normally be a view or RPC, but we'll try JS processing for simplicity 
        // if dataset is small, or raw SQL via rpc if large.
        // For MVP, let's fetch last 1000 'click_cek_resi' and client-side aggregate or use RPC if you prefer.
        // Let's assume we use a simple RPC for performance.

        // However, since RPC creation is an extra step, let's do safe client-side agg for now (MVP style).
        // Or better: Supabase .rpc() if we made one. Let's do a simple fetch for now.

        const { data, error } = await supabase
            .from('analytics_events')
            .select('properties')
            .eq('event_name', 'click_cek_resi')
            .order('created_at', { ascending: false })
            .limit(1000)

        if (error) throw error

        const counts: Record<string, number> = {}
        data?.forEach((row: any) => {
            const courier = row.properties?.courier || 'unknown'
            counts[courier] = (counts[courier] || 0) + 1
        })

        const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }))

        return { data: sorted }

    } catch (error) {
        console.error('Error fetching top couriers:', error)
        return { data: [] }
    }
}
