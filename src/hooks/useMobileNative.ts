'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export function useMobileNative() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        // 1. Status Bar Configuration
        const configureStatusBar = async () => {
            try {
                await StatusBar.setStyle({ style: Style.Light }); // Dark text for light background
                // Set color to white or your primary header color
                await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
                await StatusBar.setOverlaysWebView({ overlay: false });
            } catch (e) {
                console.warn('StatusBar not available', e);
            }
        };

        // 2. Hide Splash Screen (Safeguard)
        const hideSplash = async () => {
            try {
                await SplashScreen.hide();
            } catch (e) {
                console.warn('SplashScreen not available', e);
            }
        };

        configureStatusBar();
        hideSplash();

        // 3. Hardware Back Button Handling
        const backListener = App.addListener('backButton', ({ canGoBack }) => {
            if (pathname === '/dashboard' || pathname === '/' || pathname === '/login') {
                // If on root logic pages, exit app
                App.exitApp();
            } else {
                // Otherwise go back in Next.js history
                router.back();
            }
        });

        return () => {
            backListener.then(handler => handler.remove());
        };
    }, [pathname, router]);
}
