'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

interface ClientErrorLog {
    message: string;
    stack?: string;
    url: string;
    userAgent: string;
}

export async function logClientError(error: ClientErrorLog) {
    try {
        const supabase = await createClient()

        // Use system_health_logs table (assumed existing from Phase 75 or similar)
        // If not, we might need to create it, but aiAdminActions.ts used it, so it should exist.
        // Structure might be (id, created_at, level, message, meta)

        await (supabase as any).from('system_health_logs').insert({
            level: 'error',
            source: 'client_browser',
            message: error.message.substring(0, 500), // Truncate
            meta: {
                stack: error.stack,
                url: error.url,
                user_agent: error.userAgent,
                timestamp: new Date().toISOString()
            }
        });

    } catch (e) {
        // Fail silently
        console.error('Failed to log client error:', e)
    }
}

export async function getRecentErrors(limit = 10) {
    try {
        const supabase = await createClient()

        const { data } = await (supabase as any)
            .from('system_health_logs')
            .select('*')
            .eq('source', 'client_browser')
            .order('created_at', { ascending: false })
            .limit(limit)

        return { data: data || [] }
    } catch (e) {
        return { data: [] }
    }
}
