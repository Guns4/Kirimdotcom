'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'

interface ShippingInsightProps {
    trackingData: {
        resiNumber: string
        courier: string
        currentStatus: string
        statusDate: string
        history: Array<{
            date: string
            desc: string
            location: string
        }>
    }
}

export function ShippingInsight({ trackingData }: ShippingInsightProps) {
    const [insight, setInsight] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check if package is stuck (no movement > 3 days)
    const isStuck = () => {
        if (!trackingData.history || trackingData.history.length === 0) return false

        const lastUpdate = new Date(trackingData.history[0].date)
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceUpdate > 3
    }

    const generateInsight = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/generate-advice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'insight',
                    trackingData,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to generate insight')
            }

            const data = await response.json()
            setInsight(data.advice)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menghasilkan insight')
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-generate insight if package is stuck
    useEffect(() => {
        if (isStuck() && !insight) {
            generateInsight()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Don't show if not stuck and no insight yet
    if (!isStuck() && !insight) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/30"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-purple-300">AI Shipping Insight</h3>
                        {isStuck() && (
                            <p className="text-xs text-yellow-400">⚠️ Paket terdeteksi tidak bergerak</p>
                        )}
                    </div>
                </div>

                {/* Refresh button */}
                <button
                    onClick={generateInsight}
                    disabled={isLoading}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 py-3"
                    >
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-100" />
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-200" />
                        <span className="text-sm text-gray-400 ml-2">Menganalisis pengiriman...</span>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 text-red-400"
                    >
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                {insight && !isLoading && (
                    <motion.div
                        key="insight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/5 rounded-lg p-4 border border-purple-500/20"
                    >
                        <p className="text-sm text-gray-200 leading-relaxed">{insight}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
