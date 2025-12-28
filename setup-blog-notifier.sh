#!/bin/bash

# =============================================================================
# Setup Blog Notifier (Phase 115)
# Telegram Marketing Automation
# =============================================================================

echo "Setting up Blog Notifier..."
echo "================================================="
echo ""

# 1. Telegram Library
echo "1. Creating Library: src/lib/telegram-notifier.ts"

cat <<EOF > src/lib/telegram-notifier.ts
const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function notifyChannel(title: string, slug: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !channelId) {
        console.warn('Telegram credentials missing. Skipping notification.');
        return { success: false, error: 'Missing credentials' };
    }

    // Construct Message
    const url = \`https://cekkirim.com/blog/\${slug}\`; // Adjust base URL as needed
    const text = \`
📢 *ARTIKEL BARU TAYANG!*

*_\${title}_*

👉 Baca selengkapnya di sini:
\${url}

#CekKirim #Logistik #Tips
\`.trim();

    try {
        const res = await fetch(\`\${TELEGRAM_API}\${token}/sendMessage\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: channelId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        const data = await res.json();
        
        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return { success: false, error: data.description };
        }

        console.log('[Telegram] Notification sent for:', title);
        return { success: true, data };
    } catch (error) {
        console.error('Telegram Network Error:', error);
        return { success: false, error: 'Network error' };
    }
}
EOF
echo "   [✓] Telegram library created."
echo ""

# 2. Webhook Route
echo "2. Creating Webhook: src/app/api/webhooks/blog-published/route.ts"
mkdir -p src/app/api/webhooks/blog-published

cat <<EOF > src/app/api/webhooks/blog-published/route.ts
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
            return NextResponse.json({ success: true, message: 'Notification triggered' });
        }

        return NextResponse.json({ success: true, message: 'No action needed' });
    } catch (e: any) {
        console.error('Webhook Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
EOF
echo "   [✓] Webhook route created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo ""
echo "Configuration Steps:"
echo "1. Get a Bot Token from @BotFather."
echo "2. Create a Channel, add the Bot as Administrator."
echo "3. Get Channel ID (e.g. -100xxxxxxx)."
echo "4. Update .env.local:"
echo "   TELEGRAM_BOT_TOKEN=..."
echo "   TELEGRAM_CHANNEL_ID=..."
echo "   BLOG_NOTIFIER_SECRET=my-secret-key"
echo ""
echo "Usage:"
echo "- Option A: Setup Supabase Database Webhook to POST to /api/webhooks/blog-published?secret=..."
echo "- Option B: Call notifyChannel() directly in your Server Action (publishArticle)."
