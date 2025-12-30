#!/bin/bash

# setup-bot-alerts.sh
# Sets up Proactive Alerting with Telegram Bot + Sentry Integration
# Usage: ./setup-bot-alerts.sh

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Starting Bot Alert System Setup...${NC}"

# 1. Install Dependencies
echo -e "${YELLOW}>>> Installing @sentry/nextjs...${NC}"
npm install @sentry/nextjs

# 2. Setup Sentry Config Files (Basic Templates)
echo -e "${YELLOW}>>> Creating Sentry Configurations...${NC}"

# sentry.client.config.ts
cat << 'EOF' > sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Replay, Tracing, etc.
  integrations: [
    Sentry.replayIntegration(),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});
EOF

# sentry.server.config.ts
cat << 'EOF' > sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
EOF

# sentry.edge.config.ts
cat << 'EOF' > sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
});
EOF

# 3. Create Bot Alerts Library (Server-Side / Node.js)
echo -e "${YELLOW}>>> Creating src/lib/bot-alerts.ts...${NC}"

cat << 'EOF' > src/lib/bot-alerts.ts
import { bot } from '@/lib/telegram';
import { createClient } from '@/utils/supabase/server';

/**
 * ALERT SYSTEM
 * Handles critical system notifications to Telegram
 */

export class BotAlerts {
  private static async send(message: string, type: 'WARNING' | 'CRITICAL' | 'INFO' = 'INFO') {
    const adminId = process.env.TELEGRAM_ADMIN_ID;
    if (!adminId) {
      console.warn('TELEGRAM_ADMIN_ID not set, skipping alert.');
      return;
    }

    const icon = type === 'CRITICAL' ? '🔥' : type === 'WARNING' ? '⚠️' : 'ℹ️';
    const text = `${icon} *[${type}] System Alert*\n\n${message}`;

    try {
      // Inline Keyboard for Actions
      const extra = type !== 'INFO' ? {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🚫 Ban IP', callback_data: 'ban_ip_action_placeholder' },
              { text: '🔄 Restart Server', callback_data: 'restart_server' }
            ]
          ]
        },
        parse_mode: 'Markdown' as const
      } : { parse_mode: 'Markdown' as const };

      await bot.telegram.sendMessage(adminId, text, extra);
    } catch (error) {
      console.error('Failed to send Telegram alert:', error);
    }
  }

  /**
   * Monitor Transaction Health (Called periodically or after failures)
   * Trigger: > 10 Consecutive Failed Transactions
   */
  static async checkTransactionHealth() {
    const supabase = await createClient();
    
    // Fetch last 15 payments to be safe
    const { data: payments } = await supabase
      .from('payment_history')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!payments || payments.length < 10) return;

    // Count consecutive failures from the most recent
    let consecutiveFailures = 0;
    for (const p of payments) {
      if (p.status === 'failed' || p.status === 'rejected' || p.status === 'error') {
        consecutiveFailures++;
      } else {
        break; // Stop counting if we hit a success or pending
      }
    }

    if (consecutiveFailures >= 10) {
      await this.send(
        `🚨 *CRITICAL TRANSACTION FAILURE*\n\nDetected ${consecutiveFailures} consecutive failed transactions.\nCheck Payment Gateway immediately!`,
        'CRITICAL'
      );
    }
  }

  /**
   * Report High Error Rate (Manual Trigger)
   * To be called if an Error Boundary catches too many exceptions
   */
  static async reportHighErrorRate(errorCount: number, windowSeconds: number) {
    await this.send(
      `📉 *High Error Rate Detected*\n\n${errorCount} errors in the last ${windowSeconds}s.\nExceeds 5% threshold.`,
      'WARNING'
    );
  }
}
EOF

# 4. Update Middleware for Security Alerts (Edge Compatible)
echo -e "${YELLOW}>>> Updating src/middleware.ts with Security Alerts...${NC}"

# We use a direct fetch to Telegram API in Middleware to avoid 'native module' errors with Telegraf in Edge Runtime
# Warning: This overwrites src/middleware.ts. Ensure backups if modifying complex logic.

cat << 'EOF' > src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PROTECTED_ROUTES } from '@/config/admin-permissions';
import { AdminRole } from '@/lib/admin-rbac';

// Helper to send Telegram Alert from Edge (using Fetch)
async function sendEdgeAlert(message: string, ip: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (!token || !adminId) return;

  const text = `👮‍♂️ *SECURITY ALERT*\n\n${message}\n\n*IP:* \`${ip}\``;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
             [{ text: `🚫 Ban IP ${ip}`, callback_data: `ban_ip:${ip}` }]
          ]
        }
      })
    });
  } catch (err) {
    console.error('Failed to send edge alert', err);
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options: _options }) => response.cookies.set(name, value, _options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
  const country = (request as any).geo?.country || 'ID'; // Default to ID (Indonesia) if local/undefined

  // 1. Auth Guard for Admin
  if (url.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Role Guard for Admin sub-routes
  if (url.startsWith('/admin') && user) {
    // Quick Security Check for Foreign IP Login
    // Trigger: Login Admin dari IP Asing
    if (country !== 'ID') {
       // We don't block, but we alert.
       // Use waitUntil to not block the response
       const context = (request as any);
       if (context.waitUntil) {
          context.waitUntil(sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip));
       } else {
          // Fire and forget catch
          sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip).catch(console.error);
       }
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = (profile?.role || 'SUPPORT') as AdminRole;

    const matchingRoute = Object.keys(PROTECTED_ROUTES).find(route => url.startsWith(route));

    if (matchingRoute) {
      const allowedRoles = PROTECTED_ROUTES[matchingRoute];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
EOF

echo -e "${GREEN}>>> Setup Complete!${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure 'SENTRY_DSN' in your .env.local"
echo "2. Add 'Sentry.captureException(err)' in your error handlers."
echo "3. Call 'BotAlerts.checkTransactionHealth()' in your Cron or Payment Webhook."
