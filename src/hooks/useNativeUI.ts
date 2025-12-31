'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export function useNativeUI() {
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        // Check if running on Capacitor Native Platform (Android/iOS)
        // Note: 'web' platform is returned when running via 'ionic serve' or browser
        const platform = Capacitor.getPlatform();
        const isCapacitor = platform === 'ios' || platform === 'android';

        setIsNative(isCapacitor);

        if (isCapacitor) {
            document.body.classList.add('native-app');
        } else {
            document.body.classList.remove('native-app');
        }
    }, []);

    return { isNative };
}
