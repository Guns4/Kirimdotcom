'use client'

import { useEffect, useState } from 'react'
import { getMultiCurrencyPrices } from '@/app/actions/currency'

export function MultiCurrencyPrice({ amount, currency = 'IDR' }: { amount: number, currency?: string }) {
    const [prices, setPrices] = useState<Record<string, number>>({})

    useEffect(() => {
        loadPrices()
    }, [amount, currency])

    const loadPrices = async () => {
        const result = await getMultiCurrencyPrices(amount, currency)
        if (result?.data) {
            setPrices(result.data)
        }
    }

    const symbols: Record<string, string> = {
        IDR: 'Rp',
        USD: '$',
        MYR: 'RM',
        SGD: 'S$',
        EUR: '€'
    }

    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(prices).map(([curr, price]) => (
                <span key={curr} className="text-xs px-2 py-1 bg-gray-100 rounded border text-gray-700">
                    {symbols[curr] || curr} {price.toLocaleString()}
                </span>
            ))}
        </div>
    )
}
