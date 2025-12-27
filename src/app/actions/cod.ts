'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export interface CheckPostalCodeResult {
    success: boolean
    riskLevel?: 'Low' | 'Medium' | 'High'
    city?: string
    province?: string
    error?: string
}

export async function checkPostalCode(postalCode: string): Promise<CheckPostalCodeResult> {
    const supabase = await createClient() as any

    try {
        const { data, error } = await supabase
            .from('cod_risk_zones')
            .select('risk_level, city, province')
            .eq('postal_code', postalCode)
            .single()

        if (error) {
            // If not found, default to Unknown or handle gracefully
            if (error.code === 'PGRST116') { // No rows found
                return { success: false, error: 'Kode pos tidak ditemukan di database kami.' }
            }
            throw error
        }

        return {
            success: true,
            riskLevel: data.risk_level as 'Low' | 'Medium' | 'High',
            city: data.city,
            province: data.province
        }
    } catch (error) {
        console.error('Error checking postal code:', error)
        return { success: false, error: 'Gagal mengecek kode pos.' }
    }
}

export interface CheckPhoneResult {
    success: boolean
    reportCount?: number
    lastReportedAt?: string
    isClean?: boolean
    error?: string
}

export async function checkPhone(phoneHash: string): Promise<CheckPhoneResult> {
    const supabase = await createClient() as any

    try {
        const { data, error } = await supabase
            .from('reported_buyers')
            .select('report_count, last_reported_at')
            .eq('phone_hash', phoneHash)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No reports found -> Clean
                return { success: true, reportCount: 0, isClean: true }
            }
            throw error
        }

        return {
            success: true,
            reportCount: data.report_count,
            lastReportedAt: data.last_reported_at,
            isClean: false
        }
    } catch (error) {
        console.error('Error checking phone hash:', error)
        return { success: false, error: 'Gagal mengecek riwayat nomor.' }
    }
}

export interface ReportBuyerResult {
    success: boolean
    message?: string
    error?: string
}

export async function reportBuyer(phoneHash: string, reason: string): Promise<ReportBuyerResult> {
    const supabase = await createClient() as any

    try {
        // Get IP for audit
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'

        // 1. Log the report
        const { error: logError } = await supabase
            .from('buyer_reports')
            .insert({
                phone_hash: phoneHash,
                reason: reason,
                reporter_ip: ip
            })

        if (logError) throw logError

        // 2. Upsert the reported_buyers counter
        // Check if exists first
        const { data: existing } = await supabase
            .from('reported_buyers')
            .select('report_count')
            .eq('phone_hash', phoneHash)
            .single()

        if (existing) {
            // Update
            await supabase
                .from('reported_buyers')
                .update({
                    report_count: existing.report_count + 1,
                    last_reported_at: new Date().toISOString()
                })
                .eq('phone_hash', phoneHash)
        } else {
            // Insert
            await supabase
                .from('reported_buyers')
                .insert({
                    phone_hash: phoneHash,
                    report_count: 1,
                    last_reported_at: new Date().toISOString()
                })
        }

        return { success: true, message: 'Laporan berhasil disimpan.' }
    } catch (error) {
        console.error('Error reporting buyer:', error)
        return { success: false, error: 'Gagal mengirim laporan.' }
    }
}
