'use client'

import { useState, useRef } from 'react'
import { useQRCode } from 'next-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, QrCode, Download, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const COURIERS = [
    { value: 'jne', label: 'JNE' },
    { value: 'jnt', label: 'J&T' },
    { value: 'sicepat', label: 'SiCepat' },
    { value: 'anteraja', label: 'AnterAja' },
    { value: 'pos', label: 'POS Indonesia' },
    { value: 'tiki', label: 'TIKI' },
    { value: 'wahana', label: 'Wahana' },
    { value: 'shopee', label: 'Shopee Express' },
    { value: 'idexpress', label: 'ID Express' },
    { value: 'ninja', label: 'Ninja Xpress' },
]

export default function MagicQrGenerator() {
    const { Canvas } = useQRCode()
    const [resi, setResi] = useState('')
    const [courier, setCourier] = useState('')
    const [generatedUrl, setGeneratedUrl] = useState('')
    const [isPrinting, setIsPrinting] = useState(false)

    // Generate URL when both inputs are present
    const handleGenerate = () => {
        if (!resi || !courier) return
        const url = `https://cekkirim.com/track/${courier}/${resi}`
        setGeneratedUrl(url)
    }

    const handlePrint = () => {
        if (!generatedUrl) return
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 500)
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Input Section - Hidden when printing */}
            <div className="print:hidden space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        <QrCode className="w-8 h-8 text-indigo-600" />
                        Magic QR Code
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Buat stiker QR Code untuk paket Anda. Saat discan pembeli, langsung membuka halaman tracking CekKirim.com.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Buat QR Code Baru</CardTitle>
                        <CardDescription>Masukkan detail pengiriman untuk membuat QR</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kurir</label>
                                <Select value={courier} onValueChange={(v) => { setCourier(v); if (resi) handleGenerate() }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kurir" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURIERS.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nomor Resi</label>
                                <Input
                                    value={resi}
                                    onChange={(e) => { setResi(e.target.value); if (courier) handleGenerate() }}
                                    placeholder="Contoh: JP1234567890"
                                />
                            </div>
                        </div>

                        {generatedUrl && (
                            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100 mt-6">
                                <div className="bg-white p-2 rounded-lg shadow-sm border">
                                    <Canvas
                                        text={generatedUrl}
                                        options={{
                                            errorCorrectionLevel: 'M',
                                            margin: 2,
                                            scale: 4,
                                            width: 150,
                                            color: {
                                                dark: '#000000',
                                                light: '#FFFFFF',
                                            },
                                        }}
                                    />
                                </div>
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">QR Code Siap!</h3>
                                        <p className="text-sm text-gray-500 break-all">{generatedUrl}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <Button onClick={handlePrint} className="gap-2">
                                            <Printer className="w-4 h-4" />
                                            Cetak Label (A4)
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-blue-50 text-blue-600 px-3 py-1 rounded-full inline-block">
                                        💡 Tips: Tombol "Cetak" akan membuat 12 stiker dalam 1 halaman A4
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Print Layout - Visible only when printing */}
            {generatedUrl && (
                <div className="hidden print:block print:w-full">
                    <div className="grid grid-cols-3 gap-4 w-full h-full p-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 aspect-[3/2] break-inside-avoid">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scan untuk Lacak Paket</p>
                                <Canvas
                                    text={generatedUrl}
                                    options={{
                                        errorCorrectionLevel: 'M',
                                        margin: 1,
                                        scale: 4,
                                        width: 120,
                                        color: {
                                            dark: '#000000',
                                            light: '#FFFFFF',
                                        },
                                    }}
                                />
                                <div className="text-center">
                                    <p className="font-bold text-sm text-black">{courier.toUpperCase()}</p>
                                    <p className="font-mono text-xs text-gray-600">{resi}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Powered by CekKirim.com
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inline CSS for Print */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        visibility: hidden;
                    }
                    .print\\:block {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}
