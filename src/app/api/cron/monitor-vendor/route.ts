import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert'; // Using existing helper

// Mock Vendor API
async function getVendorBalance() {
    // In production: await fetch('https://api.digiflazz.com/v1/check-balance', ...)

    // SIMULATION: Return low balance to test Logic (400k is < 500k warning threshold)
    return 400000;
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const balance = await getVendorBalance();

    console.log(`[VENDOR MONITOR] Current Balance: Rp ${balance}`);

    // 1. Critical Level (< 50k) -> SHUTDOWN
    if (balance < 50000) {
        // Enable Maintenance Mode for key features
        await supabase.from('system_settings')
            .upsert({ key: 'ppob_maintenance_mode', value: 'true' } as any, { onConflict: 'key' });

        await sendAdminAlert({
            subject: 'CRITICAL: PPOB VENDOR EMPTY',
            message: `Balance is Rp ${balance.toLocaleString('id-ID')}. PPOB System has been AUTO-LOCKED to prevent failures.`,
            severity: 'critical'
        });
        return NextResponse.json({ status: 'CRITICAL', balance, action: 'LOCKED' });
    }

    // 2. Warning Level (< 500k) -> ALERT ONLY
    else if (balance < 500000) {
        // Ensure system is unlocked if it was unlocked before (optimistic)
        await supabase.from('system_settings')
            .upsert({ key: 'ppob_maintenance_mode', value: 'false' } as any, { onConflict: 'key' });

        await sendAdminAlert({
            subject: 'WARNING: PPOB BALANCE LOW',
            message: `Balance is Rp ${balance.toLocaleString('id-ID')}. Please Top Up immediately.`,
            severity: 'warning'
        });
        return NextResponse.json({ status: 'WARNING', balance, action: 'ALERT_SENT' });
    }

    // 3. Healthy -> ENSURE UNLOCKED
    else {
        await supabase.from('system_settings')
            .upsert({ key: 'ppob_maintenance_mode', value: 'false' } as any, { onConflict: 'key' });

        return NextResponse.json({ status: 'HEALTHY', balance });
    }
}
