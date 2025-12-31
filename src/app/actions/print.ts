'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

export const getReceiptData = async (orderId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single()

        if (!order) throw new Error('Order not found')

        return {
            trackingNumber: order.tracking_number,
            sender: user.email || 'Unknown',
            receiver: order.customer_name,
            address: order.shipping_address,
            weight: `${order.weight || 0} kg`,
            service: order.courier || 'Standard'
        }
    })
}
