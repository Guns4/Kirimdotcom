# 📊 Vercel Insights Setup Guide

## What is Vercel Insights?

Vercel provides two powerful monitoring tools:

### 1. **Analytics** 
Track real user behavior:
- ✅ Page views
- ✅ Custom events
- ✅ User paths
- ✅ Top pages
- ✅ Audience demographics

### 2. **Speed Insights**
Monitor Core Web Vitals from REAL users:
- ✅ LCP (Largest Contentful Paint)
- ✅ FID (First Input Delay)
- ✅ CLS (Cumulative Layout Shift)
- ✅ TTFB (Time to First Byte)
- ✅ FCP (First Contentful Paint)

---

## ✅ Installation Complete

The following have been added to your project:
- ✅ `@vercel/analytics` package
- ✅ `@vercel/speed-insights` package
- ✅ `<VercelInsights />` component
- ✅ Injected into `layout.tsx`

---

## 🚀 Activation Steps

### Step 1: Deploy to Vercel
```bash
git add .
git commit -m "feat: add Vercel Insights"
git push origin main
```

Vercel will auto-deploy your changes.

---

### Step 2: Enable Analytics

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **CekKirim**
3. Click **Analytics** tab
4. Click **Enable Analytics** button
5. Done! ✅

---

### Step 3: Enable Speed Insights

1. In same project dashboard
2. Click **Speed Insights** tab
3. Click **Enable Speed Insights** button
4. Done! ✅

---

## 📈 Viewing Data

### Analytics Dashboard
- **URL**: `https://vercel.com/[your-team]/[project]/analytics`
- **Data appears**: 15-30 minutes after first traffic
- **Metrics**:
  - Total page views
  - Unique visitors
  - Top pages
  - Referrers
  - Countries

### Speed Insights Dashboard
- **URL**: `https://vercel.com/[your-team]/[project]/speed-insights`
- **Data appears**: After ~100 page loads
- **Metrics**:
  - Real User Monitoring (RUM)
  - Core Web Vitals scores
  - Performance by page
  - Performance by device
  - Historical trends

---

## 🎯 What You Can Track

### Custom Events (Optional)
Track specific user actions:

```tsx
import { track } from '@vercel/analytics';

// Track button click
track('button_click', {
  location: 'navbar',
  label: 'Sign Up'
});

// Track form submission
track('form_submit', {
  form_name: 'contact'
});
```

### Pageview Tracking
Automatic! No code needed. Every page navigation is tracked.

---

## 📊 Sample Insights You'll Get

### Analytics:
```
Total Views: 10,234
Unique Visitors: 3,421
Avg Time on Page: 2m 34s
Top Pages:
  1. /cek-resi: 3,234 views
  2. /cek-ongkir: 2,123 views
  3. /: 1,987 views
```

### Speed Insights:
```
Overall Score: 95
LCP: 1.2s (Good)
FID: 45ms (Good)
CLS: 0.05 (Good)

Slowest Pages:
  1. /shop: LCP 2.8s
  2. /dashboard: LCP 2.1s
```

---

## 💰 Pricing

### Free Tier Includes:
- ✅ Analytics: 2,500 page views/month
- ✅ Speed Insights: 10,000 events/month
- ✅ 1-week data retention

### Pro Tier ($20/month):
- ✅ Analytics: 100,000 page views/month
- ✅ Speed Insights: 100,000 events/month  
- ✅ 6-month data retention
- ✅ Custom events
- ✅ Export data

**For most sites, FREE tier is sufficient!**

---

## 🔍 Troubleshooting

### "No data showing"
- Wait 15-30 minutes after enabling
- Ensure you have real traffic (not just you)
- Check that deployment succeeded
- Verify component is in `layout.tsx`

### "Data seems low"
- Insights only track production deployment
- Development/preview deployments not counted
- Ad blockers may prevent tracking

### "Analytics vs Google Analytics?"
Both work together!
- **Vercel Analytics**: Simple, fast, privacy-focused
- **Google Analytics**: Detailed, complex, powerful

Use both for best insights!

---

## 📝 Best Practices

### 1. Monitor Core Web Vitals Weekly
Check Speed Insights weekly to catch performance regressions early.

### 2. Track Key User Actions
Add custom events for important actions:
- Form submissions
- Button clicks
- Purchases
- Sign ups

### 3. Set Performance Budgets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 4. A/B Test with Data
Use insights to validate changes:
- Does new design improve engagement?
- Did optimization actually speed up page?

---

## 🎁 Bonus: Web Vitals Alerts

Get notified when performance degrades:

1. Dashboard → Speed Insights
2. Click **Set up alerts**
3. Enter email
4. Set thresholds (e.g., LCP > 2.5s)
5. Get email when threshold exceeded

---

## ✅ Verification Checklist

After enabling, verify:
- [ ] Can see analytics data in dashboard
- [ ] Speed Insights showing Core Web Vitals
- [ ] Data updating regularly
- [ ] No console errors related to insights
- [ ] Performance impact minimal

---

## 📚 Resources

- **Analytics Docs**: https://vercel.com/docs/analytics
- **Speed Insights Docs**: https://vercel.com/docs/speed-insights
- **Core Web Vitals**: https://web.dev/vitals/
- **Custom Events**: https://vercel.com/docs/analytics/custom-events

---

**Status**: ✅ Installed and Ready  
**Activation Required**: Yes (in Vercel dashboard)  
**Cost**: Free tier available  
**Data Retention**: 1 week (free) / 6 months (pro)

**Happy monitoring!** 📊🚀
