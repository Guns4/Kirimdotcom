'use client';

import { useState } from 'react';
import { Plus, X, FileText } from 'lucide-react';

interface ExpenseFormProps {
    onSubmit: (data: { amount: number; category: string; description: string }) => Promise<void>;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'Operasional', label: 'Operasional', icon: '⛽' },
    { id: 'Bahan', label: 'Bahan Packing', icon: '📦' },
    { id: 'Marketing', label: 'Marketing', icon: '📢' },
    { id: 'Lainnya', label: 'Lainnya', icon: '📝' },
];

export function ExpenseForm({ onSubmit, onClose }: ExpenseFormProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;

        setLoading(true);
        try {
            await onSubmit({
                amount: parseInt(amount.replace(/\D/g, '')),
                category,
                description
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan pengeluaran');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Catat Pengeluaran</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-zinc-500">Nominal</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">Rp</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-red-500"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === cat.id
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border-none focus:ring-2 focus:ring-red-500 text-sm"
                            placeholder="Catatan (opsional)..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !amount || !category}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export function ExpenseFAB({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform active:scale-95"
        >
            <Plus className="w-8 h-8" />
        </button>
    );
}

interface NetProfitReportProps {
    totalSales: number;
    totalExpenses: number;
    period: string;
    onExportPDF?: () => void;
}

export function NetProfitReport({ totalSales, totalExpenses, period, onExportPDF }: NetProfitReportProps) {
    const netProfit = totalSales - totalExpenses;
    const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-zinc-500 text-sm font-medium mb-1">Laporan Laba Bersih</h3>
                    <p className="text-zinc-900 dark:text-zinc-100 font-semibold">{period}</p>
                </div>
                {onExportPDF && (
                    <button
                        onClick={onExportPDF}
                        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200"
                    >
                        <FileText className="w-3 h-3" />
                        PDF
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {/* Waterfall Chart Equivalent */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-sm">Total Penjualan</span>
                        <span className="font-medium text-emerald-600">Rp {totalSales.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-sm">Total Pengeluaran</span>
                        <span className="font-medium text-red-600">- Rp {totalExpenses.toLocaleString()}</span>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-900 dark:text-white">Laba Bersih</span>
                        <div className="text-right">
                            <span className="font-bold text-xl block text-zinc-900 dark:text-white">
                                Rp {netProfit.toLocaleString()}
                            </span>
                            <span className={`text-xs font-medium ${margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                Margin {margin.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Visual Bar */}
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, (netProfit / totalSales) * 100)}%` }}
                    />
                    {/* Remaining space represents cost ratio if we think about it simply */}
                </div>
            </div>
        </div>
    );
}
