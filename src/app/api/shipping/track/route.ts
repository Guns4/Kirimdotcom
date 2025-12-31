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
