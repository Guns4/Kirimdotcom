#!/bin/bash

# =============================================================================
# Setup Dangerous Goods Checker (Phase 101)
# Smart Utility for Safe Shipping
# =============================================================================

echo "Setting up Dangerous Goods Checker..."
echo "================================================="
echo ""

# 1. Rule Engine
echo "1. Creating Rule Engine: src/lib/goods-rules.ts"

cat <<EOF > src/lib/goods-rules.ts
export type ShippingMode = 'air' | 'land' | 'sea';

export interface ValidationResult {
    status: 'safe' | 'warning' | 'danger';
    message: string;
    couriers: string[]; // Recommended couriers
}

export function validateGoods(item: string, mode: ShippingMode = 'air'): ValidationResult {
    const lowerItem = item.toLowerCase();

    // 1. Dangerous Goods (Air Restrictions)
    if (lowerItem.includes('powerbank') || lowerItem.includes('baterai') || lowerItem.includes('battery')) {
        if (mode === 'air') {
            return {
                status: 'danger',
                message: '❌ DILARANG via Udara! Powerbank/Baterai berisiko meledak. Wajib gunakan jalur Darat/Laut (Cargo).',
                couriers: ['JNE Trucking', 'J&T Cargo', 'SiCepat Gokil']
            };
        } else {
             return {
                status: 'warning',
                message: '⚠️ Boleh via Darat, tapi wajib packing kayu/aman.',
                couriers: ['JNE Trucking', 'J&T Cargo']
            };
        }
    }

    if (lowerItem.includes('aerosol') || lowerItem.includes('gas') || lowerItem.includes('parfum')) {
         if (mode === 'air') {
            return {
                status: 'danger',
                message: '❌ DILARANG via Udara! Barang mudah meledak/terbakar.',
                couriers: ['JNE Trucking', 'SiCepat Gokil']
            };
         }
    }

    // 2. Liquids
    if (lowerItem.includes('cair') || lowerItem.includes('minyak') || lowerItem.includes('oli') || lowerItem.includes('madu')) {
        return {
            status: 'warning',
            message: '⚠️ Cairan berisiko bocor/ditolak bandara. Disarankan jalur Darat & Packing Kayu.',
            couriers: ['JNE Trucking', 'J&T Cargo', 'Wahana']
        };
    }

    // 3. Perishables (Foods)
    if (lowerItem.includes('makanan') || lowerItem.includes('kue') || lowerItem.includes('basah') || lowerItem.includes('frozen')) {
        return {
            status: 'warning',
            message: '⚠️ Makanan mudah basi wajib layanan Kilat/Next Day (1 Hari Sampai).',
            couriers: ['JNE YES', 'SiCepat BEST', 'PAXEL (Frozen Friendly)']
        };
    }

    // 4. Default Safe
    return {
        status: 'safe',
        message: '✅ Barang ini aman dikirim via semua jalur (selama packing standar).',
        couriers: ['JNE', 'J&T', 'SiCepat', 'Anteraja', 'ID Express']
    };
}
EOF
echo "   [✓] Rule Engine created."
echo ""

# 2. Server Action
echo "2. Creating Action: src/app/actions/goodsCheckerActions.ts"

cat <<EOF > src/app/actions/goodsCheckerActions.ts
'use server'

import { validateGoods, ShippingMode } from '@/lib/goods-rules';

export async function checkGoodsAction(item: string, mode: ShippingMode) {
    // Simulate slight network delay for realism/loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    return validateGoods(item, mode);
}
EOF
echo "   [✓] Server Action created."
echo ""

# 3. UI Component
echo "3. Creating UI: src/components/tools/DangerousGoodsChecker.tsx"
mkdir -p src/components/tools

cat <<EOF > src/components/tools/DangerousGoodsChecker.tsx
'use client';

import { useState } from 'react';
import { checkGoodsAction } from '@/app/actions/goodsCheckerActions';
import { PackageOpen, AlertTriangle, CheckCircle, XCircle, Truck, Plane } from 'lucide-react';
import { ShippingMode, ValidationResult } from '@/lib/goods-rules';

export default function DangerousGoodsChecker() {
    const [item, setItem] = useState('');
    const [mode, setMode] = useState<ShippingMode>('air');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!item.trim()) return;
        setLoading(true);
        try {
            const res = await checkGoodsAction(item, mode);
            setResult(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PackageOpen className="w-6 h-6 text-indigo-600" />
                Cek Barang Larangan
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                    <input 
                        type="text" 
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        placeholder="Contoh: Powerbank, Durian, Parfum..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rencana Kirim Lewat</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMode('air')}
                            className={\`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 \${mode === 'air' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'border-gray-300 text-gray-600'}\`}
                        >
                            <Plane className="w-4 h-4" /> Udara (Reguler)
                        </button>
                        <button 
                             onClick={() => setMode('land')}
                             className={\`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 \${mode === 'land' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'border-gray-300 text-gray-600'}\`}
                        >
                            <Truck className="w-4 h-4" /> Darat (Kargo)
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleCheck}
                        disabled={loading || !item}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Menganalisa...' : 'Cek Keamanan'}
                    </button>
                </div>
            </div>

            {/* Result Card */}
            {result && (
                <div className={\`mt-6 p-4 rounded-lg border \${
                    result.status === 'safe' ? 'bg-green-50 border-green-200' :
                    result.status === 'danger' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                }\`}>
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            {result.status === 'safe' && <CheckCircle className="w-6 h-6 text-green-600" />}
                            {result.status === 'warning' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                            {result.status === 'danger' && <XCircle className="w-6 h-6 text-red-600" />}
                        </div>
                        <div>
                            <p className={\`font-bold text-lg \${
                                result.status === 'safe' ? 'text-green-800' :
                                result.status === 'danger' ? 'text-red-800' :
                                'text-yellow-800'
                            }\`}>
                                {result.status === 'safe' ? 'AMAN' : result.status === 'danger' ? 'DILARANG' : 'HATI-HATI'}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                            
                            {result.couriers.length > 0 && (
                                <div className="mt-3 bg-white/50 p-3 rounded-md">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rekomendasi Kurir:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.couriers.map(c => (
                                            <span key={c} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700 font-medium shadow-sm">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
EOF
echo "   [✓] UI Component created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "Use <DangerousGoodsChecker /> in your /tools page."
