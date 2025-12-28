import restrictedItems from '@/data/restricted-items.json';

export type ShippingMode = 'air' | 'land' | 'sea';

export interface ValidationResult {
    status: 'safe' | 'warning' | 'danger';
    message: string;
    couriers: string[];
}

interface Rule {
    keywords: string[];
    status: string;
    message: string;
    couriers: string[];
}

export function validateGoods(item: string, mode: ShippingMode = 'air'): ValidationResult {
    const lowerItem = item.toLowerCase();
    const rules = restrictedItems as Rule[];

    // Iterate through JSON configuration
    for (const rule of rules) {
        // Check if any keyword matches
        if (rule.keywords.some(keyword => lowerItem.includes(keyword))) {

            // Contextual override: Danger items might be okay via LAND
            if (rule.status === 'danger' && mode !== 'air') {
                return {
                    status: 'warning',
                    message: `⚠️ Boleh via ${mode === 'land' ? 'Darat' : 'Laut'}, tapi wajib packing extra aman.`,
                    couriers: rule.couriers
                };
            }

            return {
                status: rule.status as 'safe' | 'warning' | 'danger',
                message: rule.message,
                couriers: rule.couriers
            };
        }
    }

    // Default Safe
    return {
        status: 'safe',
        message: '✅ Barang ini aman dikirim via semua jalur (selama packing standar).',
        couriers: ['JNE', 'J&T', 'SiCepat', 'Anteraja', 'ID Express']
    };
}
