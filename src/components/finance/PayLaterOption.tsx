'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Lock, Info } from 'lucide-react';

interface PayLaterOptionProps {
    amount: number;
    onSelect: () => void;
    selected: boolean;
}

export function PayLaterOption({ amount, onSelect, selected }: PayLaterOptionProps) {
    const [eligible, setEligible] = useState(false);
    const [loading, setLoading] = useState(true);
    const fee = amount * 0.05; // 5% Fee

    useEffect(() => {
        // Mock Eligibility Check (replace with real API call)
        // In real app: fetch('/api/finance/paylater/status')...
        setTimeout(() => {
            setEligible(true); // Mocking eligible for demo
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />;

    return (
        <div
            onClick={eligible ? onSelect : undefined}
            className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                } ${!eligible && 'opacity-60 cursor-not-allowed bg-gray-50'}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eligible ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            PayLater / Talangan
                            {!eligible && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">Locked</span>}
                        </h4>
                        <p className="text-sm text-gray-500">
                            Beli sekarang, bayar saat gajian/COD.
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">+Fee 5%</p>
                    <p className="text-xs text-gray-500">Rp {fee.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {!eligible && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                    <Lock className="w-3 h-3" />
                    Syarat: Akun > 3 Bulan & Transaksi > 1 Juta
                </div>
            )}
        </div>
    );
}
