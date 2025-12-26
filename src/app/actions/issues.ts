'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export type IssueType = 'FIX_FLOOD' | 'FIX_STRIKE' | 'FIX_OVERLOAD' | 'FIX_ADDRESS'

export interface IssueReport {
    city: string
    type: IssueType
}

export async function reportIssue(data: IssueReport) {
    const supabase = await createClient()
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'

    // Simple rate limit check could go here

    // Insert report
    // We assume table 'logistic_reports' exists
    const { error } = await (supabase.from('logistic_reports' as any)).insert({
        city: data.city,
        issue_type: data.type,
        ip_address: ip,
        // created_at is default now()
    })

    if (error) {
        console.error('Report error:', error)
        return { success: false, error: 'Gagal melapor' }
    }

    return { success: true }
}

export async function getActiveIssues() {
    const supabase = await createClient()

    // Get reports from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // In a real optimized scenario, we would use an RPC function or a materialized view
    // For now, we fetch raw recent reports and aggregate in JS (good enough for MVP < 10k rows)
    const { data, error } = await (supabase.from('logistic_reports' as any))
        .select('city, issue_type')
        .gt('created_at', yesterday)

    if (error || !data) return []

    // Aggregate
    const cityCounts: Record<string, { city: string, count: number, types: Set<string> }> = {}

    data.forEach((row: any) => {
        const city = row.city
        if (!cityCounts[city]) {
            cityCounts[city] = { city, count: 0, types: new Set() }
        }
        cityCounts[city].count++
        cityCounts[city].types.add(row.issue_type)
    })

    // Convert to array and filter significant issues (e.g. > 3 reports)
    // For demo/MVP we show all even with 1 report to prove it works
    const textIssues = Object.values(cityCounts)
        .filter(c => c.count > 0)
        .map(c => {
            const types = Array.from(c.types).map(t => {
                if (t === 'FIX_FLOOD') return 'Banjir'
                if (t === 'FIX_STRIKE') return 'Kurir Mogok'
                if (t === 'FIX_OVERLOAD') return 'Gudang Overload'
                return 'Gangguan'
            }).join('/')

            return `${c.count} Laporan ${types} di ${c.city}`
        })

    return textIssues
}
