import { NextRequest, NextResponse } from 'next/server';

// Configuration
const MAIN_DOMAIN = 'cekkirim.com';
const DEV_DOMAINS = ['localhost:3000', 'localhost'];

/**
 * Handles multitenant domain rewriting for custom client domains.
 * Enables whitelabel functionality (e.g., portal.logistik-a.com)
 *
 * @param req NextRequest
 * @returns NextResponse (rewrite) or null (if no rewrite needed)
 */
export function handleDomainRewrite(req: NextRequest): NextResponse | null {
  const hostname = req.headers.get('host') || '';
  const { pathname, search } = req.nextUrl;

  // 1. Skip if main domain, dev, or Vercel preview
  if (
    hostname === MAIN_DOMAIN ||
    DEV_DOMAINS.some((dev) => hostname.startsWith(dev)) ||
    hostname.endsWith('.vercel.app')
  ) {
    return null; // No rewrite needed
  }

  // 2. Identify Tenant from Hostname
  // In production, use:
  // - Edge Config (recommended for performance)
  // - KV Store (Redis)
  // - Database lookup (slower, use caching)

  const tenantSlug = getTenantSlug(hostname);

  if (!tenantSlug) {
    // Unknown domain - redirect to main site
    const url = req.nextUrl.clone();
    url.hostname = MAIN_DOMAIN;
    url.pathname = '/404';
    return NextResponse.redirect(url);
  }

  // 3. Rewrite URL to tenant route
  // Example: portal.logistik-a.com/track -> /tenant/logistik-a/track
  const newUrl = req.nextUrl.clone();
  newUrl.pathname = `/tenant/${tenantSlug}${pathname}`;

  // Store original host for reference
  newUrl.searchParams.set('_host', hostname);

  return NextResponse.rewrite(newUrl);
}

/**
 * Maps custom domain to tenant slug.
 * TODO: Replace with Edge Config or KV lookup in production.
 */
function getTenantSlug(hostname: string): string | null {
  // Mock mapping - Replace with actual lookup
  const domainMap: Record<string, string> = {
    'portal.logistik-a.com': 'logistik-a',
    'track.logistik-b.co.id': 'logistik-b',
    'shipping.acme.com': 'acme-corp',
  };

  return domainMap[hostname] || null;
}

/**
 * Validates if a domain is allowed.
 * Use this in API routes to verify domain ownership.
 */
export function isValidTenantDomain(
  hostname: string,
  tenantSlug: string
): boolean {
  const mappedSlug = getTenantSlug(hostname);
  return mappedSlug === tenantSlug;
}

/**
 * Gets tenant slug from current request.
 * Use this in pages/components to identify current tenant.
 */
export function getTenantFromRequest(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || '';
  return getTenantSlug(hostname);
}
