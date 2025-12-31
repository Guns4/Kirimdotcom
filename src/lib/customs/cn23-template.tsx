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
