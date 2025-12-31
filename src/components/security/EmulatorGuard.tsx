'use client';

import React, { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';

export default function EmulatorGuard({ children }: { children: React.ReactNode }) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        const checkDevice = async () => {
            try {
                const info = await Device.getInfo();

                // Detection Logic
                const isEmulator =
                    info.isVirtual ||
                    info.manufacturer === 'Genymotion' ||
                    (info.manufacturer.includes('Google') && info.model.includes('Android SDK')) ||
                    info.model.includes('Emulator');

                if (isEmulator && process.env.NODE_ENV === 'production') {
                    // Block in production
                    setIsBlocked(true);
                }
            } catch (error) {
                console.error('Device check failed', error);
            } finally {
                setChecking(false);
            }
        };

        checkDevice();
    }, []);

    if (isBlocked) {
        return (
            <div className="fixed inset-0 z-[9999] bg-red-600 text-white flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                <h1 className="text-4xl font-bold mb-4">⛔</h1>
                <h2 className="text-2xl font-bold mb-4">Perangkat Tidak Didukung</h2>
                <p className="mb-8">Aplikasi ini tidak mendukung penggunaan Emulator atau Virtual Device demi keamanan.</p>
                <button
                    onClick={() => App.exitApp()}
                    className="bg-white text-red-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Tutup Aplikasi
                </button>
            </div>
        );
    }

    // Optional: Show loading splash while checking? 
    // For better UX, we render children immediately and overlay if blocked.
    return <>{children}</>;
}
