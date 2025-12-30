#!/bin/bash

# =============================================================================
# Supply Chain: Dropship Automation Setup
# =============================================================================

echo "Initializing Dropship Automation..."
echo "================================================="

# 1. Supplier Config
echo "1. Creating Config: src/config/supplier-partners.json"
mkdir -p src/config

cat <<EOF > src/config/supplier-partners.json
{
  "lakban": {
    "name": "Mitra Packindo",
    "email": "orders@mitrapackindo.com",
    "whatsapp": "6281234567890",
    "base_cost_multiplier": 0.9
  },
  "plastik": {
    "name": "Plastik Jaya Abadi",
    "email": "sales@plastikjaya.com",
    "whatsapp": "6289876543210",
    "base_cost_multiplier": 0.85
  },
  "printer": {
    "name": "Tekno Print Solusi",
    "email": "orders@teknoprint.com",
    "whatsapp": "6281122334455",
    "base_cost_multiplier": 0.92
  }
}
EOF

# 2. Logic (API Update / Extension)
# We will create a helper utility to handle the dropship logic called by the checkout API
echo "2. Creating Logic: src/lib/dropship-engine.ts"

cat <<EOF > src/lib/dropship-engine.ts
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
        console.warn(\`No supplier found for category \${order.category}. Processing as internal stock.\`);
        return;
    }

    // 2. Calculate Split (Profit Locking)
    // Example: Sell 10k. Cost 9k (0.9 multiplier). Profit 1k.
    const costPrice = order.sellPrice * supplier.base_cost_multiplier;
    const profit = order.sellPrice - costPrice;

    console.log(\`[DROPSHIP] Processing \${order.productName}\`);
    console.log(\`[FINANCE] Sell: \${order.sellPrice}, Cost: \${costPrice}, Profit: \${profit}\`);

    // 3. Record Profit to Application Revenue Wallet
    await supabase.from('ledger_entries').insert({
        user_id: null, // System Wallet
        amount: profit,
        type: 'REVENUE_DROPSHIP',
        description: \`Profit from \${order.productName} (Order to \${supplier.name})\`
    });

    // 4. Generate PO (Mock)
    const poNumber = \`PO-\${Date.now()}\`;
    await generatePurchaseOrder(poNumber, order, supplier);

    // 5. Notify Supplier (Mock Email/WA)
    await notifySupplier(poNumber, order, supplier);
}

async function generatePurchaseOrder(po: string, order: OrderDetails, supplier: any) {
    // Generate PDF Logic would go here (pdfmake / jspdf)
    console.log(\`[PO GENERATED] \${po} for \${supplier.name}\`);
    console.log(\`   Item: \${order.productName} x\${order.quantity}\`);
    console.log(\`   Ship To: \${order.userAddress}\`);
}

async function notifySupplier(po: string, order: OrderDetails, supplier: any) {
    const message = \`Halo \${supplier.name}, Mohon kirim \${order.productName} (x\${order.quantity}) ke \${order.userAddress}. PO: \${po} terlampir.\`;
    console.log(\`[EMAIL SENT] To: \${supplier.email} | Body: \${message}\`);
    console.log(\`[WA SENT] To: \${supplier.whatsapp} | Body: \${message}\`);
}
EOF

echo ""
echo "================================================="
echo "Dropship Automation Setup Complete!"
echo "Integration: Call 'processDropshipOrder()' in your checkout API."
