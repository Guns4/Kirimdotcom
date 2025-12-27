#!/bin/bash

# Setup Warehouse Barcode Scanner Module
echo "🚀 Setting up Warehouse Barcode Scanner System..."

# 1. Install Dependencies
echo "📦 Installing QuaggaJS..."
npm install quagga @types/quagga

# 2. Create Scanner Component
echo "📸 Creating Scanner Logic..."
mkdir -p src/components/warehouse
cat << 'EOF' > src/components/warehouse/BarcodeScanner.tsx
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
EOF

# 3. Create Server Action
echo "⚡ Creating Warehouse Actions..."
cat << 'EOF' > src/app/actions/warehouse.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const recordInventoryMovement = async (sku: string, movement: 'IN' | 'OUT') => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 1. Find product by SKU
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .eq('sku', sku)
            .single()

        if (!product) {
            throw new Error(`Product with SKU ${sku} not found`)
        }

        // 2. Update stock
        const adjustment = movement === 'IN' ? 1 : -1
        const { error } = await supabase
            .from('products')
            .update({ 
                stock: product.stock + adjustment,
                updated_at: new Date().toISOString()
            })
            .eq('id', product.id)

        if (error) throw error

        // 3. Log movement (optional: create warehouse_movements table)
        
        revalidatePath('/dashboard/warehouse')
        return { success: true, product: product.name, newStock: product.stock + adjustment }
    })
}

export const getWarehouseStats = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { todayIn: 0, todayOut: 0, lowStock: 0 }

    const { data: products } = await supabase
        .from('products')
        .select('stock, min_stock_alert')
        .eq('user_id', user.id)

    const lowStock = products?.filter(p => p.stock <= p.min_stock_alert).length || 0

    return { todayIn: 0, todayOut: 0, lowStock }
}
EOF

# 4. Create Warehouse Dashboard Page
echo "🎨 Creating Warehouse Dashboard..."
mkdir -p src/app/dashboard/warehouse
cat << 'EOF' > src/app/dashboard/warehouse/page.tsx
'use client'

import { BarcodeScanner } from '@/components/warehouse/BarcodeScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getWarehouseStats } from '@/app/actions/warehouse'

export default function WarehousePage() {
    const [stats, setStats] = useState({ todayIn: 0, todayOut: 0, lowStock: 0 })

    useEffect(() => {
        getWarehouseStats().then(data => setStats(data as any))
    }, [])

    return (
        <div className="container-custom py-8 space-y-6">
            <h1 className="text-3xl font-bold">Warehouse Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            Barang Masuk Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.todayIn}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                            <TrendingDown className="w-4 h-4" />
                            Barang Keluar Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.todayOut}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            Stok Rendah
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.lowStock}</p>
                    </CardContent>
                </Card>
            </div>

            <BarcodeScanner />
        </div>
    )
}
EOF

# 5. Create beep sound placeholder
echo "🔊 Creating sound asset placeholder..."
mkdir -p public/sounds
echo "👉 Place a beep.mp3 file in public/sounds/ for scan feedback"

echo "✅ Warehouse Scanner Setup Complete!"
echo "📱 Seller dapat menggunakan HP sebagai barcode scanner untuk tracking inventory!"
