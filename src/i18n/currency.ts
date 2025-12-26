import { currencyRates, type Locale } from './request'

// Format price based on locale
export function formatPrice(amountIDR: number, locale: Locale): string {
    if (locale === 'en') {
        // Convert IDR to USD
        const amountUSD = amountIDR / currencyRates.USD
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amountUSD)
    }

    // Default: IDR
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amountIDR)
}

// Format price with both currencies for display
export function formatPriceDual(amountIDR: number): { idr: string; usd: string } {
    const idr = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amountIDR)

    const amountUSD = amountIDR / currencyRates.USD
    const usd = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amountUSD)

    return { idr, usd }
}
