# Vercel Analytics Setup

## 1. Enable in Dashboard
1. Go to your Vercel Project Dashboard.
2. Click on the **Analytics** tab.
3. Click **Enable**.
4. Do the same for the **Speed Insights** tab.

## 2. Verify
1. Deploy your latest changes.
2. Visit your website.
3. Check the Vercel Dashboard; data should start appearing within minutes.

## Troubleshooting
If the component wasn't auto-injected:
1. Open `src/app/layout.tsx`.
2. Import: `import { VercelMonitoring } from '@/components/monitoring/VercelMonitoring';`
3. Add `<VercelMonitoring />` inside the `<body>` tag.
