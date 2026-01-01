import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARY EMERGENCY FIX - MIDDLEWARE DISABLED
// TODO: Re-enable security features after diagnosing issue

export async function middleware(request: NextRequest) {
  // PASSTHROUGH ONLY - No blocking
  const response = NextResponse.next();

  // Minimal security headers only
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
