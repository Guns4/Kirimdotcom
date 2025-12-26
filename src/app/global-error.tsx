'use client'

import { useEffect } from 'react'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Global Error:', error)
    }, [error])

    return (
        <html lang="id">
            <body className="bg-slate-900">
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <AlertOctagon className="w-10 h-10 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-3">
                            Terjadi Kesalahan Sistem
                        </h1>
                        <p className="text-gray-400 mb-6">
                            Aplikasi mengalami masalah. Silakan coba lagi.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => reset()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Coba Lagi
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Beranda
                            </a>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
