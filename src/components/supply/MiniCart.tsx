'use client';

import React, { useState } from 'react';
import { X, MapPin, Wallet, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from './QuickBuyWidget';

interface MiniCartProps {
    items: Product[];
    onRemove: (index: number) => void;
    onClose: () => void;
    onCheckoutSuccess: () => void;
}

export function MiniCart({ items, onRemove, onClose, onCheckoutSuccess }: MiniCartProps) {
    const [checkingOut, setCheckingOut] = useState(false);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    // Mock Address for now (In real app, fetch from user profile)
    const [address] = useState("Gudang Utama (Jakarta Selatan)");

    async function handleCheckout() {
        if (items.length === 0) return;

        setCheckingOut(true);
        try {
            // Process each item (Simplification: sequential)
            // Ideally backend accepts array of items
            for (const item of items) {
                const res = await fetch('/api/supply/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item.id, quantity: 1 })
                });
                const result = await res.json();
                if (!result.success) throw new Error(result.error);
            }

            toast.success('Pembelian berhasil!', { description: `Total: Rp ${total.toLocaleString('id-ID')}` });
            onCheckoutSuccess();
        } catch (e: any) {
            toast.error('Gagal memproses checkout', { description: e.message || 'Error' });
        } finally {
            setCheckingOut(false);
        }
    }

    return (
        <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 text-sm">Keranjang Belanja ({items.length})</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Items */}
            <div className="max-h-60 overflow-y-auto p-3 space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Keranjang kosong
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-start gap-3 bg-white p-2 rounded-lg border border-gray-50 shadow-sm relative group">
                            <img src={item.image_url} className="w-12 h-12 rounded object-cover bg-gray-100" alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                            <button
                                onClick={() => onRemove(index)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                    {/* Address Selection */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="flex-1 truncate">{address}</span>
                        <span className="text-blue-600 font-medium cursor-pointer">Ganti</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-600">Total Tagihan</span>
                        <span className="text-lg font-bold text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Checkout Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                        {checkingOut ? 'Memproses...' : 'Bayar Sekarang'}
                    </button>
                </div>
            )}
        </div>
    );
}
