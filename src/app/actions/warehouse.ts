'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const recordInventoryMovement = async (sku: string, movement: 'IN' | 'OUT') => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 1. Find product by SKU
        const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .eq('sku', sku)
            .single()

        if (!product) {
            throw new Error(`Product with SKU ${sku} not found`)
        }

        // 2. Update stock
        const adjustment = movement === 'IN' ? 1 : -1
        const { error } = await supabase
            .from('products')
            .update({ 
                stock: product.stock + adjustment,
                updated_at: new Date().toISOString()
            })
            .eq('id', product.id)

        if (error) throw error

        // 3. Log movement (optional: create warehouse_movements table)
        
        revalidatePath('/dashboard/warehouse')
        return { success: true, product: product.name, newStock: product.stock + adjustment }
    })
}

export const getWarehouseStats = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { todayIn: 0, todayOut: 0, lowStock: 0 }

    const { data: products } = await supabase
        .from('products')
        .select('stock, min_stock_alert')
        .eq('user_id', user.id)

    const lowStock = products?.filter(p => p.stock <= p.min_stock_alert).length || 0

    return { todayIn: 0, todayOut: 0, lowStock }
}
