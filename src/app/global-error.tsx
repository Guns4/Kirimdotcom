'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Global Error Page
 * Catches unhandled errors at the page level
 */

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-error-50 to-white">
                    {/* Illustration */}
                    <div className="relative mb-8">
                        <svg className="w-48 h-48" viewBox="0 0 300 300" fill="none">
                            {/* Background */}
                            <circle cx="150" cy="150" r="120" fill="#FEE2E2" />

                            {/* Server/Computer */}
                            <rect x="90" y="80" width="120" height="80" rx="8" fill="#FECACA" stroke="#EF4444" strokeWidth="3" />
                            <rect x="100" y="95" width="100" height="50" rx="4" fill="white" />

                            {/* Error on screen */}
                            <path d="M130 110L170 140M170 110L130 140" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

                            {/* Server lights */}
                            <circle cx="105" cy="175" r="5" fill="#EF4444" />
                            <circle cx="120" cy="175" r="5" fill="#FCD34D" />
                            <circle cx="135" cy="175" r="5" fill="#9CA3AF" />

                            {/* Cables */}
                            <path d="M150 160V200" stroke="#9CA3AF" strokeWidth="4" />
                            <path d="M130 200C130 210 170 210 170 200" stroke="#9CA3AF" strokeWidth="4" fill="none" />

                            {/* Smoke puffs */}
                            <circle cx="200" cy="70" r="12" fill="#E5E7EB" />
                            <circle cx="220" cy="55" r="8" fill="#E5E7EB" />
                            <circle cx="230" cy="45" r="5" fill="#E5E7EB" />
                        </svg>

                        {/* 500 Badge */}
                        <div className="absolute top-2 left-2 bg-error-500 text-white text-2xl font-bold px-3 py-1 rounded-lg shadow-lg transform -rotate-12">
                            500
                        </div>
                    </div>

                    {/* Text */}
                    <h1 className="text-2xl font-bold text-surface-900 mb-3 text-center">
                        Aduh, Ada yang Error! 😵
                    </h1>
                    <p className="text-surface-500 text-center max-w-md mb-6">
                        Sistem kami sedang mengalami gangguan. Tim teknis sudah diberitahu dan sedang bekerja memperbaikinya.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Coba Lagi
                        </button>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-surface-200 hover:border-surface-300 text-surface-700 font-semibold rounded-xl transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Kembali ke Home
                        </Link>
                    </div>

                    {/* Error ID */}
                    {error.digest && (
                        <p className="mt-8 text-xs text-surface-400">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
