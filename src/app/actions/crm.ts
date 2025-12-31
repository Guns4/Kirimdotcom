'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const CustomerSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    tags: z.array(z.string()).optional()
})

export const getCustomers = async (query = '') => {
    const supabase = await createClient()
    let q = supabase.from('customers').select('*').order('total_spend', { ascending: false })
    
    if (query) {
        q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    }
    
    const { data } = await q
    return data || []
}

export const upsertCustomerFromOrder = async (orderData: { name: string, phone: string, total: number }) => {
    // This is a helper to run when an Order is completed
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Simply check by phone (simplified logic)
    const { data: existing } = await supabase
        .from('customers')
        .select('id, total_spend, orders_count')
        .eq('user_id', user.id)
        .eq('phone', orderData.phone)
        .single()

    if (existing) {
        await supabase.from('customers').update({
            total_spend: (existing.total_spend || 0) + orderData.total,
            orders_count: (existing.orders_count || 0) + 1,
            last_order_at: new Date().toISOString()
        }).eq('id', existing.id)
    } else {
        await supabase.from('customers').insert({
            user_id: user.id,
            name: orderData.name,
            phone: orderData.phone,
            total_spend: orderData.total,
            orders_count: 1,
            last_order_at: new Date().toISOString()
        })
    }
}

export const addCustomer = async (data: z.infer<typeof CustomerSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')
        
        const { error } = await supabase.from('customers').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        revalidatePath('/dashboard/customers')
        return { success: true }
    })
}
