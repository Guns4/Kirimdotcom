'use client';

import { useState } from 'react';
import { Printer, Check, Bluetooth } from 'lucide-react';
import { printerService } from '@/lib/printer-service';

export default function ReceiptPrinter() {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            await printerService.connect();
            setConnected(true);
        } catch (e) {
            alert('Gagal koneksi printer. Pastikan Bluetooth aktif dan browser support Web Bluetooth.');
        } finally {
            setLoading(false);
        }
    };

    const testPrint = async () => {
        if (!connected) return;
        try {
            await printerService.print(`
          CEKKIRIM.COM
          Agent Receipt Test
          ------------------
          Date: ${new Date().toLocaleDateString()}
          Status: OK
          ------------------
          Terima Kasih
          `);
        } catch (e) {
            alert('Print Error');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={connected ? testPrint : handleConnect}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${connected
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                {loading ? (
                    <span className="animate-spin">⌛</span>
                ) : connected ? (
                    <><Printer className="w-4 h-4" /> Test Print</>
                ) : (
                    <><Bluetooth className="w-4 h-4" /> Connect Printer</>
                )}
            </button>
            {connected && <span className="text-green-500"><Check className="w-4 h-4" /></span>}
        </div>
    );
}
