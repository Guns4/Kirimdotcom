'use client';

import { useState } from 'react';
import { CheckSquare, Square, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import { processBulkPayout } from '@/app/actions/bulk-payout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface BulkPayoutPanelProps {
    withdrawals: any[];
}

export function BulkPayoutPanel({ withdrawals }: BulkPayoutPanelProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const toggleAll = () => {
        if (selected.size === withdrawals.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(withdrawals.map(w => w.id)));
        }
    };

    const selectedWithdrawals = withdrawals.filter(w => selected.has(w.id));
    const totalAmount = selectedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);

    const handleBulkApprove = async () => {
        if (selected.size === 0) {
            toast.error('Pilih minimal 1 withdrawal');
            return;
        }

        // Safety Confirmation
        const confirmMessage = `Anda akan mentransfer total Rp ${totalAmount.toLocaleString('id-ID')} ke ${selected.size} User.\n\nLanjutkan?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setProcessing(true);
        toast.loading('Processing bulk payout...');

        try {
            const results = await processBulkPayout(Array.from(selected));

            toast.dismiss();
            toast.success(
                `Berhasil: ${results.success} | Gagal: ${results.failed}\nTotal: Rp ${results.totalAmount.toLocaleString('id-ID')}`,
                { duration: 5000 }
            );

            setSelected(new Set());

        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || 'Gagal memproses payout');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Batch Actions Bar */}
            <div className="bg-white p-4 rounded-xl border flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        {selected.size === withdrawals.length ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        Pilih Semua
                    </button>

                    {selected.size > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-900">{selected.size} dipilih</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-bold text-blue-600">
                                Rp {totalAmount.toLocaleString('id-ID')}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleBulkApprove}
                    disabled={selected.size === 0 || processing}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    {processing ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Approve Selected ({selected.size})
                        </>
                    )}
                </button>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left w-12"></th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Bank</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Account</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tanggal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {withdrawals.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    Tidak ada permohonan withdrawal pending
                                </td>
                            </tr>
                        ) : (
                            withdrawals.map(withdrawal => (
                                <tr
                                    key={withdrawal.id}
                                    className={`hover:bg-gray-50 cursor-pointer ${selected.has(withdrawal.id) ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleSelection(withdrawal.id)}
                                >
                                    <td className="px-4 py-3">
                                        {selected.has(withdrawal.id) ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {withdrawal.user?.email || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {withdrawal.bank_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                        {withdrawal.account_number}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                                        Rp {Number(withdrawal.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {format(new Date(withdrawal.created_at), 'dd MMM yy', { locale: idLocale })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
