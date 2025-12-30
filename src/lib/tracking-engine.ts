import { createClient } from '@/utils/supabase/server';
import {
  trackResi as fetchExternalAPI,
  BinderByteTrackingResponse,
} from '@/lib/api/logistics';
import { Database } from '@/types/database';

// Types
export interface SmartTrackingResult {
  source: 'db' | 'api';
  isCacheHit: boolean;
  data: BinderByteTrackingResponse['data'];
  lastUpdated: Date;
}

// Configuration
const CACHE_FRESHNESS_HOURS = 4;

export async function smartTrackShipment(
  waybill: string,
  courier: string
): Promise<SmartTrackingResult> {
  const supabase = await createClient();

  // 1. Cek Lokal (DB)
  const { data: cached } = await (supabase.from('cached_resi') as any)
    .select('*')
    .eq('waybill', waybill)
    .eq('courier', courier)
    .single();

  // 2. Evaluasi Cache
  if (cached) {
    const lastUpdated = new Date(cached.last_updated);
    // const now = new Date() // No longer needed for diff calculation if we use simple methods
    const diffHours = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

    // Skenario A: Delivered -> Always return DB (No cost)
    if (cached.is_delivered) {
      console.log(`[SmartTrack] Cache Hit (Final State) for ${waybill}`);
      return {
        source: 'db',
        isCacheHit: true,
        data: cached.raw_data, // Assuming raw_data is stored as BinderByte format
        lastUpdated: lastUpdated,
      };
    }

    // Skenario B: Fresh -> Return DB
    if (diffHours < CACHE_FRESHNESS_HOURS) {
      console.log(
        `[SmartTrack] Cache Hit (Fresh ${diffHours.toFixed(1)}h) for ${waybill}`
      );
      return {
        source: 'db',
        isCacheHit: true,
        data: cached.raw_data,
        lastUpdated: lastUpdated,
      };
    }

    console.log(
      `[SmartTrack] Cache Stale (${diffHours.toFixed(1)}h) -> Refreshing from API`
    );
  } else {
    console.log(`[SmartTrack] Cache Miss for ${waybill} -> Fetching API`);
  }

  // 3. Fetch External API
  try {
    const externalData = await fetchExternalAPI(waybill, courier);

    // Validation: Ensure valid data
    if (!externalData || externalData.status !== 200 || !externalData.data) {
      throw new Error(externalData.message || 'Data tracking empty');
    }

    const trackingInfo = externalData.data;
    const isDelivered = trackingInfo.summary.status === 'DELIVERED';

    // 4. Update/Insert Cache
    // Using upsert with conflict on (waybill, courier)
    const { error: upsertError } = await (
      supabase.from('cached_resi') as any
    ).upsert(
      {
        waybill: waybill,
        courier: courier,
        status_code: trackingInfo.summary.status,
        is_delivered: isDelivered,
        raw_data: trackingInfo, // Store full JSON
        last_updated: new Date().toISOString(),
      },
      {
        onConflict: 'waybill, courier',
      }
    );

    if (upsertError) {
      console.error('[SmartTrack] Cache Update Failed:', upsertError);
    }

    return {
      source: 'api',
      isCacheHit: false,
      data: trackingInfo,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('[SmartTrack] External API Error:', error);

    // Fallback: If API fails but we have stale cache, return stale cache with warning?
    // Or just throw error. For now, throw error as requested by flow.
    // "Jika Gagal/Error: Return error ke user."
    throw error;
  }
}
