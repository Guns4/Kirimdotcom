
import { MetadataRoute } from 'next'
import { indonesianCities } from '@/data/cities'
import { popularRoutes } from '@/data/popular-routes'
import { createClient } from '@supabase/supabase-js'

// Helper to convert city name to slug
function cityToSlug(cityName: string): string {
    return cityName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
}

// Get city name by ID
function getCityNameById(cityId: string): string {
    const city = indonesianCities.find(c => c.id === cityId)
    return city?.name || `City - ${cityId} `
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.cekkirim.com'

    // Core pages
    const coreRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/statistics`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    // Dynamic routes from search history
    const dynamicRoutes: MetadataRoute.Sitemap = []

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get popular routes from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data } = await supabase
            .from('search_history')
            .select('query')
            .eq('type', 'ongkir')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .limit(500)

        if (data) {
            const routeSet = new Set<string>()

            data.forEach((item: any) => {
                try {
                    const query = item.query
                    let originId, destId

                    if (query.includes(':')) {
                        const parts = query.split(':')
                        originId = parts[0]
                        destId = parts[1]
                    } else if (query.includes('{')) {
                        const parsed = JSON.parse(query)
                        originId = parsed.originId || parsed.origin_id
                        destId = parsed.destinationId || parsed.destination_id
                    }

                    if (originId && destId) {
                        const originName = getCityNameById(originId)
                        const destName = getCityNameById(destId)
                        const slug = `${cityToSlug(originName)}-ke-${cityToSlug(destName)}`

                        if (!routeSet.has(slug)) {
                            routeSet.add(slug)
                            dynamicRoutes.push({
                                url: `${baseUrl}/cek-ongkir/${slug}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly' as const,
                                priority: 0.7,
                            })
                        }
                    }
                } catch {
                    // Skip invalid entries
                }
            })
        }
    } catch (error) {
        console.error('Error generating dynamic sitemap routes:', error)
    }

    // Add fallback static routes if not enough dynamic routes
    if (dynamicRoutes.length < 10) {
        const existingSlugs = new Set(dynamicRoutes.map(r => r.url))

        for (const route of popularRoutes) {
            const url = `${baseUrl}/cek-ongkir/${route.originSlug}-ke-${route.destinationSlug}`
            if (!existingSlugs.has(url)) {
                dynamicRoutes.push({
                    url,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                })
            }
        }
    }

    return [...coreRoutes, ...dynamicRoutes]
}
