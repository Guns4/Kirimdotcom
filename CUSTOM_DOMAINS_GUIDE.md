# 🌐 Enterprise Custom Domains Guide

Complete guide for implementing whitelabel domains for enterprise clients.

---

## Overview

Enable clients to use their own domains (e.g., `portal.logistik-a.com`) to access your platform with their custom branding.

---

## 1. Vercel Configuration

### Option A: Wildcard Subdomains (Easiest)

**Best for**: Clients using your subdomain structure

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Add: `*.cekkirim.com`
3. Now any subdomain works automatically:
   - `client1.cekkirim.com`
   - `portal.cekkirim.com`
   - `track.cekkirim.com`

### Option B: Custom Client Domains (Enterprise)

**Best for**: Full whitelabel with client's domain

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter client's domain: `portal.logistik-a.com`
4. Vercel provides DNS records for client

---

## 2. Client DNS Setup

Provide these instructions to your client:

### For Root Domain (`logistik-a.com`)
```
Type: A Record
Name: @
Value: 76.76.21.21 (Vercel IP - check Vercel docs for current IP)
```

### For Subdomain (`portal.logistik-a.com`)
```
Type: CNAME
Name: portal
Value: cname.vercel-dns.com
```

**Verification**: DNS propagation takes 10 minutes - 48 hours.

---

## 3. Code Integration

### Step 1: Update Middleware

**File**: `src/middleware.ts`

```typescript
import { handleDomainRewrite } from '@/lib/domain-rewrite';
import { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // 1. Handle custom domain rewriting FIRST
    const domainRewrite = handleDomainRewrite(req);
    if (domainRewrite) return domainRewrite;

    // 2. Your existing middleware logic
    // (Auth checks, rate limiting, etc.)
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
```

### Step 2: Create Tenant Routes

**File Structure**:
```
app/
├── tenant/
│   └── [slug]/
│       ├── layout.tsx      # Tenant-specific layout
│       ├── page.tsx         # Tenant home
│       ├── track/
│       │   └── page.tsx     # Tracking page
│       └── dashboard/
│           └── page.tsx     # Dashboard
```

**Example**: `app/tenant/[slug]/layout.tsx`

```typescript
export default function TenantLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { slug: string };
}) {
    // Fetch tenant config based on slug
    const tenant = getTenantConfig(params.slug);

    return (
        <div className="tenant-wrapper" style={{
            '--primary-color': tenant.primaryColor,
            '--logo': `url(${tenant.logoUrl})`
        }}>
            <header>{/* Tenant branding */}</header>
            {children}
        </div>
    );
}
```

---

## 4. Domain Mapping Configuration

### Development (Mock Data)

**File**: `src/lib/domain-rewrite.ts`

```typescript
const domainMap: Record<string, string> = {
    'portal.logistik-a.com': 'logistik-a',
    'track.logistik-b.co.id': 'logistik-b',
};
```

### Production (Edge Config - Recommended)

1. Install Vercel Edge Config:
```bash
npm install @vercel/edge-config
```

2. Create Edge Config in Vercel Dashboard

3. Update lookup function:
```typescript
import { get } from '@vercel/edge-config';

async function getTenantSlug(hostname: string): Promise<string | null> {
    const domains = await get('custom_domains');
    return domains[hostname] || null;
}
```

**Advantages**: 
- ✅ No build required for new domains
- ✅ Ultra-fast (edge-based)
- ✅ Update via Vercel UI or API

---

## 5. Security Considerations

### Verify Domain Ownership

```typescript
// In API routes that modify tenant data
export async function POST(req: Request) {
    const hostname = req.headers.get('host');
    const tenantSlug = req.headers.get('x-tenant-slug');

    if (!isValidTenantDomain(hostname, tenantSlug)) {
        return new Response('Forbidden', { status: 403 });
    }

    // Process request...
}
```

### SSL/TLS Certificates

- ✅ Vercel automatically provisions SSL certificates
- ✅ Supports Let's Encrypt
- ✅ No manual configuration needed

---

## 6. Testing

### Local Testing

Add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 portal.logistik-a.local
```

Access: `http://portal.logistik-a.local:3000`

### Production Testing

1. Add test domain in Vercel
2. Configure DNS with CNAME
3. Wait for propagation
4. Test: `https://portal.client-domain.com`

---

## 7. Monitoring

### Check Domain Status

**Vercel Dashboard** → **Domains** → View status:
- ✅ **Valid**: DNS configured correctly
- ⚠️ **Pending**: Awaiting DNS propagation
- ❌ **Invalid**: DNS misconfigured

### Analytics

Track traffic by domain:
```typescript
// In middleware or layout
analytics.track('page_view', {
    domain: hostname,
    tenant: tenantSlug,
    path: pathname
});
```

---

## 8. Pricing Tiers

Recommended structure:

| Tier | Custom Domain | Limit |
|------|---------------|-------|
| Basic | Subdomain only | `client.cekkirim.com` |
| Pro | 1 custom domain | `portal.client.com` |
| Enterprise | Unlimited | Multiple domains |

---

## 9. Troubleshooting

### Domain Not Working

**Check**:
1. DNS propagation: `nslookup portal.client.com`
2. Vercel domain status
3. SSL certificate status
4. Middleware logs

### Infinite Redirects

**Cause**: Rewrite loop  
**Fix**: Ensure rewrite function returns `null` for rewrote URLs

### 404 Errors

**Cause**: Missing tenant route  
**Fix**: Check `app/tenant/[slug]` structure exists

---

## 10. Migration Guide

### From Single Tenant to Multi-Tenant

1. Move `/app/page.tsx` → `/app/tenant/[slug]/page.tsx`
2. Update all hardcoded paths
3. Implement tenant context
4. Test with subdomain first
5. Add custom domain support

---

## Quick Reference

```bash
# Add domain in Vercel
vercel domains add portal.client.com

# Check domain status
vercel domains ls

# Remove domain
vercel domains rm portal.client.com
```

---

## Support

For issues:
1. Check Vercel logs
2. Verify DNS with `dig` or `nslookup`
3. Test middleware locally
4. Review Edge Config data

---

**Last Updated**: 2025-12-30  
**Version**: 1.0  
**Compatible**: Next.js 14+, Vercel
