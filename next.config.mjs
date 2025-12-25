/** @type {import('next').NextConfig} */
const nextConfig = {
    // PWA Manifest
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
        ]
    },

    // Image optimization
    images: {
        domains: [
            'onkmywglrpjqulhephkf.supabase.co', // Supabase storage
        ],
        formats: ['image/webp', 'image/avif'],
    },

    // Performance optimizations
    compress: true,
    poweredByHeader: false,
}

export default nextConfig
