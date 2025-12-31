import { createClient } from '@/utils/supabase/server';
import { getTierMarkup } from '@/lib/tier-pricing';

interface Rate {
    id: string;
    courier: string;
    service: string;
    cost: number;
    label: string;
}

export async function applyMarkup(rates: Rate[], userId: string): Promise<Rate[]> {
    const supabase = createClient();

    const globalMarkup = await getTierMarkup(userId);

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
