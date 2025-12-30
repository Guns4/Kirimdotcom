#!/bin/bash

# =============================================================================
# ChatOps: Telegram Admin Bot (Task 103)
# =============================================================================

echo "Initializing Telegram Bot Infrastructure..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing Telegraf..."
npm install telegraf

# 2. Bot Logic & Security Middleware
echo "2. Creating Lib: src/lib/telegram.ts"
mkdir -p src/lib

cat <<'EOF' > src/lib/telegram.ts
import { Telegraf } from 'telegraf';

// Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN is not defined');
}

export const bot = new Telegraf(token || 'dummy_token');

// SECURITY MIDDLEWARE
// Only allow the authorized Admin ID to interact with this bot.
bot.use(async (ctx, next) => {
    if (!adminId) {
        console.warn('TELEGRAM_ADMIN_ID is not set! Bot is insecure.');
        return next();
    }

    const userId = ctx.from?.id.toString();
    
    if (userId !== adminId) {
        // Silently ignore or Log unauthorized access attempt
        console.warn(`Unauthorized Bot Access Attempt from ID: ${userId} (${ctx.from?.username})`);
        return; // Stop execution
    }

    return next();
});

// Commands
bot.start((ctx) => {
    ctx.reply(
        '🤖 *Admin Bot Online*\n\n' +
        'Welcome, Commander. Systems are operational.\n\n' +
        '/status - Check System Health\n' +
        '/balance - Check Ledger Balance\n' +
        '/deploy_status - Check Vercel Status', 
        { parse_mode: 'Markdown' }
    );
});

bot.command('status', (ctx) => {
    // You could fetch real DB stats here
    ctx.reply('✅ Systems Normal. Database: Connected. Redis: Standby.');
});

bot.command('balance', (ctx) => {
    // Mock balance check
    ctx.reply('💰 *Current Float*:\nRp 150.000.000', { parse_mode: 'Markdown' });
});

bot.on('text', (ctx) => {
    ctx.reply('Command not recognized. Try /start');
});
EOF

# 3. Webhook Route
echo "3. Creating API: src/app/api/webhooks/telegram/route.ts"
mkdir -p src/app/api/webhooks/telegram

cat <<'EOF' > src/app/api/webhooks/telegram/route.ts
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Telegram Webhook Active' });
}
EOF

echo ""
echo "================================================="
echo "Bot Setup Complete!"
echo ""
echo "NEXT STEPS:"
echo "1. Add to .env.local:"
echo "   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
echo "   TELEGRAM_ADMIN_ID=987654321"
echo ""
echo "2. Set Webhook (After Deployment):"
echo "   curl -F \"url=https://YOUR_DOMAIN/api/webhooks/telegram\" https://api.telegram.org/bot<TOKEN>/setWebhook"
