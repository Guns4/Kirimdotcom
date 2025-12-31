'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { SmartLockerAPI } from '@/lib/locker/locker-api'

export const getNearbyLockers = async (lat: number, lng: number) => {
    return safeAction(async () => {
        const lockerAPI = new SmartLockerAPI()
        const locations = await lockerAPI.getNearbyLocations(lat, lng)
        return locations
    })
}

export const bookLocker = async (locationId: string, size: 'S' | 'M' | 'L', trackingNumber?: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const lockerAPI = new SmartLockerAPI()
        const booking = await lockerAPI.bookLocker({ locationId, size, trackingNumber })

        if (!booking.success) throw new Error('Failed to book locker')

        // Save to database
        const { error } = await supabase.from('locker_bookings').insert({
            user_id: user.id,
            locker_provider: 'PaxelBox',
            locker_location: booking.address,
            locker_code: booking.lockerCode,
            locker_size: size,
            tracking_number: trackingNumber,
            pickup_deadline: booking.expiryTime.toISOString()
        })

        if (error) throw error

        return booking
    })
}

export const getMyBookings = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('locker_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}
