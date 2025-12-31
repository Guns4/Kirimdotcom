// Shipping Cache Helper
// Utilities for managing shipping cost cache

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface ShippingCacheQuery {
    origin: string;
    destination: string;
    weight: number;
    courier: string;
    service?: string;
}

interface ShippingCacheResult {
    id: string;
    origin: string;
    destination: string;
    weight: number;
    courier: string;
    service: string;
    price: number;
    etd: string | null;
    price_data?: any;
    hit_count: number;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

export class ShippingCacheManager {
    /**
     * Check if cache exists and is valid
     */
    static async getCache(query: ShippingCacheQuery): Promise<ShippingCacheResult | null> {
        try {
            const cookieStore = await cookies();
            const supabase = await createClient(cookieStore);

            const { data, error } = await supabase
                .from('shipping_cache')
                .select('*')
                .eq('origin', query.origin)
                .eq('destination', query.destination)
                .eq('weight', query.weight)
                .eq('courier', query.courier)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Cache lookup error:', error);
                return null;
            }

            if (data) {
                // Increment hit count
                await supabase
                    .from('shipping_cache')
                    .update({ hit_count: data.hit_count + 1 })
                    .eq('id', data.id);

                console.log(`[CACHE HIT] Saved API call! Hit count: ${data.hit_count + 1}`);
            }

            return data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Store shipping cost in cache
     */
    static async setCache(
        query: ShippingCacheQuery & { service: string; price: number; etd?: string },
        price_data?: any
    ): Promise<boolean> {
        try {
            const cookieStore = await cookies();
            const supabase = await createClient(cookieStore);

            const { error } = await supabase.from('shipping_cache').insert({
                origin: query.origin,
                destination: query.destination,
                weight: query.weight,
                courier: query.courier,
                service: query.service,
                price: query.price,
                etd: query.etd || null,
                price_data: price_data || null,
                hit_count: 0,
            });

            if (error) {
                console.error('Cache insert error:', error);
                return false;
            }

            console.log('[CACHE SET] New cache entry created');
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * Invalidate cache for specific query
     */
    static async invalidateCache(query: ShippingCacheQuery): Promise<boolean> {
        try {
            const cookieStore = await cookies();
            const supabase = await createClient(cookieStore);

            const { error } = await supabase
                .from('shipping_cache')
                .delete()
                .eq('origin', query.origin)
                .eq('destination', query.destination)
                .eq('weight', query.weight)
                .eq('courier', query.courier);

            if (error) {
                console.error('Cache invalidate error:', error);
                return false;
            }

            console.log('[CACHE INVALIDATE] Cache cleared');
            return true;
        } catch (error) {
            console.error('Cache invalidate error:', error);
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    static async getCacheStats(): Promise<{
        total_entries: number;
        total_hits: number;
        expired_entries: number;
        cache_savings: number; // Estimated cost savings
    }> {
        try {
            const cookieStore = await cookies();
            const supabase = await createClient(cookieStore);

            // Total entries
            const { count: total_entries } = await supabase
                .from('shipping_cache')
                .select('*', { count: 'exact', head: true });

            // Total hits
            const { data: hitsData } = await supabase
                .from('shipping_cache')
                .select('hit_count');

            const total_hits = hitsData?.reduce((sum, row) => sum + (row.hit_count || 0), 0) || 0;

            // Expired entries
            const { count: expired_entries } = await supabase
                .from('shipping_cache')
                .select('*', { count: 'exact', head: true })
                .lt('expires_at', new Date().toISOString());

            // Estimated savings (assume Rp 500 per API call)
            const cache_savings = total_hits * 500;

            return {
                total_entries: total_entries || 0,
                total_hits,
                expired_entries: expired_entries || 0,
                cache_savings,
            };
        } catch (error) {
            console.error('Cache stats error:', error);
            return {
                total_entries: 0,
                total_hits: 0,
                expired_entries: 0,
                cache_savings: 0,
            };
        }
    }

    /**
     * Cleanup expired cache entries
     */
    static async cleanupExpired(): Promise<number> {
        try {
            const cookieStore = await cookies();
            const supabase = await createClient(cookieStore);

            const { data, error } = await supabase.rpc('cleanup_expired_shipping_cache');

            if (error) {
                console.error('Cache cleanup error:', error);
                return 0;
            }

            console.log(`[CACHE CLEANUP] Deleted ${data} expired entries`);
            return data || 0;
        } catch (error) {
            console.error('Cache cleanup error:', error);
            return 0;
        }
    }
}
