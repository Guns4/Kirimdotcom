'use client';

import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    // Cookie State
    const [preferences, setPreferences] = useState({
        necessary: true, // Always true
        analytics: true,
        marketing: false
    });

    useEffect(() => {
        const stored = localStorage.getItem('cookie_consent');
        if (!stored) {
            setIsVisible(true);
        } else {
            const savedPrefs = JSON.parse(stored);
            setPreferences(savedPrefs);
            applyCookies(savedPrefs);
        }
    }, []);

    const applyCookies = (prefs: any) => {
        // Logic to enable/disable scripts
        if (prefs.analytics) {
            console.log('✅ Google Analytics Enabled');
            // initializeGA();
        }
        if (prefs.marketing) {
            console.log('✅ Marketing Pixel Enabled');
            // initializePixel();
        }
    };

    const handleAcceptAll = () => {
        const allTrue = { necessary: true, analytics: true, marketing: true };
        saveConsent(allTrue);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    const saveConsent = (prefs: any) => {
        localStorage.setItem('cookie_consent', JSON.stringify(prefs));
        applyCookies(prefs);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 shadow-2xl z-50 animate-slide-up">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                        <Cookie className="text-amber-600" />
                        Kami Menghargai Privasi Anda
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Beberapa cookie diperlukan untuk operasional, sementara yang lain membantu kami dalam analitik dan pemasaran.
                    </p>

                    {/* Toggles (Simplified) */}
                    <div className="flex gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-not-allowed text-gray-400">
                            <input type="checkbox" checked disabled /> Necessary
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.analytics}
                                onChange={e => setPreferences({ ...preferences, analytics: e.target.checked })}
                            /> Analytics
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.marketing}
                                onChange={e => setPreferences({ ...preferences, marketing: e.target.checked })}
                            /> Marketing
                        </label>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSavePreferences}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded border"
                    >
                        Save Preferences
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
