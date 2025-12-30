'use server';

import { createClient } from '@/utils/supabase/server';
import { indonesianCities } from '@/data/cities';

// ============================================
// AUTOMATIC POPULAR ROUTES GENERATOR
// ============================================
// Generates popular routes based on actual search history data

export interface PopularRoute {
  origin: string;
  originId: string;
  originSlug: string;
  destination: string;
  destinationId: string;
  destinationSlug: string;
  searchCount: number;
}

// Helper to convert city name to slug
function cityToSlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

// Helper to get city name by ID
function getCityNameById(cityId: string): string {
  const city = indonesianCities.find((c) => c.id === cityId);
  return city?.name || `City-${cityId}`;
}

// Get popular routes from search_history (cached for 1 hour)
export async function getPopularRoutesFromDB(
  limit: number = 20
): Promise<PopularRoute[]> {
  const supabase = await createClient();

  // Get last 30 days of search data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query search history for ongkir searches
  const { data, error } = await supabase
    .from('search_history')
    .select('query')
    .eq('type', 'ongkir')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error || !data) {
    console.error('Error fetching search history:', error);
    return getFallbackRoutes();
  }

  // Parse and aggregate routes
  const routeCounts: Record<
    string,
    { originId: string; destId: string; count: number }
  > = {};

  data.forEach((item: any) => {
    try {
      // Query format: "origin_id:destination_id:weight" or JSON
      const query = item.query;
      let originId, destId;

      if (query.includes(':')) {
        const parts = query.split(':');
        originId = parts[0];
        destId = parts[1];
      } else if (query.includes('{')) {
        const parsed = JSON.parse(query);
        originId = parsed.originId || parsed.origin_id;
        destId = parsed.destinationId || parsed.destination_id;
      } else {
        return;
      }

      if (originId && destId) {
        const key = `${originId}-${destId}`;
        if (!routeCounts[key]) {
          routeCounts[key] = { originId, destId, count: 0 };
        }
        routeCounts[key].count++;
      }
    } catch {
      // Skip invalid entries
    }
  });

  // Convert to PopularRoute format and sort by count
  const routes: PopularRoute[] = Object.values(routeCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ originId, destId, count }) => {
      const originName = getCityNameById(originId);
      const destName = getCityNameById(destId);

      return {
        origin: originName,
        originId,
        originSlug: cityToSlug(originName),
        destination: destName,
        destinationId: destId,
        destinationSlug: cityToSlug(destName),
        searchCount: count,
      };
    });

  // If not enough routes from DB, supplement with fallback
  if (routes.length < limit) {
    const fallback = getFallbackRoutes();
    const existingKeys = new Set(
      routes.map((r) => `${r.originId}-${r.destinationId}`)
    );

    for (const route of fallback) {
      if (routes.length >= limit) break;
      const key = `${route.originId}-${route.destinationId}`;
      if (!existingKeys.has(key)) {
        routes.push(route);
        existingKeys.add(key);
      }
    }
  }

  return routes;
}

// Fallback static routes (used when no search history exists)
function getFallbackRoutes(): PopularRoute[] {
  return [
    // Jakarta routes
    {
      origin: 'Jakarta Selatan',
      originId: '154',
      originSlug: 'jakarta-selatan',
      destination: 'Bandung',
      destinationId: '22',
      destinationSlug: 'bandung',
      searchCount: 0,
    },
    {
      origin: 'Jakarta Selatan',
      originId: '154',
      originSlug: 'jakarta-selatan',
      destination: 'Surabaya',
      destinationId: '444',
      destinationSlug: 'surabaya',
      searchCount: 0,
    },
    {
      origin: 'Jakarta Selatan',
      originId: '154',
      originSlug: 'jakarta-selatan',
      destination: 'Semarang',
      destinationId: '398',
      destinationSlug: 'semarang',
      searchCount: 0,
    },
    {
      origin: 'Jakarta Selatan',
      originId: '154',
      originSlug: 'jakarta-selatan',
      destination: 'Malang',
      destinationId: '180',
      destinationSlug: 'malang',
      searchCount: 0,
    },

    // Surabaya routes
    {
      origin: 'Surabaya',
      originId: '444',
      originSlug: 'surabaya',
      destination: 'Jakarta Selatan',
      destinationId: '154',
      destinationSlug: 'jakarta-selatan',
      searchCount: 0,
    },
    {
      origin: 'Surabaya',
      originId: '444',
      originSlug: 'surabaya',
      destination: 'Bandung',
      destinationId: '22',
      destinationSlug: 'bandung',
      searchCount: 0,
    },
    {
      origin: 'Surabaya',
      originId: '444',
      originSlug: 'surabaya',
      destination: 'Malang',
      destinationId: '180',
      destinationSlug: 'malang',
      searchCount: 0,
    },

    // Bandung routes
    {
      origin: 'Bandung',
      originId: '22',
      originSlug: 'bandung',
      destination: 'Jakarta Selatan',
      destinationId: '154',
      destinationSlug: 'jakarta-selatan',
      searchCount: 0,
    },
    {
      origin: 'Bandung',
      originId: '22',
      originSlug: 'bandung',
      destination: 'Surabaya',
      destinationId: '444',
      destinationSlug: 'surabaya',
      searchCount: 0,
    },
    {
      origin: 'Bandung',
      originId: '22',
      originSlug: 'bandung',
      destination: 'Semarang',
      destinationId: '398',
      destinationSlug: 'semarang',
      searchCount: 0,
    },

    // Semarang routes
    {
      origin: 'Semarang',
      originId: '398',
      originSlug: 'semarang',
      destination: 'Jakarta Selatan',
      destinationId: '154',
      destinationSlug: 'jakarta-selatan',
      searchCount: 0,
    },
    {
      origin: 'Semarang',
      originId: '398',
      originSlug: 'semarang',
      destination: 'Surabaya',
      destinationId: '444',
      destinationSlug: 'surabaya',
      searchCount: 0,
    },

    // Additional major routes
    {
      origin: 'Bekasi',
      originId: '39',
      originSlug: 'bekasi',
      destination: 'Bandung',
      destinationId: '22',
      destinationSlug: 'bandung',
      searchCount: 0,
    },
    {
      origin: 'Depok',
      originId: '114',
      originSlug: 'depok',
      destination: 'Bandung',
      destinationId: '22',
      destinationSlug: 'bandung',
      searchCount: 0,
    },
    {
      origin: 'Bogor',
      originId: '80',
      originSlug: 'bogor',
      destination: 'Jakarta Selatan',
      destinationId: '154',
      destinationSlug: 'jakarta-selatan',
      searchCount: 0,
    },
    {
      origin: 'Malang',
      originId: '180',
      originSlug: 'malang',
      destination: 'Jakarta Selatan',
      destinationId: '154',
      destinationSlug: 'jakarta-selatan',
      searchCount: 0,
    },
  ];
}

// Get route by slugs (for SSR pages)
export async function getRouteBySlug(
  originSlug: string,
  destinationSlug: string
): Promise<PopularRoute | null> {
  // First try to find in cities data
  const origin = indonesianCities.find(
    (c) => cityToSlug(c.name) === originSlug
  );
  const dest = indonesianCities.find(
    (c) => cityToSlug(c.name) === destinationSlug
  );

  if (origin && dest) {
    return {
      origin: origin.name,
      originId: origin.id,
      originSlug: cityToSlug(origin.name),
      destination: dest.name,
      destinationId: dest.id,
      destinationSlug: cityToSlug(dest.name),
      searchCount: 0,
    };
  }

  return null;
}

// slugToDisplayName helper for SSR pages
export function slugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
