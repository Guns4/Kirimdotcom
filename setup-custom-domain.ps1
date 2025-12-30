# Custom Domain & Whitelabel Routing Setup (PowerShell)

Write-Host "Initializing Custom Domain Middleware Setup..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Domain Resolution Helper
Write-Host "1. Creating Domain Mapper: src/lib/domain-mapper.ts" -ForegroundColor Yellow
$dirLib = "src\lib"
if (!(Test-Path $dirLib)) { New-Item -ItemType Directory -Force -Path $dirLib | Out-Null }

$mapperContent = @'
import { createClient } from '@supabase/supabase-js';

// Note: Ensure your environment variables are available to Edge Functions.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getTenantSlugFromDomain(domain: string): Promise<string | null> {
    // 1. Remove port if local (e.g. localhost:3000 -> localhost)
    const hostname = domain.split(':')[0];

    // 2. Define your main domains to ignore
    const mainDomains = ['cekkirim.com', 'www.cekkirim.com', 'localhost', 'cekkirim.vercel.app'];
    if (mainDomains.includes(hostname)) return null;

    // 3. Check Subdomain (e.g. demo.cekkirim.com -> slug: demo)
    if (hostname.endsWith('.cekkirim.com')) {
        return hostname.replace('.cekkirim.com', '');
    }

    // 4. Check Custom Domain in DB (e.g. portal.logistic-corp.com)
    // Note: In detailed production, cache this response (e.g. Vercel KV or Edge Config) for speed.
    const { data } = await supabase
        .from('tenants')
        .select('slug')
        .eq('domain', hostname)
        .single();
    
    return data?.slug || null;
}
'@

$mapperContent | Set-Content -Path "src\lib\domain-mapper.ts" -Encoding UTF8
Write-Host "   [?] domain-mapper.ts created." -ForegroundColor Green

# 2. Middleware Implementation (MERGED)
Write-Host "2. Upgrading Middleware: src/middleware.ts (Merged Logic)" -ForegroundColor Yellow
Copy-Item "src\middleware.ts" "src\middleware.ts.bak" -ErrorAction SilentlyContinue

$middlewareContent = @'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getTenantSlugFromDomain } from '@/lib/domain-mapper';

// In-memory store for rate limiting
// Note: For production with multiple servers, use Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20;

// Helper: Get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '0.0.0.0';
}

// Helper: Check rate limit
function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now >= record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  record.count++;
  rateLimitStore.set(ip, record);
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    resetTime: record.resetTime,
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now >= record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Affiliate tracking constants
const AFFILIATE_COOKIE_NAME = 'cekkirim_ref';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const url = request.nextUrl;
  
  // Use a temporary response to collect cookies/headers initially
  const response = NextResponse.next();

  // --------------------------------------------------------------------------
  // 1. DOMAIN & TENANT RESOLUTION
  // --------------------------------------------------------------------------
  const hostname = request.headers.get('host') || '';
  const tenantSlug = await getTenantSlugFromDomain(hostname);
  let rewriteUrl: URL | null = null;

  if (tenantSlug) {
      // Rewrite URL: portal.custom.com/dashboard -> cekkirim.com/tenant/slug/dashboard
      if (!pathname.startsWith(`/tenant/${tenantSlug}`)) {
          rewriteUrl = new URL(`/tenant/${tenantSlug}${pathname}`, request.url);
      }
  }

  // --------------------------------------------------------------------------
  // 2. AFFILIATE TRACKING
  // --------------------------------------------------------------------------
  const refCode = searchParams.get('ref');
  if (refCode) {
    response.cookies.set({
      name: AFFILIATE_COOKIE_NAME,
      value: refCode,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
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

  // --------------------------------------------------------------------------
  // 3. MAINTENANCE MODE
  // --------------------------------------------------------------------------
  // Skip checks for static assets, APIs, admin, login, etc.
  if (
    !pathname.startsWith('/_next') &&
    !pathname.includes('.') &&
    pathname !== '/maintenance' &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/dashboard')
  ) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              );
            },
          },
        }
      );

      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (data?.value === 'true') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
             // Admin pass
          } else {
             return NextResponse.redirect(new URL('/maintenance', request.url));
          }
        } else {
             return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    } catch (e) {
      // Fail open
    }
  }

  // --------------------------------------------------------------------------
  // 4. SECURITY HEADERS & REQUEST PREP
  // --------------------------------------------------------------------------
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  if (!pathname.startsWith('/widget')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  // --------------------------------------------------------------------------
  // 5. FINAL RESPONSE CONSTRUCTION
  // --------------------------------------------------------------------------
  // Decide: Rewrite or Next?
  let finalResponse;

  if (rewriteUrl) {
      finalResponse = NextResponse.rewrite(rewriteUrl, {
          request: {
              headers: requestHeaders,
          },
      });
  } else {
      finalResponse = NextResponse.next({
          request: {
              headers: requestHeaders,
          },
      });
  }

  // Copy Headers
  response.headers.forEach((value, key) => {
    finalResponse.headers.set(key, value);
  });

  // Copy Cookies
  response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie);
  });

  return finalResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
'@

$middlewareContent | Set-Content -Path "src\middleware.ts" -Encoding UTF8
Write-Host "   [?] middleware.ts Merged and Updated." -ForegroundColor Green

# 3. Setup Guide
Write-Host "3. Creating Setup Guide: CNAME_SETUP.md" -ForegroundColor Yellow

$guideContent = @'
# Custom Domain (CNAME) Setup Guide for Whitelabeling

## 1. Vercel Configuration
To allow multiple custom domains to point to your single project:

1.  Go to your Vercel Project Dashboard.
2.  Navigate to **Settings** > **Domains**.
3.  Add the client's domain (e.g., `portal.logistic-corp.com`).
4.  Vercel will provide DNS records (A Record or CNAME) for the client to configure.

## 2. Client DNS Configuration
Ask your client to add a CNAME record in their DNS provider (GoDaddy, Cloudflare, etc.):

-   **Type**: CNAME
-   **Name**: portal (or www)
-   **Value**: cname.vercel-dns.com. (or your specific Vercel alias)

## 3. Database Entry
Once the domain is verified on Vercel:
1.  Go to your `public.tenants` table.
2.  Update the record for the client:
    -   **domain**: `portal.logistic-corp.com`
    -   **slug**: `logistic-corp`

## 4. Verification
Visit `https://portal.logistic-corp.com`.
-   The middleware will detect the host.
-   It resolves to slug `logistic-corp`.
-   Next.js rewrites the view to `src/app/tenant/[slug]/page.tsx`.
-   The user sees their branded dashboard while the URL remains `portal.logistic-corp.com`.
'@

$guideContent | Set-Content -Path "CNAME_SETUP.md" -Encoding UTF8
Write-Host "   [?] Guide created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Domain Middleware Setup Complete!" -ForegroundColor Green
Write-Host "1. 'src/middleware.ts' has been UPDATED." -ForegroundColor White
Write-Host "2. Read 'CNAME_SETUP.md' for infrastructure configuration." -ForegroundColor White
