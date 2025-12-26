'use client'

import { AlertTriangle, ExternalLink, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

interface FailSafeFallbackProps {
    courier: string
    officialUrl: string
}

export function FailSafeFallback({ courier, officialUrl }: FailSafeFallbackProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden border border-yellow-500/30 bg-yellow-500/5"
        >
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-full flex-shrink-0">
                        <Activity className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Sistem Tracking Sedang Gangguan
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Sistem kami mendeteksi ganguan dari server pusat {courier}.
                            Namun jangan khawatir, Anda tetap bisa melacak paket melalui link alternatif resmi di bawah ini.
                        </p>

                        <a
                            href={officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-orange-500/20"
                        >
                            <span>Cek di Web Resmi {courier}</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        <p className="text-xs text-gray-500 mt-4 italic">
                            *Link akan membuka halaman resmi pihak ekspedisi
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-yellow-500/10 px-6 py-2 border-t border-yellow-500/20 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-yellow-600">
                    <AlertTriangle className="w-3 h-3" />
                    Status API: <strong>Maintenance/Down</strong>
                </span>
                <span className="text-gray-500">
                    Update: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </motion.div>
    )
}
