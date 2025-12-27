import { indonesianCities, City } from '@/data/cities'

export function findCityByName(query: string): City | null {
    if (!query) return null

    const normalizedQuery = query.toLowerCase().trim()

    // 1. Exact match
    const exactStart = indonesianCities.find(c => c.name.toLowerCase() === normalizedQuery)
    if (exactStart) return exactStart

    // 2. Starts with (e.g. "Jakarta" -> "Jakarta Barat")
    // Prioritize Kota over Kabupaten usually?
    const startsWith = indonesianCities.find(c => c.name.toLowerCase().startsWith(normalizedQuery))
    if (startsWith) return startsWith

    // 3. Contains
    const contains = indonesianCities.find(c => c.name.toLowerCase().includes(normalizedQuery))
    if (contains) return contains

    return null
}
