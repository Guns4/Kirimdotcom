'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const MarketplaceCalculator = dynamic(
    () => import('./MarketplaceCalculator'),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        )
    }
)

export function CalculatorWrapper() {
    return <MarketplaceCalculator />
}
