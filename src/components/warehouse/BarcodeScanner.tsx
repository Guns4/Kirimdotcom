'use client'

import { useEffect, useRef, useState } from 'react'
import Quagga from 'quagga'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, X, Package } from 'lucide-react'
import { toast } from 'sonner'
import { recordInventoryMovement } from '@/app/actions/warehouse'

export function BarcodeScanner() {
    const [scanning, setScanning] = useState(false)
    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const scannerRef = useRef<HTMLDivElement>(null)

    const startScanner = () => {
        if (!scannerRef.current) return

        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                target: scannerRef.current,
                constraints: {
                    facingMode: 'environment', // Use back camera
                    width: 640,
                    height: 480
                }
            },
            decoder: {
                readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader', 'upc_reader']
            },
            locate: true
        }, (err) => {
            if (err) {
                console.error(err)
                toast.error('Gagal mengakses kamera')
                return
            }
            Quagga.start()
            setScanning(true)
        })

        Quagga.onDetected(handleDetection)
    }

    const stopScanner = () => {
        Quagga.stop()
        setScanning(false)
    }

    const handleDetection = async (result: any) => {
        const code = result.codeResult.code
        
        // Prevent duplicate scans within 2 seconds
        if (code === lastScanned) return
        setLastScanned(code)

        // Play beep sound
        const audio = new Audio('/sounds/beep.mp3')
        audio.play().catch(() => {})

        toast.success(`Barcode terdeteksi: ${code}`)

        // Record movement
        try {
            await recordInventoryMovement(code, 'IN')
        } catch (error) {
            toast.error('Gagal mencatat pergerakan barang')
        }

        setTimeout(() => setLastScanned(null), 2000)
    }

    useEffect(() => {
        return () => {
            if (scanning) {
                Quagga.stop()
            }
        }
    }, [scanning])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Warehouse Scanner
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div 
                    ref={scannerRef} 
                    className={`w-full aspect-video bg-black rounded-lg overflow-hidden ${!scanning ? 'hidden' : ''}`}
                />

                {!scanning ? (
                    <Button onClick={startScanner} className="w-full gap-2">
                        <Camera className="w-4 h-4" />
                        Mulai Scan Barcode
                    </Button>
                ) : (
                    <Button onClick={stopScanner} variant="destructive" className="w-full gap-2">
                        <X className="w-4 h-4" />
                        Berhenti Scan
                    </Button>
                )}

                {lastScanned && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                        <p className="text-sm text-green-600 font-medium">Terakhir discan:</p>
                        <p className="text-lg font-mono font-bold text-green-800">{lastScanned}</p>
                    </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                    Arahkan kamera ke barcode produk untuk scan otomatis
                </p>
            </CardContent>
        </Card>
    )
}
