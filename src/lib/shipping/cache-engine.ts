import { createClient } from '@/utils/supabase/server';

export interface CacheParams {
    origin: string;
    destination: string;
    weight: number;
    courier?: string;
}

export interface CachedRate {
    courier: string;
    service: string;
    price: number;
    etd: string;
}

const CACHE_DURATION_DAYS = 30;

export async function checkCache(params: CacheParams): Promise<CachedRate[] | null> {
    const supabase = await createClient();

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CACHE_DURATION_DAYS);

    let query = (supabase as any)
        .from('shipping_cache')
        .select('courier, service, price, etd')
        .eq('origin_code', params.origin)
        .eq('destination_code', params.destination)
        .eq('weight_kg', params.weight)
        .gte('updated_at', cutoffDate.toISOString());

    if (params.courier) {
        query = query.eq('courier', params.courier);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
        return null;
    }

    return data as CachedRate[];
}

export async function setCache(params: CacheParams, rates: CachedRate[]) {
    const supabase = await createClient();

    const cacheEntries = rates.map(rate => ({
        origin_code: params.origin,
        destination_code: params.destination,
        weight_kg: params.weight,
        courier: rate.courier,
        service: rate.service,
        price: rate.price,
        etd: rate.etd,
        updated_at: new Date().toISOString()
    }));

    // Upsert logic could be complex with composite keys, simpler to insert for now
    // Ideally we delete old records for this combo first

    // 1. Delete existing for this specific combo to avoid duplicates
    await (supabase as any)
        .from('shipping_cache')
        .delete()
        .eq('origin_code', params.origin)
        .eq('destination_code', params.destination)
        .eq('weight_kg', params.weight);

    // 2. Insert new
    const { error } = await (supabase as any)
        .from('shipping_cache')
        .insert(cacheEntries);

    if (error) {
        console.error('Cache set error:', error);
    }
}
