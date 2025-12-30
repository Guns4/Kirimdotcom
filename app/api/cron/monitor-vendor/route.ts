import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert';

// Mock Vendor API
async function getVendorBalance() {
  // In production: await fetch('https://api.digiflazz.com/v1/check-balance', ...)

  // SIMULATION: Randomly return low balance to test Logic
  // const mockBalances = [1000000, 400000, 30000];
  // return mockBalances[Math.floor(Math.random() * mockBalances.length)];

  return 400000; // Simulate Warning State
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const balance = await getVendorBalance();

  console.log(`[VENDOR MONITOR] Current Balance: Rp ${balance}`);

  // 1. Critical Level (< 50k) -> SHUTDOWN
  if (balance < 50000) {
    await supabase.from('system_settings').upsert({ key: 'ppob_maintenance_mode', value: 'true' }); // Enable Lock

    await sendAdminAlert(
      'CRITICAL: PPOB VENDOR EMPTY',
      `Balance is Rp ${balance}. PPOB System has been AUTO-LOCKED to prevent failures.`
    );
    return NextResponse.json({ status: 'CRITICAL', balance, action: 'LOCKED' });
  }

  // 2. Warning Level (< 500k) -> ALERT ONLY
  else if (balance < 500000) {
    // Ensure system is unlocked if it was locked before
    await supabase.from('system_settings').upsert({ key: 'ppob_maintenance_mode', value: 'false' });

    await sendAdminAlert(
      'WARNING: PPOB BALANCE LOW',
      `Balance is Rp ${balance}. Please Top Up immediately.`
    );
    return NextResponse.json({ status: 'WARNING', balance, action: 'ALERT_SENT' });
  }

  // 3. Healthy -> ENSURE UNLOCKED
  else {
    await supabase.from('system_settings').upsert({ key: 'ppob_maintenance_mode', value: 'false' });

    return NextResponse.json({ status: 'HEALTHY', balance });
  }
}
