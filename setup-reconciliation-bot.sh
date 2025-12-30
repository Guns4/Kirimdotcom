#!/bin/bash

# =============================================================================
# Automation: Reconciliation Bot
# =============================================================================

echo "Initializing Reconciliation Bot..."
echo "================================================="

# 1. Main Logic Endpoint
echo "1. Creating API: src/app/api/cron/reconcile/route.ts"
mkdir -p src/app/api/cron/reconcile

cat <<EOF > src/app/api/cron/reconcile/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { adminAlert } from '@/lib/admin-alert';

// Mock Gateway API (Simulating Midtrans/Xendit)
async function fetchGatewayReport(dateStr: string) {
    // Return sample data that matches or mismatches DB
    return [
       // Case A: Matching Success
       { order_id: 'TRX-MATCH-001', status: 'SETTLEMENT', amount: 100000 },
       // Case B: Ghost Success (Gateway Status=Success, DB=Pending) -> AUTO-FIX
       { order_id: 'TRX-GHOST-002', status: 'SETTLEMENT', amount: 50000 },
       // Case C: Critical Fail (Gateway=Fail, DB=Success) -> CRITICAL ALERT
       { order_id: 'TRX-RISK-003', status: 'EXPIRE', amount: 250000 },
    ];
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const reportData = await fetchGatewayReport(today);
    const logs: string[] = [];

    let fixedCount = 0;
    let alertCount = 0;

    for (const gwTrx of reportData) {
        // 1. Check DB Ledger
        const { data: dbTrx } = await supabase
            .from('ledger_entries')
            .select('*')
            .eq('metadata->>order_id', gwTrx.order_id)
            .single();

        if (!dbTrx) {
            logs.push(\`[SKIP] \${gwTrx.order_id} not found in DB.\`);
            continue;
        }

        const dbStatus = dbTrx.metadata?.status || 'UNKNOWN';

        // 2. Reconciliation Logic
        if (gwTrx.status === 'SETTLEMENT' && dbStatus === 'PENDING') {
            // AUTO FIX: Gateway says paid, but DB is stuck on Pending
            logs.push(\`[FIX] \${gwTrx.order_id}: Gateway SETTLEMENT, DB PENDING. Updating...\`);
            
            // Example Update (Adapt to your schema)
            await supabase.from('ledger_entries')
                .update({ 
                    metadata: { ...dbTrx.metadata, status: 'SUCCESS' },
                    updated_at: new Date().toISOString()
                })
                .eq('id', dbTrx.id);
            
            fixedCount++;
        }
        else if (gwTrx.status === 'EXPIRE' && dbStatus === 'SUCCESS') {
            // CRITICAL: DB thinks we got money, but Gateway says Expired/Failed.
            const msg = \`CRITICAL MISMATCH: Order \${gwTrx.order_id} is SUCCESS in DB but EXPIRED in Gateway. Potential Loss: Rp \${gwTrx.amount.toLocaleString()}\`;
            logs.push(msg);
            
            await adminAlert.critical('Reconciliation Loss Detected', msg, { gwTrx, dbTrx });
            alertCount++;
        }
    }

    const summary = \`Reconciliation Complete. Fixed: \${fixedCount}, Alerts: \${alertCount}\`;
    logs.push(summary);

    // Final Report
    if (alertCount > 0 || fixedCount > 0) {
        await adminAlert.info('Daily Reconciliation Report', logs.join('\\n'));
    }

    return NextResponse.json({ success: true, summary, logs });
}
EOF

echo ""
echo "================================================="
echo "Reconciliation Bot Ready!"
echo "Endpoint: GET /api/cron/reconcile"
echo "Note: Integrated with existing src/lib/admin-alert.ts"
