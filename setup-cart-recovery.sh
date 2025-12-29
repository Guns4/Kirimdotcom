#!/bin/bash

# =============================================================================
# Cart Recovery System (Automated Follow-up)
# =============================================================================

echo "Setting up Cart Recovery System..."
echo "================================================="
echo ""

# 1. API Route (Cron Job)
echo "1. Creating API Route: app/api/cron/cart-recovery/route.ts"
mkdir -p app/api/cron/cart-recovery

cat <<EOF > app/api/cron/cart-recovery/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    
    // 1. Find Abandoned Carts (Pending > 5 mins, Not Notified yet)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: abandoned, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'PENDING')
        .lt('created_at', fiveMinutesAgo)
        .is('recovery_sent_at', null)
        .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!abandoned || abandoned.length === 0) {
        return NextResponse.json({ message: 'No abandoned carts found' });
    }

    const results = [];

    // 2. Process Notifications
    for (const trx of abandoned) {
        if (!trx.contact_phone) continue;

        const recoveryLink = \`https://cekkirim.com/pay/\${trx.id}?discount=RECOVERY5\`;
        
        // TODO: Integrate with WA Gateway
        console.log(\`[Recovery] Sent to \${trx.contact_phone}: \${recoveryLink}\`);

        // 3. Log Success
        const { error: updateError } = await supabase
            .from('transactions')
            .update({ recovery_sent_at: new Date().toISOString() })
            .eq('id', trx.id);
            
        if (!updateError) {
            await supabase.from('cart_recovery_logs').insert({
                transaction_id: trx.id,
                channel: 'whatsapp',
                status: 'sent'
            });
        }
            
        results.push({ id: trx.id, status: updateError ? 'failed' : 'sent' });
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
}
EOF
echo "   ✓ Cron API Route created."
echo ""

# 2. Database Schema
echo "2. Generating SQL Schema: cart_recovery_schema.sql"
cat <<EOF > cart_recovery_schema.sql
-- Ensure transactions table exists
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'PENDING',
    contact_phone TEXT,
    customer_name TEXT,
    amount DECIMAL(19,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add recovery tracking column
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS recovery_sent_at TIMESTAMP WITH TIME ZONE;

-- Index for fast Cron Job queries
CREATE INDEX IF NOT EXISTS idx_transactions_abandoned 
ON public.transactions(status, created_at) 
WHERE status = 'PENDING' AND recovery_sent_at IS NULL;

-- Recovery log table
CREATE TABLE IF NOT EXISTS public.cart_recovery_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    channel TEXT DEFAULT 'whatsapp',
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_recovery_logs_transaction 
ON public.cart_recovery_logs(transaction_id);
EOF
echo "   ✓ cart_recovery_schema.sql created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Run: cart_recovery_schema.sql in Supabase SQL Editor"
echo "2. Setup Cron Job to hit /api/cron/cart-recovery every 10 minutes"
echo "   (Header: Authorization: Bearer \$CRON_SECRET)"
