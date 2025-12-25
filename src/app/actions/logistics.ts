'use server'

import { calculateShippingRate, generateMockTracking, generateDeliveredTracking } from '@/data/couriers'
import type { CourierService, TrackingStatus } from '@/data/couriers'

// ============================================
// SERVER ACTION: Check Shipping Rates
// ============================================

export interface CheckOngkirParams {
    originId: string
    destinationId: string
    weight: number // in grams
}

export interface CheckOngkirResult {
    success: boolean
    data?: Array<CourierService & { price: number }>
    error?: string
}

export async function checkOngkir(params: CheckOngkirParams): Promise<CheckOngkirResult> {
    try {
        const { originId, destinationId, weight } = params

        // Validation
        if (!originId || !destinationId) {
            return {
                success: false,
                error: 'Kota asal dan tujuan harus dipilih',
            }
        }

        if (!weight || weight <= 0) {
            return {
                success: false,
                error: 'Berat paket harus lebih dari 0 gram',
            }
        }

        if (weight > 30000) {
            return {
                success: false,
                error: 'Berat maksimal 30kg (30000 gram)',
            }
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // TODO: Replace with actual API call to RajaOngkir/BinderByte
        // const response = await fetch('API_URL', { ... })
        // const data = await response.json()

        // For now, use mock data
        const rates = calculateShippingRate(originId, destinationId, weight)

        return {
            success: true,
            data: rates,
        }
    } catch (error) {
        console.error('Error checking ongkir:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan saat mengecek ongkir',
        }
    }
}

// ============================================
// SERVER ACTION: Track Package
// ============================================

export interface TrackResiParams {
    courier: string
    waybill: string
}

export interface TrackResiResult {
    success: boolean
    data?: {
        waybill: string
        courier: string
        currentStatus: string
        estimatedDelivery: string
        history: TrackingStatus[]
    }
    error?: string
}

export async function trackResi(params: TrackResiParams): Promise<TrackResiResult> {
    try {
        const { courier, waybill } = params

        // Validation
        if (!courier) {
            return {
                success: false,
                error: 'Kurir harus dipilih',
            }
        }

        if (!waybill || waybill.length < 8) {
            return {
                success: false,
                error: 'Nomor resi tidak valid',
            }
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // TODO: Replace with actual API call to courier tracking API
        // const response = await fetch(`API_URL/${courier}/${waybill}`)
        // const data = await response.json()

        // For now, use mock data
        // Simulate "delivered" status for waybills ending with "99"
        const trackingData = waybill.endsWith('99')
            ? generateDeliveredTracking(courier, waybill)
            : generateMockTracking(courier, waybill)

        return {
            success: true,
            data: trackingData,
        }
    } catch (error) {
        console.error('Error tracking resi:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan saat melacak paket',
        }
    }
}

// ============================================
// AI INSIGHT GENERATOR (Simple Logic)
// ============================================

export function generateAIInsight(context: {
    type: 'ongkir' | 'tracking'
    data?: any
}): string {
    if (context.type === 'ongkir' && context.data) {
        const { estimatedDays, serviceType } = context.data

        // Extract days from string like "2-3 hari"
        const days = parseInt(estimatedDays.split('-')[1] || estimatedDays)

        if (days > 4) {
            return '⏰ Pengiriman agak lama karena jarak lintas pulau. Pertimbangkan layanan Express jika membutuhkan pengiriman lebih cepat.'
        } else if (days <= 2 && serviceType === 'Regular') {
            return '⚡ Estimasi pengiriman cukup cepat! Ini adalah pilihan yang baik untuk paket reguler.'
        } else if (serviceType === 'Express') {
            return '🚀 Layanan express dipilih - paket Anda akan tiba lebih cepat dengan prioritas tinggi.'
        }
    }

    if (context.type === 'tracking' && context.data) {
        const { currentStatus } = context.data

        if (currentStatus === 'DELIVERED') {
            return '✅ Paket telah diterima! Terima kasih telah menggunakan layanan kami.'
        } else if (currentStatus === 'OUT FOR DELIVERY') {
            return '📦 Paket Anda sedang dalam perjalanan! Siapkan diri untuk menerima paket hari ini.'
        } else if (currentStatus === 'IN TRANSIT') {
            return '🚚 Paket Anda sedang dalam perjalanan ke kota tujuan. Mohon bersabar.'
        }
    }

    return '💡 Gunakan fitur ini secara rutin untuk mendapatkan update terbaru paket Anda.'
}
