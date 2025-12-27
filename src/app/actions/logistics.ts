'use server'

import {
    trackResi as trackResiAPI,
    getShippingCost as getShippingCostAPI,
    getErrorMessage,
    isNotFoundError,
    isRateLimitError,
} from '@/lib/api/logistics'
import { verifyTurnstile } from './security'
import {
    getCachedTracking,
    setCachedTracking,
    getCachedOngkir,
    setCachedOngkir,
} from '@/lib/cache/logistics'
import { createClient } from '@/utils/supabase/server'
import { getOfficialFallbackUrl } from '@/lib/courier-links'
import { smartTrackShipment } from '@/lib/tracking-engine'

// ============================================
// SERVER ACTION: Check Shipping Rates
// ============================================

export interface CheckOngkirParams {
    originId: string
    destinationId: string
    weight: number // in grams
    courierCode?: string // Optional: specific courier
    customKey?: string // User's custom API Key
    accountType?: string // starter | pro
    token?: string // Turnstile token
}

export interface OngkirRate {
    id: string
    courier: string
    courierCode: string
    service: string
    serviceType: string
    description: string
    estimatedDays: string
    price: number
}

export interface CheckOngkirResult {
    success: boolean
    data?: OngkirRate[]
    error?: string
    fromCache?: boolean
}

export async function checkOngkir(
    params: CheckOngkirParams
): Promise<CheckOngkirResult> {
    try {
        const { originId, destinationId, weight, courierCode, customKey, accountType, token } = params

        // Security Check (Turnstile)
        // Public users (no custom key) must verify, unless we want to enforce for all
        if (!customKey && token) {
            const isHuman = await verifyTurnstile(token)
            if (!isHuman) {
                return {
                    success: false,
                    error: 'Verifikasi keamanan gagal. Silakan refresh halaman.',
                }
            }
        }

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

        // Step 1: Check cache first
        const cached = await getCachedOngkir(
            originId,
            destinationId,
            weight,
            courierCode
        )

        if (cached && !customKey) { // Skip cache if custom key is used (to get fresh data)
            // Cache hit - using cached data
            return {
                success: true,
                data: cached.rates_json,
                fromCache: true,
            }
        }

        // Cache miss - fetch from API

        // Step 2: Fetch from API
        const couriers = courierCode
            ? [courierCode]
            : ['jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'ninja']

        const allRates: OngkirRate[] = []

        for (const courier of couriers) {
            try {
                const apiResponse = await getShippingCostAPI(
                    originId,
                    destinationId,
                    weight,
                    courier,
                    customKey,
                    accountType
                )

                if (apiResponse.data) {
                    // Transform API response to our format
                    apiResponse.data.forEach((service, index) => {
                        service.cost.forEach((cost) => {
                            allRates.push({
                                id: `${courier}-${index}-${Date.now()}`,
                                courier: courier.toUpperCase(),
                                courierCode: courier,
                                service: service.service,
                                serviceType: service.service.includes('REG') ? 'Regular' : 'Express',
                                description: service.description,
                                estimatedDays: cost.etd || '1-2 hari',
                                price: cost.value,
                            })
                        })
                    })
                }
            } catch (error) {
                console.error(`Error fetching ${courier}:`, error)
                // Continue with next courier
            }
        }

        if (allRates.length === 0) {
            return {
                success: false,
                error: 'Tidak ada layanan tersedia untuk rute ini',
            }
        }

        // Step 3: Save to cache (Only if NOT custom key)
        if (!customKey) {
            await setCachedOngkir(originId, destinationId, weight, allRates, courierCode)
        }

        // Step 4: Save to search history
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (user) {
            // Format: originId:destinationId:weight for easy parsing in popular-routes
            await supabase.from('search_history').insert({
                user_id: user.id,
                type: 'ongkir',
                query: `${originId}:${destinationId}:${weight}`,
            })
        }

        return {
            success: true,
            data: allRates,
            fromCache: false,
        }
    } catch (error) {
        console.error('checkOngkir error:', error)

        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

// ============================================
// SERVER ACTION: Track Package
// ============================================

export interface TrackResiParams {
    resiNumber: string
    courierCode: string
    token?: string // Turnstile token
}

export interface TrackingHistory {
    date: string
    desc: string
    location: string
}

export interface TrackResiResult {
    success: boolean
    data?: {
        resiNumber: string
        courier: string
        service?: string
        currentStatus: string
        statusDate: string
        statusDesc: string
        weight?: string
        history: TrackingHistory[]
    }
    error?: string
    errorType?: 'not-found' | 'rate-limit' | 'network' | 'general' | 'system_error'
    officialUrl?: string
    courier?: string
    fromCache?: boolean
}

export async function trackResi(
    params: TrackResiParams
): Promise<TrackResiResult> {
    try {
        const { resiNumber, courierCode, token } = params

        // Security Check (Turnstile)
        if (token) {
            const isHuman = await verifyTurnstile(token)
            if (!isHuman) {
                return {
                    success: false,
                    error: 'Verifikasi keamanan gagal. Silakan refresh halaman.',
                    errorType: 'general',
                }
            }
        }

        // Validation
        if (!resiNumber || !courierCode) {
            return {
                success: false,
                error: 'Nomor resi dan kurir harus diisi',
                errorType: 'general',
            }
        }

        // USE SMART TRACKING ENGINE (DB Priority -> Freshness -> API)
        const smartResult = await smartTrackShipment(resiNumber, courierCode)
        const trackingData = smartResult.data

        // Helper to format history
        const formattedHistory = trackingData?.history?.map(h => ({
            date: h.date,
            desc: h.desc,
            location: h.location
        })) || []

        // Formatted Output
        const resultData = {
            resiNumber: trackingData?.summary?.awb || resiNumber,
            courier: trackingData?.summary?.courier || courierCode,
            service: trackingData?.summary?.service || '',
            currentStatus: trackingData?.summary?.status || '',
            statusDate: trackingData?.summary?.date || '',
            statusDesc: trackingData?.summary?.desc || '',
            weight: trackingData?.summary?.weight || '',
            history: formattedHistory,
        }

        // Step 4: Save to search history (Only for Web Users)
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase.from('search_history').insert({
                user_id: user.id,
                type: 'resi',
                query: `${resiNumber} (${courierCode.toUpperCase()})`,
            })
        }

        return {
            success: true,
            data: resultData,
            fromCache: smartResult.source === 'db',
            courier: courierCode
        }

    } catch (error: any) {
        console.error('trackResi error:', error)

        // Determine error type and valid fallback
        let errorType: 'not-found' | 'rate-limit' | 'network' | 'general' | 'system_error' = 'general'

        // Check for specific error patterns
        const errorMessage = typeof error === 'string' ? error.toLowerCase() : (error.message || '').toLowerCase()
        const isSystemError =
            errorMessage.includes('500') ||
            errorMessage.includes('502') ||
            errorMessage.includes('503') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('network') ||
            errorMessage.includes('fetch failed')

        if (isSystemError) {
            errorType = 'system_error'
        } else if (isNotFoundError(error)) {
            errorType = 'not-found'
        } else if (isRateLimitError(error)) {
            errorType = 'rate-limit'
        }

        return {
            success: false,
            error: isSystemError ? 'Gangguan sistem pada server ekspedisi.' : getErrorMessage(error),
            errorType,
            courier: params.courierCode,
            officialUrl: params.courierCode ? getOfficialFallbackUrl(params.courierCode) : undefined
        }
    }
}

// ============================================
// AI INSIGHT GENERATOR
// ============================================

export async function generateAIInsight(params: {
    type: 'ongkir' | 'resi'
    data: any
}): Promise<string> {
    const { type, data } = params

    if (type === 'ongkir') {
        const cheapest = data.price
        return `Berdasarkan analisis AI, harga Rp ${cheapest?.toLocaleString('id-ID')} termasuk kompetitif untuk rute ini. Estimasi pengiriman ${data.estimatedDays}.`
    }

    // resi
    return `Status terkini: ${data.currentStatus}. Paket Anda sedang dalam proses pengiriman dengan estimasi ${data.statusDesc}.`
}
