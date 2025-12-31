'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition, AdMobBannerSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Test IDs (Replace with real IDs in production via Env)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

const INTERSTITIAL_THRESHOLD = 5;

export function useAdMob() {
    const [adCounter, setAdCounter] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true); // Sync this with Admin Config

    // 1. Initialize AdMob
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const init = async () => {
            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Example Test Device
                    initializeForTesting: true,
                });
                setIsInitialized(true);

                // Show Banner by default if enabled
                if (isEnabled) {
                    showBanner();
                }
            } catch (e) {
                console.error('[AdMob] Init Failed:', e);
            }
        };

        init();
    }, [isEnabled]);

    // 2. Banner Logic
    const showBanner = async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            await AdMob.showBanner({
                adId: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || TEST_BANNER_ID,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                size: BannerAdSize.BANNER, // Standard Banner
            });
        } catch (e) {
            console.error('[AdMob] Show Banner Failed:', e);
        }
    };

    const hideBanner = async () => {
        if (!Capacitor.isNativePlatform()) return;
        await AdMob.hideBanner();
    };

    // 3. Interstitial Logic (Triggered by Counting Actions)
    const incrementAdCounter = useCallback(async () => {
        if (!isEnabled || !Capacitor.isNativePlatform()) return;

        const newCount = adCounter + 1;
        setAdCounter(newCount);

        if (newCount >= INTERSTITIAL_THRESHOLD) {
            console.log('[AdMob] Threshold reached, showing Interstitial...');
            await showInterstitial();
            setAdCounter(0); // Reset
        }
    }, [adCounter, isEnabled]);

    const showInterstitial = async () => {
        try {
            await AdMob.prepareInterstitial({
                adId: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || TEST_INTERSTITIAL_ID,
            });
            await AdMob.showInterstitial();
        } catch (e) {
            console.error('[AdMob] Show Interstitial Failed:', e);
        }
    };

    return {
        showBanner,
        hideBanner,
        incrementAdCounter, // Call this whenever user checks a resi
        isEnabled
    };
}
