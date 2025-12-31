'use client';

import React, { useEffect, useState } from 'react';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
// Note: In real setup, you might import `isJailbroken` from 'jailbreak-root-detection'
// But since that requires native linking often, we simulate the interface or use a mock if web.
// Pseudocode for the logic:

export default function DeviceIntegrityGuard({ children }: { children: React.ReactNode }) {
    const [isSecure, setIsSecure] = useState(true);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkIntegrity = async () => {
            try {
                const info = await Device.getInfo();

                // 1. Emulator Check
                const isEmulator =
                    info.isVirtual ||
                    info.manufacturer === 'Genymotion' ||
                    (info.manufacturer.includes('Google') && info.model.includes('Android SDK'));

                if (isEmulator && process.env.NODE_ENV === 'production') {
                    setReason('Emulator Detected');
                    setIsSecure(false);
                    return;
                }

                // 2. Root/Jailbreak Check (Mocking the call as the specific plugin setup varies)
                // const { result } = await JailbreakRootDetection.isJailbroken();
                // if (result) { setIsSecure(false); setReason('Root Access Detected'); }

                // For now, we trust the Emulator check as the integrity check.

            } catch (error) {
                console.error('Integrity check failed', error);
            }
        };

        checkIntegrity();
    }, []);

    if (!isSecure) {
        return (
            <div className="fixed inset-0 z-[9999] bg-red-900 text-white flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
                <div className="text-6xl mb-4">🛡️</div>
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="mb-8 text-red-200">
                    Demi keamanan transaksi, aplikasi tidak dapat dijalankan di perangkat: <br />
                    <strong className="text-white uppercase mt-2 block">{reason}</strong>
                </p>
                <button
                    onClick={() => App.exitApp()}
                    className="bg-white text-red-900 px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                >
                    Keluar
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
