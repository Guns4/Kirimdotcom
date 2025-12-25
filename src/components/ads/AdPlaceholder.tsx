'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

interface AdPlaceholderProps {
    slot?: 'top' | 'middle' | 'sidebar'
    className?: string
}

export function AdPlaceholder({ slot = 'middle', className = '' }: AdPlaceholderProps) {
    const [isPremium, setIsPremium] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const checkPremiumStatus = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single()

                setIsPremium(profile?.subscription_status === 'active')
            }

            setIsLoading(false)
        }

        checkPremiumStatus()
    }, [supabase])

    // Don't show ads for premium users
    if (isPremium || isLoading) {
        return null
    }

    const getAdSize = () => {
        switch (slot) {
            case 'top':
                return 'h-24' // Banner ad
            case 'sidebar':
                return 'h-64' // Sidebar ad
            default:
                return 'h-32' // Medium rectangle
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative w-full ${getAdSize()} ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Sponsored</p>
                    <p className="text-sm text-gray-400">Advertisement Space</p>
                </div>
            </div>

            {/* TODO: Replace with actual AdSense/AdMob code */}
            {/* Example AdSense:
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      */}
        </motion.div>
    )
}
