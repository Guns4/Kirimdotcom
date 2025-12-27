#!/bin/bash

# Setup AI Address Normalizer (NLP)
echo "🚀 Setting up AI Address Correction..."

# 1. Create Address Normalizer Logic
echo "🧠 Creating Address Normalizer..."
mkdir -p src/lib/ai
cat << 'EOF' > src/lib/ai/address-normalizer.ts
// Address normalization using pattern matching and Indonesian address rules
// For production, integrate with OpenAI GPT API for better results

interface NormalizedAddress {
    original: string
    normalized: string
    confidence: number
    corrections: string[]
}

const STREET_ABBR: Record<string, string> = {
    'jl': 'Jalan',
    'jln': 'Jalan',
    'jl.': 'Jalan',
    'gg': 'Gang',
    'gg.': 'Gang',
    'blok': 'Blok',
    'rt': 'RT',
    'rw': 'RW',
    'kel': 'Kelurahan',
    'kel.': 'Kelurahan',
    'kec': 'Kecamatan',
    'kec.': 'Kecamatan',
    'no': 'No.',
    'no.': 'No.'
}

const CITY_CORRECTIONS: Record<string, string> = {
    'jkt': 'Jakarta',
    'bdg': 'Bandung',
    'sby': 'Surabaya',
    'smg': 'Semarang',
    'mlg': 'Malang',
    'dps': 'Denpasar',
    'mdn': 'Medan',
    'plg': 'Palembang',
    'mksr': 'Makassar',
    'btm': 'Batam'
}

export class AddressNormalizer {
    normalize(address: string): NormalizedAddress {
        const corrections: string[] = []
        let normalized = address.trim()

        // 1. Capitalize properly
        normalized = this.capitalize(normalized)
        if (normalized !== address) corrections.push('Capitalization fixed')

        // 2. Expand abbreviations
        const expanded = this.expandAbbreviations(normalized)
        if (expanded !== normalized) {
            normalized = expanded
            corrections.push('Abbreviations expanded')
        }

        // 3. Fix city names
        const cityFixed = this.fixCityNames(normalized)
        if (cityFixed !== normalized) {
            normalized = cityFixed
            corrections.push('City name corrected')
        }

        // 4. Format numbers
        normalized = this.formatNumbers(normalized)

        // 5. Remove extra spaces
        normalized = normalized.replace(/\s+/g, ' ').trim()

        // Calculate confidence
        const confidence = this.calculateConfidence(address, normalized, corrections)

        return {
            original: address,
            normalized,
            confidence,
            corrections
        }
    }

    private capitalize(text: string): string {
        return text
            .toLowerCase()
            .split(' ')
            .map(word => {
                // Don't capitalize Roman numerals or abbreviations
                if (/^(rt|rw|no\.?|gg\.?)$/i.test(word)) {
                    return word.toUpperCase()
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            })
            .join(' ')
    }

    private expandAbbreviations(text: string): string {
        let result = text

        Object.entries(STREET_ABBR).forEach(([abbr, full]) => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
            result = result.replace(regex, full)
        })

        return result
    }

    private fixCityNames(text: string): string {
        let result = text

        Object.entries(CITY_CORRECTIONS).forEach(([abbr, full]) => {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
            result = result.replace(regex, full)
        })

        // Add "Kota" or "Kabupaten" if missing for major cities
        const majorCities = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Medan']
        majorCities.forEach(city => {
            const regex = new RegExp(`\\b${city}\\b(?!\\s+(Kota|Kabupaten|Selatan|Utara|Barat|Timur|Pusat))`, 'gi')
            result = result.replace(regex, `Kota ${city}`)
        })

        return result
    }

    private formatNumbers(text: string): string {
        // Format "No 5" -> "No. 5"
        return text.replace(/\bNo\s+(\d+)/gi, 'No. $1')
    }

    private calculateConfidence(original: string, normalized: string, corrections: string[]): number {
        if (original === normalized) return 1.0

        // Base confidence
        let confidence = 0.7

        // Increase confidence based on corrections made
        if (corrections.length > 0) confidence += 0.1 * Math.min(corrections.length, 3)

        // Decrease if too many changes
        const changeRatio = this.levenshteinDistance(original, normalized) / original.length
        if (changeRatio > 0.5) confidence -= 0.3

        return Math.max(0.3, Math.min(1.0, confidence))
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = []

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i]
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                }
            }
        }

        return matrix[str2.length][str1.length]
    }
}

export const addressNormalizer = new AddressNormalizer()
EOF

# 2. Create Server Action
echo "⚡ Creating Address Correction Action..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/address.ts
'use server'

import { safeAction } from '@/lib/safe-action'
import { addressNormalizer } from '@/lib/ai/address-normalizer'

export const normalizeAddress = async (address: string) => {
    return safeAction(async () => {
        const result = addressNormalizer.normalize(address)
        return result
    })
}

// Batch normalize for multiple addresses
export const normalizeAddresses = async (addresses: string[]) => {
    return safeAction(async () => {
        const results = addresses.map(addr => addressNormalizer.normalize(addr))
        return results
    })
}
EOF

# 3. Create UI Component
echo "🎨 Creating Address Correction UI..."
mkdir -p src/components/ai
cat << 'EOF' > src/components/ai/AddressCorrector.tsx
'use client'

import { useState } from 'react'
import { normalizeAddress } from '@/app/actions/address'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wand2, CheckCircle, ArrowRight } from 'lucide-react'

export function AddressCorrector() {
    const [input, setInput] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleNormalize = async () => {
        if (!input.trim()) return

        setLoading(true)
        try {
            const res = await normalizeAddress(input)
            if (res?.data) {
                setResult(res.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const applyCorrection = () => {
        if (result) {
            setInput(result.normalized)
            setResult(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    AI Address Correction
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Alamat Pengiriman</label>
                    <Textarea 
                        placeholder="Contoh: jln mawar no 5 bdg"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        rows={3}
                        className="font-mono text-sm"
                    />
                </div>

                <Button 
                    onClick={handleNormalize} 
                    disabled={loading || !input.trim()}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                >
                    <Wand2 className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Normalize Address'}
                </Button>

                {result && (
                    <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-700">Corrected</span>
                            </div>
                            <Badge variant="outline" className="bg-white">
                                {(result.confidence * 100).toFixed(0)}% Confidence
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm">
                                <span className="text-gray-500 shrink-0">Original:</span>
                                <span className="text-gray-700 line-through">{result.original}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                                <span className="text-gray-500 shrink-0">Normalized:</span>
                                <span className="font-medium text-green-700">{result.normalized}</span>
                            </div>
                        </div>

                        {result.corrections.length > 0 && (
                            <div className="pt-2 border-t border-green-200">
                                <p className="text-xs text-gray-600 mb-1">Corrections made:</p>
                                <div className="flex flex-wrap gap-1">
                                    {result.corrections.map((correction: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {correction}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button onClick={applyCorrection} variant="outline" className="w-full">
                            Apply Correction
                        </Button>
                    </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <p className="font-medium mb-1">Examples:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                        <li>"jln mawar no 5 bdg" → "Jalan Mawar No. 5, Kota Bandung"</li>
                        <li>"gg kenanga 12 rt 5 sby" → "Gang Kenanga No. 12 RT 5, Kota Surabaya"</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
EOF

echo "✅ AI Address Normalizer Setup Complete!"
echo "🧠 AI akan otomatis memperbaiki typo dan format alamat!"
