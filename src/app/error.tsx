'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Oops! Terjadi Kesalahan
                </h1>
                <p className="text-gray-400 mb-8">
                    Maaf, terjadi kesalahan pada aplikasi. Tim kami sedang berusaha memperbaikinya.
                    Silakan coba lagi atau kembali ke halaman utama.
                </p>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <Bug className="w-4 h-4" />
                            <span className="text-sm font-medium">Error Details</span>
                        </div>
                        <p className="text-red-300 text-sm font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-red-400/50 text-xs mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Coba Lagi
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Support Info */}
                <p className="mt-8 text-sm text-gray-500">
                    Jika masalah terus berlanjut, hubungi kami di{' '}
                    <a href="mailto:support@cekkirim.com" className="text-indigo-400 hover:underline">
                        support@cekkirim.com
                    </a>
                </p>
            </div>
        </div>
    )
}
