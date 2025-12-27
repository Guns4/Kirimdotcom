#!/bin/bash

# Setup HS Code Database (Harmonized System Code Lookup)
echo "🚀 Setting up HS Code Database..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_hscode.sql
CREATE TABLE IF NOT EXISTS hs_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hs_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT,
    import_duty_percentage NUMERIC DEFAULT 0,
    vat_percentage NUMERIC DEFAULT 10,
    keywords TEXT[], -- For search optimization
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search index
CREATE INDEX IF NOT EXISTS idx_hscode_keywords ON hs_codes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_hscode_description ON hs_codes USING GIN(to_tsvector('indonesian', description));

-- RLS (Public read, admin write)
ALTER TABLE hs_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read HS codes" ON hs_codes FOR SELECT USING (true);

-- Seed common HS codes for Indonesian products
INSERT INTO hs_codes (hs_code, description, category, import_duty_percentage, vat_percentage, keywords) VALUES
('6403.99', 'Sepatu dengan sol karet/plastik', 'Footwear', 15, 10, ARRAY['sepatu', 'shoes', 'footwear']),
('6110.20', 'Sweter/Pullover rajut katun', 'Apparel', 15, 10, ARRAY['baju', 'sweater', 'pakaian', 'clothing']),
('8517.62', 'Smartphone dan perangkat telekomunikasi', 'Electronics', 10, 10, ARRAY['hp', 'handphone', 'smartphone', 'elektronik']),
('3304.20', 'Kosmetik untuk mata', 'Cosmetics', 10, 10, ARRAY['makeup', 'kosmetik', 'eyeshadow', 'mascara']),
('9503.00', 'Mainan anak-anak', 'Toys', 7.5, 10, ARRAY['mainan', 'toys', 'boneka', 'action figure']),
('6402.19', 'Sepatu olahraga', 'Footwear', 15, 10, ARRAY['sepatu olahraga', 'sneakers', 'sport shoes']),
('6204.62', 'Celana panjang wanita', 'Apparel', 15, 10, ARRAY['celana', 'pants', 'jeans']),
('8471.30', 'Laptop dan komputer portabel', 'Electronics', 0, 10, ARRAY['laptop', 'notebook', 'computer']),
('3926.90', 'Produk plastik lainnya', 'Plastic Goods', 7.5, 10, ARRAY['plastik', 'plastic', 'container']),
('4202.22', 'Tas tangan/Handbag', 'Bags', 15, 10, ARRAY['tas', 'bag', 'handbag', 'purse'])
ON CONFLICT (hs_code) DO NOTHING;
EOF

# 2. Create Server Actions
echo "⚡ Creating HS Code Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/hscode.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const searchHSCode = async (query: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        // Search by keywords or description
        const { data } = await supabase
            .from('hs_codes')
            .select('*')
            .or(`keywords.cs.{${query}},description.ilike.%${query}%`)
            .limit(10)

        return data || []
    })
}

export const getHSCodeByCode = async (code: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { data } = await supabase
            .from('hs_codes')
            .select('*')
            .eq('hs_code', code)
            .single()

        return data
    })
}

export const calculateCustomsDuty = async (hsCode: string, productValue: number) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { data: code } = await supabase
            .from('hs_codes')
            .select('*')
            .eq('hs_code', hsCode)
            .single()

        if (!code) throw new Error('HS Code not found')

        const importDuty = (productValue * code.import_duty_percentage) / 100
        const vat = ((productValue + importDuty) * code.vat_percentage) / 100
        const totalDuty = importDuty + vat

        return {
            product_value: productValue,
            import_duty: importDuty,
            import_duty_rate: code.import_duty_percentage,
            vat: vat,
            vat_rate: code.vat_percentage,
            total_duty: totalDuty,
            total_cost: productValue + totalDuty
        }
    })
}
EOF

# 3. Create UI Component
echo "🎨 Creating HS Code Lookup..."
mkdir -p src/components/customs
cat << 'EOF' > src/components/customs/HSCodeLookup.tsx
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
EOF

echo "✅ HS Code Database Setup Complete!"
echo "📊 Seller dapat mencari kode tarif bea cukai dan hitung pajak impor secara otomatis!"
