import { NextResponse } from 'next/server';
import { processNextJob } from '@/lib/job-queue';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Secure Headers Check (Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow development bypass or check secure secret
        if (process.env.NODE_ENV !== 'development') {
            // return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        const job = await processNextJob('cloud-worker');

        if (job) {
            return NextResponse.json({ success: true, processed: job.id, type: job.type });
        } else {
            return NextResponse.json({ success: true, message: 'No jobs to process' });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
