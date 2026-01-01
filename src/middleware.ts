import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// RATE LIMIT STORE (In-Memory for Edge)
const ipRateMap = new Map<string, { count: number; lastReset: number }>();

// Simple VPN/Datacenter detection (enhance with real service like IPQuality later)
function isVpnOrDatacenter(ip: string): boolean {
  // Common datacenter/cloud IP ranges (simplified)
  const suspiciousRanges = ['10.', '172.', '192.168.'];
  return suspiciousRanges.some(range => ip.startsWith(range));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.ip || '127.0.0.1';
  const country = request.geo?.country || 'ID';
  const userAgent = request.headers.get('user-agent') || '';

  // ZONE 1: PUBLIC ASSETS (Bypass untuk performa)
  if (path.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // ZONE 2: GEO-FENCING (Indonesia Only untuk routes sensitif)
  // ONLY apply to sensitive admin/API routes, NOT public pages
  const protectedRoutes = ['/api/admin', '/api/saas', '/admin', '/console', '/god-mode'];
  const isProtected = protectedRoutes.some(r => path.startsWith(r));

  // DEVELOPMENT MODE BYPASS
  const isDevelopment = process.env.NODE_ENV === 'development' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    userAgent.includes('Vercel');

  if (isProtected && country !== 'ID' && !isDevelopment) {
    // Exception untuk bots
    if (userAgent.includes('Applebot') || userAgent.includes('Googlebot')) {
      // Allow crawlers and Vercel bot
    } else {
      return new NextResponse(
        JSON.stringify({
          error: "Access Denied",
          message: "This section is only available in Indonesia."
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ZONE 3: VPN & BOT SHIELD
  if (isProtected && isVpnOrDatacenter(ip)) {
    return new NextResponse(
      JSON.stringify({
        error: "Security Alert",
        message: "VPN/Proxy connections are not allowed."
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ZONE 4: WAF RATE LIMITING
  let limit = 50;
  let windowMs = 60 * 1000;

  if (path.startsWith('/api')) limit = 300; // 5 req/sec
  if (path.startsWith('/auth')) limit = 5;  // Strict login

  let record = ipRateMap.get(ip);
  const now = Date.now();

  if (!record || (now - record.lastReset > windowMs)) {
    record = { count: 0, lastReset: now };
  }

  if (record.count >= limit) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "Slow down. Velocity check triggered."
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  record.count++;
  ipRateMap.set(ip, record);

  // ZONE 5: SECURITY HEADERS (OWASP)
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
