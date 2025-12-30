import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const COST_PER_ITEM = 200; // Rp 200 per item per day

    // 1. Get all active inventory grouped by user
    const { data: inventories } = await supabase
        .from('warehouse_inventory')
        .select('user_id, quantity')
        .gt('quantity', 0);

    if (!inventories || inventories.length === 0) {
        return NextResponse.json({ processed: 0 });
    }

    // Group by User
    const userTotals: Record<string, number> = {};
    inventories.forEach(inv => {
        userTotals[inv.user_id] = (userTotals[inv.user_id] || 0) + inv.quantity;
    });

    let processedCount = 0;

    // 2. Process Billing per User
    for (const [userId, totalItems] of Object.entries(userTotals)) {
        const dailyCost = totalItems * COST_PER_ITEM;

        // Deduct Wallet
        const { error: ledgerError } = await supabase.from('ledger_entries').insert({
            user_id: userId,
            amount: -dailyCost,
            type: 'WAREHOUSE_FEE',
            description: `Sewa Gudang Harian (${totalItems} items)`
        } as any);

        if (!ledgerError) {
            // Log Billing
            await supabase.from('warehouse_billing_logs').insert({
                user_id: userId,
                total_items: totalItems,
                total_cost: dailyCost
            });
            processedCount++;
        }
    }

    return NextResponse.json({
        success: true,
        processedUsers: processedCount,
        rate: COST_PER_ITEM
    });
}
