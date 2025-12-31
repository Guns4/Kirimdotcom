import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return request.cookies.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    response.cookies.delete(name); // Fix delete method
                },
            },
        }
    );

    // 1. Get User (Triggers Token Refresh if needed)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        // If token refresh fails (e.g. Reuse Detected), error will be thrown here or user will be null
        // Log the security event
        console.warn('[SECURITY] Session Verification Failed:', error.message);

        // 2. Redirect to Login if accessing protected route
        if (!request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
            return NextResponse.redirect(new URL('/login?error=session_expired', request.url));
        }
    }

    return response;
}
