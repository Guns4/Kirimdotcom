'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const InvoiceItemSchema = z.object({
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
})

const CreateInvoiceSchema = z.object({
    invoice_number: z.string().min(1),
    customer_name: z.string().min(1),
    customer_email: z.string().email().optional().or(z.literal('')),
    customer_address: z.string().optional(),
    items: z.array(InvoiceItemSchema),
    due_date: z.string().optional(), // ISO String
})

export const createInvoice = async (data: z.infer<typeof CreateInvoiceSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Unauthorized')

        // Calculate total
        const total_amount = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

        const { error } = await supabase.from('invoices').insert({
            user_id: user.id,
            ...data,
            total_amount,
            status: 'UNPAID'
        })

        if (error) throw error

        revalidatePath('/dashboard/invoices')
        return { success: true }
    })
}

export const getInvoices = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    return data || []
}

export const deleteInvoice = async (id: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { error } = await supabase.from('invoices').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/invoices')
        return { success: true }
    })
}
