'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Vercel Monitoring Components
 *
 * - Analytics: Track pageviews, custom events, and user behavior
 * - Speed Insights: Real User Monitoring (RUM) for Core Web Vitals
 *
 * These components automatically collect and send data to Vercel dashboard.
 * No configuration needed - just deploy and enable in Vercel dashboard.
 *
 * @see https://vercel.com/docs/analytics
 * @see https://vercel.com/docs/speed-insights
 */
export function VercelInsights() {
  return (
    <>
      {/* Vercel Analytics - Track user behavior */}
      <Analytics />

      {/* Speed Insights - Monitor Core Web Vitals from real users */}
      <SpeedInsights />
    </>
  );
}
