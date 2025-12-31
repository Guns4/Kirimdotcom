import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  trackShipment,
  validateTrackParams,
  BinderbyteError,
  handleApiError
} from '@/lib/api/binderbyte';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TrackingRequest {
  courier: string;
  awb: string;
  user_id?: string; // Optional for guest tracking
}

// ==========================================
// POST /api/shipping/track
// ==========================================

export async function POST(req: Request) {
  try {
    const body: TrackingRequest = await req.json();
    const { courier, awb, user_id } = body;

    // 1. Validate Input
    const validation = validateTrackParams({ courier, awb });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log(`[Tracking] Tracking shipment: ${courier.toUpperCase()} - ${awb}`);

    // 2. Call Binderbyte Tracking API
    let trackingData: any;

    try {
      const result = await trackShipment({ courier, awb });
      trackingData = result.data;

      console.log(`[Tracking] ✅ Tracking data received for ${awb}`);
    } catch (error: any) {
      console.error('[Tracking] Binderbyte API error:', error);

      // Handle specific errors
      if (error instanceof BinderbyteError) {
        if (error.statusCode === 404) {
          return NextResponse.json(
            {
              error: 'Tracking number not found',
              message: 'Resi tidak ditemukan atau belum tersedia di sistem kurir',
              awb,
              courier,
            },
            { status: 404 }
          );
        }
      }

      throw handleApiError(error);
    }

    // 3. Save to Tracking History (User Retention!)
    try {
      const historyPayload = {
        waybill: awb,
        courier: courier.toLowerCase(),
        last_status: trackingData.status || 'UNKNOWN',
        recipient_name: trackingData.receiver || null,
        history_data: trackingData,
        updated_at: new Date().toISOString(),
      };

      if (user_id) {
        // Save for logged-in user
        console.log(`[Tracking] Saving history for user: ${user_id}`);

        const { error: historyError } = await supabase
          .from('tracking_history')
          .upsert(
            {
              user_id,
              ...historyPayload,
            },
            {
              onConflict: 'user_id,waybill',
            }
          );

        if (historyError) {
          console.error('[Tracking] Failed to save user history:', historyError);
          // Don't fail the request, just log the error
        } else {
          console.log(`[Tracking] ✅ User history saved`);
        }
      } else {
        // Save as guest tracking (user_id = null)
        console.log(`[Tracking] Saving guest tracking history`);

        const { error: guestHistoryError } = await supabase
          .from('tracking_history')
          .upsert(
            {
              user_id: null,
              ...historyPayload,
            },
            {
              onConflict: 'waybill',
              ignoreDuplicates: false,
            }
          );

        if (guestHistoryError) {
          console.error('[Tracking] Failed to save guest history:', guestHistoryError);
        } else {
          console.log(`[Tracking] ✅ Guest history saved`);
        }
      }
    } catch (historyError) {
      // History saving failed, but don't fail the main request
      console.error('[Tracking] History save exception:', historyError);
    }

    // 4. Return Tracking Data
    return NextResponse.json({
      success: true,
      data: {
        waybill: trackingData.waybill || awb,
        courier: trackingData.courier || courier,
        service: trackingData.service,
        status: trackingData.status,
        receiver: trackingData.receiver,
        received_date: trackingData.received_date,
        manifest: trackingData.manifest || [],
      },
      message: user_id
        ? 'Tracking saved to your history'
        : 'Tracking data retrieved',
    });

  } catch (error: any) {
    console.error('[Tracking] Error:', error);

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
        error: 'Failed to track shipment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// GET /api/shipping/track/history
// Get user's tracking history
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    console.log(`[Tracking History] Fetching history for user: ${user_id}`);

    // Fetch user's tracking history
    const { data: history, error } = await supabase
      .from('tracking_history')
      .select('waybill, courier, last_status, recipient_name, created_at, updated_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      history: history || [],
      count: history?.length || 0,
    });

  } catch (error: any) {
    console.error('[Tracking History] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get tracking history',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
