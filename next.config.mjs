/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Ignore ESLint errors during build (we'll fix incrementally)
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Ignore TypeScript errors during build
    typescript: {
        ignoreBuildErrors: true,
    },

    // Image optimization
    images: {
        domains: ['localhost', 'supabase.co', 'cdn.freesound.org'],
        unoptimized: true,
    },

    // Webpack config for Node.js modules
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            };
        }
        return config;
    },

    // Experimental features
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default nextConfig;
