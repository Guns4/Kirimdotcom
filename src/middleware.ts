import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store (PRODUCTION MUST USE Redis/Upstash)
const ipMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {
  // Only protect SaaS API routes
  if (request.nextUrl.pathname.startsWith('/api/v1')) {

    // 1. GLOBAL SECURITY HEADERS (From previous patch)
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // 2. FINANCIAL GUARD: IP RATE LIMITING (Anti-Spam, Anti-Boncos)
    // Prevents one person from firing thousands of requests (small DDoS / Spam)
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 Minute
    const limit = 60; // Maximum 60 requests per minute per IP

    let record = ipMap.get(ip);

    if (!record || (now - record.lastReset > windowMs)) {
      // Reset window
      record = { count: 0, lastReset: now };
    }

    if (record.count >= limit) {
      console.warn(`[RATE LIMIT] IP ${ip} exceeded limit (${limit} req/min)`);
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "IP Rate limit exceeded. Maximum 60 requests per minute. Slow down.",
          retry_after: Math.ceil((windowMs - (now - record.lastReset)) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((windowMs - (now - record.lastReset)) / 1000))
          }
        }
      );
    }

    record.count++;
    ipMap.set(ip, record);

    // 3. COST GUARD: RESPONSE CACHING (Optional but powerful)
    // Tells browser/client to cache tracking data for 5 minutes
    // So they don't request the same tracking repeatedly (Saves Server Cost)
    if (request.nextUrl.pathname.includes('/track')) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
    }

    // 4. CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    return response;
  }

  // For other routes (Admin Panel / User Dashboard), pass through
  return NextResponse.next();
}

// Config matcher - only run middleware on specific routes
export const config = {
  matcher: '/api/v1/:path*',
};
