import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity } = await request.json();

    // 1. Get Product
    const { data: product } = await supabase
        .from('supply_products')
        .select('*')
        .eq('id', productId)
        .single();

    if (!product || product.stock < quantity) {
        return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 });
    }

    const totalPrice = product.price * quantity;

    // 2. Transaction (Ideally use RPC/Transaction for atomicity)
    // Decrement Balance (Record Ledger)
    const { error: ledgerError } = await supabase.from('ledger_entries').insert({
        user_id: user.id,
        amount: -totalPrice,
        type: 'PURCHASE',
        description: `Pembelian ${product.name} (x${quantity})`,
        reference_id: productId
    });

    if (ledgerError) return NextResponse.json({ error: ledgerError.message }, { status: 500 });

    // Decrement Stock
    await supabase.from('supply_products')
        .update({ stock: product.stock - quantity })
        .eq('id', productId);

    return NextResponse.json({ success: true, newBalance: totalPrice });
}
