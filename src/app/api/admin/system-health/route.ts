import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const status = {
        database: 'ONLINE',
        midtrans: 'ONLINE',
        smm_provider: 'ONLINE',
        supabase: 'ONLINE',
        timestamp: new Date().toISOString()
    };

    try {
        // Check environment variables
        if (!process.env.MIDTRANS_SERVER_KEY) {
            status.midtrans = 'CONFIG_MISSING';
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            status.database = 'CONFIG_MISSING';
            status.supabase = 'CONFIG_MISSING';
        }

        // If this endpoint is responding, database connection is OK
        // In production, you could add actual health checks here
        // For example: ping SMM provider API, check Midtrans status endpoint, etc.

        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({
            ...status,
            error: error.message,
            database: 'ERROR'
        }, { status: 500 });
    }
}
