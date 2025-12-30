import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PROTECTED_ROUTES } from '@/config/admin-permissions';
import { AdminRole } from '@/lib/admin-rbac';

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
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.pathname;

  // 1. Auth Guard for Admin
  if (url.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Role Guard for Admin sub-routes
  if (url.startsWith('/admin') && user) {
    // Fetch Admin Role
    // Optimization: Use a quick RPC or stored procedure, or rely on metadata if synced.
    // For security, we query the DB table directly here.
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = (profile?.role || 'SUPPORT') as AdminRole; // Default fallback to restricted role

    // Check Permissions
    // We find the definition that matches the start of the current path
    const matchingRoute = Object.keys(PROTECTED_ROUTES).find(route => url.startsWith(route));

    if (matchingRoute) {
      const allowedRoles = PROTECTED_ROUTES[matchingRoute];
      if (!allowedRoles.includes(userRole)) {
        // Access Denied
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
