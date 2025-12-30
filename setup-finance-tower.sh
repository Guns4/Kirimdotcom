#!/bin/bash

# =============================================================================
# Finance: Control Tower Dashboard Setup (Task 98)
# =============================================================================

echo "Initializing Finance Control Tower..."
echo "================================================="

# 1. Install Excel Export Library
echo "1. Installing xlsx library..."
npm install xlsx

# 2. Server Actions (Data Fetching & Export)
echo "2. Creating Actions: src/app/actions/finance-tower.ts"
mkdir -p src/app/actions

cat <<'EOF' > src/app/actions/finance-tower.ts
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
EOF

# 3. Client Component (With Export)
echo "3. Creating Component: src/components/admin/finance/FinanceTower.tsx"
mkdir -p src/components/admin/finance

cat <<'EOF' > src/components/admin/finance/FinanceTower.tsx
'use client';

import { useState, useEffect } from 'react';
import { Filter, Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { getFinancialTransactions, getMonthlyReport, detectAnomalies } from '@/app/actions/finance-tower';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export function FinanceTower() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, netFlow: 0, count: 0 });
    const [anomalies, setAnomalies] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [sourceFilter, setSourceFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, [sourceFilter, typeFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getFinancialTransactions({
                source: sourceFilter || undefined,
                type: typeFilter || undefined
            });
            setTransactions(result.transactions);
            setSummary(result.summary);
            setAnomalies(detectAnomalies(result.transactions));
        } catch (error) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportMonthly = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        toast.loading('Generating report...');

        const data = await getMonthlyReport(year, month);

        // Convert to Excel
        const worksheet = XLSX.utils.json_to_sheet(
            data.map(tx => ({
                'Tanggal': format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm'),
                'User': tx.user?.email || 'System',
                'Type': tx.type,
                'Amount': Number(tx.amount),
                'Description': tx.description || '-',
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${year}-${month.toString().padStart(2, '0')}`);

        XLSX.writeFile(workbook, `Finance_Report_${year}_${month.toString().padStart(2, '0')}.xlsx`);
        toast.dismiss();
        toast.success('Report downloaded!');
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500 mb-1">Total Kredit</p>
                    <p className="text-2xl font-bold text-green-600">
                        Rp {summary.totalCredit.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500 mb-1">Total Debit</p>
                    <p className="text-2xl font-bold text-red-600">
                        Rp {summary.totalDebit.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500 mb-1">Net Flow</p>
                    <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        Rp {summary.netFlow.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-gray-500 mb-1">Transaksi</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
                </div>
            </div>

            {/* Filters & Export */}
            <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                        value={sourceFilter} 
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Semua Source</option>
                        <option value="SERVICE_FEE">Service Fee</option>
                        <option value="INSURANCE_PREMIUM">Insurance</option>
                        <option value="AD_SPEND">Ads</option>
                        <option value="MARKETPLACE_FEE">Marketplace</option>
                        <option value="PPOB_COMMISSION">PPOB</option>
                    </select>
                </div>

                <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Debit & Kredit</option>
                    <option value="CREDIT">Kredit Only</option>
                    <option value="DEBIT">Debit Only</option>
                </select>

                <button 
                    onClick={handleExportMonthly}
                    className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export Bulanan (Excel)
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tanggal</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Tidak ada transaksi
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => {
                                    const isAnomaly = anomalies.includes(tx.id);
                                    return (
                                        <tr 
                                            key={tx.id} 
                                            className={`hover:bg-gray-50 ${isAnomaly ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {format(new Date(tx.created_at), 'dd MMM yy HH:mm', { locale: idLocale })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {tx.user?.email || 'System'}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-gray-600">
                                                {tx.type}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold">
                                                <span className={Number(tx.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {Number(tx.amount) >= 0 ? '+' : ''}
                                                    Rp {Number(tx.amount).toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                {tx.description || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isAnomaly && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-red-700">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Anomaly!
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
EOF

# 4. Admin Page
echo "4. Creating Page: src/app/admin/finance/tower/page.tsx"
mkdir -p src/app/admin/finance/tower

cat <<'EOF' > src/app/admin/finance/tower/page.tsx
import { FinanceTower } from '@/components/admin/finance/FinanceTower';

export default function FinanceTowerPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Finance Control Tower</h1>
                <p className="text-gray-500">Monitor semua arus kas dengan deteksi anomali otomatis</p>
            </div>

            <FinanceTower />
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Finance Control Tower Setup Complete!"
echo "1. Run 'npm install xlsx' if not auto-installed."
echo "2. Visit '/admin/finance/tower' to access dashboard."
echo "3. Use filters and export monthly reports."
echo "4. Red rows indicate potential anomalies."
