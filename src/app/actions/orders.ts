'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { smartTrackShipment } from '@/lib/tracking-engine'
import { safeAction } from '@/lib/safe-action'
import { Database } from '@/types/database'
import { ActionResponse } from '@/types'

// Type Definition from Database
export type Order = Database['public']['Tables']['orders']['Row']
export type NewOrder = Database['public']['Tables']['orders']['Insert']
export type UpdateOrderParams = Database['public']['Tables']['orders']['Update']

// ============================================
// CRUD OPERATIONS
// ============================================

export async function createOrder(data: NewOrder): Promise<ActionResponse<Order>> {
    return safeAction(async (input, user) => {
        if (!user) throw new Error('Unauthorized')

        const supabase = await createClient()

        // Insert order
        const { error: insertError, data: newOrder } = await supabase
            .from('orders')
            .insert({
                ...input,
                user_id: user.id, // Ensure user_id is set validly from auth
                tracking_status: 'PENDING'
            })
            .select()
            .single()

        if (insertError) throw new Error(insertError.message)

        // Auto-track if resi & courier provided
        if (newOrder.resi_number && newOrder.courier) {
            await refreshSingleOrderTracking(newOrder.id, newOrder.resi_number, newOrder.courier)
        }

        revalidatePath('/dashboard/orders')
        return newOrder
    }, data, { requireAuth: true })
}

export async function getOrders(): Promise<ActionResponse<{ data: Order[], stats: any }>> {
    return safeAction(async (_, user) => {
        if (!user) throw new Error('Unauthorized')

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        const orders = data as Order[]

        // Calculate Stats
        const stats = orders.reduce((acc, order) => {
            // Revenue (Only Paid/Shipped/Done)
            // Need to match the string literal types strictly, or casting
            const status = order.status
            if (status === 'Paid' || status === 'Shipped' || status === 'Done') {
                acc.revenue += Number(order.price)
            }
            // Active Shipments
            if (order.tracking_status !== 'DELIVERED' && order.tracking_status !== 'PENDING' && status === 'Shipped') {
                acc.active += 1
            }
            // Returned
            if (status === 'Returned' || order.tracking_status.includes('RETUR')) {
                acc.returned += 1
            }
            return acc
        }, { revenue: 0, active: 0, returned: 0 })

        return { data: orders, stats }
    }, null, { requireAuth: true })
}

export async function updateOrder(id: string, updates: UpdateOrderParams): Promise<ActionResponse<null>> {
    return safeAction(async (input, user) => {
        if (!user) throw new Error('Unauthorized')
        const supabase = await createClient()

        const { error } = await supabase
            .from('orders')
            .update(input)
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)

        // If updating resi, trigger re-track
        if (input.resi_number && input.courier) {
            await refreshSingleOrderTracking(id, input.resi_number, input.courier)
        }

        revalidatePath('/dashboard/orders')
        return null
    }, updates, { requireAuth: true })
}

export async function deleteOrder(id: string): Promise<ActionResponse<null>> {
    return safeAction(async (_, user) => {
        if (!user) throw new Error('Unauthorized')
        const supabase = await createClient()

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) throw new Error(error.message)

        revalidatePath('/dashboard/orders')
        return null
    }, null, { requireAuth: true })
}

// ============================================
// AUTO-TRACK LOGIC
// ============================================

async function refreshSingleOrderTracking(orderId: string, resi: string, courier: string) {
    const supabase = await createClient()
    try {
        const result = await smartTrackShipment(resi, courier)
        if (result.data) {
            const status = result.data.summary.status
            const isDelivered = status === 'DELIVERED'

            // Auto-update business status if Delivered
            const updates: UpdateOrderParams = {
                tracking_status: status,
                last_tracking_check: new Date().toISOString()
            }

            if (isDelivered) {
                updates.status = 'Done' // Auto-close order
            }

            await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId)
        }
    } catch (e) {
        console.error('Auto-track failed for order', orderId, e)
    }
}

export async function refreshActiveOrders(): Promise<ActionResponse<{ count: number }>> {
    return safeAction(async (_, user) => {
        if (!user) throw new Error('Unauthorized')
        const supabase = await createClient()

        // Fetch active orders (Shipped but not Done/Returned)
        // Limit to 5 to prevent timeout on Vercel Free
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'Shipped')
            .neq('tracking_status', 'DELIVERED')
            .not('resi_number', 'is', null)
            .not('courier', 'is', null)
            .limit(5)

        if (!orders || orders.length === 0) return { count: 0 }

        // Parallel processing
        await Promise.all(orders.map(order =>
            refreshSingleOrderTracking(order.id, order.resi_number!, order.courier!)
        ))

        revalidatePath('/dashboard/orders')
        return { count: orders.length }
    }, null, { requireAuth: true })
}
