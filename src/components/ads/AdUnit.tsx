'use client'

import { useEffect } from 'react'
import { AD_CONFIG } from '@/config/ads'

interface AdUnitProps {
    slot: keyof typeof AD_CONFIG.slots
    className?: string
}

export function AdUnit({ slot, className = '' }: AdUnitProps) {
    const config = AD_CONFIG.slots[slot]

    useEffect(() => {
        if (AD_CONFIG.enabled && typeof window !== 'undefined') {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({})
            } catch (err) {
                console.error('AdSense error', err)
            }
        }
    }, [])

    if (!AD_CONFIG.enabled) return null

    return (
        <div className={`ad-container my-4 flex justify-center ${className}`}>
            <div className="text-xs text-center text-gray-300 mb-1">Iklan</div>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...config.style }}
                data-ad-client={AD_CONFIG.publisherId}
                data-ad-slot={config.adUnitId}
                data-ad-format={config.format}
                data-full-width-responsive={config.responsive ? 'true' : 'false'}
                {...(config.layoutKey ? { 'data-ad-layout-key': config.layoutKey } : {})}
            />
        </div>
    )
}
