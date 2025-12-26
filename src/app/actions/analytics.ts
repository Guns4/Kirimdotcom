'use server'

import { createClient } from '@/utils/supabase/server'

// ============================================
// ANALYTICS SERVER ACTIONS
// ============================================

interface DailyStats {
    date: string
    ongkir_count: number
    resi_count: number
    total: number
}

interface CourierStats {
    courier: string
    count: number
}

interface AnalyticsData {
    todaySearches: {
        ongkir: number
        resi: number
        total: number
    }
    topCouriers: CourierStats[]
    weeklyTraffic: DailyStats[]
    apiFailureRate: number
    totalUsers: number
    newUsersToday: number
}

export async function getAnalytics(): Promise<AnalyticsData> {
    const supabase = await createClient()

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get 7 days ago
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // 1. Today's searches
    const { data: todayOngkir } = await supabase
        .from('search_history')
        .select('id', { count: 'exact' })
        .eq('type', 'ongkir')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

    const { data: todayResi } = await supabase
        .from('search_history')
        .select('id', { count: 'exact' })
        .eq('type', 'resi')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

    const ongkirCount = todayOngkir?.length || 0
    const resiCount = todayResi?.length || 0

    // 2. Top couriers from cached_resi (last 7 days)
    const { data: courierData } = await supabase
        .from('cached_resi')
        .select('courier_code')
        .gte('created_at', weekAgo.toISOString())

    const courierCounts: Record<string, number> = {}
    courierData?.forEach((item: any) => {
        const code = item.courier_code?.toUpperCase() || 'UNKNOWN'
        courierCounts[code] = (courierCounts[code] || 0) + 1
    })

    const topCouriers = Object.entries(courierCounts)
        .map(([courier, count]) => ({ courier, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    // 3. Weekly traffic
    const weeklyTraffic: DailyStats[] = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const { data: dayData } = await supabase
            .from('search_history')
            .select('type')
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString())

        const ongkirDay = dayData?.filter((d: any) => d.type === 'ongkir').length || 0
        const resiDay = dayData?.filter((d: any) => d.type === 'resi').length || 0

        weeklyTraffic.push({
            date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
            ongkir_count: ongkirDay,
            resi_count: resiDay,
            total: ongkirDay + resiDay,
        })
    }

    // 4. Total users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

    // 5. New users today
    const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

    // 6. API failure rate (simplified - based on empty cache responses)
    // In production, you'd track this separately
    const apiFailureRate = 2.5 // Mock value - implement actual tracking later

    return {
        todaySearches: {
            ongkir: ongkirCount,
            resi: resiCount,
            total: ongkirCount + resiCount,
        },
        topCouriers,
        weeklyTraffic,
        apiFailureRate,
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

interface UserProfile {
    id: string
    email: string
    role: string
    subscription_status: string
    created_at: string
    avatar_url: string | null
}

export async function getRecentUsers(limit = 10): Promise<UserProfile[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data || []
}

export async function banUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminProfile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' }
    }

    // Set user role to 'banned' (you may need to add this to your role enum)
    const { error } = await supabase
        .from('profiles')
        .update({
            role: 'user', // or 'banned' if you add it to enum
            subscription_status: 'expired'
        })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function updateUserRole(
    userId: string,
    role: 'user' | 'premium' | 'admin'
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // Check if current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminProfile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
