'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const getFreightForwarders = async (filters?: {
    service?: string
    route?: string
}) => {
    const supabase = await createClient()
    let query = supabase
        .from('freight_forwarders')
        .select('*')
        .eq('is_verified', true)

    if (filters?.service) {
        query = query.contains('services', [filters.service])
    }

    if (filters?.route) {
        query = query.contains('routes', [filters.route])
    }

    const { data } = await query.order('rating', { ascending: false })
    return data || []
}

export const requestQuote = async (quoteData: {
    forwarderId: string
    originPort: string
    destinationPort: string
    cargoType: string
    commodity: string
    weight: number
    volume: number
    notes?: string
}) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('freight_quotes').insert({
            user_id: user.id,
            forwarder_id: quoteData.forwarderId,
            origin_port: quoteData.originPort,
            destination_port: quoteData.destinationPort,
            cargo_type: quoteData.cargoType,
            commodity: quoteData.commodity,
            weight_kg: quoteData.weight,
            volume_cbm: quoteData.volume,
            notes: quoteData.notes
        })

        if (error) throw error
        return { success: true }
    })
}

export const getMyQuotes = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('freight_quotes')
        .select('*, freight_forwarders(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}
