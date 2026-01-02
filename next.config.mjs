import './src/env.mjs';
import withPWAInit from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

// Initialize Bundle Analyzer
const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

// Initialize PWA
const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // 1. Image Optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'pub-*.r2.dev' },
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'api.dicebear.com' },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // 2. Webpack Config
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false, net: false, tls: false, crypto: false, stream: false,
                url: false, zlib: false, http: false, https: false, assert: false,
                os: false, path: false, 'process/browser': false,
            };
        }
        return config;
    },

    // 3. Security Headers & CSP
    async headers() {
        // CSP Policy: Allow Self, Google Analytics, Midtrans, Supabase, Vercel
        const ContentSecurityPolicy = `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://app.midtrans.com https://api.midtrans.com https://vercel.live;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' blob: data: https:;
          font-src 'self' https://fonts.gstatic.com;
          connect-src 'self' https://*.supabase.co https://api.midtrans.com https://app.midtrans.com https://www.google-analytics.com;
          frame-src 'self' https://app.midtrans.com;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim();

        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Content-Security-Policy', value: ContentSecurityPolicy }
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                ],
            },
        ];
    },
};

export default withPWA(bundleAnalyzer(nextConfig));
