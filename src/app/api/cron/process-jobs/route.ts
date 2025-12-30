import { processPendingJobs } from '@/lib/job-queue';
import { NextResponse } from 'next/server';

// Cron secrets should be validated here in real production
export async function GET() {
    try {
        const result = await processPendingJobs();
        return NextResponse.json({
            success: true,
            message: 'Worker ran successfully',
            processed: result?.processed || 0
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Worker failed' }, { status: 500 });
    }
}
