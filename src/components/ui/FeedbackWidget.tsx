'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquarePlus, X, Send, Loader2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitFeedback, type FeedbackType } from '@/app/actions/feedback'
import { usePathname } from 'next/navigation'

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [type, setType] = useState<FeedbackType>('general')
    const [rating, setRating] = useState(0)
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const pathname = usePathname()
    const formRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                // Don't close if clicking the toggle button
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [formRef]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message) return

        setIsSubmitting(true)
        try {
            const result = await submitFeedback(
                type,
                message,
                rating > 0 ? rating : undefined,
                pathname || 'unknown'
            )

            if (result.success) {
                setIsSuccess(true)
                setTimeout(() => {
                    setIsOpen(false)
                    setIsSuccess(false)
                    setMessage('')
                    setRating(0)
                    setType('general')
                }, 2000)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-4 z-40 print:hidden">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={formRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-16 right-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquarePlus className="w-4 h-4" />
                                Kirim Masukan
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4">
                            {isSuccess ? (
                                <div className="text-center py-6 text-green-600">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Send className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium">Terima kasih!</p>
                                    <p className="text-sm text-gray-500">Masukan Anda sangat berharga.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Rating */}
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Type */}
                                    <div className="flex p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setType('bug')}
                                            className={`flex-1 text-xs py-1.5 rounded-md transition-all ${type === 'bug' ? 'bg-white text-indigo-600 shadow-sm font-medium' : 'text-gray-500'}`}
                                        >
                                            Bug
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('feature')}
                                            className={`flex-1 text-xs py-1.5 rounded-md transition-all ${type === 'feature' ? 'bg-white text-indigo-600 shadow-sm font-medium' : 'text-gray-500'}`}
                                        >
                                            Fitur
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('other')}
                                            className={`flex-1 text-xs py-1.5 rounded-md transition-all ${type === 'other' ? 'bg-white text-indigo-600 shadow-sm font-medium' : 'text-gray-500'}`}
                                        >
                                            Lainnya
                                        </button>
                                    </div>

                                    {/* Message */}
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ceritakan pengalaman atau saran Anda..."
                                        rows={3}
                                        className="w-full text-sm p-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-900 dark:border-slate-600 outline-none resize-none"
                                        required
                                    />

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Kirim
                                                <Send className="w-3 h-3" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-white text-indigo-600 hover:bg-gray-50 rounded-full shadow-lg border border-gray-100 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group relative"
                aria-label="Feedback"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageSquarePlus className="w-6 h-6" />
                )}

                {/* Tooltip */}
                {!isOpen && (
                    <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Beri Masukan
                    </span>
                )}
            </button>
        </div>
    )
}
