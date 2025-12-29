import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

/**
 * Caching Strategy
 * Server-side caching with time-based and on-demand revalidation
 */

// ============================================
// Cache Tags
// ============================================

export const CACHE_TAGS = {
    // Settings
    SITE_SETTINGS: 'site-settings',
    COURIER_MARKUP: 'courier-markup',

    // Locations
    PROVINCES: 'provinces',
    CITIES: 'cities',
    DISTRICTS: 'districts',

    // Content
    FAQ: 'faq',
    BLOG: 'blog',
    CATEGORIES: 'categories',

    // User data (use with user ID)
    USER_PROFILE: 'user-profile',
    USER_WALLET: 'user-wallet',
    USER_ORDERS: 'user-orders',

    // Statistics
    STATISTICS: 'statistics',
    TRENDS: 'trends',
};

// ============================================
// Cache Durations (in seconds)
// ============================================

export const CACHE_DURATION = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 3600,          // 1 hour
    DAILY: 86400,        // 24 hours
    WEEKLY: 604800,      // 7 days
};

// ============================================
// Cached Functions Wrapper
// ============================================

/**
 * Create a cached version of a function
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    tags: string[],
    revalidate: number = CACHE_DURATION.LONG
) {
    return unstable_cache(fn, tags, { revalidate, tags });
}

/**
 * Get site settings (cached 1 hour)
 */
export const getCachedSettings = unstable_cache(
    async () => {
        // Import dynamically to avoid circular dependency
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        return data;
    },
    [CACHE_TAGS.SITE_SETTINGS],
    { revalidate: CACHE_DURATION.LONG, tags: [CACHE_TAGS.SITE_SETTINGS] }
);

/**
 * Get courier markup (cached 1 hour)
 */
export const getCachedCourierMarkup = unstable_cache(
    async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        const { data } = await supabase
            .from('courier_markup')
            .select('*')
            .eq('is_active', true);

        return data || [];
    },
    [CACHE_TAGS.COURIER_MARKUP],
    { revalidate: CACHE_DURATION.LONG, tags: [CACHE_TAGS.COURIER_MARKUP] }
);

/**
 * Get provinces (cached 1 day)
 */
export const getCachedProvinces = unstable_cache(
    async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        const { data } = await supabase
            .from('provinces')
            .select('id, name')
            .order('name');

        return data || [];
    },
    [CACHE_TAGS.PROVINCES],
    { revalidate: CACHE_DURATION.DAILY, tags: [CACHE_TAGS.PROVINCES] }
);

/**
 * Get FAQ items (cached 1 hour)
 */
export const getCachedFAQ = unstable_cache(
    async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        const { data } = await supabase
            .from('faq_items')
            .select('*')
            .eq('is_active', true)
            .order('priority', { ascending: false });

        return data || [];
    },
    [CACHE_TAGS.FAQ],
    { revalidate: CACHE_DURATION.LONG, tags: [CACHE_TAGS.FAQ] }
);

/**
 * Get categories (cached 1 day)
 */
export const getCachedCategories = unstable_cache(
    async () => {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();

        const { data } = await supabase
            .from('supplier_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        return data || [];
    },
    [CACHE_TAGS.CATEGORIES],
    { revalidate: CACHE_DURATION.DAILY, tags: [CACHE_TAGS.CATEGORIES] }
);

// ============================================
// On-Demand Revalidation
// ============================================

/**
 * Invalidate cache by tag
 */
export function invalidateCache(tag: string) {
    revalidateTag(tag);
}

/**
 * Invalidate multiple cache tags
 */
export function invalidateCaches(tags: string[]) {
    tags.forEach((tag) => revalidateTag(tag));
}

/**
 * Invalidate all site settings caches
 */
export function invalidateSettingsCache() {
    invalidateCaches([
        CACHE_TAGS.SITE_SETTINGS,
        CACHE_TAGS.COURIER_MARKUP,
    ]);
}

/**
 * Invalidate all location caches
 */
export function invalidateLocationCache() {
    invalidateCaches([
        CACHE_TAGS.PROVINCES,
        CACHE_TAGS.CITIES,
        CACHE_TAGS.DISTRICTS,
    ]);
}

/**
 * Invalidate all content caches
 */
export function invalidateContentCache() {
    invalidateCaches([
        CACHE_TAGS.FAQ,
        CACHE_TAGS.BLOG,
        CACHE_TAGS.CATEGORIES,
    ]);
}

/**
 * Invalidate user-specific cache
 */
export function invalidateUserCache(userId: string) {
    invalidateCaches([
        `${CACHE_TAGS.USER_PROFILE}-${userId}`,
        `${CACHE_TAGS.USER_WALLET}-${userId}`,
        `${CACHE_TAGS.USER_ORDERS}-${userId}`,
    ]);
}

export default {
    CACHE_TAGS,
    CACHE_DURATION,
    getCachedSettings,
    getCachedCourierMarkup,
    getCachedProvinces,
    getCachedFAQ,
    getCachedCategories,
    invalidateCache,
    invalidateCaches,
    invalidateSettingsCache,
    invalidateLocationCache,
    invalidateContentCache,
    invalidateUserCache,
};
