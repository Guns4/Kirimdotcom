#!/bin/bash

# Setup Multi-Currency Pricing Engine
echo "🚀 Setting up Multi-Currency Converter..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
npm install axios

# 2. Create Currency Service
echo "💱 Creating Currency Service..."
mkdir -p src/lib/currency
cat << 'EOF' > src/lib/currency/exchange-rates.ts
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
EOF

# 3. Create Server Actions
echo "⚡ Creating Currency Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/currency.ts
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
EOF

# 4. Create Currency Converter UI
echo "🎨 Creating Currency Converter..."
mkdir -p src/components/currency
cat << 'EOF' > src/components/currency/CurrencyConverter.tsx
'use client'

import { useState, useEffect } from 'react'
import { convert, getRates } from '@/app/actions/currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRightLeft, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CurrencyConverter() {
    const [amount, setAmount] = useState('1000000')
    const [fromCurrency, setFromCurrency] = useState('IDR')
    const [toCurrency, setToCurrency] = useState('USD')
    const [result, setResult] = useState<number | null>(null)
    const [rates, setRates] = useState<any>(null)

    useEffect(() => {
        loadRates()
    }, [])

    useEffect(() => {
        if (amount) {
            handleConvert()
        }
    }, [amount, fromCurrency, toCurrency])

    const loadRates = async () => {
        const data = await getRates()
        if (data?.data) {
            setRates(data.data)
        }
    }

    const handleConvert = async () => {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount)) return

        const res = await convert(numAmount, fromCurrency, toCurrency)
        if (res?.data) {
            setResult(res.data.amount)
        }
    }

    const swapCurrencies = () => {
        const temp = fromCurrency
        setFromCurrency(toCurrency)
        setToCurrency(temp)
    }

    const currencies = [
        { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Multi-Currency Converter
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Jumlah</label>
                        <Input 
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="1000000"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dari</label>
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map(cur => (
                                    <SelectItem key={cur.code} value={cur.code}>
                                        {cur.code} - {cur.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-center">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={swapCurrencies}
                            className="mt-7"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ke</label>
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map(cur => (
                                    <SelectItem key={cur.code} value={cur.code}>
                                        {cur.code} - {cur.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {result !== null && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-gray-600">Hasil Konversi:</p>
                        <p className="text-3xl font-bold text-green-700">
                            {currencies.find(c => c.code === toCurrency)?.symbol} {result.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {rates && `1 ${fromCurrency} = ${(rates.rates[toCurrency] / rates.rates[fromCurrency]).toFixed(4)} ${toCurrency}`}
                        </p>
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Kurs update setiap 1 jam menggunakan Open Exchange Rates API
                </p>
            </CardContent>
        </Card>
    )
}
EOF

# 5. Create Price Display Component
echo "🏷️ Creating Multi-Currency Price Display..."
cat << 'EOF' > src/components/currency/MultiCurrencyPrice.tsx
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
EOF

echo "✅ Multi-Currency Setup Complete!"
echo "💱 Seller dapat melihat harga dalam berbagai mata uang secara realtime!"
echo "👉 Set OPENEXCHANGERATES_API_KEY in .env.local for production"
