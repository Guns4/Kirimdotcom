# Golden Master Build Checklist

## 1. Asset Optimization
- [ ] Ensure `compress: true` is in next.config.ts
- [ ] Ensure images use `next/image` with `placeholder="blur"` where possible.
- [ ] Run `npm run analyze` (if @next/bundle-analyzer is installed) to check bundle size.

## 2. Security Hardening
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` scope is limited (RLS enabled on all tables).
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is NEVER used in client-side code (check with grep).
- [ ] Set `poweredByHeader: false` in next.config.ts.

## 3. Performance
- [ ] Verify `sw.js` (Service Worker) is caching static assets.
- [ ] Check Lighthouse score > 90.

## 4. Final Build
Run the following to lock dependencies and build:
```bash
npm ci
npm run build
```
