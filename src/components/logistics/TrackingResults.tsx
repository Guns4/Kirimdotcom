'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrackResiResult, generateAIInsight } from '@/app/actions/logistics'
import { Package, MapPin, AlertCircle, Sparkles, CheckCircle2, Clock, List, Map as MapIcon } from 'lucide-react'
import { ErrorState } from './ErrorState'
import { ShippingInsight } from '../ai/ShippingInsight'
import { ComplaintGenerator } from '../ai/ComplaintGenerator'
import { ShareButton } from '../share/ShareButton'
import { WhatsAppShareButton } from '../tools/WhatsAppShareButton'
import { CourierReviewForm } from '../reviews/CourierReviewForm'
import { useLiteMode } from '@/context/LiteModeContext'
import { useSystemStatus } from '@/context/SystemStatusContext'
import { FailSafeFallback } from './FailSafeFallback'
import { IssueReportButton } from './IssueReportButton'
import { SmartText } from '@/components/common/SmartText'
import { calculatePrediction } from '@/lib/prediction-engine'
import dynamic from 'next/dynamic'

// Dynamic Import Map (Client Only)
const TrackingMap = dynamic(() => import('../tracking/TrackingMap'), {
    loading: () => <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>,
    ssr: false
})

interface TrackingResultsProps {
    result: TrackResiResult
    onRetry?: () => void
}

export function TrackingResults({ result, onRetry }: TrackingResultsProps) {
    const { isLiteMode } = useLiteMode()
    const { reportError } = useSystemStatus()
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    if (!result.success) {
        // Fail-Safe: System Error / Network Error
        if (result.errorType === 'system_error' || result.errorType === 'network' || result.errorType === 'rate-limit') {
            reportError() // Signal global status
            return (
                <FailSafeFallback
                    courier={(result.courier || 'Ekspedisi').toUpperCase()}
                    officialUrl={result.officialUrl || '#'}
                />
            )
        }

        return (
            <ErrorState
                type={result.errorType || 'general'}
                message={result.error || 'Terjadi kesalahan'}
                onRetry={onRetry}
            />
        )
    }

    const { data } = result

    if (!data) {
        return null
    }

    // Calculate prediction
    const prediction = calculatePrediction(data.history, data.currentStatus)

    // Check if package is delivered
    const isDelivered = data.currentStatus?.toUpperCase().includes('TERKIRIM') ||
        data.currentStatus?.toUpperCase().includes('DELIVERED')

    const getStatusColor = (status: string) => {
        if (status === 'DELIVERED') return 'text-green-400 bg-green-500/20'
        if (status === 'OUT FOR DELIVERY') return 'text-blue-400 bg-blue-500/20'
        if (status.includes('TRANSIT')) return 'text-yellow-400 bg-yellow-500/20'
        return 'text-gray-400 bg-gray-500/20'
    }

    return (
        <div className="space-y-4">
            {/* Prediction Card (ETA & Progress) */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={isLiteMode ? false : { opacity: 1, y: 0 }}
                className={isLiteMode ? "bg-white p-5 border border-green-100 shadow-sm rounded-xl mb-6" : "glass-card p-5 border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5"}
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Estimasi Tiba</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{prediction.etaText}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-green-500">{prediction.progress}%</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mb-3">
                    <div
                        className={`h-full ${prediction.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${prediction.progress}%` }}
                    />
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {prediction.description}
                </p>
            </motion.div>

            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isLiteMode ? false : { opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={isLiteMode ? "bg-white p-4 mb-6 border border-purple-100 shadow-sm rounded-xl" : "glass-card p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30"}
            >
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-purple-300 mb-1">AI Insight</p>
                        <p className="text-sm text-gray-300">
                            {generateAIInsight({
                                type: 'resi',
                                data: data,
                            })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Package Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLiteMode ? false : { opacity: 1, y: 0 }}
                className={isLiteMode ? "bg-white p-6 border border-gray-200 shadow-sm rounded-xl" : "glass-card p-6"}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-400">Nomor Resi</p>
                        <p className="text-xl font-bold text-white">{data.resiNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Kurir</p>
                        <p className="text-lg font-semibold text-indigo-400">{data.courier}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Status Terkini</p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(data.currentStatus)}`}>
                                {data.currentStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Estimasi Sampai</p>
                        <p className="text-white font-semibold">{data.statusDate}</p>
                    </div>
                </div>
            </motion.div>

            {/* AI Shipping Insight - Auto-detects stuck packages */}
            <ShippingInsight trackingData={data} />

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center flex-wrap">
                <ComplaintGenerator trackingData={data} />
                <ShareButton trackingData={data} />
                <ShareButton trackingData={data} />
                <WhatsAppShareButton trackingData={data} />
                <IssueReportButton city={data.history[0]?.location || ''} />

                {/* Review Button - Only show if delivered */}
                {isDelivered && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-yellow-500/30"
                    >
                        ⭐ Beri Rating
                    </button>
                )}
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <CourierReviewForm
                    courierCode={data.courier}
                    courierName={data.courier}
                    resiNumber={data.resiNumber}
                    onClose={() => setShowReviewForm(false)}
                    onSuccess={() => {
                        setShowReviewForm(false)
                        // Could show success message here
                    }}
                />
            )}


            {/* View Toggle */}
            <div className="flex justify-center my-4">
                <div className="bg-white/10 dark:bg-gray-800 p-1 rounded-lg inline-flex items-center">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <List className="w-4 h-4" /> Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'map'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'}`}
                    >
                        <MapIcon className="w-4 h-4" /> Peta
                    </button>
                </div>
            </div>

            {/* Tracking Content (List vs Map) */}
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={isLiteMode ? "bg-white p-6 border border-gray-200 shadow-sm rounded-xl" : "glass-card p-6"}
            >
                {viewMode === 'map' ? (
                    <TrackingMap history={data.history} />
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-white mb-6">Riwayat Tracking</h3>
                        <div className="space-y-6 relative">
                            {/* Vertical line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />

                            {data.history.map((item, index) => {
                                const isLatest = index === 0
                                const isDelivered = item.desc?.toUpperCase().includes('TERKIRIM') || item.desc?.toUpperCase().includes('DELIVERED')

                                return (
                                    <div key={index} className="relative pl-16">
                                        {/* Timeline dot */}
                                        <div
                                            className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${isDelivered
                                                ? 'bg-green-500/20 border-2 border-green-500'
                                                : isLatest
                                                    ? 'bg-indigo-500/20 border-2 border-indigo-500 animate-pulse'
                                                    : 'bg-gray-500/20 border-2 border-gray-500'
                                                }`}
                                        >
                                            {isDelivered ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                            ) : (
                                                <Package className="w-6 h-6 text-indigo-400" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div
                                            className={`p-4 rounded-xl ${isLatest ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className={`font-semibold ${isLatest ? 'text-indigo-300' : 'text-white'}`}>
                                                    <SmartText text={item.desc} />
                                                </h4>
                                                <div className="text-right text-sm text-gray-400">
                                                    <div>{item.date}</div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-300 mb-2">
                                                <SmartText text={item.desc} />
                                            </p>

                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>{item.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}
