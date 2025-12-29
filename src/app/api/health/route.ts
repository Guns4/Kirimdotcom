import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const startTime = Date.now();

    try {
        const supabase = await createClient();

        // 1. Database Connectivity Check
        const { error } = await (supabase.from('tenants') as any).select('count', { count: 'exact', head: true });

        const responseTime = Date.now() - startTime;

        if (error) {
            console.error('Health Check DB Error:', error);

            return NextResponse.json(
                {
                    status: 'degraded',
                    db: 'error',
                    detail: error.message,
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                },
                { status: 503 }
            );
        }

        // 2. Success - All systems operational
        return NextResponse.json(
            {
                status: 'healthy',
                db: 'connected',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                }
            }
        );
    } catch (err: any) {
        const responseTime = Date.now() - startTime;

        return NextResponse.json(
            {
                status: 'error',
                message: err.message,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
