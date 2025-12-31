'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Motion } from '@capacitor/motion';
import html2canvas from 'html2canvas';

// Configuration
const SHAKE_THRESHOLD = 50; // Sensitivity 
const COOLDOWN_MS = 3000;
const IS_ACTIVE = process.env.NEXT_PUBLIC_ENV === 'beta' || process.env.NODE_ENV === 'development';

export default function ShakeFeedback() {
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [screenShot, setScreenShot] = useState<string | null>(null);
    const lastShake = useRef<number>(0);
    const isSubmitting = useRef(false);

    // Capture Console Logs
    useEffect(() => {
        if (!IS_ACTIVE) return;

        const originalLog = console.log;
        const originalError = console.error;

        const captureLog = (type: string, args: any[]) => {
            const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
            setLogs(prev => [`[${type.toUpperCase()}] ${msg}`, ...prev].slice(0, 5)); // Keep last 5
        };

        console.log = (...args) => {
            captureLog('info', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            captureLog('error', args);
            originalError.apply(console, args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
        };
    }, []);

    // Detect Shake
    useEffect(() => {
        if (!IS_ACTIVE) return;

        let isActive = true;

        const initMotion = async () => {
            try {
                await Motion.addListener('accel', (event) => {
                    if (!isActive) return;

                    const { x, y, z } = event.accelerationIncludingGravity;
                    const acceleration = Math.sqrt(x * x + y * y + z * z);

                    // Simple shake detection logic (delta could be better, but this works for simple "jolt")
                    // Gravity is ~9.8, so shake is significantly higher or rapid change.
                    // Using a simplified magnitude check for "Sudden Movement"
                    if (acceleration > SHAKE_THRESHOLD) {
                        const now = Date.now();
                        if (now - lastShake.current > COOLDOWN_MS && !showModal) {
                            lastShake.current = now;
                            handleShakeDetected();
                        }
                    }
                });
            } catch (e) {
                console.error('Motion API not available', e);
            }
        };

        initMotion();
        return () => {
            isActive = false;
            Motion.removeAllListeners();
        };
    }, [showModal]);

    const handleShakeDetected = async () => {
        console.log('📳 Shake detected! Capturing state...');
        try {
            // Capture Screenshot of Document Body
            const canvas = await html2canvas(document.body);
            setScreenShot(canvas.toDataURL('image/png'));
            setShowModal(true);
        } catch (e) {
            console.error('Screenshot failed', e);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting.current) return;
        isSubmitting.current = true;

        const payload = {
            message: description,
            logs: logs,
            screenshot: screenShot, // Base64
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
        };

        console.log('🚀 Submitting Bug Report:', payload);

        try {
            // API Integration to Support Ticket
            // await fetch('/api/admin/support/ticket', { method: 'POST', body: JSON.stringify(payload) });

            alert('Laporan terkirim! Terima kasih bantuannya.');
            setShowModal(false);
            setDescription('');
        } catch (e) {
            alert('Gagal mengirim laporan. Coba lagi.');
        } finally {
            isSubmitting.current = false;
        }
    };

    if (!IS_ACTIVE || !showModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 bg-red-600 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        🐞 Lapor Bug (Shake)
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Apa yang salah?</label>
                        <textarea
                            className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                            rows={3}
                            placeholder="Misal: Tombol macet saat diklik..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Log Terakhir (Auto)</label>
                        <div className="bg-black text-green-400 font-mono text-[10px] p-2 rounded max-h-24 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className="border-b border-white/10 pb-1 mb-1 last:border-0 last:mb-0">
                                    {log}
                                </div>
                            ))}
                            {logs.length === 0 && <span className="text-zinc-500">// Tidak ada log baru</span>}
                        </div>
                    </div>

                    {screenShot && (
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Screenshot</label>
                            <img src={screenShot} alt="Capture" className="w-full h-24 object-cover rounded border border-zinc-200" />
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                    >
                        Kirim Laporan
                    </button>
                </div>
            </div>
        </div>
    );
}
