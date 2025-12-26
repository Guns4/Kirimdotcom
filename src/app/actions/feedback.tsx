'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export type FeedbackType = 'bug' | 'feature' | 'general' | 'other'

export interface FeedbackData {
    type: FeedbackType
    rating?: number
    message: string
    pageUrl?: string
    userAgent?: string
}

export async function submitFeedback(data: FeedbackData) {
    try {
        const supabase = await createClient()

        // Get user IP for rate limiting/spam protection (basic)
        const headersList = headers()
        const ip = (await headersList).get('x-forwarded-for') || 'unknown'

        // Cast to any to bypass Strict Type Checking for new table
        const { error } = await (supabase.from('app_feedback' as any)).insert({
            type: data.type,
            rating: data.rating,
            message: data.message,
            page_url: data.pageUrl,
            user_agent: data.userAgent,
            ip_address: ip,
        })

        if (error) {
            console.error('Feedback submission error:', error)
            return { success: false, error: 'Gagal mengirim feedback' }
        }

        return { success: true }
    } catch (error) {
        console.error('Feedback error:', error)
        return { success: false, error: 'Terjadi kesalahan sistem' }
    }
}
