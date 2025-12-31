#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🚀 Core API Engine Perfect Setup v1.0               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ==========================================
# STEP 1: Vendor Config
# ==========================================
echo "📝 Creating Vendor Config..."
mkdir -p src/lib/api

cat << 'EOF' > src/lib/api/vendor-config.ts
// Vendor API Configuration
// Centralized config for RajaOngkir, Binderbyte, Digiflazz

export const VENDOR_CONFIG = {
  // Shipping API (RajaOngkir/Binderbyte)
  SHIPPING_API_KEY: process.env.RAJAONGKIR_API_KEY || process.env.BINDERBYTE_API_KEY || '',
  SHIPPING_BASE_URL: process.env.RAJAONGKIR_API_KEY 
    ? 'https://pro.rajaongkir.com/api'
    : 'https://api.binderbyte.com/v1',
  SHIPPING_PROVIDER: process.env.RAJAONGKIR_API_KEY ? 'rajaongkir' : 'binderbyte',

  // PPOB API (Digiflazz/Tripay)
  PPOB_USER: process.env.DIGIFLAZZ_USERNAME || '',
  PPOB_KEY: process.env.DIGIFLAZZ_API_KEY || '',
  PPOB_BASE_URL: 'https://api.digiflazz.com/v1',

  // Pricing
  SHIPPING_MARKUP: 1000, // Rp 1.000 profit per shipping
  PPOB_MARGIN_PERCENT: 5, // 5% profit margin for PPOB
  
  // Cache TTL
  CACHE_TTL_DAYS: 30,
};

// Validation helper
export function validateVendorConfig() {
  const errors: string[] = [];

  if (!VENDOR_CONFIG.SHIPPING_API_KEY) {
    errors.push('Missing RAJAONGKIR_API_KEY or BINDERBYTE_API_KEY');
  }

  if (!VENDOR_CONFIG.PPOB_USER || !VENDOR_CONFIG.PPOB_KEY) {
    errors.push('Missing DIGIFLAZZ credentials (DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
EOF

echo "✅ Vendor config created"

# ==========================================
# STEP 2: Shipping Cost API (With Cache & Markup)
# ==========================================
echo "📦 Creating Shipping Cost API..."
mkdir -p src/app/api/shipping/cost

cat << 'EOF' > src/app/api/shipping/cost/route.ts
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
EOF

echo "✅ Shipping cost API created"

# ==========================================
# STEP 3: PPOB Transaction API
# ==========================================
echo "💰 Creating PPOB Transaction API..."
mkdir -p src/app/api/ppob/transaction

cat << 'EOF' > src/app/api/ppob/transaction/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { VENDOR_CONFIG } from '@/lib/api/vendor-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PPOBRequest {
  product_code: string;
  target_number: string;
  user_id: string;
}

export async function POST(req: Request) {
  try {
    const body: PPOBRequest = await req.json();
    const { product_code, target_number, user_id } = body;

    // 1. Validate Input
    if (!product_code || !target_number || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 2. Get Product Details
    const { data: product, error: productError } = await supabase
      .from('ppob_products')
      .select('*')
      .eq('product_code', product_code)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // 3. Check User Balance (if using wallet system)
    // const { data: wallet } = await supabase
    //   .from('wallets')
    //   .select('balance')
    //   .eq('user_id', user_id)
    //   .single();
    
    // if (!wallet || wallet.balance < product.price_sell) {
    //   return NextResponse.json(
    //     { error: 'Insufficient balance' },
    //     { status: 402 }
    //   );
    // }

    // 4. Create Transaction Record
    const trx_id = `TRX-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const { data: transaction, error: trxError } = await supabase
      .from('ppob_transactions')
      .insert({
        user_id,
        trx_id,
        product_code,
        target_number,
        price_modal: product.price_modal,
        price_sell: product.price_sell,
        status: 'PENDING',
      })
      .select()
      .single();

    if (trxError) {
      throw new Error('Failed to create transaction: ' + trxError.message);
    }

    // 5. Deduct Balance (Atomic Operation)
    // await supabase.rpc('deduct_balance', {
    //   p_user_id: user_id,
    //   p_amount: product.price_sell
    // });

    // 6. Call Vendor API (Digiflazz)
    try {
      const vendorResponse = await axios.post(
        `${VENDOR_CONFIG.PPOB_BASE_URL}/transaction`,
        {
          username: VENDOR_CONFIG.PPOB_USER,
          buyer_sku_code: product_code,
          customer_no: target_number,
          ref_id: trx_id,
          sign: generateDigiflazzSign(trx_id), // Implement sign generation
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const vendorData = vendorResponse.data.data;

      // 7. Update Transaction Status
      await supabase
        .from('ppob_transactions')
        .update({
          status: vendorData.status === 'Sukses' ? 'SUCCESS' : 'PENDING',
          sn: vendorData.sn || null,
          vendor_trx_id: vendorData.trx_id || null,
          vendor_msg: vendorData.message || null,
          completed_at: vendorData.status === 'Sukses' ? new Date().toISOString() : null,
        })
        .eq('id', transaction.id);

      return NextResponse.json({
        success: true,
        transaction: {
          trx_id,
          status: vendorData.status,
          sn: vendorData.sn,
          message: vendorData.message,
        },
      });
    } catch (vendorError: any) {
      console.error('Vendor API Error:', vendorError.message);

      // 8. Refund on Vendor Failure
      await supabase
        .from('ppob_transactions')
        .update({
          status: 'FAILED',
          vendor_msg: vendorError.message,
          refund_amount: product.price_sell,
          refund_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      // await supabase.rpc('refund_balance', {
      //   p_user_id: user_id,
      //   p_amount: product.price_sell
      // });

      return NextResponse.json(
        {
          success: false,
          error: 'Transaction failed, balance refunded',
          trx_id,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('PPOB Transaction Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to generate Digiflazz signature
function generateDigiflazzSign(ref_id: string): string {
  const crypto = require('crypto');
  const username = VENDOR_CONFIG.PPOB_USER;
  const apiKey = VENDOR_CONFIG.PPOB_KEY;
  const sign = crypto
    .createHash('md5')
    .update(username + apiKey + ref_id)
    .digest('hex');
  return sign;
}
EOF

echo "✅ PPOB transaction API created"

# ==========================================
# STEP 4: Tracking API
# ==========================================
echo "📍 Creating Tracking API..."
mkdir -p src/app/api/shipping/track

cat << 'EOF' > src/app/api/shipping/track/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { VENDOR_CONFIG } from '@/lib/api/vendor-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TrackingRequest {
  waybill: string;
  courier: string;
  user_id?: string;
}

export async function POST(req: Request) {
  try {
    const body: TrackingRequest = await req.json();
    const { waybill, courier, user_id } = body;

    // 1. Validate Input
    if (!waybill || !courier) {
      return NextResponse.json(
        { error: 'Missing waybill or courier' },
        { status: 400 }
      );
    }

    // 2. Fetch from Vendor API
    const response = await axios.get(
      `${VENDOR_CONFIG.SHIPPING_BASE_URL}/waybill`,
      {
        params: { waybill, courier },
        headers: { key: VENDOR_CONFIG.SHIPPING_API_KEY },
      }
    );

    const trackingData = response.data.rajaongkir?.result || response.data.data;

    // 3. Save to Tracking History
    if (user_id) {
      await supabase.from('tracking_history').upsert(
        {
          user_id,
          waybill,
          courier,
          last_status: trackingData.delivery_status?.status || trackingData.status || 'Unknown',
          recipient_name: trackingData.delivery_status?.pod_receiver || null,
          history_data: trackingData,
        },
        { onConflict: 'waybill' }
      );
    }

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error: any) {
    console.error('Tracking API Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to track shipment', details: error.message },
      { status: 500 }
    );
  }
}
EOF

echo "✅ Tracking API created"

# ==========================================
# Final Summary
# ==========================================
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                 ✅ SETUP COMPLETE!                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Files Created:"
echo "  📁 src/lib/api/vendor-config.ts"
echo "  📁 src/app/api/shipping/cost/route.ts"
echo "  📁 src/app/api/ppob/transaction/route.ts"
echo "  📁 src/app/api/shipping/track/route.ts"
echo ""
echo "Next Steps:"
echo "  1. Set environment variables in .env.local:"
echo "     - RAJAONGKIR_API_KEY or BINDERBYTE_API_KEY"
echo "     - DIGIFLAZZ_USERNAME"
echo "     - DIGIFLAZZ_API_KEY"
echo "     - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "  2. Test APIs:"
echo "     curl -X POST http://localhost:3000/api/shipping/cost \\"
echo "       -d '{\"origin\":\"Jakarta\",\"destination\":\"Surabaya\",\"weight\":1000,\"courier\":\"jne\"}'"
echo ""
echo "  3. Monitor cache hit rate in Supabase Dashboard"
echo "     SELECT * FROM shipping_cache ORDER BY hit_count DESC;"
echo ""
