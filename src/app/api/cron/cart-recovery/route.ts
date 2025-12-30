import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Find Abandoned Carts (Pending > 5 mins, Not Notified yet)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: abandoned, error } = await (supabase as any)
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

    const results: { id: string; status: string }[] = [];

    // 2. Process Notifications
    for (const trx of abandoned) {
        if (!trx.contact_phone) continue;

        const recoveryLink = `https://cekkirim.com/pay/${trx.id}?discount=RECOVERY5`;

        // TODO: Integrate with WA Gateway
        console.log(`[Recovery] Sent to ${trx.contact_phone}: ${recoveryLink}`);

        // 3. Log Success
        const { error: updateError } = await (supabase as any)
            .from('transactions')
            .update({ recovery_sent_at: new Date().toISOString() })
            .eq('id', trx.id);

        if (!updateError) {
            await (supabase as any).from('cart_recovery_logs').insert({
                transaction_id: trx.id,
                channel: 'whatsapp',
                status: 'sent'
            });
        }

        results.push({ id: trx.id, status: updateError ? 'failed' : 'sent' });
    }

    return NextResponse.json({ success: true, processed: results.length, details: results });
}
