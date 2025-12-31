'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const getFleetVehicles = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

    return data || []
}

export const getVehicleLocation = async (vehicleId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        // Get last 10 locations for route history
        const { data } = await supabase
            .from('fleet_locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('timestamp', { ascending: false })
            .limit(10)

        return data || []
    })
}

export const updateVehicleLocation = async (vehicleId: string, location: {
    latitude: number
    longitude: number
    speed?: number
    heading?: number
    accuracy?: number
}) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { error } = await supabase.from('fleet_locations').insert({
            vehicle_id: vehicleId,
            ...location
        })

        if (error) throw error
        return { success: true }
    })
}
