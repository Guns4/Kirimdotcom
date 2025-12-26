// ============================================
// POPULAR ROUTES DATA FOR PROGRAMMATIC SEO
// ============================================
// Used for internal linking and sitemap generation

export interface PopularRoute {
    origin: string
    originId: string
    originSlug: string
    destination: string
    destinationId: string
    destinationSlug: string
}

// Top 50 popular routes in Indonesia
export const popularRoutes: PopularRoute[] = [
    // Jakarta routes
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Semarang', destinationId: '398', destinationSlug: 'semarang' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Yogyakarta', destinationId: '501', destinationSlug: 'yogyakarta' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Medan', destinationId: '249', destinationSlug: 'medan' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Makassar', destinationId: '187', destinationSlug: 'makassar' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Palembang', destinationId: '339', destinationSlug: 'palembang' },
    { origin: 'Jakarta Selatan', originId: '154', originSlug: 'jakarta-selatan', destination: 'Denpasar', destinationId: '114', destinationSlug: 'denpasar' },

    // Surabaya routes
    { origin: 'Surabaya', originId: '444', originSlug: 'surabaya', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Surabaya', originId: '444', originSlug: 'surabaya', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Surabaya', originId: '444', originSlug: 'surabaya', destination: 'Malang', destinationId: '180', destinationSlug: 'malang' },
    { origin: 'Surabaya', originId: '444', originSlug: 'surabaya', destination: 'Semarang', destinationId: '398', destinationSlug: 'semarang' },
    { origin: 'Surabaya', originId: '444', originSlug: 'surabaya', destination: 'Denpasar', destinationId: '114', destinationSlug: 'denpasar' },

    // Bandung routes
    { origin: 'Bandung', originId: '22', originSlug: 'bandung', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Bandung', originId: '22', originSlug: 'bandung', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Bandung', originId: '22', originSlug: 'bandung', destination: 'Semarang', destinationId: '398', destinationSlug: 'semarang' },
    { origin: 'Bandung', originId: '22', originSlug: 'bandung', destination: 'Yogyakarta', destinationId: '501', destinationSlug: 'yogyakarta' },

    // Semarang routes
    { origin: 'Semarang', originId: '398', originSlug: 'semarang', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Semarang', originId: '398', originSlug: 'semarang', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Semarang', originId: '398', originSlug: 'semarang', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },

    // Medan routes
    { origin: 'Medan', originId: '249', originSlug: 'medan', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Medan', originId: '249', originSlug: 'medan', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Medan', originId: '249', originSlug: 'medan', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },

    // Makassar routes
    { origin: 'Makassar', originId: '187', originSlug: 'makassar', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Makassar', originId: '187', originSlug: 'makassar', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },

    // Yogyakarta routes
    { origin: 'Yogyakarta', originId: '501', originSlug: 'yogyakarta', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Yogyakarta', originId: '501', originSlug: 'yogyakarta', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Yogyakarta', originId: '501', originSlug: 'yogyakarta', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },

    // Denpasar (Bali) routes
    { origin: 'Denpasar', originId: '114', originSlug: 'denpasar', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Denpasar', originId: '114', originSlug: 'denpasar', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Denpasar', originId: '114', originSlug: 'denpasar', destination: 'Malang', destinationId: '180', destinationSlug: 'malang' },

    // More diverse routes
    { origin: 'Bekasi', originId: '39', originSlug: 'bekasi', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Bekasi', originId: '39', originSlug: 'bekasi', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
    { origin: 'Tangerang', originId: '455', originSlug: 'tangerang', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Depok', originId: '114', originSlug: 'depok', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Bogor', originId: '80', originSlug: 'bogor', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },
    { origin: 'Bogor', originId: '80', originSlug: 'bogor', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },

    // Palembang routes
    { origin: 'Palembang', originId: '339', originSlug: 'palembang', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Palembang', originId: '339', originSlug: 'palembang', destination: 'Bandung', destinationId: '22', destinationSlug: 'bandung' },

    // Balikpapan routes
    { origin: 'Balikpapan', originId: '37', originSlug: 'balikpapan', destination: 'Jakarta Selatan', destinationId: '154', destinationSlug: 'jakarta-selatan' },
    { origin: 'Balikpapan', originId: '37', originSlug: 'balikpapan', destination: 'Surabaya', destinationId: '444', destinationSlug: 'surabaya' },
]

// Helper to get route by slugs
export function getRouteBySlug(originSlug: string, destinationSlug: string): PopularRoute | undefined {
    return popularRoutes.find(
        r => r.originSlug === originSlug && r.destinationSlug === destinationSlug
    )
}

// Helper to format slug to display name
export function slugToDisplayName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

// Helper to create slug from city name
export function cityToSlug(cityName: string): string {
    return cityName.toLowerCase().replace(/\s+/g, '-')
}

// Get routes by origin city
export function getRoutesByOrigin(originSlug: string): PopularRoute[] {
    return popularRoutes.filter(r => r.originSlug === originSlug)
}

// Get unique origin cities
export function getUniqueOrigins(): { name: string; slug: string }[] {
    const seen = new Set<string>()
    return popularRoutes
        .filter(r => {
            if (seen.has(r.originSlug)) return false
            seen.add(r.originSlug)
            return true
        })
        .map(r => ({ name: r.origin, slug: r.originSlug }))
}
