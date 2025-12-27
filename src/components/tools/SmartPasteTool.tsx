'use client'

import { useState } from 'react'
import { extractTrackingNumbers } from '@/utils/text-cleaner'
import { ClipboardPaste, ArrowRight, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function SmartPasteTool() {
    const [rawText, setRawText] = useState('')
    const [extracted, setExtracted] = useState<string[]>([])
    const [isCleaned, setIsCleaned] = useState(false)

    const handleExtract = () => {
        if (!rawText.trim()) return
        const numbers = extractTrackingNumbers(rawText)
        setExtracted(numbers)
        setIsCleaned(true)
    }

    const handleClear = () => {
        setRawText('')
        setExtracted([])
        setIsCleaned(false)
    }

    const bulkTrackingUrl = `/bulk-tracking?resi=${extracted.join(',')}`

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Input Area */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardPaste className="w-5 h-5 text-indigo-500" />
                            Paste Chat WhatsApp
                        </CardTitle>
                        <CardDescription>
                            Tempel chat kotor dari customer di sini. Kami akan ambil nomor resinya saja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={rawText}
                            onChange={(e) => {
                                setRawText(e.target.value)
                                setIsCleaned(false)
                            }}
                            placeholder={`Contoh:\n"Halo gan, ini resinya ya JNE 8829102931 sama J&T JP29381923. Tolong dicek makasih 🙏"`}
                            className="w-full h-64 p-4 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-mono text-sm"
                        />
                        <div className="flex justify-end mt-4 gap-2">
                            <Button variant="outline" onClick={handleClear} disabled={!rawText}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                            <Button onClick={handleExtract} disabled={!rawText || isCleaned}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Bersihkan Resi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Result Area */}
            <div className="space-y-4">
                <Card className={`h-full ${isCleaned ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-dashed'}`}>
                    <CardHeader>
                        <CardTitle>Hasil Ekstraksi</CardTitle>
                        <CardDescription>
                            Nomor resi yang berhasil dikenali.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {extracted.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {extracted.map((resi, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm font-mono shadow-sm">
                                            {resi}
                                        </span>
                                    ))}
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-indigo-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Total Resi</span>
                                        <span className="text-xl font-bold text-indigo-600">{extracted.length}</span>
                                    </div>
                                    <Button className="w-full" asChild>
                                        <Link href={bulkTrackingUrl}>
                                            Lacak {extracted.length} Paket Melalui Bulk Tracking
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : isCleaned ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <AlertCircle className="w-8 h-8 mb-2 text-yellow-500" />
                                <p>Tidak ditemukan nomor resi.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <p className="text-sm">Hasil akan muncul di sini...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
