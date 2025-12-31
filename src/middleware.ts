import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PROTECTED_ROUTES } from '@/config/admin-permissions';
import { AdminRole } from '@/lib/admin-rbac';
// import { checkRateLimit } from '@/lib/security/ratelimit'; // Commented out until @vercel/kv is configured

// Helper to send Telegram Alert from Edge (using Fetch)
async function sendEdgeAlert(message: string, ip: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (!token || !adminId) return;

  const text = `👮‍♂️ *SECURITY ALERT*\\n\\n${message}\\n\\n*IP:* \\`${ ip }\\``;
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
            [{ text: `🚫 Ban IP ${ip}`, callback_data: `ban_ip:${ip}` }],
          ],
        },
      }),
    });
  } catch (err) {
    console.error('Failed to send edge alert', err);
  }
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // --- 1. RATE LIMITING CHECK ---
  // Note: Uncomment this block after setting up KV_REST_API_URL and KV_REST_API_TOKEN in .env
  /*
  try {
    // Basic Public Limit
    const { success, limit, remaining, reset } = await checkRateLimit(ip, 'PUBLIC');
    
    if (!success) {
      console.warn(`[RATE LIMIT] IP Blocked: ${ip}`);
      // Log blocked attempt (optional)
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
        }
      });
    }
  } catch (e) {
    console.error('Rate limit error, failing open', e);
  }
  */

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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options: _options }) =>
            response.cookies.set(name, value, _options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.pathname;
  const country = (request as any).geo?.country || 'ID'; // Default to ID (Indonesia) if local/undefined

  // --- 2. Emergency Lockdown Check ---
  if (request.method !== 'GET' && !url.startsWith('/admin') && !url.startsWith('/auth')) {
    // Lockdown logic placeholer
  }

  // --- 3. Auth & Role Guard ---
  if (url.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Quick Security Check for Foreign IP Login
    if (country !== 'ID') {
      const context = request as any;
      if (context.waitUntil) {
        context.waitUntil(
          sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip)
        );
      } else {
        sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip).catch(console.error);
      }
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = (profile?.role || 'SUPPORT') as AdminRole;

    const matchingRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
      url.startsWith(route)
    );

    if (matchingRoute) {
      const allowedRoles = PROTECTED_ROUTES[matchingRoute];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(
          new URL('/admin/unauthorized', request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths EXCEPT:
    // - /api/* (API routes handled separately)
    // - static files and assets
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
