import './src/env.mjs'
import withPWA from 'next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

// Initialize next-intl plugin
// Initialize next-intl plugin (Disabled to fix 404 Root Route issue)
// const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// ... (existing config)

// Wrap with PWA, i18n, and Bundle Analyzer
export default pwaConfig(bundleAnalyzer(nextConfig))
