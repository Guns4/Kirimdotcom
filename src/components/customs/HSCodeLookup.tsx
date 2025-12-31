'use client'

import { useState } from 'react'
import { searchHSCode, calculateCustomsDuty } from '@/app/actions/hscode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, FileText, Calculator } from 'lucide-react'
import { toast } from 'sonner'

export function HSCodeLookup() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [selectedCode, setSelectedCode] = useState<any>(null)
    const [productValue, setProductValue] = useState('')
    const [calculation, setCalculation] = useState<any>(null)

    const handleSearch = async () => {
        if (!query.trim()) return

        const result = await searchHSCode(query)
        if (result?.data) {
            setResults(result.data)
            if (result.data.length === 0) {
                toast.info('Tidak ditemukan HS Code untuk kata kunci tersebut')
            }
        }
    }

    const handleCalculate = async () => {
        if (!selectedCode || !productValue) {
            toast.error('Pilih HS Code dan masukkan nilai produk')
            return
        }

        const result = await calculateCustomsDuty(selectedCode.hs_code, parseFloat(productValue))
        if (result?.data) {
            setCalculation(result.data)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        HS Code Lookup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Cari produk (contoh: sepatu, smartphone, tas)"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button onClick={handleSearch} className="gap-2">
                            <Search className="w-4 h-4" />
                            Cari
                        </Button>
                    </div>

                    {results.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Hasil Pencarian:</p>
                            {results.map(code => (
                                <div 
                                    key={code.id}
                                    onClick={() => setSelectedCode(code)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                        selectedCode?.id === code.id 
                                            ? 'border-indigo-500 bg-indigo-50' 
                                            : 'hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono font-bold text-sm">{code.hs_code}</p>
                                            <p className="text-sm text-gray-700">{code.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">{code.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Import Duty</p>
                                            <p className="font-bold text-sm">{code.import_duty_percentage}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedCode && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="w-5 h-5" />
                            Kalkulator Bea Cukai
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded border">
                            <p className="text-xs text-gray-500">HS Code Terpilih</p>
                            <p className="font-mono font-bold">{selectedCode.hs_code}</p>
                            <p className="text-sm">{selectedCode.description}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nilai Produk (USD)</label>
                            <Input 
                                type="number"
                                placeholder="Contoh: 100"
                                value={productValue}
                                onChange={e => setProductValue(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleCalculate} className="w-full">
                            Hitung Biaya Bea Cukai
                        </Button>

                        {calculation && (
                            <div className="space-y-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span>Nilai Produk</span>
                                    <span className="font-medium">${calculation.product_value.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Import Duty ({calculation.import_duty_rate}%)</span>
                                    <span className="font-medium">${calculation.import_duty.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>VAT ({calculation.vat_rate}%)</span>
                                    <span className="font-medium">${calculation.vat.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-indigo-200 pt-2 mt-2 flex justify-between font-bold">
                                    <span>Total Biaya</span>
                                    <span className="text-indigo-600">${calculation.total_cost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
