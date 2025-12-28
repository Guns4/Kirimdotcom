#!/bin/bash

# =============================================================================
# Upgrade Cart Recovery (Phase 132)
# Conversion Logic & Automated Follow-up
# =============================================================================

echo "Setting up Cart Recovery System..."
echo "================================================="
echo ""

# 1. API Route (Cron Job)
echo "1. Creating API Route: src/app/api/cron/cart-recovery/route.ts"
mkdir -p src/app/api/cron/cart-recovery

cat <<EOF > src/app/api/cron/cart-recovery/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWAMessage } from '@/app/actions/waGatewayActions'; // Assuming existing action

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    
    // 1. Find Abandoned Carts (Pending > 5 mins, Not Notified yet)
    // We assume 'transactions' table has 'status', 'created_at', 'user_id', 'contact_phone'
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: abandoned, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'PENDING')
        .lt('created_at', fiveMinutesAgo)
        .is('recovery_sent_at', null) // Avoid duplicate notifications
        .limit(10); // Batch size

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!abandoned || abandoned.length === 0) return NextResponse.json({ message: 'No abandoned carts found' });

    const results = [];

    // 2. Process Notifications
    for (const trx of abandoned) {
        if (!trx.contact_phone) continue;

        // Generate Recovery Link (Mock)
        const recoveryLink = \`https://cekkirim.com/pay/\${trx.id}?discount=RECOVERY5\`;
        
        // Send WA
        // In real app, this calls the WA Gateway provider
        // const waResult = await sendWAMessage({
        //     to: trx.contact_phone,
        //     message: \`Halo kak \${trx.customer_name || ''}, pesananmu menunggu pembayaran nih. Yuk selesaikan sekarang dapat diskon 5%! Link: \${recoveryLink}\`
        // });
        
        // Mock success
        console.log(\`[Recovery] Sent to \${trx.contact_phone}: \${recoveryLink}\`);

        // 3. Log Success
        const { error: updateError } = await supabase
            .from('transactions')
            .update({ recovery_sent_at: new Date().toISOString() })
            .eq('id', trx.id);
            
        results.push({ id: trx.id, status: updateError ? 'failed_update' : 'sent' });
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
}
EOF
echo "   [✓] Cron API Route created."
echo ""

# 2. Database Schema
echo "2. Generating SQL Schema..."
cat <<EOF > cart_recovery_schema.sql
-- Add column to transactions to track recovery status
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS recovery_sent_at timestamp with time zone;

-- Index for fast Cron Job queries
CREATE INDEX IF NOT EXISTS idx_transactions_abandoned 
ON public.transactions(status, created_at) 
WHERE status = 'PENDING' AND recovery_sent_at IS NULL;

-- Optional: recovery log table if you want detailed history separate from main table
CREATE TABLE IF NOT EXISTS public.cart_recovery_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id uuid REFERENCES public.transactions(id),
    sent_at timestamp with time zone DEFAULT now(),
    channel text DEFAULT 'whatsapp',
    status text
);
EOF
echo "   [✓] cart_recovery_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run cart_recovery_schema.sql in Supabase."
echo "2. Setup Cron Job (e.g. cron-job.org) to hit https://your-site.com/api/cron/cart-recovery hourly."
echo "   (Header: Authorization: Bearer YOUR_CRON_SECRET)"
