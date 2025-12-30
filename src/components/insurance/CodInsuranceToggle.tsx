'use client';

import { ShieldCheck } from 'lucide-react';

interface CodInsuranceToggleProps {
    checked: boolean;
    onToggle: (val: boolean) => void;
    ongkirAmount: number;
}

export function CodInsuranceToggle({ checked, onToggle, ongkirAmount }: CodInsuranceToggleProps) {
    const PREMIUM = 500;

    return (
        <div
            onClick={() => onToggle(!checked)}
            className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Asuransi Retur COD</h4>
                    <p className="text-sm text-gray-500">
                        Ganti rugi Ongkir 100% jika paket ditolak/retur.
                    </p>
                </div>
            </div>

            <div className="text-right">
                <p className="text-sm font-bold text-gray-900">+Rp {PREMIUM}</p>
                {checked && (
                    <p className="text-xs text-green-700 font-semibold">
                        Coverage: Rp {ongkirAmount.toLocaleString('id-ID')}
                    </p>
                )}
            </div>
        </div>
    );
}
