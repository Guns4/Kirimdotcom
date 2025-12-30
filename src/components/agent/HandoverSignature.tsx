'use client';

import { useRef, useState, useEffect } from 'react';
import { submitHandover } from '@/lib/dropoff-service';

export default function HandoverSignature({
    packageIds,
    onComplete
}: {
    packageIds: string[],
    onComplete: () => void
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [courierName, setCourierName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
        }
    }, []);

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSubmit = async () => {
        if (!courierName) return alert('Nama kurir wajib diisi');
        setLoading(true);
        try {
            // Simplified: in real app, canvas.toDataURL()
            await submitHandover(packageIds, courierName, 'base64_signature_placeholder');
            onComplete();
        } catch (e) {
            alert('Gagal submit handover');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Serah Terima Kurir</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Kurir</label>
                <input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Contoh: Budi (JNE)"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanda Tangan</label>
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
                    className="border-2 border-dashed border-gray-300 rounded-lg w-full touch-none bg-gray-50 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <button onClick={clear} className="text-xs text-red-500 underline mt-1">Hapus Tanda Tangan</button>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
            >
                {loading ? 'Memproses...' : `Serahkan ${packageIds.length} Paket`}
            </button>
        </div>
    );
}
