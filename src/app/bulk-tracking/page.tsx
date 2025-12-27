'use client'

import { useState, useRef, useCallback, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Package, Play, Download, AlertTriangle, CheckCircle, Clock, Loader2, FileSpreadsheet, Trash2, Copy } from 'lucide-react'
import { copyToClipboardAsTable, exportToCSV } from '@/utils/clipboard'

interface TrackingResult {
    resi: string
    courier: string
    status: string
    statusDate: string
    description: string
    isError: boolean
    errorMessage?: string
}

// Queue processor - processes 3 items per second
class TrackingQueue {
    private queue: string[] = []
    private processing = false
    private onProgress: (current: number, total: number) => void
    private onResult: (result: TrackingResult) => void
    private onComplete: () => void
    private aborted = false

    constructor(
        onProgress: (current: number, total: number) => void,
        onResult: (result: TrackingResult) => void,
        onComplete: () => void
    ) {
        this.onProgress = onProgress
        this.onResult = onResult
        this.onComplete = onComplete
    }

    add(items: string[]) {
        this.queue = [...items]
    }

    abort() {
        this.aborted = true
    }

    async start() {
        if (this.processing) return
        this.processing = true
        this.aborted = false

        const total = this.queue.length
        let current = 0

        // Process 3 items every second (rate limiting)
        while (this.queue.length > 0 && !this.aborted) {
            const batch = this.queue.splice(0, 3)

            // Process batch in parallel
            const promises = batch.map(async (resi) => {
                current++
                this.onProgress(current, total)

                try {
                    const result = await this.trackSingle(resi)
                    this.onResult(result)
                } catch (error) {
                    this.onResult({
                        resi,
                        courier: 'unknown',
                        status: 'ERROR',
                        statusDate: '-',
                        description: 'Gagal memproses',
                        isError: true,
                        errorMessage: (error as Error).message,
                    })
                }
            })

            await Promise.all(promises)

            // Wait 1 second before next batch (rate limiting)
            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        this.processing = false
        this.onComplete()
    }

    private async trackSingle(resi: string): Promise<TrackingResult> {
        // Detect courier from resi format
        const courier = this.detectCourier(resi)

        const response = await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resi, courier }),
        })

        const data = await response.json()

        if (!data.success) {
            return {
                resi,
                courier,
                status: 'NOT FOUND',
                statusDate: '-',
                description: data.error || 'Data tidak ditemukan',
                isError: true,
            }
        }

        const trackingData = data.data
        return {
            resi,
            courier: courier.toUpperCase(),
            status: trackingData.summary?.status || trackingData.status?.status || 'Unknown',
            statusDate: trackingData.summary?.date || trackingData.history?.[0]?.date || '-',
            description: trackingData.summary?.desc || trackingData.status?.desc || '-',
            isError: false,
        }
    }

    private detectCourier(resi: string): string {
        const resiUpper = resi.toUpperCase()

        // Auto-detect courier
        if (resiUpper.startsWith('JP') || resiUpper.startsWith('JD')) return 'jnt'
        if (resiUpper.startsWith('00') || resiUpper.length === 15 && resiUpper.match(/^\d+$/)) return 'sicepat'
        if (resiUpper.startsWith('10') && resiUpper.length >= 12) return 'anteraja'
        if (resiUpper.match(/^[A-Z]{3}\d+$/)) return 'jne'
        if (resiUpper.startsWith('NV') || resiUpper.startsWith('NI')) return 'ninja'
        if (resiUpper.match(/^\d{13,}$/)) return 'pos'

        // Default to JNE
        return 'jne'
    }
}

function BulkTrackingContent() {
    const searchParams = useSearchParams()

    // Initialize input from search params if available
    const initialResi = searchParams.get('resi') || ''

    // Only set initial state once to avoid overwriting user changes unless strictly navigated
    const [input, setInput] = useState(initialResi ? initialResi.split(',').join('\n') : '')

    // If URL changes (e.g. navigation from same page), helpful to update input too if it was empty?
    // But let's keep it simple: just initial state.

    useEffect(() => {
        if (initialResi && !input) {
            setInput(initialResi.split(',').join('\n'))
        }
    }, [initialResi])

    const [results, setResults] = useState<TrackingResult[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0 })

    const queueRef = useRef<TrackingQueue | null>(null)

    // Parse input to get resi list
    const parseInput = (text: string): string[] => {
        return text
            .split(/[\n,;]+/)
            .map(r => r.trim())
            .filter(r => r.length >= 8) // Minimum resi length
    }

    // Start processing
    const handleStart = useCallback(() => {
        const resiList = parseInput(input)

        if (resiList.length === 0) {
            alert('Masukkan minimal 1 nomor resi yang valid')
            return
        }

        if (resiList.length > 100) {
            alert('Maksimal 100 resi dalam satu batch')
            return
        }

        setResults([])
        setIsProcessing(true)
        setProgress({ current: 0, total: resiList.length })

        queueRef.current = new TrackingQueue(
            (current, total) => setProgress({ current, total }),
            (result) => setResults(prev => [...prev, result]),
            () => setIsProcessing(false)
        )

        queueRef.current.add(resiList)
        queueRef.current.start()
    }, [input])

    // Stop processing
    const handleStop = () => {
        queueRef.current?.abort()
        setIsProcessing(false)
    }

    // Export & Copy Utils
    const columns = [
        { key: 'no', label: 'No' },
        { key: 'resi', label: 'Nomor Resi' },
        { key: 'courier', label: 'Kurir' },
        { key: 'status', label: 'Status' },
        { key: 'statusDate', label: 'Tanggal' },
        { key: 'description', label: 'Keterangan' }
    ]

    const getFormattedData = () => results.map((r, i) => ({
        no: i + 1,
        resi: r.resi,
        courier: r.courier,
        status: r.status,
        statusDate: r.statusDate,
        description: r.description
    }))

    const handleExportCSV = () => {
        if (results.length === 0) return
        exportToCSV(getFormattedData(), columns, `tracking-results-${new Date().toISOString().split('T')[0]}`)
    }

    const handleCopyTable = async () => {
        if (results.length === 0) return
        const success = await copyToClipboardAsTable(getFormattedData(), columns)
        if (success) {
            alert('Data berhasil disalin! Silakan Paste (Ctrl+V) di Google Sheets/Excel.')
        } else {
            alert('Gagal menyalin data.')
        }
    }

    // Clear all
    const handleClear = () => {
        setInput('')
        setResults([])
        setProgress({ current: 0, total: 0 })
    }

    const resiCount = parseInput(input).length
    const successCount = results.filter(r => !r.isError).length
    const errorCount = results.filter(r => r.isError).length

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 rounded-full text-orange-400 text-sm mb-4">
                        <Package className="w-4 h-4" />
                        Untuk UMKM & Seller Online
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Cek Resi Massal
                    </h1>
                    <p className="text-gray-400">
                        Lacak hingga 100 paket sekaligus. Hemat waktu untuk bisnis Anda.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-400" />
                            Daftar Nomor Resi
                        </h2>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Masukkan nomor resi (satu per baris atau pisahkan dengan koma):\n\nContoh:\nCGK1234567890\nJP1234567890,00123456789012345\nNV1234567890`}
                            className="w-full h-64 p-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
                            disabled={isProcessing}
                        />

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-gray-400">
                                {resiCount} resi terdeteksi
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleClear}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </button>

                                {isProcessing ? (
                                    <button
                                        onClick={handleStop}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Stop
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStart}
                                        disabled={resiCount === 0}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Lacak Semua
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress & Stats Section */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Status Proses
                        </h2>

                        {/* Progress Bar */}
                        {isProcessing && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                        Memproses...
                                    </span>
                                    <span>{progress.current} dari {progress.total}</span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-white/5 rounded-xl text-center">
                                <p className="text-2xl font-bold text-white">{results.length}</p>
                                <p className="text-xs text-gray-400">Diproses</p>
                            </div>
                            <div className="p-4 bg-green-600/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-green-400">{successCount}</p>
                                <p className="text-xs text-gray-400">Berhasil</p>
                            </div>
                            <div className="p-4 bg-red-600/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-red-400">{errorCount}</p>
                                <p className="text-xs text-gray-400">Gagal</p>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        {results.length > 0 && (
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCopyTable}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                    Copy Table
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Export CSV
                                </button>
                            </div>
                        )}

                        {/* Info */}
                        <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                            <h4 className="text-blue-400 font-medium text-sm mb-2">💡 Tips</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Kurir dideteksi otomatis dari format resi</li>
                                <li>• Proses 3 resi per detik untuk menghindari overload</li>
                                <li>• Hasil bisa diexport ke CSV untuk laporan</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                {results.length > 0 && (
                    <div className="mt-8 glass-card overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                                Hasil Tracking ({results.length})
                            </h3>
                            <button
                                onClick={handleExportCSV}
                                className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm flex items-center gap-2 hover:bg-green-600/30"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white/5 text-left text-sm text-gray-400 border-b border-white/10">
                                        <th className="py-3 px-4">No</th>
                                        <th className="py-3 px-4">Nomor Resi</th>
                                        <th className="py-3 px-4">Kurir</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, index) => (
                                        <tr
                                            key={result.resi + index}
                                            className={`border-b border-white/5 ${result.isError ? 'bg-red-600/10' : ''}`}
                                        >
                                            <td className="py-3 px-4 text-gray-500 text-sm">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <code className="text-indigo-300 text-sm">{result.resi}</code>
                                            </td>
                                            <td className="py-3 px-4 text-gray-300 text-sm">{result.courier}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${result.isError
                                                    ? 'bg-red-600/20 text-red-400'
                                                    : result.status.toLowerCase().includes('delivered') || result.status.toLowerCase().includes('terkirim')
                                                        ? 'bg-green-600/20 text-green-400'
                                                        : 'bg-yellow-600/20 text-yellow-400'
                                                    }`}>
                                                    {result.isError ? (
                                                        <AlertTriangle className="w-3 h-3" />
                                                    ) : result.status.toLowerCase().includes('delivered') ? (
                                                        <CheckCircle className="w-3 h-3" />
                                                    ) : (
                                                        <Clock className="w-3 h-3" />
                                                    )}
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-sm">{result.statusDate}</td>
                                            <td className="py-3 px-4 text-gray-400 text-sm max-w-xs truncate">
                                                {result.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function BulkTrackingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
            <BulkTrackingContent />
        </Suspense>
    )
}
