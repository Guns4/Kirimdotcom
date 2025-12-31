'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { revalidatePath } from 'next/cache'

export const createEscrowTransaction = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Calculate fee (Simple 5%)
        const admin_fee = Number(data.amount) * 0.05

        const { error } = await supabase.from('escrow_transactions').insert({
            buyer_id: user.id,
            ...data,
            admin_fee
        })
        
        if (error) throw error
        return { success: true }
    })
}

export const releaseFunds = async (transactionId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // Only buyer can release funds
        const { data: tx } = await supabase.from('escrow_transactions').select('*').eq('id', transactionId).single()
        if (!tx || tx.buyer_id !== user?.id) throw new Error('Unauthorized')

        const { error } = await supabase.from('escrow_transactions')
            .update({ status: 'COMPLETED' })
            .eq('id', transactionId)

        if (error) throw error
        
        // Here trigger "Add to Vendor Wallet" logic (omitted for MVP)
        revalidatePath('/marketplace/transactions')
        return { success: true }
    })
}
