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
