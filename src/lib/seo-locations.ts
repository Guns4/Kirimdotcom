import { INDONESIA_REGIONS, Region } from '@/data/indonesia-regions';

export interface LocationBreadcrumb {
    name: string;
    slug: string;
    type: string;
}

export function getLocationFromSlugs(slugs: string[]): { location: Region | null, breadcrumbs: LocationBreadcrumb[] } {
    let currentLevel = INDONESIA_REGIONS;
    let found: Region | null = null;
    const breadcrumbs: LocationBreadcrumb[] = [];

    for (const slug of slugs) {
        const match = currentLevel.find(r => r.slug === slug);
        if (match) {
            found = match;
            breadcrumbs.push({ name: match.name, slug: match.slug, type: match.type });
            if (match.children) {
                currentLevel = match.children;
            } else {
                currentLevel = [];
            }
        } else {
            return { location: null, breadcrumbs: [] };
        }
    }

    return { location: found, breadcrumbs };
}

export function generateLocalSEOMetadata(location: Region) {
    const title = `Cek Ongkir & Ekspedisi di ${location.name} - CekKirim.com`;
    const description = `Daftar agen logistik terdekat, tarif pengiriman termurah, dan jadwal kurir di ${location.name}. Bandingkan harga JNE, J&T, SiCepat di ${location.name}.`;

    return { title, description };
}
