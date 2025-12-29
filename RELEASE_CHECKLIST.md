# Pre-Release Checklist
*Perform these checks before merging to Main.*

## 1. Automated Checks
- [ ] **Build Success**: Did `npm run build` pass locally?
- [ ] **Type Check**: Did `npx tsc --noEmit` pass without errors?
- [ ] **Linting**: Did `npm run lint` pass?
- [ ] **No Console Errors**: Checked browser console for errors?

## 2. Manual Verification (Preview URL)
- [ ] **Mobile Responsiveness**: Opened on actual phone (iOS/Android)?
- [ ] **Critical Flows**: Tested tracking, cek ongkir, or main feature?
- [ ] **Navigation**: All links working correctly?
- [ ] **Forms**: All forms submitting properly?
- [ ] **Images**: All images loading correctly?
- [ ] **Performance**: Page load time acceptable?

## 3. Cross-Browser Testing
- [ ] **Chrome**: Tested on Chrome?
- [ ] **Safari**: Tested on Safari (iOS)?
- [ ] **Firefox**: Basic functionality check?

## 4. Security Checks
- [ ] **Environment Variables**: No secrets exposed in client code?
- [ ] **API Keys**: All API keys working?
- [ ] **Authentication**: Login/logout working properly?
- [ ] **CORS**: No CORS errors in console?

## 5. SEO & Analytics
- [ ] **Meta Tags**: Proper title and description?
- [ ] **Open Graph**: Social sharing preview looks good?
- [ ] **Sitemap**: Updated if new pages added?
- [ ] **Robots.txt**: Not blocking important pages?
- [ ] **Analytics**: Google Analytics tracking?

## 6. Content Review
- [ ] **Spelling**: No typos in visible text?
- [ ] **Links**: External links open in new tab?
- [ ] **Contact Info**: Email/phone numbers correct?
- [ ] **Legal**: Privacy policy & terms updated if needed?

## 7. Performance
- [ ] **Lighthouse**: Score > 90 on mobile?
- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms?
- [ ] **Bundle Size**: No unexpected size increase?

## 8. Monitoring (Post-Release)
- [ ] **Sentry**: No new error spikes in dashboard?
- [ ] **Vercel**: Deployment status is "Ready"?
- [ ] **Google Search Console**: No crawl errors?
- [ ] **Uptime Monitor**: Site responding correctly?

## 9. Rollback Plan
- [ ] **Git Tag**: Created release tag (e.g., `v1.2.3`)?
- [ ] **Backup**: Previous version accessible?
- [ ] **Team Notified**: Team aware of deployment?

## 10. Final Sign-Off
- [ ] **Client Approval**: Client approved preview URL?
- [ ] **Documentation**: Updated if new features added?
- [ ] **Changelog**: Updated CHANGELOG.md?

---

## Emergency Contacts
- **Developer**: [Your contact]
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

## Quick Rollback
```bash
git checkout main
git revert HEAD
git push origin main
```

---

**Date**: [Fill in]  
**Reviewer**: [Fill in]  
**Approved**: [ ] Yes [ ] No
