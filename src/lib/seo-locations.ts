import { popularRegions, Region } from '@/data/indonesia-regions';

export interface LocationPath {
    slug: string[]; // [province, city, district]
    region: Region;
}

export function getAllLocationPaths(): LocationPath[] {
    return popularRegions.map((region) => {
        // Slugify helper
        const slugify = (text: string) =>
            text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

        return {
            slug: [
                slugify(region.province),
                slugify(region.city),
                slugify(region.district),
            ],
            region,
        };
    });
}

export function getRegionBySlug(slug: string[]): Region | undefined {
    if (slug.length !== 3) return undefined;

    const [provSlug, citySlug, distSlug] = slug;
    const paths = getAllLocationPaths();

    const match = paths.find(p =>
        p.slug[0] === provSlug &&
        p.slug[1] === citySlug &&
        p.slug[2] === distSlug
    );

    return match?.region;
}
