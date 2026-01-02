'use client';

import { useEffect } from 'react';

/**
 * Hook to handle deep linking from native app or browser URL schemes
 * This enables the app to respond to custom URLs like cekkirim://tracking/123
 */
export function useDeepLink() {
    useEffect(() => {
        // Only run in browser/native context
        if (typeof window === 'undefined') return;

        // Handle Capacitor deep links (if available)
        const setupCapacitorDeepLinks = async () => {
            try {
                const { App } = await import('@capacitor/app');

                // Handle app URL open events
                App.addListener('appUrlOpen', (event) => {
                    const url = new URL(event.url);
                    const pathname = url.pathname;

                    // Route to the appropriate page
                    if (pathname) {
                        window.location.href = pathname + url.search;
                    }
                });
            } catch {
                // Capacitor not available, running in web mode
                // Deep links are handled by browser/router naturally
            }
        };

        setupCapacitorDeepLinks();

        // Cleanup
        return () => {
            // Remove Capacitor listeners on unmount
            import('@capacitor/app')
                .then(({ App }) => {
                    App.removeAllListeners();
                })
                .catch(() => {
                    // Ignore if not available
                });
        };
    }, []);
}
