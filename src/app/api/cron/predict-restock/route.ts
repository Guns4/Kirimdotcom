import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Get all users with inventory tracking (or active sellers)
    // For demo, we select users who have active inventory records
    const { data: inventories } = await supabase
        .from('user_supply_inventory')
        .select('*');

    if (!inventories) return NextResponse.json({ processed: 0 });

    let alertCount = 0;

    for (const inv of inventories) {
        if (inv.item_type !== 'lakban') continue;

        // 2. Calculate Consumption
        // Logic: Count receipts (transactions) created since last_restock_at
        const { count, error } = await supabase
            .from('transactions') // Assuming 'transactions' stores Resi order
            .select('id', { count: 'exact', head: true })
            .eq('user_id', inv.user_id)
            .gte('created_at', inv.last_restock_at);

        if (error || count === null) continue;

        // Consumption: 0.5 meter per Resi
        const usedMeters = count * 0.5;
        // Initial Stock (from DB) - Used
        const currentEstimated = inv.estimated_stock - usedMeters;

        console.log(`[RESTOCK] User ${inv.user_id}: Est ${currentEstimated}m (Used ${usedMeters}m from ${count} resi)`);

        // 3. Check Threshold (e.g. < 10 meters remaining)
        if (currentEstimated < 10) {
            // Trigger Alert
            const { error: alertError } = await supabase.from('supply_alerts').upsert({
                user_id: inv.user_id,
                alert_type: 'LOW_STOCK_Lakban',
                message: 'Stok Lakban Menipis! Estimasi sisa < 10m. Beli sekarang, diskon ongkir instan.',
                is_active: true
            }, { onConflict: 'user_id, alert_type' }); // Ensure only one active alert per type per user

            if (!alertError) alertCount++;
        }
    }

    return NextResponse.json({ processed: inventories.length, alerts_generated: alertCount });
}
