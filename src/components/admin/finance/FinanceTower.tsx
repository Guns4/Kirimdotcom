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
