'use client'

import { useEffect, useState } from 'react'
import { getActiveIssues } from '@/app/actions/issues'
import { AlertCircle, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function IssueTicker() {
    const [issues, setIssues] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchIssues = async () => {
            const data = await getActiveIssues()
            if (data.length > 0) {
                setIssues(data)
            } else {
                // Mock data if empty for demo feeling
                setIssues([
                    // "Info: Sistem berjalan normal di seluruh Indonesia."
                ])
            }
        }

        fetchIssues()
    }, [])

    useEffect(() => {
        if (issues.length <= 1) return
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % issues.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [issues])

    if (issues.length === 0) return null

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white overflow-hidden relative z-40">
            <div className="container-custom py-2 flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded">
                    <Megaphone className="w-4 h-4 text-white animate-pulse" />
                </div>

                <div className="flex-1 relative h-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute inset-0 flex items-center text-xs md:text-sm font-medium truncate"
                        >
                            {issues[currentIndex]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
