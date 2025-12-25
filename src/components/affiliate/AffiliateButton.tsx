'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Truck } from 'lucide-react'

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            eventName: string,
            params?: Record<string, any>
        ) => void
    }
}

interface AffiliateButtonProps {
    courier: string
    service: string
    price: number
    className?: string
}

export function AffiliateButton({
    courier,
    service,
    price,
    className = '',
}: AffiliateButtonProps) {
    const getAffiliateLink = (courierCode: string) => {
        // TODO: Replace with actual affiliate links
        const affiliateLinks: Record<string, string> = {
            jne: 'https://www.jne.co.id/id/tracking/trace',
            jnt: 'https://www.jet.co.id/',
            sicepat: 'https://www.sicepat.com/',
            anteraja: 'https://www.anteraja.id/',
            ninja: 'https://www.ninjaxpress.co/',
            pos: 'https://www.posindonesia.co.id/',
            tiki: 'https://www.tiki.id/',
        }

        return affiliateLinks[courierCode.toLowerCase()] || '#'
    }

    const handleClick = () => {
        // Track affiliate click
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'affiliate_click', {
                courier: courier,
                service: service,
                price: price,
            })
        }
    }

    return (
        <motion.a
            href={getAffiliateLink(courier)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg transition-all ${className}`}
        >
            <Truck className="w-4 h-4" />
            Kirim Paket Ini
            <ExternalLink className="w-3 h-3" />
        </motion.a>
    )
}
