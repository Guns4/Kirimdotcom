import { NextResponse } from 'next/server'
import { getRealtimeStats } from '@/lib/monitoring/realtime-stats'

export async function GET() {
    try {
        const stats = await getRealtimeStats()
        return NextResponse.json(stats)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
