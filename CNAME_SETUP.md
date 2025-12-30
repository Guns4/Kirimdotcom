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
