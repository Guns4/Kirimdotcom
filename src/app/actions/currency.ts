'use server'

import { safeAction } from '@/lib/safe-action'
import { convertCurrency, fetchExchangeRates } from '@/lib/currency/exchange-rates'

export const convert = async (amount: number, from: string, to: string) => {
    return safeAction(async () => {
        const converted = await convertCurrency(amount, from, to)
        return { amount: converted, from, to }
    })
}

export const getRates = async () => {
    return safeAction(async () => {
        const rates = await fetchExchangeRates()
        return rates
    })
}

export const getMultiCurrencyPrices = async (baseAmount: number, baseCurrency: string) => {
    return safeAction(async () => {
        const targetCurrencies = ['IDR', 'USD', 'MYR', 'SGD', 'EUR']
        const prices: Record<string, number> = {}

        for (const currency of targetCurrencies) {
            prices[currency] = await convertCurrency(baseAmount, baseCurrency, currency)
        }

        return prices
    })
}
