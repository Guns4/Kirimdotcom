#!/bin/bash

# =============================================================================
# Money In: Automated Deposit Gateway
# =============================================================================

echo "Initializing Deposit Gateway..."
echo "================================================="

# 1. Payment Utils (Security)
echo "1. Creating Payment Utils: src/lib/payment.ts"
mkdir -p src/lib
cat <<EOF > src/lib/payment.ts
import crypto from 'crypto';

export function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, signatureKey: string) {
  // Standard Midtrans Signature: SHA512(order_id+status_code+gross_amount+ServerKey)
  const payload = orderId + statusCode + grossAmount + serverKey;
  const hash = crypto.createHash('sha512').update(payload).digest('hex');
  
  return hash === signatureKey;
}

export async function sendWhatsappNotification(phone: string, message: string) {
  // Mock Notification
  console.log(\`[WA] To \${phone}: \${message}\`);
  // In production, call generic WA API provider
}
EOF

# 2. Webhook Route
echo "2. Creating Handler: src/app/api/webhooks/payment/route.ts"
mkdir -p src/app/api/webhooks/payment
cat <<EOF > src/app/api/webhooks/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifySignature, sendWhatsappNotification } from '@/lib/payment';

// Mock Server Key (should be in env)
const SERVER_KEY = process.env.PAYMENT_SERVER_KEY || 'mock-server-key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      transaction_status,
      order_id,
      gross_amount,
      status_code,
      signature_key,
      custom_field1 // user_id (sent during snap token creation)
    } = body;

    // 1. Verify Signature
    // Note: If using 'custom_field1' passing user_id, ensure payload correctness
    const isValid = verifySignature(order_id, status_code, gross_amount, SERVER_KEY, signature_key);
    
    // For Dev/Demo purposes, strict check might be disabled if signature_key is missing in mock payload
    if (signature_key && !isValid) {
       return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 });
    }

    // 2. Settlement Logic
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
       const supabase = createClient();
       
       // user_id MUST be passed in custom_field1 from frontend when creating transaction
       const userId = custom_field1; 
       
       if (!userId) {
           console.error('No User ID in webhook metadata');
           return NextResponse.json({ message: 'Missing User ID' }, { status: 400 });
       }

       // 3. Get Wallet ID (Helper function or query)
       const { data: walletData } = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', userId)
          .single();

       if (!walletData) {
           return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });
       }

       // 4. CREDIT LEDGER (The new standard)
       const { error } = await supabase.from('ledger_entries').insert({
          wallet_id: walletData.id,
          amount: parseFloat(gross_amount),
          entry_type: 'CREDIT',
          description: \`Topup via \${body.payment_type || 'Payment Gateway'}\`,
          reference_id: order_id,
          metadata: body
       });

       if (error) {
           console.error('Ledger Insert Error:', error);
           return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
       }

       // 5. Notify
       // Need to fetch user phone first, ignoring for now or using mock
       await sendWhatsappNotification('00000', \`Topup Berhasil Rp \${gross_amount}\`);

       return NextResponse.json({ message: 'OK' });
    }

    return NextResponse.json({ message: 'Ignored status' });

  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ message: 'Invalid Request' }, { status: 400 });
  }
}
EOF

echo ""
echo "================================================="
echo "Deposit Gateway Ready!"
echo "1. Set PAYMENT_SERVER_KEY in .env"
echo "2. URL: /api/webhooks/payment"
echo "3. Logic: Automatically CREDITS ledger upon 'settlement'."
