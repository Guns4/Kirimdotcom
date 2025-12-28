/**
 * SEO Traffic Machine - City Data
 * Top 50 Indonesian cities for route combinations
 */

export interface CityData {
    name: string;
    slug: string;
    province: string;
}

export const TOP_CITIES: CityData[] = [
    { name: 'Jakarta', slug: 'jakarta', province: 'DKI Jakarta' },
    { name: 'Surabaya', slug: 'surabaya', province: 'Jawa Timur' },
    { name: 'Bandung', slug: 'bandung', province: 'Jawa Barat' },
    { name: 'Medan', slug: 'medan', province: 'Sumatera Utara' },
    { name: 'Semarang', slug: 'semarang', province: 'Jawa Tengah' },
    { name: 'Makassar', slug: 'makassar', province: 'Sulawesi Selatan' },
    { name: 'Palembang', slug: 'palembang', province: 'Sumatera Selatan' },
    { name: 'Tangerang', slug: 'tangerang', province: 'Banten' },
    { name: 'Depok', slug: 'depok', province: 'Jawa Barat' },
    { name: 'Bekasi', slug: 'bekasi', province: 'Jawa Barat' },
    { name: 'Yogyakarta', slug: 'yogyakarta', province: 'DI Yogyakarta' },
    { name: 'Bogor', slug: 'bogor', province: 'Jawa Barat' },
    { name: 'Malang', slug: 'malang', province: 'Jawa Timur' },
    { name: 'Denpasar', slug: 'denpasar', province: 'Bali' },
    { name: 'Pekanbaru', slug: 'pekanbaru', province: 'Riau' },
    { name: 'Padang', slug: 'padang', province: 'Sumatera Barat' },
    { name: 'Bandar Lampung', slug: 'bandar-lampung', province: 'Lampung' },
    { name: 'Batam', slug: 'batam', province: 'Kepulauan Riau' },
    { name: 'Balikpapan', slug: 'balikpapan', province: 'Kalimantan Timur' },
    { name: 'Pontianak', slug: 'pontianak', province: 'Kalimantan Barat' },
    { name: 'Banjarmasin', slug: 'banjarmasin', province: 'Kalimantan Selatan' },
    { name: 'Manado', slug: 'manado', province: 'Sulawesi Utara' },
    { name: 'Samarinda', slug: 'samarinda', province: 'Kalimantan Timur' },
    { name: 'Jambi', slug: 'jambi', province: 'Jambi' },
    { name: 'Cirebon', slug: 'cirebon', province: 'Jawa Barat' },
    { name: 'Solo', slug: 'solo', province: 'Jawa Tengah' },
    { name: 'Surakarta', slug: 'surakarta', province: 'Jawa Tengah' },
    { name: 'Tasikmalaya', slug: 'tasikmalaya', province: 'Jawa Barat' },
    { name: 'Purwokerto', slug: 'purwokerto', province: 'Jawa Tengah' },
    { name: 'Kediri', slug: 'kediri', province: 'Jawa Timur' },
    { name: 'Madiun', slug: 'madiun', province: 'Jawa Timur' },
    { name: 'Pekalongan', slug: 'pekalongan', province: 'Jawa Tengah' },
    { name: 'Tegal', slug: 'tegal', province: 'Jawa Tengah' },
    { name: 'Sukabumi', slug: 'sukabumi', province: 'Jawa Barat' },
    { name: 'Karawang', slug: 'karawang', province: 'Jawa Barat' },
    { name: 'Serang', slug: 'serang', province: 'Banten' },
    { name: 'Cilegon', slug: 'cilegon', province: 'Banten' },
    { name: 'Mataram', slug: 'mataram', province: 'NTB' },
    { name: 'Kupang', slug: 'kupang', province: 'NTT' },
    { name: 'Jayapura', slug: 'jayapura', province: 'Papua' },
    { name: 'Ambon', slug: 'ambon', province: 'Maluku' },
    { name: 'Ternate', slug: 'ternate', province: 'Maluku Utara' },
    { name: 'Kendari', slug: 'kendari', province: 'Sulawesi Tenggara' },
    { name: 'Palu', slug: 'palu', province: 'Sulawesi Tengah' },
    { name: 'Gorontalo', slug: 'gorontalo', province: 'Gorontalo' },
    { name: 'Bengkulu', slug: 'bengkulu', province: 'Bengkulu' },
    { name: 'Banda Aceh', slug: 'banda-aceh', province: 'Aceh' },
    { name: 'Pangkal Pinang', slug: 'pangkal-pinang', province: 'Bangka Belitung' },
    { name: 'Tarakan', slug: 'tarakan', province: 'Kalimantan Utara' },
];

/**
 * Generate all route combinations for static generation
 */
export function generateRouteCombinations(): { origin: string; destination: string }[] {
    const combinations: { origin: string; destination: string }[] = [];

    // Generate combinations (not permutations to reduce pages)
    for (let i = 0; i < TOP_CITIES.length; i++) {
        for (let j = i + 1; j < TOP_CITIES.length; j++) {
            // Add both directions
            combinations.push({
                origin: TOP_CITIES[i].slug,
                destination: TOP_CITIES[j].slug,
            });
            combinations.push({
                origin: TOP_CITIES[j].slug,
                destination: TOP_CITIES[i].slug,
            });
        }
    }

    return combinations;
}

/**
 * Get city by slug
 */
export function getCityBySlug(slug: string): CityData | undefined {
    return TOP_CITIES.find(city => city.slug === slug);
}

/**
 * Get popular routes for internal linking
 */
export function getPopularRoutes(excludeOrigin?: string, excludeDestination?: string, limit = 10) {
    const popularRoutes = [
        { origin: 'jakarta', destination: 'bandung' },
        { origin: 'jakarta', destination: 'surabaya' },
        { origin: 'jakarta', destination: 'semarang' },
        { origin: 'jakarta', destination: 'yogyakarta' },
        { origin: 'bandung', destination: 'surabaya' },
        { origin: 'surabaya', destination: 'malang' },
        { origin: 'jakarta', destination: 'medan' },
        { origin: 'jakarta', destination: 'makassar' },
        { origin: 'bandung', destination: 'semarang' },
        { origin: 'jakarta', destination: 'denpasar' },
        { origin: 'surabaya', destination: 'semarang' },
        { origin: 'jakarta', destination: 'palembang' },
        { origin: 'bandung', destination: 'yogyakarta' },
        { origin: 'jakarta', destination: 'bogor' },
        { origin: 'surabaya', destination: 'denpasar' },
    ];

    return popularRoutes
        .filter(r => r.origin !== excludeOrigin || r.destination !== excludeDestination)
        .slice(0, limit);
}

export default TOP_CITIES;
