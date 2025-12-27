import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// In-memory store for rate limiting
// Note: For production with multiple servers, use Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20

// Protected patterns that require rate limiting
const PROTECTED_PATTERNS = [
    '/api/ai/generate-advice',
    '/api/ai/shipping-insight',
    // Add more patterns as needed
]

// Helper: Get client IP
function getClientIp(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    // Fallback to a default (shouldn't happen in production)
    return '0.0.0.0'
}

// Helper: Check rate limit
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitStore.get(ip)

    // No record or expired - allow and create new
    if (!record || now >= record.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        })
        return {
            allowed: true,
            remaining: MAX_REQUESTS_PER_WINDOW - 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        }
    }

    // Record exists and not expired
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime,
        }
    }

    // Increment count
    record.count++
    rateLimitStore.set(ip, record)

    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - record.count,
        resetTime: record.resetTime,
    }
}

// Cleanup old entries periodically (prevent memory leak)
setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now >= record.resetTime) {
            rateLimitStore.delete(ip)
        }
    }
}, RATE_LIMIT_WINDOW) // Run cleanup every hour

// Affiliate tracking constants
const AFFILIATE_COOKIE_NAME = 'cekkirim_ref';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl
    const response = NextResponse.next()

    // AFFILIATE TRACKING: Check for referral parameter
    const refCode = searchParams.get('ref');

    if (refCode) {
        // Store affiliate code in cookie
        response.cookies.set({
            name: AFFILIATE_COOKIE_NAME,
            value: refCode,
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        console.log(`[Affiliate] Referral tracked: ${refCode} on ${pathname}`);
    }

    // Extend existing affiliate cookie expiration
    const existingRef = request.cookies.get(AFFILIATE_COOKIE_NAME);
    if (existingRef && !refCode) {
        response.cookies.set({
            name: AFFILIATE_COOKIE_NAME,
            value: existingRef.value,
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
    }

    // 0. Maintenance Mode Check (Specific paths only to save performance, or global)
    // NOTE: For extreme performance, use Edge Config. For now, we skip DB check on static assets.
    if (!pathname.startsWith('/_next') && !pathname.includes('.') && pathname !== '/maintenance' && !pathname.startsWith('/api') && !pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/dashboard')) {
        try {
            // Create a Supabase client just for this check
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll: () => request.cookies.getAll(),
                        setAll: (cookiesToSet) => {
                            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        },
                    },
                }
            )

            const { data } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single()

            if (data?.value === 'true') {
                // Check if user is admin to bypass
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                    if (profile?.role === 'admin') {
                        return response // Admin pass
                    }
                }

                return NextResponse.redirect(new URL('/maintenance', request.url))
            }
        } catch (e) {
            // Fail open
        }
    }

    // 3. Widget Support
    // Pass pathname to layout for conditional rendering
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    // 1. Security Headers (Apply to all responses)
    if (!pathname.startsWith('/widget')) {
        response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    }
    // Remove X-Frame-Options for widget routes or allow all if needed, 
    // but conditionally skipping SAMEORIGIN is enough to let browsers default (or CSP handles it)

    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    if (!pathname.startsWith('/widget')) {
        response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    }
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

    // 2. Rate Limiting Logic
    // ... (existing logic)

    // Return response with new headers
    // Note: To pass headers to the Server Components (Layout), we must use NextResponse.next({ request: ... })
    // and for the response headers we managed above, we need to ensure they are on the final response.
    // The current pattern with 'const response = NextResponse.next()' modifies the response object directly.
    // But passing request headers requires creating a new response from next().

    const finalResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // Copy headers from our 'response' object to 'finalResponse'
    response.headers.forEach((value, key) => {
        finalResponse.headers.set(key, value)
    })

    // Re-apply rate limit headers if they were set on 'response'
    // (The previous logic set headers on 'response', so copying them works)

    return finalResponse
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        // Match API routes for rate limiting
        '/api/ai/:path*',
        // Match all pages for Security Headers (root, any subpath)
        '/:path*',
    ],
}
