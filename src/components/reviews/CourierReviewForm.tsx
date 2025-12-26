'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, X, Loader2, CheckCircle2 } from 'lucide-react'
import { submitCourierReview, type SubmitReviewParams } from '@/app/actions/reviews'

interface CourierReviewFormProps {
    courierCode: string
    courierName: string
    resiNumber?: string
    onClose?: () => void
    onSuccess?: () => void
}

export function CourierReviewForm({
    courierCode,
    courierName,
    resiNumber,
    onClose,
    onSuccess,
}: CourierReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Mohon berikan rating bintang')
            return
        }

        setIsSubmitting(true)
        setError(null)

        const params: SubmitReviewParams = {
            courierCode,
            courierName,
            rating,
            comment: comment.trim() || undefined,
            resiNumber,
        }

        const result = await submitCourierReview(params)

        setIsSubmitting(false)

        if (result.success) {
            setIsSuccess(true)
            setTimeout(() => {
                onSuccess?.()
                onClose?.()
            }, 2000)
        } else {
            setError(result.error || 'Gagal mengirim review')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 max-w-md w-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Beri Rating</h3>
                        <p className="text-sm text-gray-400">Bagaimana pengalaman Anda dengan {courierName}?</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {isSuccess ? (
                    /* Success State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-8 text-center"
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">Terima kasih!</p>
                        <p className="text-sm text-gray-400">Review Anda telah tersimpan</p>
                    </motion.div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Rating
                            </label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-600'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <p className="text-center text-sm text-gray-400 mt-2">
                                    {rating === 1 && 'Sangat buruk'}
                                    {rating === 2 && 'Buruk'}
                                    {rating === 3 && 'Cukup'}
                                    {rating === 4 && 'Bagus'}
                                    {rating === 5 && 'Sangat bagus!'}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Komentar (opsional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ceritakan pengalaman Anda..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {comment.length}/500
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Kirim Review
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    )
}
