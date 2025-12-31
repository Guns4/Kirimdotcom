import { NextRequest, NextResponse } from 'next/server';
import { DMS } from '@/lib/dead-mans-switch';

export async function GET(req: NextRequest) {
    // Security: Verify cron secret if needed
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        const result = await DMS.checkStatusAndTrigger();
        return NextResponse.json(result);
    } catch (error) {
        console.error('DMS Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
