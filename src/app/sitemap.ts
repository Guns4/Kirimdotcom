import { MetadataRoute } from 'next'
import { terms } from '@/lib/dictionary'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.cekkirim.com'
    const supabase = await createClient()

    // 1. Core Routes
    const coreRoutes: MetadataRoute.Sitemap = [
        '',
        '/cek-ongkir',
        '/cek-resi',
        '/tools/cek-cod',
        '/tools/kompres-foto',
        '/tools/generator-caption',
        '/about',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Routes (Popular Routes from History)
    let dynamicRoutes: MetadataRoute.Sitemap = []

    // Fetch popular ongkir queries
    const { data: ongkirHistory } = await supabase
        .from('search_history')
        .select('query')
        .eq('type', 'ongkir')
        .order('created_at', { ascending: false })
        .limit(50)

    if (ongkirHistory) {
        // query format: "Jakarta -> Bandung"
        const slugs = new Set<string>()
        ongkirHistory.forEach(h => {
            const parts = h.query.split(' -> ')
            if (parts.length === 2) {
                const source = parts[0].toLowerCase().replace(/\s+/g, '-')
                const dest = parts[1].toLowerCase().replace(/\s+/g, '-')
                slugs.add(`${source}/${dest}`)
            }
        })

        dynamicRoutes = Array.from(slugs).map(slug => ({
            url: `${baseUrl}/cek-ongkir/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }))
    }

    // 3. Dictionary Routes (Kamus)
    const dictionaryRoutes: MetadataRoute.Sitemap = terms.map(term => ({
        url: `${baseUrl}/kamus/${term.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    // 4. User Profiles (Sample - dynamic fetching usually expensive for sitemap, 
    // but we can query top users if we had a users table accessible. 
    // For now, we allowed /u/* in robots, but we might not list them all here to save build time)

    return [...coreRoutes, ...dictionaryRoutes, ...dynamicRoutes]
}
