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
