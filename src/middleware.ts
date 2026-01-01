import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isVpnOrDatacenter } from '@/lib/saas/guards/vpn';
import { checkAccountFarming } from '@/lib/saas/guards/farming';

// Simple in-memory rate limiting (Production: use Redis/Upstash)
const ipRateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {
  // Only protect SaaS API routes
  if (request.nextUrl.pathname.startsWith('/api/v1')) {

    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const apiKey = request.headers.get('x-api-key') || 'unknown';

    // LAYER 1: VPN/DATACENTER BLOCK (Free Tier Protection)
    // Only for API endpoints, don't block main website
    if (isVpnOrDatacenter(ip)) {
      // Exception: Allow if user has Enterprise plan (IP whitelisted in DB)
      // But for default free tier, we reject
      console.warn(`[VPN SHIELD] Blocked VPN/Datacenter IP: ${ip}`);
      return new NextResponse(
        JSON.stringify({
          error: "Access Denied",
          message: "VPN/Proxy/Datacenter IPs are not allowed on Free Tier. Please use a residential connection or upgrade to Enterprise for IP whitelisting.",
          code: "VPN_BLOCKED"
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // LAYER 2: MULTI-ACCOUNT FARMING PROTECTION
    if (apiKey !== 'unknown') {
      const farmingCheck = checkAccountFarming(ip, apiKey);
      if (farmingCheck.banned) {
        console.error(`[FARMING SHIELD] Banned IP attempting access: ${ip}`);
        return new NextResponse(
          JSON.stringify({
            error: "IP Banned",
            message: "Suspicious activity detected. Multiple accounts linked to this IP. This IP has been permanently banned. Contact support@cekkirim.com if this is an error.",
            code: farmingCheck.reason
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // LAYER 3: RATE LIMITING (From previous patch)
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 60;

    let record = ipRateLimitMap.get(ip);

    if (!record || (now - record.lastReset > windowMs)) {
      record = { count: 0, lastReset: now };
    }

    if (record.count >= limit) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Max 60 requests per minute.",
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
    ipRateLimitMap.set(ip, record);

    // LAYER 4: SECURITY HEADERS
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS for API
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    // Cache headers for tracking endpoints (cost optimization)
    if (request.nextUrl.pathname.includes('/track')) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=59');
    }

    return response;
  }

  // For other routes (Admin Panel / User Dashboard), pass through
  return NextResponse.next();
}

// Config matcher - only run middleware on specific routes
export const config = {
  matcher: '/api/v1/:path*',
};
