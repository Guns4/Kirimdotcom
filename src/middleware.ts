import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkAccountFarming } from '@/lib/saas/guards/farming';

// Blacklist User-Agents commonly used by bots
const BAD_AGENTS = ['curl', 'python', 'wget', 'libwww-perl', 'postmanruntime', 'bot', 'crawler', 'spider'];

// Simple in-memory rate limiting (Production: use Redis/Upstash)
const ipRateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function middleware(request: NextRequest) {

  // Only protect SaaS API routes (Divisi 4)
  if (request.nextUrl.pathname.startsWith('/api/v1')) {

    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const apiKey = request.headers.get('x-api-key') || 'unknown';
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

    // -----------------------------------------------------------------
    // LAYER 1: GEO-BLOCKING (INDONESIA ONLY FOR FREE TIER)
    // Nuclear option: Block all non-Indonesian traffic
    // -----------------------------------------------------------------
    // Hackers using VPN usually connect to US/SG/EU servers
    // We reject all foreign traffic for this endpoint
    // Note: request.geo available when deployed on Vercel. Local dev might be undefined.
    const country = request.geo?.country || 'ID'; // Default ID on local

    if (country !== 'ID') {
      // Exception: Allow if user has Enterprise plan (Database whitelist logic here)
      // But default: REJECT
      console.warn(`[GEO-BLOCK] Rejected traffic from ${country} (IP: ${ip})`);
      return new NextResponse(
        JSON.stringify({
          error: "Geo-Restricted",
          message: "Access denied from your country. CekKirim API is strictly for Indonesian operations. Contact sales for international access.",
          country_detected: country
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // -----------------------------------------------------------------
    // LAYER 2: BOT AGENT FILTER (Anti-Automation)
    // Block requests from obvious bot user-agents
    // -----------------------------------------------------------------
    if (BAD_AGENTS.some(agent => userAgent.includes(agent))) {
      console.warn(`[BOT-FILTER] Blocked bot user-agent: ${userAgent.substring(0, 50)}`);
      return new NextResponse(
        JSON.stringify({
          error: "Bot Detected",
          message: "Invalid user-agent. Please use a real application or browser. Automated bots are not allowed on free tier.",
          detected_agent: userAgent.substring(0, 50)
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // -----------------------------------------------------------------
    // LAYER 3: MULTI-ACCOUNT FARMING (From previous patch)
    // -----------------------------------------------------------------
    if (apiKey !== 'unknown') {
      const farmingCheck = checkAccountFarming(ip, apiKey);
      if (farmingCheck.banned) {
        console.error(`[FARMING] Banned IP attempting access: ${ip}`);
        return new NextResponse(
          JSON.stringify({
            error: "IP Banned",
            message: "Suspicious activity detected. This IP has been permanently banned.",
            code: farmingCheck.reason
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // -----------------------------------------------------------------
    // LAYER 4: RATE LIMITING (60 req/min per IP)
    // -----------------------------------------------------------------
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
          message: "Rate limit exceeded. Maximum 60 requests per minute.",
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

    // -----------------------------------------------------------------
    // LAYER 5: SECURITY HEADERS
    // -----------------------------------------------------------------
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS for API
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    // Cache headers for tracking endpoints
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
