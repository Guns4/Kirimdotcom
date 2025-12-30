import { NextResponse } from 'next/server';
import { notifyChannel } from '@/lib/telegram-notifier';

export async function POST(request: Request) {
  // 1. Security Check (Basic Secret or Database Webhook Signature)
  // For Supabase DB Webhooks, you might simply rely on the Service Role or a shared secret query param
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.BLOG_NOTIFIER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Supabase DB Webhook Payload Structure
    // { type: 'INSERT' | 'UPDATE', table: 'articles', record: { ... }, old_record: { ... } }

    const { type, record, old_record } = body;

    // Condition: Status changes to 'published' OR New row inserted with 'published'
    const isPublishedNow = record?.status === 'published';
    const wasPublishedBefore = old_record?.status === 'published';

    if (isPublishedNow && !wasPublishedBefore) {
      // Trigger Notification
      await notifyChannel(record.title, record.slug);
      return NextResponse.json({
        success: true,
        message: 'Notification triggered',
      });
    }

    return NextResponse.json({ success: true, message: 'No action needed' });
  } catch (e: any) {
    console.error('Webhook Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
