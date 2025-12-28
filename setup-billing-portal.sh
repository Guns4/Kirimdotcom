#!/bin/bash

# =============================================================================
# Setup Billing Portal (Phase 97)
# Customer Self-Service & Invoices
# =============================================================================

echo "Setting up Billing Portal..."
echo "================================================="
echo ""

# 1. Page Structure
echo "1. Creating Page: src/app/settings/billing/page.tsx"
mkdir -p src/app/settings/billing
mkdir -p src/components/billing

cat <<EOF > src/app/settings/billing/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InvoiceList from '@/components/billing/InvoiceList';
import PlanSwitcher from '@/components/billing/PlanSwitcher';
import { CreditCard, History, Package } from 'lucide-react';

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Current Subscription
    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .single();
        
    const planName = sub?.subscription_plans?.name || 'Free Plan';
    const status = sub?.status || 'Active';

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
            
            <div className="grid gap-6">
                {/* Current Plan */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package className="w-24 h-24" />
                    </div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        Current Plan
                    </h2>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{planName}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                    {status}
                                </span>
                                <span className="text-sm text-gray-500">Renews on {sub?.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                        <PlanSwitcher currentPlanId={sub?.plan_id} />
                    </div>
                </div>

                {/* Payment Methods (Placeholder) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Payment Method
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gray-300 rounded overflow-hidden relative">
                                {/* Visa style */}
                                <div className="absolute top-1 right-1 w-2 h-2 bg-white/50 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Visa ending in 4242</p>
                                <p className="text-xs text-gray-500">Expires 12/28</p>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Update</button>
                    </div>
                </div>

                {/* Invoice History */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        Invoice History
                    </h2>
                    <InvoiceList userId={user.id} />
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [✓] Page created."
echo ""

# 2. Components
echo "2. Creating Components..."

# InvoiceList Component
cat <<EOF > src/components/billing/InvoiceList.tsx
'use client';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateInvoicePDF } from '@/lib/invoice-generator';

// Mock data generator for MVP
function getMockInvoices() {
    return [
        { id: 'INV-001', date: '2025-10-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
        { id: 'INV-002', date: '2025-11-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
        { id: 'INV-003', date: '2025-12-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
    ];
}

export default function InvoiceList({ userId }: { userId: string }) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setInvoices(getMockInvoices());
            setLoading(false);
        }, 500);
    }, []);

    const handleDownload = (invoice: any) => {
        generateInvoicePDF(invoice);
    };

    if (loading) return <div className="py-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {inv.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {inv.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => handleDownload(inv)}
                                    className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 ml-auto"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
EOF

# PlanSwitcher Component
cat <<EOF > src/components/billing/PlanSwitcher.tsx
'use client';

export default function PlanSwitcher({ currentPlanId }: { currentPlanId?: string }) {
    return (
        <div className="flex gap-3">
             {currentPlanId !== 'business' && (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Upgrade Plan
                </button>
             )}
             {currentPlanId !== 'free' && (
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Downgrade
                </button>
             )}
        </div>
    )
}
EOF

# 3. PDF Generator Lib
echo "3. Creating Library: src/lib/invoice-generator.ts"

cat <<EOF > src/lib/invoice-generator.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Fix TS types for autotable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number };
        autoTable: (options: any) => void;
    }
}

export function generateInvoicePDF(invoice: any) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', 160, 20);

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('CekKirim.com', 14, 20);
    doc.text('Jakarta, Indonesia', 14, 26);
    doc.text('support@cekkirim.com', 14, 32);

    // Invoice Details
    doc.text(\`Invoice #: \${invoice.id}\`, 160, 30);
    doc.text(\`Date: \${invoice.date}\`, 160, 36);

    // Customer (Generic)
    doc.text('Bill To:', 14, 45);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Valued Customer', 14, 52);

    // Table
    doc.autoTable({
        startY: 60,
        head: [['Description', 'Period', 'Amount']],
        body: [
            [\`Subscription - \${invoice.plan}\`, '1 Month', \`Rp \${invoice.amount.toLocaleString()}\`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Total:', 140, finalY);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(\`Rp \${invoice.amount.toLocaleString()}\`, 170, finalY);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business.', 14, 280);

    // Save
    doc.save(\`Invoice-\${invoice.id}.pdf\`);
}
EOF

echo "================================================="
echo "Setup Complete!"
echo "Check /settings/billing to see the portal."
