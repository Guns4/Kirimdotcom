#!/bin/bash

# Setup International Shipping Label & Customs Declaration (CN23 Form)
echo "🚀 Setting up Customs Documentation Generator..."

# 1. Install PDF Generation Library
echo "📦 Installing dependencies..."
# @react-pdf/renderer already installed from invoices module

# 2. Create CN23 Form Template
echo "📄 Creating CN23 Form Generator..."
mkdir -p src/lib/customs
cat << 'EOF' > src/lib/customs/cn23-template.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 9, fontFamily: 'Helvetica' },
    header: { textAlign: 'center', marginBottom: 10, borderBottom: '1px solid black', paddingBottom: 5 },
    title: { fontSize: 14, fontWeight: 'bold' },
    section: { marginBottom: 8 },
    row: { flexDirection: 'row', borderBottom: '1px solid #ddd', paddingVertical: 3 },
    col: { flex: 1, paddingHorizontal: 3 },
    bold: { fontWeight: 'bold' },
    table: { border: '1px solid black', marginTop: 5 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: '1px solid black', padding: 3 },
    tableRow: { flexDirection: 'row', borderBottom: '1px solid #ddd', padding: 3 },
    checkbox: { width: 10, height: 10, border: '1px solid black', marginRight: 3 }
})

export const CN23Form = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>CUSTOMS DECLARATION CN23</Text>
                <Text style={{ fontSize: 8 }}>Declaration en douane / Customs Declaration</Text>
            </View>

            {/* Sender Info */}
            <View style={styles.section}>
                <Text style={styles.bold}>FROM / EXPEDITEUR:</Text>
                <Text>{data.sender.name}</Text>
                <Text>{data.sender.address}</Text>
                <Text>{data.sender.city}, {data.sender.country} {data.sender.postal_code}</Text>
            </View>

            {/* Receiver Info */}
            <View style={styles.section}>
                <Text style={styles.bold}>TO / DESTINATAIRE:</Text>
                <Text>{data.receiver.name}</Text>
                <Text>{data.receiver.address}</Text>
                <Text>{data.receiver.city}, {data.receiver.country} {data.receiver.postal_code}</Text>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.col, { flex: 3 }]}>Description</Text>
                    <Text style={styles.col}>Qty</Text>
                    <Text style={styles.col}>Weight(kg)</Text>
                    <Text style={styles.col}>Value(USD)</Text>
                    <Text style={[styles.col, { flex: 2 }]}>HS Code</Text>
                    <Text style={[styles.col, { flex: 2 }]}>Origin</Text>
                </View>

                {data.items.map((item: any, i: number) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.col, { flex: 3 }]}>{item.description}</Text>
                        <Text style={styles.col}>{item.quantity}</Text>
                        <Text style={styles.col}>{item.weight}</Text>
                        <Text style={styles.col}>{item.value}</Text>
                        <Text style={[styles.col, { flex: 2 }]}>{item.hs_code}</Text>
                        <Text style={[styles.col, { flex: 2 }]}>{item.origin_country}</Text>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={[styles.row, { marginTop: 5, borderTop: '2px solid black' }]}>
                <Text style={[styles.col, styles.bold, { flex: 4 }]}>TOTAL</Text>
                <Text style={[styles.col, styles.bold]}>{data.total_weight} kg</Text>
                <Text style={[styles.col, styles.bold, { flex: 3 }]}>${data.total_value}</Text>
            </View>

            {/* Content Type */}
            <View style={[styles.section, { marginTop: 10 }]}>
                <Text style={styles.bold}>Type of shipment / Nature de l'envoi:</Text>
                <View style={{ flexDirection: 'row', gap: 15, marginTop: 3 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.checkbox} />
                        <Text>Gift / Cadeau</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.checkbox} />
                        <Text>Commercial Sample / Echantillon commercial</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.checkbox} />
                        <Text>Documents</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.checkbox, { backgroundColor: 'black' }]} />
                        <Text>Sale of goods / Merchandise</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.checkbox} />
                        <Text>Returned goods / Retour</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.checkbox} />
                        <Text>Other / Autre</Text>
                    </View>
                </View>
            </View>

            {/* Signature */}
            <View style={[styles.section, { marginTop: 15 }]}>
                <Text style={styles.bold}>I certify that the particulars given in this declaration are correct.</Text>
                <Text style={{ fontSize: 8, marginTop: 2 }}>Je certifie l'exactitude des indications portees sur la presente declaration.</Text>
                
                <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                    <View>
                        <Text>Date: {new Date().toLocaleDateString()}</Text>
                    </View>
                    <View>
                        <Text>Signature: _____________________</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={{ position: 'absolute', bottom: 10, left: 20, right: 20 }}>
                <Text style={{ fontSize: 7, textAlign: 'center', color: '#666' }}>
                    Generated by CekKirim.com - International Shipping Assistant
                </Text>
            </View>
        </Page>
    </Document>
)
EOF

# 3. Create Server Action
echo "⚡ Creating Customs Doc Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/customs.ts
'use server'

import { safeAction } from '@/lib/safe-action'
import { createClient } from '@/utils/supabase/server'

export const getInternationalShipment = async (orderId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // Get order details
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single()

        if (!order) throw new Error('Order not found')

        // Format for CN23
        return {
            sender: {
                name: user.email || 'Seller Name',
                address: 'Jl. Example 123',
                city: 'Jakarta',
                country: 'Indonesia',
                postal_code: '12345'
            },
            receiver: {
                name: order.customer_name,
                address: order.shipping_address || 'Unknown',
                city: order.destination_city || 'Unknown',
                country: order.destination_country || 'Unknown',
                postal_code: order.destination_postal || '00000'
            },
            items: [
                {
                    description: order.product_name || 'Item',
                    quantity: order.quantity || 1,
                    weight: order.weight || 0.5,
                    value: order.total_amount || 100,
                    hs_code: order.hs_code || '0000.00',
                    origin_country: 'Indonesia'
                }
            ],
            total_weight: order.weight || 0.5,
            total_value: order.total_amount || 100
        }
    })
}
EOF

# 4. Create UI Component
echo "🎨 Creating CN23 Generator UI..."
mkdir -p src/components/customs
cat << 'EOF' > src/components/customs/CN23Generator.tsx
'use client'

import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import { CN23Form } from '@/lib/customs/cn23-template'
import { getInternationalShipment } from '@/app/actions/customs'
import { toast } from 'sonner'

export function CN23Generator({ orderId }: { orderId: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await getInternationalShipment(orderId)
            if (result?.data) {
                setData(result.data)
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load shipment data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CN23 Customs Declaration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!data ? (
                    <Button onClick={loadData} disabled={loading} className="w-full">
                        {loading ? 'Loading...' : 'Generate CN23 Form'}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700 font-medium">CN23 Form Ready!</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Destination: {data.receiver.country}
                            </p>
                        </div>

                        <PDFDownloadLink
                            document={<CN23Form data={data} />}
                            fileName={`CN23_${orderId}.pdf`}
                            className="w-full"
                        >
                            {({ loading: pdfLoading }) => (
                                <Button className="w-full gap-2" disabled={pdfLoading}>
                                    <Download className="w-4 h-4" />
                                    {pdfLoading ? 'Generating PDF...' : 'Download CN23 (PDF)'}
                                </Button>
                            )}
                        </PDFDownloadLink>

                        <p className="text-xs text-muted-foreground text-center">
                            Lampirkan form ini pada paket internasional Anda
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
EOF

echo "✅ Customs Documentation Setup Complete!"
echo "📋 Seller dapat generate CN23 form otomatis untuk pengiriman internasional!"
