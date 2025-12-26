import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/admin', // Block admin panel
                    '/api/',            // Block API routes
                    '/_next/',          // Block Next.js internals
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/dashboard/admin'],
            },
        ],
        sitemap: 'https://kirimdotcom.vercel.app/sitemap.xml',
    }
}
