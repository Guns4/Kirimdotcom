'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Receipt, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';

export interface Expense {
    id: string;
    user_id: string;
    amount: number;
    category: 'operasional' | 'bahan' | 'marketing' | 'lainnya';
    description: string;
    date: string;
    created_at?: string;
}

interface ExpenseFormProps {
    onSubmit: (data: { amount: number; category: string; description: string }) => Promise<void>;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'operasional', label: 'Operasional', icon: '🚗', examples: 'Bensin, Parkir, Pulsa' },
    { id: 'bahan', label: 'Bahan', icon: '📦', examples: 'Lakban, Kardus, Bubble wrap' },
    { id: 'marketing', label: 'Marketing', icon: '📢', examples: 'Iklan, Promo, Endorse' },
    { id: 'lainnya', label: 'Lainnya', icon: '💰', examples: 'Lain-lain' },
];

/**
 * Quick Expense Input Form (Modal)
 */
export function ExpenseForm({ onSubmit, onClose }: ExpenseFormProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('operasional');
    const [description, setDescription] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;

        startTransition(async () => {
            await onSubmit({
                amount: Number(amount),
                category,
                description,
            });
            onClose();
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-red-500" />
                        Input Pengeluaran
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                            Nominal
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">Rp</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-12 pr-4 py-3 text-2xl font-bold border-2 border-surface-200 rounded-xl focus:border-primary-500 focus:ring-0"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-surface-700 mb-2 block">
                            Kategori
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`p-3 rounded-xl border-2 text-left transition ${category === cat.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-surface-200 hover:border-surface-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{cat.icon}</span>
                                        <span className="font-medium">{cat.label}</span>
                                    </div>
                                    <p className="text-xs text-surface-500 mt-1">{cat.examples}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-surface-700 mb-1 block">
                            Keterangan (opsional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Contoh: Beli lakban 5 roll"
                            className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl focus:border-primary-500 focus:ring-0"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!amount || isPending}
                        className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isPending ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/**
 * Expense FAB Button
 */
export function ExpenseFAB({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-4 w-14 h-14 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition flex items-center justify-center z-40"
            title="Input Pengeluaran"
        >
            <Plus className="w-6 h-6" />
        </button>
    );
}

/**
 * Net Profit Report Card
 */
interface NetProfitReportProps {
    totalSales: number;
    totalExpenses: number;
    period: string;
    onExportPDF?: () => void;
}

export function NetProfitReport({ totalSales, totalExpenses, period, onExportPDF }: NetProfitReportProps) {
    const netProfit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const isProfit = netProfit >= 0;

    return (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-surface-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-surface-500" />
                    <span className="font-medium">{period}</span>
                </div>
                {onExportPDF && (
                    <button
                        onClick={onExportPDF}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="p-4 space-y-4">
                {/* Sales */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-surface-600">Total Penjualan</span>
                    </div>
                    <span className="font-semibold text-green-600">
                        Rp {totalSales.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Expenses */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <span className="text-surface-600">Total Pengeluaran</span>
                    </div>
                    <span className="font-semibold text-red-600">
                        Rp {totalExpenses.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Divider */}
                <hr className="border-surface-200" />

                {/* Net Profit */}
                <div className="flex items-center justify-between">
                    <span className="font-bold text-surface-900">Laba Bersih Sejati</span>
                    <span className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfit ? '+' : '-'} Rp {Math.abs(netProfit).toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Margin */}
                <div className="text-right text-sm text-surface-500">
                    Margin: {profitMargin.toFixed(1)}%
                </div>
            </div>
        </div>
    );
}

export default {
    ExpenseForm,
    ExpenseFAB,
    NetProfitReport,
    CATEGORIES,
};
