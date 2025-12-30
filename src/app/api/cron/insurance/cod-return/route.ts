import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Get polices (simulating batch processing)
    const { data: policies } = await supabase
        .from('cod_insurance_policies')
        .select('*')
        .eq('status', 'ACTIVE')
        .limit(50);

    if (!policies?.length) return NextResponse.json({ processed: 0 });

    let approved = 0;

    for (const policy of policies) {
        // 2. Check Tracking (Mocking integration with Global Tracking table if it existed, or just mock check)
        // If we integrated with Task 24 (Global Tracking), we could query 'tracking_history'

        // Mock: If resi ends with 'RET', we treat as Returned
        const isReturned = policy.resi.endsWith('RET');
        const isDelivered = policy.resi.endsWith('DEL');

        if (isReturned) {
            // AUTO APPROVE CLAIM
            const { error: claimError } = await supabase
                .from('cod_insurance_policies')
                .update({
                    status: 'CLAIMED',
                    claim_status: 'AUTO_APPROVED'
                })
                .eq('id', policy.id);

            if (!claimError) {
                // Credit Wallet (Refund Ongkir)
                await supabase.from('ledger_entries').insert({
                    user_id: policy.user_id,
                    amount: policy.coverage_amount,
                    type: 'INSURANCE_CLAIM',
                    description: `Klaim Asuransi Retur COD (Resi: ${policy.resi})`
                });
                approved++;
            }
        } else if (isDelivered) {
            await supabase
                .from('cod_insurance_policies')
                .update({ status: 'EXPIRED' }) // Coverage ends on delivery
                .eq('id', policy.id);
        }
    }

    return NextResponse.json({
        success: true,
        processed: policies.length,
        claims_approved: approved
    });
}
