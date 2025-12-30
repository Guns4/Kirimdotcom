'use server';

import { createClient } from '@/utils/supabase/server';

export interface TransactionFilters {
    source?: string; // PPOB, ADS, MARKETPLACE, SHIPPING, etc
    type?: string; // DEBIT, CREDIT
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
}

export async function getFinancialTransactions(filters: TransactionFilters = {}) {
    const supabase = await createClient();

    let query = supabase
        .from('ledger_entries')
        .select('*, user:user_id(email)')
        .order('created_at', { ascending: false })
        .limit(500);

    // Apply Filters
    if (filters.source) {
        query = query.eq('type', filters.source);
    }

    if (filters.type === 'DEBIT') {
        query = query.lt('amount', 0);
    } else if (filters.type === 'CREDIT') {
        query = query.gt('amount', 0);
    }

    if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Calculate Summary Stats
    const totalCredit = transactions?.reduce((sum, t) => t.amount > 0 ? sum + Number(t.amount) : sum, 0) || 0;
    const totalDebit = Math.abs(transactions?.reduce((sum, t) => t.amount < 0 ? sum + Number(t.amount) : sum, 0) || 0);
    const netFlow = totalCredit - totalDebit;

    return {
        transactions: transactions || [],
        summary: {
            totalCredit,
            totalDebit,
            netFlow,
            count: transactions?.length || 0
        }
    };
}

export async function getMonthlyReport(year: number, month: number) {
    const supabase = await createClient();

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
        .from('ledger_entries')
        .select('*, user:user_id(email)')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });

    return data || [];
}

// Anomaly Detection Logic
export function detectAnomalies(transactions: any[]) {
    const anomalies: string[] = [];

    transactions.forEach(tx => {
        const amount = Math.abs(Number(tx.amount));

        // Flag 1: Unusually large amounts (> 10 million)
        if (amount > 10000000) {
            anomalies.push(tx.id);
        }

        // Flag 2: Suspicious round numbers (exactly 1M, 5M, etc)
        if (amount >= 1000000 && amount % 1000000 === 0) {
            anomalies.push(tx.id);
        }

        // Flag 3: Negative balance scenarios can be checked if we track balance
        // This would require more complex logic with running balance calculation
    });

    return anomalies;
}
