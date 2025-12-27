#!/bin/bash

# Setup Invoice Module
echo "🚀 Setting up Invoice Generator Module..."

# 1. Install Dependencies
echo "📦 Installing dependencies..."
npm install @react-pdf/renderer

# 2. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_invoices.sql
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    items JSONB NOT NULL, -- Array of {description, quantity, price}
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE', 'VOID')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = user_id);
EOF

# 3. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/invoices.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const InvoiceItemSchema = z.object({
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
})

const CreateInvoiceSchema = z.object({
    invoice_number: z.string().min(1),
    customer_name: z.string().min(1),
    customer_email: z.string().email().optional().or(z.literal('')),
    customer_address: z.string().optional(),
    items: z.array(InvoiceItemSchema),
    due_date: z.string().optional(), // ISO String
})

export const createInvoice = async (data: z.infer<typeof CreateInvoiceSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error('Unauthorized')

        // Calculate total
        const total_amount = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

        const { error } = await supabase.from('invoices').insert({
            user_id: user.id,
            ...data,
            total_amount,
            status: 'UNPAID'
        })

        if (error) throw error

        revalidatePath('/dashboard/invoices')
        return { success: true }
    })
}

export const getInvoices = async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })
    return data || []
}

export const deleteInvoice = async (id: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { error } = await supabase.from('invoices').delete().eq('id', id)
        if (error) throw error
        revalidatePath('/dashboard/invoices')
        return { success: true }
    })
}
EOF

# 4. Create UI Components
echo "🎨 Creating UI Components..."
mkdir -p src/components/invoices

# 4.1 Invoice PDF Template
cat << 'EOF' > src/components/invoices/InvoiceTemplate.tsx
'use client'

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { siteConfig } from '@/config/site'

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    logo: { fontSize: 24, fontWeight: 'bold', color: siteConfig.theme.primary[600] },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    section: { marginBottom: 10 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 5 },
    headerRow: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    colDesc: { width: '50%', paddingLeft: 5 },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', paddingRight: 5 },
    text: { fontSize: 10, lineHeight: 1.5 },
    bold: { fontSize: 10, fontWeight: 'bold' },
    totalSection: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
    footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#666' }
});

export const InvoiceTemplate = ({ invoice }: { invoice: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logo}>{siteConfig.name}</Text>
                    <Text style={styles.text}>{siteConfig.url}</Text>
                    <Text style={styles.text}>Email: {siteConfig.links.email}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={styles.text}>#{invoice.invoice_number}</Text>
                    <Text style={styles.text}>{new Date(invoice.created_at).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Client Info */}
            <View style={[styles.section, { marginTop: 20 }]}>
                <Text style={[styles.bold, { color: '#666', marginBottom: 4 }]}>BILL TO:</Text>
                <Text style={styles.bold}>{invoice.customer_name}</Text>
                {invoice.customer_email && <Text style={styles.text}>{invoice.customer_email}</Text>}
                {invoice.customer_address && <Text style={styles.text}>{invoice.customer_address}</Text>}
            </View>

            {/* Table Header */}
            <View style={[styles.headerRow, { marginTop: 20 }]}>
                <Text style={[styles.bold, styles.colDesc]}>Description</Text>
                <Text style={[styles.bold, styles.colQty]}>Qty</Text>
                <Text style={[styles.bold, styles.colPrice]}>Price</Text>
                <Text style={[styles.bold, styles.colTotal]}>Amount</Text>
            </View>

            {/* Table Rows */}
            {invoice.items.map((item: any, i: number) => (
                <View key={i} style={styles.row}>
                    <Text style={[styles.text, styles.colDesc]}>{item.description}</Text>
                    <Text style={[styles.text, styles.colQty]}>{item.quantity}</Text>
                    <Text style={[styles.text, styles.colPrice]}>
                        Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                    <Text style={[styles.text, styles.colTotal]}>
                        Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                    </Text>
                </View>
            ))}

            {/* Total */}
            <View style={styles.totalSection}>
                <View style={{ width: '40%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                        <Text style={styles.bold}>Total:</Text>
                        <Text style={[styles.bold, { fontSize: 12 }]}>
                            Rp {invoice.total_amount.toLocaleString('id-ID')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Thank you for your business. Payment is due within 7 days.
            </Text>
        </Page>
    </Document>
);
EOF

# 4.2 Invoice List & Create Page
mkdir -p src/app/dashboard/invoices
cat << 'EOF' > src/app/dashboard/invoices/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getInvoices, createInvoice, deleteInvoice } from '@/app/actions/invoices'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoiceTemplate } from '@/components/invoices/InvoiceTemplate'
import { Plus, Download, Trash, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Form State (Simplified for demo)
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        customer_name: '',
        items: [{ description: 'Jasa Pengiriman', quantity: 1, price: 0 }]
    })

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        setIsLoading(true)
        const data = await getInvoices()
        setInvoices(data)
        setIsLoading(false)
    }

    const handleSubmit = async () => {
        try {
            const res = await createInvoice(formData)
            if (res.success) {
                toast.success('Invoice created!')
                setIsCreating(false)
                loadInvoices()
            }
        } catch (error) {
            toast.error('Failed to create invoice')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Invoice</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Create Invoice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            placeholder="Invoice Number" 
                            value={formData.invoice_number}
                            onChange={e => setFormData({...formData, invoice_number: e.target.value})}
                        />
                        <Input 
                            placeholder="Customer Name" 
                            value={formData.customer_name}
                            onChange={e => setFormData({...formData, customer_name: e.target.value})}
                        />
                        {/* Simplified Item Input */}
                        <div className="flex gap-2">
                             <Input 
                                placeholder="Description" 
                                value={formData.items[0].description}
                                onChange={e => {
                                    const newItems = [...formData.items]
                                    newItems[0].description = e.target.value
                                    setFormData({...formData, items: newItems})
                                }}
                            />
                            <Input 
                                type="number"
                                placeholder="Price" 
                                value={formData.items[0].price}
                                onChange={e => {
                                    const newItems = [...formData.items]
                                    newItems[0].price = Number(e.target.value)
                                    setFormData({...formData, items: newItems})
                                }}
                            />
                        </div>
                        <Button onClick={handleSubmit}>Save Invoice</Button>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : invoices.length === 0 ? (
                <EmptyState 
                    title="Belum ada Invoice" 
                    description="Buat invoice pertama Anda untuk pelanggan."
                    icon={FileText}
                    action={{ label: "Buat Invoice", onClick: () => setIsCreating(true) }}
                />
            ) : (
                <div className="grid gap-4">
                    {invoices.map((inv) => (
                        <Card key={inv.id} className="flex flex-row items-center justify-between p-4 bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{inv.invoice_number}</h3>
                                    <p className="text-sm text-gray-500">{inv.customer_name} • Rp {Number(inv.total_amount).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Download PDF Button */}
                                <PDFDownloadLink
                                    document={<InvoiceTemplate invoice={inv} />}
                                    fileName={`invoice-${inv.invoice_number}.pdf`}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    {({ blob, url, loading, error }) =>
                                        loading ? 'Loading...' : <><Download className="w-4 h-4" /> PDF</>
                                    }
                                </PDFDownloadLink>
                                
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                        if(confirm('Delete invoice?')) {
                                            await deleteInvoice(inv.id); 
                                            loadInvoices();
                                        }
                                    }}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
EOF

echo "✅ Invoice Module Setup Complete!"
echo "👉 Run: npm run dev to test."
