import { createClient } from '@/utils/supabase/server';
import suppliers from '@/config/supplier-partners.json';

interface OrderDetails {
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    userAddress: string;
    sellPrice: number; // e.g. 10000
}

export async function processDropshipOrder(order: OrderDetails) {
    const supabase = await createClient();

    // 1. Identify Supplier
    const supplier = (suppliers as any)[order.category];
    if (!supplier) {
        console.warn(`No supplier found for category ${order.category}. Processing as internal stock.`);
        return;
    }

    // 2. Calculate Split (Profit Locking)
    // Example: Sell 10k. Cost 9k (0.9 multiplier). Profit 1k.
    const costPrice = order.sellPrice * supplier.base_cost_multiplier;
    const profit = order.sellPrice - costPrice;

    console.log(`[DROPSHIP] Processing ${order.productName}`);
    console.log(`[FINANCE] Sell: ${order.sellPrice}, Cost: ${costPrice}, Profit: ${profit}`);

    // 3. Record Profit to Application Revenue Wallet
    // Assuming 'ledger_entries' has a NULL user_id for System Wallet or a specific UUID const
    await supabase.from('ledger_entries').insert({
        user_id: null, // System Wallet
        amount: profit,
        type: 'REVENUE_DROPSHIP',
        description: `Profit from ${order.productName} (Order to ${supplier.name})`,
        reference_id: order.productId
    });

    // 4. Generate PO (Mock)
    const poNumber = `PO-${Date.now()}`;
    await generatePurchaseOrder(poNumber, order, supplier);

    // 5. Notify Supplier (Mock Email/WA)
    await notifySupplier(poNumber, order, supplier);
}

async function generatePurchaseOrder(po: string, order: OrderDetails, supplier: any) {
    // Generate PDF Logic would go here (pdfmake / jspdf)
    console.log(`[PO GENERATED] ${po} for ${supplier.name}`);
    console.log(`   Item: ${order.productName} x${order.quantity}`);
    console.log(`   Ship To: ${order.userAddress}`);
}

async function notifySupplier(po: string, order: OrderDetails, supplier: any) {
    const message = `Halo ${supplier.name}, Mohon kirim ${order.productName} (x${order.quantity}) ke ${order.userAddress}. PO: ${po} terlampir.`;
    console.log(`[EMAIL SENT] To: ${supplier.email} | Body: ${message}`);
    console.log(`[WA SENT] To: ${supplier.whatsapp} | Body: ${message}`);
}
