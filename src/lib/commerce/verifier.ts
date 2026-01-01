import { IDR } from '@/lib/utils/money';

// Live Price Verifier - Prevents selling at loss due to vendor price changes

async function getVendorLivePrice(sku: string, params: any): Promise<number> {
    // TODO: Integrate with real vendor APIs (JNE, Telkomsel, etc.)
    // For now, mock implementation
    return 15000;
}

export async function verifyTransactionIntegrity(
    sku: string,
    userPrice: number,
    params: any
): Promise<{ safe: boolean; newPrice?: number; diff?: number }> {

    console.log(`[PRICE VERIFIER] Checking integrity for ${sku}...`);

    // 1. Get live vendor price
    const vendorPrice = await getVendorLivePrice(sku, params);

    // 2. Add our margin (should match admin panel settings)
    const myMargin = 1000; // TODO: Fetch from database
    const requiredSellingPrice = new IDR(vendorPrice)
        .addMarginFixed(myMargin)
        .value();

    // 3. Compare with user's payment amount
    if (userPrice < requiredSellingPrice) {
        const loss = requiredSellingPrice - userPrice;
        console.error(`[PRICE VERIFIER] SLIP DETECTED! Loss: Rp ${loss}`);

        return {
            safe: false,
            newPrice: requiredSellingPrice,
            diff: loss
        };
    }

    return { safe: true };
}

// Usage in payment API:
// const check = await verifyTransactionIntegrity(sku, amount, {});
// if (!check.safe) {
//   return error("Price changed, please refresh");
// }
