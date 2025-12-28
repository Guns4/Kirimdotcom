#!/bin/bash

# =============================================================================
# Setup Custom Domains (Phase 125)
# Enterprise Branding & CNAME Support
# =============================================================================

echo "Setting up Custom Domains..."
echo "================================================="
echo ""

# 1. Domain Rewrite Logic
echo "1. Creating Rewrite Logic: src/lib/domaint-rewrite.ts"
mkdir -p src/lib

cat <<EOF > src/lib/domain-rewrite.ts
import { NextRequest, NextResponse } from 'next/server';

// Configuration
const MAIN_DOMAIN = 'cekkirim.com';
const DEV_DOMAIN = 'localhost:3000';

/**
 * Handles multitenant domain rewriting.
 * @param req NextRequest
 * @returns NextResponse (rewrite) or null (if no rewrite needed)
 */
export function handleDomainRewrite(req: NextRequest) {
    const hostname = req.headers.get('host') || '';
    const { pathname, searchParams } = req.nextUrl;

    // 1. Skip if main domain or dev
    if (hostname === MAIN_DOMAIN || hostname === DEV_DOMAIN || hostname.endsWith('.vercel.app')) {
        return null; // No rewrite needed, standard behavior
    }

    // 2. Identify Tenant from Hostname
    // In a real app, you might use a Map, Edge Config, or DB lookup.
    // Ideally, keep this FAST (Edge Config is best).
    // Here we simulate a lookup for demonstration.
    
    let tenantSlug = null;
    
    // Example Mock Lookup
    if (hostname === 'portal.logistik-a.com') tenantSlug = 'logistik-a';
    if (hostname === 'track.logistik-b.co.id') tenantSlug = 'logistik-b';

    if (!tenantSlug) {
        // If domain is unknown, maybe 404 or redirect to main
        return null;
    }

    // 3. Rewrite URL
    // We rewrite the request to /tenant/[slug]/[original_path]
    // Example: portal.logistik-a.com/track -> cekkirim.com/tenant/logistik-a/track
    
    req.nextUrl.pathname = \`/tenant/\${tenantSlug}\${pathname}\`;
    
    // Pass the original host for internal use if needed
    req.nextUrl.searchParams.set('x-original-host', hostname);

    return NextResponse.rewrite(req.nextUrl);
}
EOF
echo "   [✓] Rewrite logic created."
echo ""

# 2. Vercel Guide
echo "2. Creating Guide: CUSTOM_DOMAINS_GUIDE.md"

cat <<EOF > CUSTOM_DOMAINS_GUIDE.md
# Enterprise Custom Domains Guide

This guide explains how to enable whitelabel domains (e.g., \`portal.logistik-a.com\`) for your clients.

## 1. Vercel Configuration
To allow *any* domain to point to your app, you have two options:

### Option A: Wildcard Domains (Recommended)
1. Go to Vercel Dashboard -> Settings -> Domains.
2. Add \`*.cekkirim.com\`.
3. Now any submodule (e.g., \`client1.cekkirim.com\`) works automatically.

### Option B: Custom Client Domains (CNAME)
1. Go to Vercel Dashboard -> Settings -> Domains.
2. Add the client's domain: \`portal.logistik-a.com\`.
3. Vercel will give you a DNS record (CNAME or A Record) to give to the client.

## 2. Client Setup
Ask your client ("Logistik A") to configure their DNS:

- **Type**: CNAME
- **Name**: portal (or @ for root)
- **Value**: cname.vercel-dns.com

Once verified in Vercel, requests to \`portal.logistik-a.com\` will hit your app.

## 3. Middleware Verification
Ensure your \`middleware.ts\` imports and uses the \`handleDomainRewrite\` function.

\`\`\`ts
// src/middleware.ts
import { handleDomainRewrite } from '@/lib/domain-rewrite';

export function middleware(req) {
   // 1. Check for Domain Rewrite first
   const rewrite = handleDomainRewrite(req);
   if (rewrite) return rewrite;

   // 2. Proceed with normal middleware (Auth, etc.)
   // ...
}
\`\`\`
EOF
echo "   [✓] Guide created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Read CUSTOM_DOMAINS_GUIDE.md."
echo "2. Integrate handleDomainRewrite into your middleware.ts."
