'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

export const getInternationalShipment = async (orderId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Get order details
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single()

        if (!order) throw new Error('Order not found')

        // Format for CN23
        return {
            sender: {
                name: user.email || 'Seller Name',
                address: 'Jl. Example 123',
                city: 'Jakarta',
                country: 'Indonesia',
                postal_code: '12345'
            },
            receiver: {
                name: order.customer_name,
                address: order.shipping_address || 'Unknown',
                city: order.destination_city || 'Unknown',
                country: order.destination_country || 'Unknown',
                postal_code: order.destination_postal || '00000'
            },
            items: [
                {
                    description: order.product_name || 'Item',
                    quantity: order.quantity || 1,
                    weight: order.weight || 0.5,
                    value: order.total_amount || 100,
                    hs_code: order.hs_code || '0000.00',
                    origin_country: 'Indonesia'
                }
            ],
            total_weight: order.weight || 0.5,
            total_value: order.total_amount || 100
        }
    })
}
