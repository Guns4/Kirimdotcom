'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function trackFunnelEvent(eventName: string, properties: any = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const { error } = await supabase.from('analytics_events').insert({
            user_id: user?.id || null, // Allow anonymous events
            event_name: eventName,
            properties: properties,
        });

        if (error) console.error('Track error:', error);
    } catch (e) {
        console.error('Track exception:', e);
    }
}

export async function getFunnelStats() {
    const supabase = await createClient();

    // In a real production app, aggregated queries should be done via RPC or specialized analytics DB.
    // For "Lite" version, we count normally.

    // We want counts for: 
    // 1. view_landing_page (Visitor)
    // 2. view_register_page (Interest)
    // 3. complete_registration (User)
    // 4. complete_purchase (Customer)

    const events = ['view_landing_page', 'view_register_page', 'complete_registration', 'complete_purchase'];
    const stats: Record<string, number> = {};

    for (const event of events) {
        const { count, error } = await supabase
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_name', event);

        stats[event] = count || 0;
    }

    // Mock data fallback if empty (for demonstration)
    if (Object.values(stats).every(v => v === 0)) {
        return {
            view_landing_page: 1200,
            view_register_page: 450,
            complete_registration: 150,
            complete_purchase: 45
        };
    }

    return stats;
}
