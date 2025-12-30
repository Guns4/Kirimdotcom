'use server';

import { createClient } from '@/utils/supabase/server';

export type TransactionFilter = 'ALL' | 'THIS_MONTH' | 'LAST_MONTH';

export async function getTransactionHistory(filter: TransactionFilter = 'ALL') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get Wallet ID first
    const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', user.id).single();
    if (!wallet) return [];

    let query = supabase
        .from('ledger_entries')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

    // 2. Apply Date Filter
    const now = new Date();
    if (filter === 'THIS_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', start);
    } else if (filter === 'LAST_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('created_at', start).lt('created_at', end);
    }

    const { data } = await query;
    return data || [];
}
