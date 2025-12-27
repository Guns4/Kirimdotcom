'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { smartTrackShipment } from '@/lib/tracking-engine'

export interface Order {
    id: string
    user_id: string
    customer_name: string
    product_name: string
    price: number
    resi_number: string | null
    courier: string | null
    status: 'Unpaid' | 'Paid' | 'Shipped' | 'Done' | 'Cancelled' | 'Returned' // Simplified Business Status
    tracking_status: string // Logistics Status
    created_at: string
    updated_at: string
}

export type NewOrder = Pick<Order, 'customer_name' | 'product_name' | 'price' | 'resi_number' | 'courier' | 'status'>

// ============================================
// CRUD OPERATIONS
// ============================================

export async function createOrder(data: NewOrder) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Insert order
    const { error: insertError, data: newOrder } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            customer_name: data.customer_name,
            product_name: data.product_name,
            price: data.price,
            resi_number: data.resi_number || null,
            courier: data.courier || null,
            status: data.status,
            tracking_status: 'PENDING'
        })
        .select()
        .single()

    if (insertError) {
        console.error('Create Order Error:', insertError)
        return { success: false, error: 'Gagal membuat order' }
    }

    // Auto-track if resi & courier provided
    if (data.resi_number && data.courier) {
        // Run in background (fire & forget, but we await for simplicity in Vercel serverless)
        // Ideally use persistent queue, but for "Simple" feature:
        await refreshSingleOrderTracking(newOrder.id, data.resi_number, data.courier)
    }

    revalidatePath('/dashboard/orders')
    return { success: true }
}

export async function getOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], stats: { revenue: 0, active: 0, returned: 0 } }

    const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const orders = (data || []) as Order[]

    // Calculate Stats
    const stats = orders.reduce((acc, order) => {
        // Revenue (Only Paid/Shipped/Done)
        if (['Paid', 'Shipped', 'Done'].includes(order.status)) {
            acc.revenue += Number(order.price)
        }
        // Active Shipments (Using Tracking Status)
        if (order.tracking_status !== 'DELIVERED' && order.tracking_status !== 'PENDING' && order.status === 'Shipped') {
            acc.active += 1
        }
        // Returned
        if (order.status === 'Returned' || order.tracking_status.includes('RETUR')) {
            acc.returned += 1
        }
        return acc
    }, { revenue: 0, active: 0, returned: 0 })

    return { data: orders, stats }
}

export async function updateOrder(id: string, updates: Partial<Order>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { success: false, error: 'Update failed' }

    // If updating resi, trigger re-track
    if (updates.resi_number && updates.courier) {
        await refreshSingleOrderTracking(id, updates.resi_number, updates.courier)
    }

    revalidatePath('/dashboard/orders')
    return { success: true }
}

export async function deleteOrder(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase.from('orders').delete().eq('id', id).eq('user_id', user.id)
    if (error) return { success: false, error: 'Delete failed' }

    revalidatePath('/dashboard/orders')
    return { success: true }
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
            const updates: any = { tracking_status: status, last_tracking_check: new Date().toISOString() }
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

export async function refreshActiveOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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

    if (!orders) return

    // Parallel processing
    await Promise.all(orders.map(order =>
        refreshSingleOrderTracking(order.id, order.resi_number!, order.courier!)
    ))

    revalidatePath('/dashboard/orders')
    return { success: true, count: orders.length }
}
