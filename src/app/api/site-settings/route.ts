import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/site-settings
 * Fetch site settings for client-side consumption
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching site settings:', error.message)
            return NextResponse.json(
                { error: 'Failed to fetch site settings', settings: null },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { settings: data },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
                },
            }
        )
    } catch (error) {
        console.error('Failed to fetch site settings:', error)
        return NextResponse.json(
            { error: 'Internal server error', settings: null },
            { status: 500 }
        )
    }
}
