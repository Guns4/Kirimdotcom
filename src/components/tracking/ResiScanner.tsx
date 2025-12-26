'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X, Scan, Loader2, AlertTriangle, Zap } from 'lucide-react'

interface ResiScannerProps {
    onScanComplete: (resi: string) => void
}

export function ResiScanner({ onScanComplete }: ResiScannerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [extractedTexts, setExtractedTexts] = useState<string[]>([])

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Request camera permission
    const startCamera = useCallback(async () => {
        try {
            setError('')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            })

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setHasPermission(true)
            }
        } catch (err) {
            console.error('Camera error:', err)
            setHasPermission(false)
            setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
        }
    }, [])

    // Stop camera
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }, [])

    // Handle modal open/close
    useEffect(() => {
        if (isOpen) {
            startCamera()
        } else {
            stopCamera()
        }

        return () => stopCamera()
    }, [isOpen, startCamera, stopCamera])

    // Capture and process image
    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current) return

        setIsProcessing(true)
        setError('')
        setExtractedTexts([])

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        // Set canvas size to video size
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0)

        try {
            // Dynamic import Tesseract.js (heavy library)
            const Tesseract = await import('tesseract.js')

            // Process image with Tesseract
            const result = await Tesseract.recognize(
                canvas.toDataURL('image/png'),
                'eng+ind', // English + Indonesian
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            // Could show progress here
                        }
                    },
                }
            )

            // Extract potential resi numbers
            const potentialResis = extractResiNumbers(result.data.text)

            if (potentialResis.length > 0) {
                setExtractedTexts(potentialResis)
            } else {
                setError('Tidak menemukan nomor resi. Coba arahkan kamera lebih dekat.')
            }
        } catch (err) {
            console.error('OCR error:', err)
            setError('Gagal memproses gambar. Silakan coba lagi.')
        } finally {
            setIsProcessing(false)
        }
    }

    // Extract resi numbers from OCR text
    const extractResiNumbers = (text: string): string[] => {
        // Clean the text
        const cleanedText = text
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .toUpperCase()

        // Common resi patterns
        const patterns = [
            // JNE: CGK1234567890
            /[A-Z]{2,4}\d{10,15}/g,
            // Generic: 12-15 digit numbers
            /\d{12,18}/g,
            // JNT: JP\d+
            /JP\d{10,}/g,
            // SiCepat: 00\d+
            /00\d{10,}/g,
            // AnterAja: 10\d+
            /10\d{10,}/g,
            // Alphanumeric mixed (8-20 chars)
            /[A-Z0-9]{10,20}/g,
        ]

        const matches = new Set<string>()

        for (const pattern of patterns) {
            const found = cleanedText.match(pattern)
            if (found) {
                found.forEach(m => {
                    // Filter out unlikely matches
                    if (m.length >= 10 && m.length <= 25) {
                        matches.add(m)
                    }
                })
            }
        }

        return Array.from(matches).slice(0, 5) // Return max 5 potential matches
    }

    // Select a resi number
    const selectResi = (resi: string) => {
        onScanComplete(resi)
        setIsOpen(false)
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Scan Resi dengan Kamera"
            >
                <Camera className="w-5 h-5" />
            </button>

            {/* Scanner Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <Scan className="w-5 h-5 text-indigo-400" />
                                Scan Nomor Resi
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Camera View */}
                        <div className="relative bg-black rounded-xl overflow-hidden">
                            {hasPermission === false ? (
                                <div className="aspect-[4/3] flex items-center justify-center bg-slate-800">
                                    <div className="text-center p-4">
                                        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                                        <p className="text-gray-400">{error}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full aspect-[4/3] object-cover"
                                    />

                                    {/* Scan Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-4/5 h-16 border-2 border-indigo-400 border-dashed rounded-lg flex items-center justify-center">
                                            <p className="text-indigo-400 text-sm bg-black/50 px-3 py-1 rounded">
                                                Arahkan resi ke dalam kotak
                                            </p>
                                        </div>
                                    </div>

                                    {/* Processing Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <div className="text-center">
                                                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                                                <p className="text-white">Memproses gambar...</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Hidden Canvas for processing */}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Capture Button */}
                        {hasPermission && !isProcessing && extractedTexts.length === 0 && (
                            <button
                                onClick={captureAndProcess}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                Scan Sekarang
                            </button>
                        )}

                        {/* Error Message */}
                        {error && !isProcessing && extractedTexts.length === 0 && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            </div>
                        )}

                        {/* Extracted Results */}
                        {extractedTexts.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-400 text-sm">Ditemukan {extractedTexts.length} kemungkinan resi:</p>
                                {extractedTexts.map((resi, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectResi(resi)}
                                        className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                                    >
                                        <span className="text-white font-mono">{resi}</span>
                                        <span className="text-indigo-400 text-sm float-right group-hover:underline">
                                            Gunakan →
                                        </span>
                                    </button>
                                ))}

                                <button
                                    onClick={() => {
                                        setExtractedTexts([])
                                        setError('')
                                    }}
                                    className="w-full mt-2 py-2 text-gray-400 hover:text-white text-sm"
                                >
                                    ↻ Scan Ulang
                                </button>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                💡 Pastikan nomor resi terlihat jelas dan pencahayaan cukup
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
