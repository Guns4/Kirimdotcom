'use client'

import { useState, useEffect, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, Image as ImageIcon, Sliders, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function ImageCompressor() {
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [compressedFile, setCompressedFile] = useState<Blob | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Settings
    const [quality, setQuality] = useState(80)
    const [useWatermark, setUseWatermark] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Handlers
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFileSelect(event.target.files[0])
        }
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileSelect(event.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (file: File) => {
        if (!file.type.match(/image\/*/)) {
            toast.error('Mohon upload file gambar')
            return
        }
        setOriginalFile(file)
    }

    // Compression Effect
    useEffect(() => {
        const processImage = async () => {
            if (!originalFile) return

            setIsProcessing(true)
            try {
                // 1. Compress
                const options = {
                    maxSizeMB: 1, // Default limit, but quality controls mostly
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    initialQuality: quality / 100
                }

                let outputBlob = await imageCompression(originalFile, options)

                // 2. Watermark (if enabled)
                if (useWatermark) {
                    outputBlob = await applyWatermark(outputBlob)
                }

                setCompressedFile(outputBlob)
                setPreviewUrl(URL.createObjectURL(outputBlob))
            } catch (error) {
                console.error(error)
                toast.error('Gagal memproses gambar')
            } finally {
                setIsProcessing(false)
            }
        }

        const timer = setTimeout(() => {
            processImage()
        }, 500) // Debounce

        return () => clearTimeout(timer)
    }, [originalFile, quality, useWatermark])

    const applyWatermark = async (imageBlob: Blob): Promise<Blob> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = URL.createObjectURL(imageBlob)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(imageBlob)
                    return
                }

                // Draw original
                ctx.drawImage(img, 0, 0)

                // Draw Watermark
                const fontSize = Math.max(24, Math.floor(img.width * 0.05))
                ctx.font = `bold ${fontSize}px sans-serif`
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
                ctx.lineWidth = fontSize / 8
                ctx.textAlign = 'right'
                ctx.textBaseline = 'bottom'

                const text = "CekKirim.com"
                const padding = fontSize

                ctx.strokeText(text, canvas.width - padding, canvas.height - padding)
                ctx.fillText(text, canvas.width - padding, canvas.height - padding)

                // Export
                canvas.toBlob((blob) => {
                    resolve(blob || imageBlob)
                }, imageBlob.type, 0.9)
            }
        })
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const handleDownload = () => {
        if (!compressedFile) return
        const link = document.createElement('a')
        link.href = URL.createObjectURL(compressedFile)
        link.download = `compressed-${originalFile?.name}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Area */}
            <div className="space-y-6">
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={`glass-card p-8 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[300px] ${originalFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/30'
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                    />

                    {originalFile ? (
                        <div className="space-y-4">
                            <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={URL.createObjectURL(originalFile)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-white font-medium truncate max-w-[200px] mx-auto">{originalFile.name}</h3>
                                <p className="text-gray-400 text-sm">{formatSize(originalFile.size)}</p>
                            </div>
                            <label htmlFor="image-upload" className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors cursor-pointer">
                                Ganti Foto
                            </label>
                        </div>
                    ) : (
                        <label htmlFor="image-upload" className="cursor-pointer space-y-4 w-full h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Upload Foto Produk</h3>
                                <p className="text-gray-400 text-sm mt-1">Drag & drop atau klik untuk memilih</p>
                            </div>
                        </label>
                    )}
                </div>

                {/* Controls */}
                {originalFile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 space-y-6"
                    >
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300 font-medium flex items-center gap-2">
                                    <Sliders className="w-4 h-4" /> Kualitas Kompresi
                                </span>
                                <span className="text-indigo-400 font-bold">{quality}%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-gray-300 text-sm font-medium">Watermark "CekKirim"</span>
                            <button
                                onClick={() => setUseWatermark(!useWatermark)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${useWatermark ? 'bg-indigo-600' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useWatermark ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Preview Area */}
            <div className="space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-1 h-full min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

                    <div className="flex-1 flex items-center justify-center p-8">
                        {isProcessing ? (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
                                <p className="text-gray-400 animate-pulse">Memproses gambar...</p>
                            </div>
                        ) : previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl}
                                alt="Result"
                                className="max-w-full max-h-[400px] object-contain shadow-2xl rounded-lg"
                            />
                        ) : (
                            <div className="text-center text-gray-600">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Preview hasil kompresi akan muncul di sini</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    {compressedFile && !isProcessing && (
                        <div className="bg-gray-900/80 backdrop-blur-md p-6 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Before</p>
                                    <p className="text-white font-mono">{formatSize(originalFile?.size || 0)}</p>
                                </div>
                                <div className="border-l border-white/10">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">After</p>
                                    <p className="text-green-400 font-mono font-bold flex items-center justify-center gap-1">
                                        {formatSize(compressedFile.size)}
                                        <span className="text-[10px] bg-green-500/20 px-1.5 py-0.5 rounded text-green-300">
                                            -{Math.round((1 - compressedFile.size / (originalFile?.size || 1)) * 100)}%
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full bg-white hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                Download Hasil
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
