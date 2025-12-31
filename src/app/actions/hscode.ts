'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const searchHSCode = async (query: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        // Search by keywords or description
        const { data } = await supabase
            .from('hs_codes')
            .select('*')
            .or(`keywords.cs.{${query}},description.ilike.%${query}%`)
            .limit(10)

        return data || []
    })
}

export const getHSCodeByCode = async (code: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { data } = await supabase
            .from('hs_codes')
            .select('*')
            .eq('hs_code', code)
            .single()

        return data
    })
}

export const calculateCustomsDuty = async (hsCode: string, productValue: number) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { data: code } = await supabase
            .from('hs_codes')
            .select('*')
            .eq('hs_code', hsCode)
            .single()

        if (!code) throw new Error('HS Code not found')

        const importDuty = (productValue * code.import_duty_percentage) / 100
        const vat = ((productValue + importDuty) * code.vat_percentage) / 100
        const totalDuty = importDuty + vat

        return {
            product_value: productValue,
            import_duty: importDuty,
            import_duty_rate: code.import_duty_percentage,
            vat: vat,
            vat_rate: code.vat_percentage,
            total_duty: totalDuty,
            total_cost: productValue + totalDuty
        }
    })
}
