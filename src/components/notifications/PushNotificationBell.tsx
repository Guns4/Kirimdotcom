'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, X, Check } from 'lucide-react';

interface PushNotificationProps {
    vapidPublicKey: string;
    onSubscribe?: (subscription: PushSubscription) => Promise<void>;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Push Notification Bell Button
 * Non-intrusive permission request UI
 */
export function PushNotificationBell({ vapidPublicKey, onSubscribe }: PushNotificationProps) {
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [showPrompt, setShowPrompt] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        setPermission(getNotificationPermission());
    }, []);

    const requestPermission = async () => {
        setIsSubscribing(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                // Register service worker and subscribe
                const registration = await navigator.serviceWorker.ready;

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
                });

                // Send subscription to server
                if (onSubscribe) {
                    await onSubscribe(subscription);
                }

                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Push subscription failed:', error);
        } finally {
            setIsSubscribing(false);
        }
    };

    // Convert VAPID key
    function urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Unsupported browser
    if (permission === 'unsupported') return null;

    // Already granted
    if (permission === 'granted') {
        return (
            <button
                className="relative p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                title="Notifikasi aktif"
            >
                <BellRing className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            </button>
        );
    }

    // Denied
    if (permission === 'denied') {
        return (
            <button
                className="relative p-2 text-surface-400 cursor-not-allowed"
                title="Notifikasi diblokir"
            >
                <BellOff className="w-6 h-6" />
            </button>
        );
    }

    // Default - show bell with prompt
    return (
        <div className="relative">
            <button
                onClick={() => setShowPrompt(true)}
                className="relative p-2 text-surface-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition"
                title="Aktifkan notifikasi"
            >
                <Bell className="w-6 h-6" />
            </button>

            {/* Permission Prompt Modal */}
            {showPrompt && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-surface-200 p-4 z-50">
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="absolute top-2 right-2 p-1 text-surface-400 hover:text-surface-600"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="font-bold text-surface-900 mb-1">
                            Izinkan Notifikasi Paket?
                        </h3>
                        <p className="text-sm text-surface-600">
                            Dapatkan update status pengiriman langsung di browser Anda
                        </p>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={requestPermission}
                            disabled={isSubscribing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50"
                        >
                            {isSubscribing ? (
                                <>Mengaktifkan...</>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Ya, Aktifkan
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="w-full px-4 py-2 text-surface-600 hover:bg-surface-100 rounded-lg transition text-sm"
                        >
                            Nanti saja
                        </button>
                    </div>

                    <p className="text-xs text-surface-400 text-center mt-3">
                        Anda bisa menonaktifkan kapan saja
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Hook to manage push subscription
 */
export function usePushNotification(vapidPublicKey: string) {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (!isPushSupported()) return;

        setPermission(Notification.permission);

        // Check existing subscription
        navigator.serviceWorker.ready.then(async (registration) => {
            const existingSub = await registration.pushManager.getSubscription();
            setSubscription(existingSub);
        });
    }, []);

    return {
        subscription,
        permission,
        isSupported: isPushSupported(),
        isSubscribed: !!subscription,
    };
}

export default PushNotificationBell;
