'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const ExpenseSchema = z.object({
    description: z.string().min(1),
    amount: z.number().min(1),
    category: z.enum(['Operational', 'Marketing', 'Salary', 'Other']),
    date: z.string() // ISO Date YYYY-MM-DD
})

export const getExpenses = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    return data || []
}

export const createExpense = async (data: z.infer<typeof ExpenseSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('expenses').insert({
            user_id: user.id,
            ...data
        })

        if (error) throw error
        revalidatePath('/dashboard/expenses')
        return { success: true }
    })
}

export const deleteExpense = async (id: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/expenses')
        return { success: true }
    })
}
