import { createClient } from '@/utils/supabase/server';

const CACHE_DURATION_DAYS = 30;

interface CacheParams {
    origin: string;
    destination: string;
    weight: number;
}

export async function checkCache(params: CacheParams) {
    const supabase = createClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CACHE_DURATION_DAYS);

    const { data, error } = await supabase
        .from('shipping_cache')
        .select('*')
        .eq('origin', params.origin)
        .eq('destination', params.destination)
        .eq('weight', params.weight)
        .gte('updated_at', cutoffDate.toISOString());

    if (error || !data || data.length === 0) {
        return null; // Cache Miss
    }

    // Cache Hit - Group by courier
    return data.map(item => ({
        courier: item.courier,
        service: item.service,
        price: item.price,
        etd: item.etd
    }));
}

export async function setCache(params: CacheParams, rates: any[]) {
    const supabase = createClient();

    const cacheRecords = rates.map(rate => ({
        origin: params.origin,
        destination: params.destination,
        weight: params.weight,
        courier: rate.courier,
        service: rate.service,
        price: rate.price,
        etd: rate.etd || 'N/A'
    }));

    await supabase.from('shipping_cache').insert(cacheRecords);
}
