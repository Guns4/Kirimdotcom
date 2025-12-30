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

  // --- 0. Emergency Lockdown Check ---
  // If lock is active, BLOCK all non-GET requests for non-Admins
  // We use a simple header check or optimistically fetch from Edge Config / DB
  // For performance, we might skip DB call here and rely on client-side or specific actions, 
  // but for "Panic Button", we enforce it.

  // NOTE: Calling Supabase DB in Middleware can add latency. 
  // In production, use Edge Config or Redis. 
  // For this setup, we check a specific 'x-system-lockdown' header if updated by CDN, 
  // or allowed simple bypass for GET.

  if (request.method !== 'GET' && !url.startsWith('/admin') && !url.startsWith('/auth')) {
    // Ideally: const isLocked = await isSystemLockedEdge();
    // For now, we assume open unless a specific cookie is set by a broadcast
    // or we skip strictly blocking at middleware level to save latency 
    // and rely on Server Actions checking `isSystemLocked()`.
  }


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
