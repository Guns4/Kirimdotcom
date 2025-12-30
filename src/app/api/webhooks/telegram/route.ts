import { bot } from '@/lib/telegram';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    // Optional: Validate secret token if configured in setWebhook

    const body = await req.json();

    // Process update
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram Webhook Active' });
}
