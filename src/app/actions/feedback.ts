'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export type FeedbackType = 'bug' | 'feature' | 'general' | 'nps' | 'other'

export interface FeedbackData {
    type: FeedbackType
    rating?: number // 1-5 for general, 0-10 for NPS
    message?: string
    pageUrl?: string
    userAgent?: string
}

export async function submitFeedback(data: FeedbackData) {
    try {
        const supabase = await createClient()
        const headersList = headers()
        const ip = (await headersList).get('x-forwarded-for') || 'unknown'

        // Log to console in dev
        console.log('[Feedback]', data)

        // Insert into app_feedback
        const { error } = await (supabase.from('app_feedback' as any)).insert({
            type: data.type,
            // Map rating to appropriate column if needed, or just use 'rating'
            // For NPS (0-10), we can reuse 'rating' or add 'nps_score'
            // Keep it simple: reuse 'rating' column
            rating: data.rating,
            message: data.message || '',
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

export async function getFeedbackFeed(limit = 10) {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase as any)
            .from('app_feedback')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return { data: data || [] }
    } catch (error) {
        console.error('Error fetching feedback:', error)
        return { data: [] }
    }
}

export async function getNPSStats() {
    try {
        const supabase = await createClient()

        // Fetch only NPS type
        const { data } = await (supabase as any)
            .from('app_feedback')
            .select('rating')
            .eq('type', 'nps')
            .limit(1000)

        if (!data || data.length === 0) return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 }

        let promoters = 0
        let passives = 0
        let detractors = 0

        data.forEach((item: any) => {
            const score = item.rating || 0
            if (score >= 9) promoters++
            else if (score >= 7) passives++
            else detractors++
        })

        const total = data.length
        const score = Math.round(((promoters - detractors) / total) * 100)

        return { score, promoters, passives, detractors, total }

    } catch (error) {
        return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 }
    }
}
