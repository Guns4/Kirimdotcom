'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { siteConfig } from '@/config/site';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: siteConfig.theme.primary[600],
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colDesc: { width: '50%', paddingLeft: 5 },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right', paddingRight: 5 },
  text: { fontSize: 10, lineHeight: 1.5 },
  bold: { fontSize: 10, fontWeight: 'bold' },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
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
          <Text style={styles.text}>
            {new Date(invoice.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={[styles.section, { marginTop: 20 }]}>
        <Text style={[styles.bold, { color: '#666', marginBottom: 4 }]}>
          BILL TO:
        </Text>
        <Text style={styles.bold}>{invoice.customer_name}</Text>
        {invoice.customer_email && (
          <Text style={styles.text}>{invoice.customer_email}</Text>
        )}
        {invoice.customer_address && (
          <Text style={styles.text}>{invoice.customer_address}</Text>
        )}
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 5,
            }}
          >
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
