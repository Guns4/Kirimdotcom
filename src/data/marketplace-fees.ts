export interface MarketplacePlatform {
    id: string
    name: string
    tiers: {
        id: string
        name: string
        adminFee: number // in percentage (e.g., 4.7 for 4.7%)
        paymentFee: number // in percentage (e.g., 1.7 for 1.7% payment processing)
        freeShippingFee?: number // if user participates in free shipping program
    }[]
}

export const MARKETPLACE_FEES: MarketplacePlatform[] = [
    {
        id: 'shopee',
        name: 'Shopee',
        tiers: [
            {
                id: 'non-star',
                name: 'Non-Star (Regular)',
                adminFee: 4.0,
                paymentFee: 1.0,
                freeShippingFee: 4.0
            },
            {
                id: 'star',
                name: 'Star Seller / Star+',
                adminFee: 4.7,
                paymentFee: 1.0,
                freeShippingFee: 4.0
            },
            {
                id: 'mall',
                name: 'Shopee Mall',
                adminFee: 6.5,
                paymentFee: 1.0,
                freeShippingFee: 4.0
            }
        ]
    },
    {
        id: 'tokopedia',
        name: 'Tokopedia',
        tiers: [
            {
                id: 'regular',
                name: 'Regular Merchant',
                adminFee: 3.8,
                paymentFee: 1.0,
                freeShippingFee: 3.0
            },
            {
                id: 'power',
                name: 'Power Merchant',
                adminFee: 4.5,
                paymentFee: 1.0,
                freeShippingFee: 4.0
            },
            {
                id: 'power-pro',
                name: 'Power Merchant Pro',
                adminFee: 4.5, // Similar to Power but different benefits
                paymentFee: 1.0,
                freeShippingFee: 4.0
            }
        ]
    },
    {
        id: 'tiktok',
        name: 'TikTok Shop',
        tiers: [
            {
                id: 'regular',
                name: 'Regular Seller',
                adminFee: 4.0, // Base commission + 2000 fixed usually, simplifying to % + fixed logic handled in component if needed
                paymentFee: 1.0,
                freeShippingFee: 3.0
            },
            {
                id: 'mall',
                name: 'Official Store',
                adminFee: 6.0,
                paymentFee: 1.0,
                freeShippingFee: 3.0
            }
        ]
    },
    {
        id: 'lazada',
        name: 'Lazada',
        tiers: [
            {
                id: 'regular',
                name: 'Regular Seller',
                adminFee: 3.5,
                paymentFee: 1.0,
                freeShippingFee: 3.0
            },
            {
                id: 'lazmall',
                name: 'LazMall',
                adminFee: 5.0,
                paymentFee: 1.0,
                freeShippingFee: 3.0
            }
        ]
    }
]
