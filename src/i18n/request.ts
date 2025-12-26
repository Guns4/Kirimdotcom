import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['id', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'id'

// Currency conversion rates (static for performance)
export const currencyRates = {
    IDR: 1,
    USD: 15500, // 1 USD = 15,500 IDR
}

export default getRequestConfig(async () => {
    // Get locale from cookie or use default
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')
    const locale = (localeCookie?.value as Locale) || defaultLocale

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
