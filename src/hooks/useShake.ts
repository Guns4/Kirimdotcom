'use client';

import { useEffect, useRef } from 'react';
import { Motion } from '@capacitor/motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

// Threshold for shake detection
const SHAKE_THRESHOLD = 15;
const COOLDOWN_MS = 2000; // Prevent spamming

export function useShake(onShake?: () => void) {
    const router = useRouter();
    const lastUpdate = useRef(0);
    const lastShake = useRef(0);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let accelHandler: any;

        const startListening = async () => {
            // Request permissions if needed (iOS 13+ usually needs it for Motion)
            // Note: Capacitor handles this automatically or via Manifest mostly

            try {
                accelHandler = await Motion.addListener('accel', event => {
                    const { x, y, z } = event.accelerationIncludingGravity;
                    const now = Date.now();

                    if ((now - lastUpdate.current) > 100) {
                        lastUpdate.current = now;

                        // Simple Shake Calculation
                        const magnitude = Math.sqrt(x * x + y * y + z * z);

                        // Use acceleration without gravity if available for cleaner signal
                        const acc = event.acceleration;
                        if (acc) {
                            const m = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

                            if (m > SHAKE_THRESHOLD) {
                                if (now - lastShake.current > COOLDOWN_MS) {
                                    lastShake.current = now;
                                    handleShake();
                                }
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Motion listener error:", e);
            }
        };

        const handleShake = async () => {
            console.log('📳 Device Shaken!');

            try {
                // 1. Haptic Feedback
                await Haptics.impact({ style: ImpactStyle.Heavy });

                // 2. Audio Feedback (Simulated swoosh or play real file)
                // const audio = new Audio('/sounds/swoosh.mp3');
                // audio.play().catch(e => console.log('Audio play failed', e));

                // 3. Action
                if (onShake) {
                    onShake();
                } else {
                    // Default Action: Refresh Page
                    router.refresh();
                }
            } catch (e) {
                console.error("Shake handler error:", e);
            }
        };

        startListening();

        return () => {
            if (accelHandler) {
                accelHandler.remove();
            }
        };
    }, [router, onShake]);
}
