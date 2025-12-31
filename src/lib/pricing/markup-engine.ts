import { createClient } from '@/utils/supabase/server';

interface Rate {
    id: string;
    courier: string;
    service: string;
    cost: number;
    label: string;
}

export async function applyMarkup(rates: Rate[], userId: string): Promise<Rate[]> {
    const supabase = createClient();

    // 1. Fetch Global/User Rules
    // Simplified: Just getting ALL_USERS rules for MVP
    const { data: rules } = await supabase
        .from('markup_rules')
        .select('*')
        .eq('is_active', true)
        .or(`user_level.eq.ALL_USERS`);

    const globalMarkup = rules?.find(r => r.courier === 'ALL')?.amount_rp || 0;

    // 2. Apply to Rates
    return rates.map(rate => {
        let finalCost = rate.cost;

        // Add Global Markup (Platform Profit)
        finalCost += globalMarkup;

        // Add Seller Markup (e.g. from User Settings - fetched separately in real app)
        const sellerMarkup = 1000; // Mocked sender setting
        finalCost += sellerMarkup;

        // 3. Label Engineering (Psychology)
        let newLabel = rate.label;
        if (rate.courier === 'JNE' && rate.service === 'REG') {
            newLabel = 'JNE REG (Termasuk Asuransi)';
        }

        return {
            ...rate,
            cost: finalCost,
            label: newLabel
        };
    });
}
