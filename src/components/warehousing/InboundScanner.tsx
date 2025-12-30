'use client';

import { useState } from 'react';
import { Scan, PackagePlus } from 'lucide-react';
import { toast } from 'sonner';

export function InboundScanner() {
    const [sku, setSku] = useState('');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);

    // Mock Target User (Seller) for demo purposes
    // In real app, you'd select from a list or scan a user QR too
    const targetUserId = '00000000-0000-0000-0000-000000000000';

    async function handleInbound() {
        if (!sku) return toast.error('Masukkan SKU');

        setLoading(true);
        try {
            const res = await fetch('/api/warehousing/inbound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetUserId,
                    sku,
                    itemName: `Item ${sku}`, // Auto-name for demo
                    quantity: Number(qty)
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`Inbound Sukses! Stok Skrg: ${data.currentStock}`);
                setSku(''); // Reset for next scan
            } else {
                toast.error('Gagal: ' + data.error);
            }
        } catch (e) {
            toast.error('Scan Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-600" /> Inbound Scanner
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Scan SKU / Barcode</label>
                    <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Scan here..."
                        className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Jumlah (Qty)</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="w-full mt-1 p-2 border rounded-lg"
                        min="1"
                    />
                </div>

                <button
                    onClick={handleInbound}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                >
                    {loading ? 'Processing...' : <><PackagePlus className="w-4 h-4" /> Masuk Gudang</>}
                </button>
            </div>
        </div>
    );
}
