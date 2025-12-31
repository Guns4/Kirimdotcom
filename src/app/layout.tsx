import { VercelMonitoring } from '@/components/monitoring/VercelMonitoring';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
// Build timestamp: 2024-12-29-06:05 - Force fresh bundle generation
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import MobileNav from '@/components/layout/MobileNav';
import { LiteModeProvider } from '@/context/LiteModeContext';
import { SystemStatusProvider } from '@/context/SystemStatusContext';
import { FeedbackWidget } from '@/components/ui/FeedbackWidget';
import { siteConfig } from '@/config/site';
import { headers } from 'next/headers';
import ClarityAnalytics from '@/components/analytics/ClarityAnalytics';
import ErrorMonitor from '@/components/analytics/ErrorMonitor';
import WebVitalsReporter from '@/components/analytics/WebVitalsReporter';
import NPSSurvey from '@/components/ui/NPSSurvey';
import { getPublicFlags } from '@/app/actions/flagActions';
import { FeatureFlagProvider } from '@/components/providers/FeatureFlagProvider';
import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';
import { VercelInsights } from '@/components/monitoring/VercelInsights';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Critical: Text visible before font loads
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification=YOUR_VERIFICATION_CODE', // Ganti dengan kode dari Google Search Console
  },
  other: {
    'google-adsense-account': 'ca-pub-5099892029462046',
  },
};

import { useDeepLink } from '@/hooks/useDeepLink';
import { useShake } from '@/hooks/useShake';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize Deep Linking
  useDeepLink();

  // Initialize Shake-to-Refresh
  useShake();

  // Wrap in try-catch to handle cases where request context is not available
  let isWidget = false;
  let flags = {};

  try {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    isWidget = pathname.startsWith('/widget');
  } catch (error) {
    // Headers not available during static generation
  }

  try {
    flags = await getPublicFlags();
  } catch (error) {
    // Flags not available during static generation
  }

  return (
    <html lang="id" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.binderbyte.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={`font-sans antialiased min-h-screen flex flex-col ${isWidget ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30'}`}
      >
        <SystemStatusProvider>
          <FeatureFlagProvider initialFlags={flags}>
            <LiteModeProvider>
              {!isWidget && <Navbar />}
              <main
                className={
                  isWidget
                    ? 'min-h-screen flex items-center justify-center p-4'
                    : 'flex-1 pb-16 md:pb-0'
                }
              >
                {children}
              </main>
              {!isWidget && <FeedbackWidget />}
              <ClarityAnalytics />
              <ErrorMonitor />
              <WebVitalsReporter />
              <NPSSurvey />
              {!isWidget && <Footer />}

              {/* Web Bottom Nav (Hidden in Native App via CSS) */}
              {!isWidget && <div className="web-bottom-nav"><BottomNav /></div>}

              {/* Native Mobile Nav (Only in App) */}
              <MobileNav />
            </LiteModeProvider>
          </FeatureFlagProvider>
        </SystemStatusProvider>

        {/* Third-party scripts with optimized loading */}
        <ThirdPartyScripts
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          adsenseId="ca-pub-5099892029462046"
        />

        {/* Vercel Analytics & Speed Insights */}
        <VercelInsights />

        <VercelMonitoring />
      </body>
    </html>
  );
}
