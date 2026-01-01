import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 3) {
        return NextResponse.json({ results: [] });
    }

    try {
        // Parallel Search (all tables simultaneously)
        const [users, orders, products] = await Promise.all([
            // 1. Search Users (Email/Name)
            supabase
                .from('users')
                .select('id, email, full_name, is_banned, wallet_balance')
                .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
                .limit(5),

            // 2. Search Order IDs
            supabase
                .from('marketplace_orders')
                .select('id, trx_id, total_amount, order_status, user_id')
                .ilike('trx_id', `%${q}%`)
                .limit(5),

            // 3. Search Products
            supabase
                .from('marketplace_products')
                .select('id, name, stock, type, price_sell')
                .ilike('name', `%${q}%`)
                .limit(5)
        ]);

        return NextResponse.json({
            users: users.data || [],
            orders: orders.data || [],
            products: products.data || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
