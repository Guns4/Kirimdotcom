import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validateCheckoutSync } from '@/lib/billing/checkout-guard';
import { checkIdempotency } from '@/lib/security/idempotency';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 0. Idempotency Check
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
        const isFresh = await checkIdempotency(idempotencyKey);
        if (!isFresh) {
            return NextResponse.json({ error: 'Duplicate transaction detected. Please wait.' }, { status: 409 });
        }
    }

    const body = await request.json();
    const { productId, quantity, price } = body; // 'price' here might be sent by malicious user

    try {
        // 1. Logic Guard (Tamper Proof)
        // This validates price server-side and logs if 'price' param was suspicious
        const { product, validTotal } = await validateCheckoutSync({
            productId,
            quantity,
            userPrice: price,
            userId: user.id
        });

        if (product.stock < quantity) {
            return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 });
        }

        // 2. Transaction
        const { error: ledgerError } = await supabase.from('ledger_entries').insert({
            user_id: user.id,
            amount: -validTotal, // Use server-calculated total
            type: 'PURCHASE',
            description: `Pembelian ${product.name} (x${quantity})`,
            reference_id: productId
        });

        if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 });

        // Decrement Stock
        await supabase.from('supply_products')
            .update({ stock: product.stock - quantity })
            .eq('id', productId);

        return NextResponse.json({ success: true, newBalance: validTotal });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Transaction Failed' }, { status: 500 });
    }
}
