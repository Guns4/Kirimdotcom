import { NextResponse } from 'next/server';
import { PlayStoreBot } from '@/lib/bot/play-store-service';

export async function POST(req: Request) {
    // Verify Secret
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== process.env.BOT_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run Bot
    // In production, this might be a Vercel Cron Job
    const result = await PlayStoreBot.scanAndReply();

    return NextResponse.json(result);
}
