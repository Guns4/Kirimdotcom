// ============================================
// SUPABASE CACHING LAYER FOR LOGISTICS API
// ============================================
// Implements smart caching to minimize API costs

import { createClient } from '@/utils/supabase/server'

// Cache TTL Configuration
const TRACKING_CACHE_HOURS = 3 // Tracking cache expires after 3 hours
const ONGKIR_CACHE_HOURS = 24 // Ongkir cache expires after 24 hours

// ============================================
// TRACKING CACHE FUNCTIONS
// ============================================

export interface CachedTracking {
    id: string
    resi_number: string
    courier_code: string
    status_json: any
    current_status: string | null
    last_updated: string
    created_at: string
}

/**
 * Get cached tracking data if available and fresh
 */
export async function getCachedTracking(
    resiNumber: string,
    courierCode: string
): Promise<CachedTracking | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cached_resi')
        .select('*')
        .eq('resi_number', resiNumber)
        .eq('courier_code', courierCode.toLowerCase())
        .single()

    if (error || !data) {
        return null
    }

    // Check if cache is still fresh (< 3 hours old)
    const lastUpdated = new Date((data as any).last_updated)
    const now = new Date()
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > TRACKING_CACHE_HOURS) {
        // Cache is stale
        return null
    }

    return data as CachedTracking
}

/**
 * Save or update tracking data in cache
 */
export async function setCachedTracking(
    resiNumber: string,
    courierCode: string,
    statusData: any,
    currentStatus?: string
): Promise<void> {
    const supabase = await createClient()

    const cacheData = {
        resi_number: resiNumber,
        courier_code: courierCode.toLowerCase(),
        status_json: statusData,
        current_status: currentStatus || null,
        last_updated: new Date().toISOString(),
    }

    // Upsert (insert or update if exists)
    const { error } = await (supabase.from('cached_resi') as any)
        .upsert(cacheData, {
            onConflict: 'resi_number,courier_code',
        })

    if (error) {
        console.error('Failed to cache tracking data:', error)
        // Don't throw - caching failure shouldn't break the app
    }
}

// ============================================
// ONGKIR CACHE FUNCTIONS
// ============================================

export interface CachedOngkir {
    id: string
    origin_id: string
    destination_id: string
    weight: number
    courier_code: string | null
    rates_json: any
    last_updated: string
    created_at: string
}

/**
 * Get cached ongkir data if available and fresh
 */
export async function getCachedOngkir(
    originId: string,
    destinationId: string,
    weight: number,
    courierCode?: string
): Promise<CachedOngkir | null> {
    const supabase = await createClient()

    let query = supabase
        .from('cached_ongkir')
        .select('*')
        .eq('origin_id', originId)
        .eq('destination_id', destinationId)
        .eq('weight', weight)

    if (courierCode) {
        query = query.eq('courier_code', courierCode.toLowerCase())
    }

    const { data, error } = await query.single()

    if (error || !data) {
        return null
    }

    // Check if cache is still fresh (< 24 hours old)
    const lastUpdated = new Date((data as any).last_updated)
    const now = new Date()
    const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > ONGKIR_CACHE_HOURS) {
        // Cache is stale
        return null
    }

    return data as CachedOngkir
}

/**
 * Save or update ongkir data in cache
 */
export async function setCachedOngkir(
    originId: string,
    destinationId: string,
    weight: number,
    ratesData: any,
    courierCode?: string
): Promise<void> {
    const supabase = await createClient()

    const cacheData = {
        origin_id: originId,
        destination_id: destinationId,
        weight: weight,
        courier_code: courierCode?.toLowerCase() || null,
        rates_json: ratesData,
        last_updated: new Date().toISOString(),
    }

    // Upsert (insert or update if exists)
    const { error } = await (supabase.from('cached_ongkir') as any)
        .upsert(cacheData, {
            onConflict: 'origin_id,destination_id,weight,courier_code',
        })

    if (error) {
        console.error('Failed to cache ongkir data:', error)
        // Don't throw - caching failure shouldn't break the app
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get cache statistics (for monitoring)
 */
export async function getCacheStats() {
    const supabase = await createClient()

    const [resiCount, ongkirCount] = await Promise.all([
        supabase.from('cached_resi').select('*', { count: 'exact', head: true }),
        supabase.from('cached_ongkir').select('*', { count: 'exact', head: true }),
    ])

    return {
        trackingCacheSize: resiCount.count || 0,
        ongkirCacheSize: ongkirCount.count || 0,
    }
}

/**
 * Manually clear stale cache (admin function)
 */
export async function clearStaleCache(): Promise<{
    trackingDeleted: number
    ongkirDeleted: number
}> {
    const supabase = await createClient()

    // Clear tracking cache older than 7 days
    const trackingCutoff = new Date()
    trackingCutoff.setDate(trackingCutoff.getDate() - 7)

    const { data: deletedTracking } = await supabase
        .from('cached_resi')
        .delete()
        .lt('last_updated', trackingCutoff.toISOString())
        .select()

    // Clear ongkir cache older than 30 days
    const ongkirCutoff = new Date()
    ongkirCutoff.setDate(ongkirCutoff.getDate() - 30)

    const { data: deletedOngkir } = await (supabase.from('cached_ongkir') as any)
        .delete()
        .lt('last_updated', ongkirCutoff.toISOString())
        .select()

    return {
        trackingDeleted: deletedTracking?.length || 0,
        ongkirDeleted: deletedOngkir?.length || 0,
    }
}
