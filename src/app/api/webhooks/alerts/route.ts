import { NextRequest, NextResponse } from 'next/server';
import { sendSystemAlert, AlertType } from '@/lib/telegram-alerts';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, meta } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Missing type or message' },
        { status: 400 }
      );
    }

    await sendSystemAlert(type as AlertType, message, meta);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Alert Webhook Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
