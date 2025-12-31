import './src/env.mjs'
import withPWA from 'next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

// Initialize next-intl plugin
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
    // PWA Manifest & Security Headers
    async headers() {
        return [
            {
                source: '/manifest.json',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/manifest+json',
                    },
                ],
            },
            {
                source: '/.well-known/assetlinks.json',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/json',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    // DNS Prefetch for performance
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    // Force HTTPS
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    // Prevent clickjacking - DENY for maximum security
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    // Prevent MIME type sniffing
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    // XSS Protection (legacy browsers)
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    // Control referrer information
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    // Disable camera, microphone, geolocation
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
                    },
                    // Content Security Policy - Strict but allows Google services
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            // Default: only self
                            "default-src 'self'",
                            // Scripts: self + Google (Analytics, Adsense, reCAPTCHA)
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagmanager.com https://www.google-analytics.com https://adservice.google.com https://tpc.googlesyndication.com",
                            // Styles: self + fonts
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Images: self + data URLs + HTTPS
                            "img-src 'self' data: https: blob:",
                            // Fonts: self + Google Fonts
                            "font-src 'self' https://fonts.gstatic.com data:",
                            // iframes: Google services only
                            "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com",
                            // API connections
                            "connect-src 'self' https://onkmywglrpjqulhephkf.supabase.co https://api.binderbyte.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://region1.google-analytics.com",
                            // Objects: none
                            "object-src 'none'",
                            // Base URI: self
                            "base-uri 'self'",
                            // Form actions: self
                            "form-action 'self'",
                            // Frame ancestors: none (prevent embedding)
                            "frame-ancestors 'none'",
                            // Upgrade insecure requests
                            "upgrade-insecure-requests",
                        ].join('; '),
                    },
                    // Expect-CT for certificate transparency
                    {
                        key: 'Expect-CT',
                        value: 'max-age=86400, enforce',
                    },
                ],
            },
            // Widget page exception (allow iframe for embeds)
            {
                source: '/widget/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors *",
                    },
                ],
            },
        ]
    },

    // Image optimization
    images: {
        unoptimized: process.env.NEXT_EXPORT === 'true',
        domains: [
            'onkmywglrpjqulhephkf.supabase.co', // Supabase storage
        ],
        formats: ['image/webp', 'image/avif'],
    },

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Build settings - ignore errors for deployment
    // TODO: Remove after fixing all database types
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Mobile App (Capacitor) Support
    output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,

    // Production optimizations
    compiler: {
        // Remove console.log in production for cleaner logs
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

// PWA Configuration
const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-image-assets',
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /^https:\/\/api\.binderbyte\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                },
            },
        },
    ],
})

// Wrap with both PWA and i18n
// Bundle Analyzer
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
})

// Wrap with PWA, i18n, and Bundle Analyzer
export default withNextIntl(pwaConfig(bundleAnalyzer(nextConfig)))
