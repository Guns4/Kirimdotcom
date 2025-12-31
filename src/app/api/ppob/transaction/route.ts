import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VENDOR_CONFIG } from '@/lib/api/vendor-config';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PPOBRequest {
  user_id: string;
  product_code: string;
  target_number: string;
}

export async function POST(req: Request) {
  try {
    const body: PPOBRequest = await req.json();
    const { user_id, product_code, target_number } = body;

    // 1. Validate Input
    if (!user_id || !product_code || !target_number) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, product_code, target_number' },
        { status: 400 }
      );
    }

    // 2. Get Product Details
    const { data: product, error: productError } = await supabase
      .from('ppob_products')
      .select('*')
      .eq('product_code', product_code)
      .eq('is_active', true)
      .eq('stock_available', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found, inactive, or out of stock' },
        { status: 404 }
      );
    }

    const selling_price = product.price_sell;
    const modal_price = product.price_modal;

    // 3. Check User Balance
    const { data: balanceData } = await supabase.rpc('get_balance', {
      p_user_id: user_id,
    });

    const currentBalance = balanceData || 0;

    if (currentBalance < selling_price) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          required: selling_price,
          current: currentBalance,
          shortfall: selling_price - currentBalance,
        },
        { status: 402 }
      );
    }

    // 4. Generate Transaction ID
    const trxId = `TRX-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 5. Deduct Balance (Atomic Operation)
    const { data: deductResult, error: deductError } = await supabase.rpc(
      'deduct_balance',
      {
        p_user_id: user_id,
        p_amount: selling_price,
      }
    );

    if (deductError || !deductResult?.[0]?.success) {
      console.error('Balance deduction failed:', deductError || deductResult?.[0]?.message);
      return NextResponse.json(
        { error: 'Failed to process payment: ' + (deductResult?.[0]?.message || 'Unknown error') },
        { status: 500 }
      );
    }

    const newBalance = deductResult[0].new_balance;

    // 6. Create Transaction Record (PENDING status)
    const { data: transaction, error: trxError } = await supabase
      .from('ppob_transactions')
      .insert({
        user_id,
        trx_id: trxId,
        product_code,
        target_number,
        price_modal: modal_price,
        price_sell: selling_price,
        status: 'PENDING',
      })
      .select()
      .single();

    if (trxError) {
      // Refund balance if transaction creation fails
      await supabase.rpc('add_balance', {
        p_user_id: user_id,
        p_amount: selling_price,
      });

      return NextResponse.json(
        { error: 'Failed to create transaction: ' + trxError.message },
        { status: 500 }
      );
    }

    // 7. Call Vendor API (Digiflazz/Tripay)
    let vendorStatus = 'PENDING';
    let sn = '';
    let vendorMessage = '';

    try {
      // ========================================
      // PRODUCTION: Replace this with real vendor API call
      // ========================================

      // Example Digiflazz API call:
      /*
      const vendorResponse = await axios.post(
        `${VENDOR_CONFIG.PPOB_BASE_URL}/transaction`,
        {
          username: VENDOR_CONFIG.PPOB_USER,
          buyer_sku_code: product_code,
          customer_no: target_number,
          ref_id: trxId,
          sign: generateDigiflazzSign(trxId),
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const vendorData = vendorResponse.data.data;
      vendorStatus = vendorData.status === 'Sukses' ? 'SUCCESS' : 'FAILED';
      sn = vendorData.sn || '';
      vendorMessage = vendorData.message || '';
      */

      // ========================================
      // DEVELOPMENT: Simulated success for testing
      // ========================================
      vendorStatus = 'SUCCESS';
      sn = `SN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      vendorMessage = 'Transaction successful (simulated)';

      console.log('[PPOB] Vendor API called successfully:', {
        trxId,
        status: vendorStatus,
        sn,
      });
    } catch (vendorError: any) {
      vendorStatus = 'FAILED';
      vendorMessage = vendorError.message || 'Vendor API error';
      console.error('[PPOB] Vendor API error:', vendorError.message);
    }

    // 8. Update Transaction Status
    await supabase
      .from('ppob_transactions')
      .update({
        status: vendorStatus,
        sn: sn || null,
        vendor_msg: vendorMessage,
        completed_at: vendorStatus === 'SUCCESS' ? new Date().toISOString() : null,
      })
      .eq('id', transaction.id);

    // 9. Refund if Vendor Failed
    if (vendorStatus === 'FAILED') {
      const { data: refundResult } = await supabase.rpc('add_balance', {
        p_user_id: user_id,
        p_amount: selling_price,
      });

      await supabase
        .from('ppob_transactions')
        .update({
          status: 'REFUNDED',
          refund_amount: selling_price,
          refund_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      console.log('[PPOB] Transaction failed, balance refunded:', {
        trxId,
        amount: selling_price,
        newBalance: refundResult?.[0]?.new_balance,
      });

      return NextResponse.json(
        {
          error: 'Transaction failed at vendor',
          message: 'Your balance has been refunded',
          trx_id: trxId,
          refunded_amount: selling_price,
          vendor_message: vendorMessage,
        },
        { status: 500 }
      );
    }

    // 10. Success Response
    return NextResponse.json({
      success: true,
      data: {
        trx_id: trxId,
        status: vendorStatus,
        sn: sn,
        product: product.product_name,
        target: target_number,
        amount: selling_price,
        previous_balance: currentBalance,
        new_balance: newBalance,
        message: 'Transaction completed successfully',
      },
    });
  } catch (error: any) {
    console.error('[PPOB] Unexpected error:', error);
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
