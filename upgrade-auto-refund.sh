#!/bin/bash

# =============================================================================
# Upgrade Auto Refund (Phase 138)
# Operational Automation
# =============================================================================

echo "Setting up Auto Refund System..."
echo "================================================="
echo ""

# 1. Webhook Handler
echo "1. Creating Webhook: src/app/api/webhooks/ppob/route.ts"
mkdir -p src/app/api/webhooks/ppob

cat <<EOF > src/app/api/webhooks/ppob/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWAMessage } from '@/app/actions/waGatewayActions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const supabase = await createClient();
    
    // Parse Provider Callback (Mock structure)
    // Provider might send: { trx_id: '...', status: 'FAILED', message: 'Number Blocked' }
    const body = await req.json();
    const { trx_id, status, message } = body;

    if (!trx_id || !status) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (status === 'FAILED') {
        console.log(\`[Webhook] Processing Refund for \${trx_id}\`);

        // 1. Call Atomic Refund RPC
        const { data, error } = await supabase.rpc('process_refund', {
            p_transaction_id: trx_id,
            p_reason: message || 'Provider Failed'
        });

        if (error) {
            console.error('[Webhook] Refund Failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const result = data; // { success: true, new_balance: ..., user_id: ..., user_phone: ... }

        // 2. Notify User if Refund Successful
        if (result && result.success && result.user_phone) {
             const msg = \`Mohon maaf transaksi PPOB gagal (\${message}). Saldo telah dikembalikan otomatis ke dompet Anda. Sisa Saldo: Rp \${result.new_balance.toLocaleString('id-ID')}\`;
             
             // Fire and forget WA
             sendWAMessage({
                 to: result.user_phone,
                 message: msg
             }).catch(console.error);
        }

        return NextResponse.json({ success: true, refund_processed: true });
    }

    // Handle SUCCESS or PENDING...
    return NextResponse.json({ received: true });
}
EOF
echo "   [✓] Webhook Handler created."
echo ""

# 2. Database Schema (RPC)
echo "2. Generating SQL Schema..."
cat <<EOF > auto_refund_schema.sql
-- 1. Create Refunds Audit Table
CREATE TABLE IF NOT EXISTS public.refunds (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id uuid REFERENCES public.transactions(id),
    user_id uuid REFERENCES auth.users(id),
    amount numeric NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Atomic Refund Function
CREATE OR REPLACE FUNCTION public.process_refund(p_transaction_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS \$\$
DECLARE
    v_trx record;
    v_user_phone text;
    v_new_balance numeric;
BEGIN
    -- A. Lock & Get Transaction
    SELECT * INTO v_trx 
    FROM public.transactions 
    WHERE id = p_transaction_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Transaction not found"}'::jsonb;
    END IF;

    -- B. Validate Status (Prevent double refund)
    IF v_trx.status = 'REFUNDED' THEN
        RETURN '{"success": false, "error": "Already refunded"}'::jsonb;
    END IF;

    -- C. Get User Info (for notification)
    SELECT contact_phone INTO v_user_phone 
    FROM public.users -- Or profiles
    WHERE id = v_trx.user_id;
    -- Fallback/Alternative check logic...

    -- D. Update Transaction Status
    UPDATE public.transactions 
    SET status = 'REFUNDED', updated_at = now()
    WHERE id = p_transaction_id;

    -- E. Credit Wallet (Assuming user_wallets table)
    UPDATE public.user_wallets
    SET balance = balance + v_trx.amount, updated_at = now()
    WHERE user_id = v_trx.user_id
    RETURNING balance INTO v_new_balance;

    -- F. Log Audit
    INSERT INTO public.refunds (transaction_id, user_id, amount, reason)
    VALUES (p_transaction_id, v_trx.user_id, v_trx.amount, p_reason);

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'user_id', v_trx.user_id,
        'user_phone', COALESCE(v_trx.contact_phone, v_user_phone)
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
\$\$
EOF
echo "   [✓] auto_refund_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run auto_refund_schema.sql in Supabase."
echo "2. Configure your PPOB Provider to POST to /api/webhooks/ppob."
