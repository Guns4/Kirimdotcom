import { NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/systemHealth';

/**
 * API Route: System Health Check
 * GET /api/health
 * Used by cron jobs and monitoring
 */

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const health = await getSystemHealth();

        const statusCode = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 200 : 503;

        return NextResponse.json(health, {
            status: statusCode,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date(),
            },
            { status: 500 }
        );
    }
}
