'use client';

import { useState, useRef } from 'react';
import { Scan, Plus } from 'lucide-react';
import { scanDropoff } from '@/lib/dropoff-service';

export default function DropoffScanner({ onScanSuccess }: { onScanSuccess: () => void }) {
    const [receipt, setReceipt] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receipt) return;

        setLoading(true);
        try {
            await scanDropoff(receipt);
            setReceipt('');
            onScanSuccess();
            // Keep focus for continuous scanning
            inputRef.current?.focus();
            // Play beep sound
            // const audio = new Audio('/sounds/beep.mp3'); audio.play().catch(() => {});
        } catch (err: any) {
            alert(err.message || 'Scan Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleScan} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Scan className="text-blue-600" /> Incoming Scan
            </h2>
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    value={receipt}
                    onChange={(e) => setReceipt(e.target.value)}
                    placeholder="Scan / Ketik Resi..."
                    className="flex-1 border rounded-xl px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '...' : <Plus />}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Gunakan USB Barcode Reader atau ketik manual.</p>
        </form>
    );
}
