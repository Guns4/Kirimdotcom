import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { VENDOR_CONFIG } from '@/lib/api/vendor-config';

// Init Supabase with Service Role (bypass RLS for cache writes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShippingCostRequest {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export async function POST(req: Request) {
  try {
    const body: ShippingCostRequest = await req.json();
    const { origin, destination, weight, courier } = body;

    // 1. Validate Input
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, weight, courier' },
        { status: 400 }
      );
    }

    // 2. CHECK CACHE (Anti-Boncos Strategy!)
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
      console.log('⚡ CACHE HIT! Saved vendor API call');
      
      // Increment hit count for ROI tracking
      await supabase
        .from('shipping_cache')
        .update({ hit_count: (cache.hit_count || 0) + 1 })
        .eq('id', cache.id);

      return NextResponse.json({
        source: 'cache',
        data: cache.price_data,
        cached_at: cache.created_at,
        savings: 'Saved Rp 500 API call cost!',
      });
    }

    // 3. FETCH FROM VENDOR (Cache Miss)
    console.log('🔌 CACHE MISS - Fetching from vendor API...');

    let vendorData: any;

    if (VENDOR_CONFIG.SHIPPING_PROVIDER === 'rajaongkir') {
      // RajaOngkir Implementation
      const response = await axios.post(
        `${VENDOR_CONFIG.SHIPPING_BASE_URL}/cost`,
        {
          origin,
          originType: 'city',
          destination,
          destinationType: 'subdistrict',
          weight,
          courier,
        },
        {
          headers: { key: VENDOR_CONFIG.SHIPPING_API_KEY },
        }
      );

      vendorData = response.data.rajaongkir.results[0];
    } else {
      // Binderbyte Implementation
      const response = await axios.get(
        `${VENDOR_CONFIG.SHIPPING_BASE_URL}/cost`,
        {
          params: { origin, destination, weight, courier },
          headers: { key: VENDOR_CONFIG.SHIPPING_API_KEY },
        }
      );

      vendorData = response.data.data;
    }

    // 4. APPLY MARKUP (Profit Strategy!)
    const processedCosts = vendorData.costs.map((service: any) => {
      const originalCost = service.cost[0].value;
      const markupCost = originalCost + VENDOR_CONFIG.SHIPPING_MARKUP;

      return {
        ...service,
        cost: [
          {
            ...service.cost[0],
            value: markupCost,
            original_value: originalCost,
            markup: VENDOR_CONFIG.SHIPPING_MARKUP,
            note: 'Includes service fee',
          },
        ],
      };
    });

    const finalData = { ...vendorData, costs: processedCosts };

    // 5. SAVE TO CACHE (For Next Request)
    await supabase.from('shipping_cache').insert({
      origin,
      destination,
      weight,
      courier,
      service: vendorData.costs[0]?.service || 'unknown',
      price: processedCosts[0]?.cost[0]?.value || 0,
      etd: processedCosts[0]?.cost[0]?.etd || '',
      price_data: finalData,
      hit_count: 0,
      expires_at: new Date(Date.now() + VENDOR_CONFIG.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });

    console.log('✅ Data cached for future requests');

    return NextResponse.json({
      source: 'api',
      data: finalData,
      fetched_at: new Date().toISOString(),
      cached_until: new Date(Date.now() + VENDOR_CONFIG.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Shipping Cost API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch shipping cost', details: error.message },
      { status: 500 }
    );
  }
}
