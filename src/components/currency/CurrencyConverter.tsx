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
