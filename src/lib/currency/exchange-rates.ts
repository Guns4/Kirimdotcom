import axios from 'axios'

const OPENEXCHANGERATES_API = 'https://openexchangerates.org/api/latest.json'
const APP_ID = process.env.OPENEXCHANGERATES_API_KEY || 'demo' // Free tier: 1000 requests/month

interface ExchangeRates {
    base: string
    rates: Record<string, number>
    timestamp: number
}

let cachedRates: ExchangeRates | null = null
let lastFetch: number = 0
const CACHE_DURATION = 3600000 // 1 hour

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now()
    
    // Return cached if fresh
    if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
        return cachedRates
    }

    try {
        const response = await axios.get(OPENEXCHANGERATES_API, {
            params: { app_id: APP_ID }
        })

        cachedRates = {
            base: response.data.base,
            rates: response.data.rates,
            timestamp: now
        }
        lastFetch = now

        return cachedRates
    } catch (error) {
        // Fallback rates if API fails
        console.error('Exchange rate API failed, using fallback rates')
        return {
            base: 'USD',
            rates: {
                USD: 1,
                IDR: 15700,
                MYR: 4.72,
                SGD: 1.35,
                EUR: 0.92,
                GBP: 0.79,
                CNY: 7.24
            },
            timestamp: now
        }
    }
}

export async function convertCurrency(
    amount: number,
    from: string,
    to: string
): Promise<number> {
    if (from === to) return amount

    const rates = await fetchExchangeRates()

    // Convert to USD first if needed
    const amountInUSD = from === 'USD' 
        ? amount 
        : amount / rates.rates[from]

    // Convert from USD to target currency
    const convertedAmount = to === 'USD'
        ? amountInUSD
        : amountInUSD * rates.rates[to]

    return parseFloat(convertedAmount.toFixed(2))
}

export async function getSupportedCurrencies() {
    const rates = await fetchExchangeRates()
    return Object.keys(rates.rates)
}
