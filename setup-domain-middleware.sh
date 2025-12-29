#!/bin/bash

# =============================================================================
# Custom Domain (CNAME) & Whitelabel Routing Middleware
# =============================================================================

echo "Initializing Custom Domain Middleware Setup..."
echo "================================================="

# 1. Domain Resolution Helper (Edge Compatible)
echo "1. Creating Domain Mapper: src/lib/domain-mapper.ts"
mkdir -p src/lib

cat <<EOF > src/lib/domain-mapper.ts
import { createClient } from '@supabase/supabase-js';

// Note: Use a separate SUPABASE_URL/ANON_KEY for Edge consistency if needed, 
// or ensure your environment variables are available to Edge Functions.
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
EOF

# 2. Middleware Implementation
echo "2. Creating Middleware Logic: middleware_domain_logic.ts"
echo "   (Merge this into your main src/middleware.ts)"

cat <<EOF > middleware_domain_logic.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantSlugFromDomain } from '@/lib/domain-mapper';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    
    // 1. Get Hostname (e.g. portal.custom.com)
    const hostname = req.headers.get('host') || '';

    // 2. Resolve Tenant
    const tenantSlug = await getTenantSlugFromDomain(hostname);

    if (tenantSlug) {
        // 3. Rewrite URL
        // From: portal.custom.com/dashboard
        // To:   cekkirim.com/tenant/logistic-corp/dashboard
        
        // Prevent infinite loops if already in /tenant path
        if (!url.pathname.startsWith(\`/tenant/\${tenantSlug}\`)) {
             url.pathname = \`/tenant/\${tenantSlug}\${url.pathname}\`;
             return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}
EOF

# 3. Setup Guide
echo "3. Creating Setup Guide: CNAME_SETUP.md"

cat <<EOF > CNAME_SETUP.md
# Custom Domain (CNAME) Setup Guide for Whitelabeling

## 1. Vercel Configuration
To allow multiple custom domains to point to your single project:

1.  Go to your Vercel Project Dashboard.
2.  Navigate to **Settings** > **Domains**.
3.  Add the client's domain (e.g., \`portal.logistic-corp.com\`).
4.  Vercel will provide DNS records (A Record or CNAME) for the client to configure.

## 2. Client DNS Configuration
Ask your client to add a CNAME record in their DNS provider (GoDaddy, Cloudflare, etc.):

-   **Type**: CNAME
-   **Name**: portal (or www)
-   **Value**: cname.vercel-dns.com. (or your specific Vercel alias)

## 3. Database Entry
Once the domain is verified on Vercel:
1.  Go to your \`public.tenants\` table.
2.  Update the record for the client:
    -   **domain**: \`portal.logistic-corp.com\`
    -   **slug**: \`logistic-corp\`

## 4. Verification
Visit \`https://portal.logistic-corp.com\`.
-   The middleware will detect the host.
-   It resolves to slug \`logistic-corp\`.
-   Next.js rewrites the view to \`src/app/tenant/[slug]/page.tsx\`.
-   The user sees their branded dashboard while the URL remains \`portal.logistic-corp.com\`.
EOF

echo ""
echo "================================================="
echo "Domain Middleware Setup Complete!"
echo "1. Integrate 'middleware_domain_logic.ts' into 'src/middleware.ts'."
echo "2. Read 'CNAME_SETUP.md' for infrastructure configuration."
