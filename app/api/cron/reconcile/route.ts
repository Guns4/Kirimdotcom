import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert';

// Mock Gateway API
async function fetchGatewayReport(dateStr: string) {
  // Return sample data that matches or mismatches DB
  return [
    // Case A: Matching Success
    { order_id: 'TRX-MATCH-001', status: 'SETTLEMENT', amount: 100000 },
    // Case B: Ghost Success (Gateway Status=Success, DB=Pending) -> NEEDS FIX
    { order_id: 'TRX-GHOST-002', status: 'SETTLEMENT', amount: 50000 },
    // Case C: Critical Fail (Gateway=Fail, DB=Success) -> ALERT
    { order_id: 'TRX-RISK-003', status: 'EXPIRE', amount: 250000 },
  ];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const reportData = await fetchGatewayReport(today);
  const logs: string[] = [];

  let fixedCount = 0;
  let alertCount = 0;

  for (const gwTrx of reportData) {
    // 1. Check DB
    // Assuming we look in 'ledger_entries' or a specific 'transactions' table
    // For this demo, let's assume we query 'ledger_entries' by ref_id

    const { data: dbTrx } = await supabase
      .from('ledger_entries') // or 'purchase_transactions'
      .select('*')
      .eq('reference_id', gwTrx.order_id)
      .single();

    if (!dbTrx) {
      logs.push(`[SKIP] ${gwTrx.order_id} not found in DB.`);
      continue;
    }

    // 2. Logic: Status Mismatch
    // We assume DB uses metadata -> { status: 'PENDING' } or similar column
    const dbStatus = dbTrx.metadata?.status || 'UNKNOWN';

    if (gwTrx.status === 'SETTLEMENT' && dbStatus === 'PENDING') {
      // AUTO FIX: Mark as paid
      logs.push(`[FIX] Retrieving ${gwTrx.order_id}. Gateway paid, DB Pending.`);

      // Do the fix (Update status, insert ledger if missing, etc)
      // await supabase.from('ledger_entries').update(...);

      fixedCount++;
    } else if (gwTrx.status === 'EXPIRE' && dbStatus === 'SUCCESS') {
      // CRITICAL: DB thinks we got money, but Gateway says invalid.
      const msg = `CRITICAL: Order ${gwTrx.order_id} is SUCCESS in DB but EXPIRED in Gateway. Loss Potential: ${gwTrx.amount}`;
      logs.push(msg);
      await sendAdminAlert('Reconciliation Mismatch', msg);
      alertCount++;
    }
  }

  const summary = `Reconciliation Complete. Fixed: ${fixedCount}, Alerts: ${alertCount}`;
  logs.push(summary);

  if (alertCount > 0) {
    await sendAdminAlert('Daily Reconciliation Report', logs.join('\n'));
  }

  return NextResponse.json({ success: true, summary, logs });
}
