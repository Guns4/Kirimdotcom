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
      const context = request as any;
      if (context.waitUntil) {
        context.waitUntil(
          sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip)
        );
      } else {
        // Fire and forget catch
        sendEdgeAlert(`Admin Access from Foreign IP (${country})`, ip).catch(
          console.error
        );
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
