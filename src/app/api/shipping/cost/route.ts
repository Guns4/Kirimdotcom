import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { binderbyteClient, handleApiError, BinderbyteError, validateCostParams } from '@/lib/api/binderbyte';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// Configuration
// ==========================================

const MARKUP_AMOUNT = 1000;        // Profit: Rp 1.000 per service
const CACHE_TTL_DAYS = 30;         // Cache expires after 30 days

// ==========================================
// POST /api/shipping/cost
// ==========================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, weight, courier } = body;

    // 1. Validate Input
    const validation = validateCostParams({ origin, destination, weight, courier });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 2. CHECK CACHE FIRST (Save Money!)
    console.log(`[Shipping Cost] Checking cache for ${courier}: ${origin} → ${destination} (${weight}g)`);

    const { data: cache, error: cacheError } = await supabase
      .from('shipping_cache')
      .select('*')
      .eq('origin', origin)
      .eq('destination', destination)
      .eq('weight', weight)
      .eq('courier', courier)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (cache && !cacheError) {
      // Cache hit - increment usage counter
      await supabase
        .from('shipping_cache')
        .update({ hit_count: (cache.hit_count || 0) + 1 })
        .eq('id', cache.id);

      console.log(`[Shipping Cost] ✅ CACHE HIT! (hit_count: ${cache.hit_count + 1})`);

      return NextResponse.json({
        source: 'cache',
        data: cache.price_data,
        cached_at: cache.created_at,
        expires_at: cache.expires_at,
        savings: `Saved Rp 200 API call cost!`,
      });
    }

    // 3. CACHE MISS - Call Binderbyte API
    console.log(`[Shipping Cost] ⚠️ CACHE MISS - Calling Binderbyte API...`);

    let rawData: any;

    try {
      const response = await binderbyteClient.get('/cost', {
        params: {
          origin,
          destination,
          weight,
          courier,
        },
      });

      // Extract data from Binderbyte response
      rawData = response.data?.data || response.data;

      if (!rawData) {
        throw new Error('Invalid response from shipping provider');
      }

      console.log(`[Shipping Cost] ✅ Binderbyte API responded successfully`);
    } catch (error: any) {
      console.error('[Shipping Cost] Binderbyte API error:', error);
      throw handleApiError(error);
    }

    // 4. APPLY MARKUP (Profit Strategy!)
    if (rawData && Array.isArray(rawData.costs)) {
      console.log(`[Shipping Cost] 💰 Applying markup: +Rp ${MARKUP_AMOUNT} per service`);

      rawData.costs = rawData.costs.map((service: any) => {
        const originalPrice = parseInt(service.price || service.cost || 0);
        const markedUpPrice = originalPrice + MARKUP_AMOUNT;

        return {
          ...service,
          price: markedUpPrice,
          original_price: originalPrice,
          markup: MARKUP_AMOUNT,
          note: service.note || 'Harga termasuk layanan proteksi & asuransi',
        };
      });

      console.log(`[Shipping Cost] Markup applied to ${rawData.costs.length} services`);
    } else {
      console.warn('[Shipping Cost] No costs array found in response, skipping markup');
    }

    // 5. SAVE TO CACHE (For Next Request)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    const { error: insertError } = await supabase.from('shipping_cache').insert({
      origin,
      destination,
      weight,
      courier,
      service: rawData.costs?.[0]?.service || 'unknown',
      price: rawData.costs?.[0]?.price || 0,
      etd: rawData.costs?.[0]?.etd || '',
      price_data: rawData,
      hit_count: 0,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error('[Shipping Cost] Failed to cache result:', insertError);
      // Don't fail the request, just log the error
    } else {
      console.log(`[Shipping Cost] ✅ Cached successfully (expires: ${expiresAt.toISOString()})`);
    }

    // 6. Return Response
    return NextResponse.json({
      source: 'api',
      data: rawData,
      fetched_at: new Date().toISOString(),
      cached_until: expiresAt.toISOString(),
      message: 'Fresh data from shipping provider (now cached for 30 days)',
    });

  } catch (error: any) {
    console.error('[Shipping Cost] Error:', error);

    if (error instanceof BinderbyteError) {
      return NextResponse.json(
        {
          error: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to get shipping cost',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET /api/shipping/cost (Cache Statistics)
// ==========================================

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_cache_statistics');

    if (error) {
      throw error;
    }

    const stats = data?.[0] || {
      total_entries: 0,
      total_hits: 0,
      expired_entries: 0,
      active_entries: 0,
    };

    // Calculate savings
    const apiCallsSaved = stats.total_hits || 0;
    const savingsRp = apiCallsSaved * 200; // Assume Rp 200 per API call
    const profitFromMarkup = stats.total_hits * MARKUP_AMOUNT;

    return NextResponse.json({
      cache_statistics: {
        total_cached_routes: stats.total_entries,
        active_cached_routes: stats.active_entries,
        expired_cached_routes: stats.expired_entries,
        total_api_calls_saved: apiCallsSaved,
        estimated_cost_savings: `Rp ${savingsRp.toLocaleString('id-ID')}`,
        estimated_profit_from_markup: `Rp ${profitFromMarkup.toLocaleString('id-ID')}`,
        total_value: `Rp ${(savingsRp + profitFromMarkup).toLocaleString('id-ID')}`,
      },
      markup_configuration: {
        markup_per_service: MARKUP_AMOUNT,
        cache_ttl_days: CACHE_TTL_DAYS,
      },
      message: apiCallsSaved > 0
        ? `Cache saved you ${apiCallsSaved} API calls! 🎉`
        : 'No cache hits yet. Keep using the app!',
    });
  } catch (error: any) {
    console.error('[Shipping Cost Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics', details: error.message },
      { status: 500 }
    );
  }
}
