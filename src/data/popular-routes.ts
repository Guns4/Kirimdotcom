// ============================================
// POPULAR ROUTES DATA FOR PROGRAMMATIC SEO
// ============================================
// Static fallback data - The dynamic data comes from
// src/app/actions/popular-routes.ts which reads from search_history

export interface PopularRoute {
  origin: string;
  originId: string;
  originSlug: string;
  destination: string;
  destinationId: string;
  destinationSlug: string;
  searchCount?: number;
}

// Static popular routes (fallback when DB is empty)
// These will be supplemented/replaced by real data from search_history
export const popularRoutes: PopularRoute[] = [
  // Jakarta routes
  {
    origin: 'Jakarta Selatan',
    originId: '154',
    originSlug: 'jakarta-selatan',
    destination: 'Bandung',
    destinationId: '22',
    destinationSlug: 'bandung',
  },
  {
    origin: 'Jakarta Selatan',
    originId: '154',
    originSlug: 'jakarta-selatan',
    destination: 'Surabaya',
    destinationId: '444',
    destinationSlug: 'surabaya',
  },
  {
    origin: 'Jakarta Selatan',
    originId: '154',
    originSlug: 'jakarta-selatan',
    destination: 'Semarang',
    destinationId: '398',
    destinationSlug: 'semarang',
  },
  {
    origin: 'Jakarta Selatan',
    originId: '154',
    originSlug: 'jakarta-selatan',
    destination: 'Malang',
    destinationId: '180',
    destinationSlug: 'malang',
  },

  // Surabaya routes
  {
    origin: 'Surabaya',
    originId: '444',
    originSlug: 'surabaya',
    destination: 'Jakarta Selatan',
    destinationId: '154',
    destinationSlug: 'jakarta-selatan',
  },
  {
    origin: 'Surabaya',
    originId: '444',
    originSlug: 'surabaya',
    destination: 'Bandung',
    destinationId: '22',
    destinationSlug: 'bandung',
  },
  {
    origin: 'Surabaya',
    originId: '444',
    originSlug: 'surabaya',
    destination: 'Malang',
    destinationId: '180',
    destinationSlug: 'malang',
  },

  // Bandung routes
  {
    origin: 'Bandung',
    originId: '22',
    originSlug: 'bandung',
    destination: 'Jakarta Selatan',
    destinationId: '154',
    destinationSlug: 'jakarta-selatan',
  },
  {
    origin: 'Bandung',
    originId: '22',
    originSlug: 'bandung',
    destination: 'Surabaya',
    destinationId: '444',
    destinationSlug: 'surabaya',
  },
  {
    origin: 'Bandung',
    originId: '22',
    originSlug: 'bandung',
    destination: 'Semarang',
    destinationId: '398',
    destinationSlug: 'semarang',
  },

  // Semarang routes
  {
    origin: 'Semarang',
    originId: '398',
    originSlug: 'semarang',
    destination: 'Jakarta Selatan',
    destinationId: '154',
    destinationSlug: 'jakarta-selatan',
  },
  {
    origin: 'Semarang',
    originId: '398',
    originSlug: 'semarang',
    destination: 'Surabaya',
    destinationId: '444',
    destinationSlug: 'surabaya',
  },

  // Additional major routes
  {
    origin: 'Bekasi',
    originId: '39',
    originSlug: 'bekasi',
    destination: 'Bandung',
    destinationId: '22',
    destinationSlug: 'bandung',
  },
  {
    origin: 'Depok',
    originId: '114',
    originSlug: 'depok',
    destination: 'Bandung',
    destinationId: '22',
    destinationSlug: 'bandung',
  },
  {
    origin: 'Bogor',
    originId: '80',
    originSlug: 'bogor',
    destination: 'Jakarta Selatan',
    destinationId: '154',
    destinationSlug: 'jakarta-selatan',
  },
  {
    origin: 'Malang',
    originId: '180',
    originSlug: 'malang',
    destination: 'Jakarta Selatan',
    destinationId: '154',
    destinationSlug: 'jakarta-selatan',
  },
];

// Helper to get route by slugs (sync version)
export function getRouteBySlug(
  originSlug: string,
  destinationSlug: string
): PopularRoute | undefined {
  return popularRoutes.find(
    (r) => r.originSlug === originSlug && r.destinationSlug === destinationSlug
  );
}

// Helper to format slug to display name
export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to create slug from city name
export function cityToSlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

// Get routes by origin city
export function getRoutesByOrigin(originSlug: string): PopularRoute[] {
  return popularRoutes.filter((r) => r.originSlug === originSlug);
}

// Get unique origin cities
export function getUniqueOrigins(): { name: string; slug: string }[] {
  const seen = new Set<string>();
  return popularRoutes
    .filter((r) => {
      if (seen.has(r.originSlug)) return false;
      seen.add(r.originSlug);
      return true;
    })
    .map((r) => ({ name: r.origin, slug: r.originSlug }));
}
