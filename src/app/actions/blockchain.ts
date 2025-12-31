'use server'

import { safeAction } from '@/lib/safe-action'
import { blockchainLogger } from '@/lib/blockchain/proof-of-delivery'
import { createClient } from '@/utils/supabase/server'

export const logDeliveryProof = async (trackingNumber: string, status: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Get delivery metadata
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('tracking_number', trackingNumber)
            .single()

        if (!order) throw new Error('Order not found')

        // Log to blockchain
        const result = await blockchainLogger.logDeliveryToBlockchain(
            trackingNumber,
            status,
            {
                recipient: order.customer_name,
                courier: order.courier || 'Unknown',
                deliveredBy: user.email
            }
        )

        // Save blockchain tx hash to database
        await supabase.from('orders').update({
            blockchain_tx_hash: result.txHash,
            blockchain_verified: true
        }).eq('tracking_number', trackingNumber)

        return result
    })
}

export const verifyDeliveryProof = async (trackingNumber: string) => {
    return safeAction(async () => {
        const result = await blockchainLogger.verifyDeliveryOnBlockchain(trackingNumber)
        return result
    })
}
