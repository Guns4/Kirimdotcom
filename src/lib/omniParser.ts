'use client';

import * as XLSX from 'xlsx';

export interface ColumnMapping {
    orderId?: string;
    orderDate?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    productName?: string;
    productQty?: string;
    productPrice?: string;
    total?: string;
    courier?: string;
    awb?: string;
}

export interface ParsedOrder {
    sourceOrderId: string;
    orderNumber: string;
    orderDate?: Date;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    products?: { name: string; qty: number; price: number }[];
    totalAmount: number;
    courier?: string;
    awb?: string;
    rawData: Record<string, any>;
}

// Column name patterns for each marketplace
const COLUMN_PATTERNS: Record<string, RegExp[]> = {
    orderId: [
        /no\.?\s*pesanan/i,
        /order\s*id/i,
        /nomor\s*invoice/i,
        /invoice/i,
        /order_sn/i,
    ],
    orderDate: [
        /waktu\s*pesanan/i,
        /tanggal\s*(pembayaran|order|pesanan)/i,
        /order\s*date/i,
        /created?\s*(time|at)/i,
    ],
    customerName: [
        /nama\s*(pembeli|penerima)/i,
        /buyer\s*name/i,
        /recipient/i,
        /customer\s*name/i,
    ],
    customerPhone: [
        /no\.?\s*(telepon|hp|telp)/i,
        /phone/i,
        /telepon/i,
    ],
    customerAddress: [
        /alamat\s*(pengiriman|penerima|lengkap)?/i,
        /shipping\s*address/i,
        /address/i,
    ],
    productName: [
        /nama\s*(produk|barang)/i,
        /product\s*name/i,
        /item\s*name/i,
        /sku\s*name/i,
    ],
    productQty: [
        /jumlah(\s*produk)?/i,
        /quantity/i,
        /qty/i,
    ],
    productPrice: [
        /harga\s*(awal|jual)?/i,
        /price/i,
        /unit\s*price/i,
    ],
    total: [
        /total\s*(harga|amount|bayar)?/i,
        /grand\s*total/i,
        /order\s*amount/i,
    ],
    courier: [
        /kurir/i,
        /courier/i,
        /ekspedisi/i,
        /shipping\s*(option|provider)/i,
        /opsi\s*pengiriman/i,
    ],
    awb: [
        /no\.?\s*resi/i,
        /awb/i,
        /tracking\s*(number|id|code)?/i,
        /kode\s*booking/i,
    ],
};

/**
 * Detect marketplace source from file content
 */
export function detectMarketplace(headers: string[]): string {
    const headerStr = headers.join(' ').toLowerCase();

    if (headerStr.includes('tokopedia') || headerStr.includes('invoice')) {
        return 'tokopedia';
    }
    if (headerStr.includes('shopee') || headerStr.includes('order_sn')) {
        return 'shopee';
    }
    if (headerStr.includes('tiktok') || headerStr.includes('sku unit')) {
        return 'tiktok';
    }
    if (headerStr.includes('lazada') || headerStr.includes('seller sku')) {
        return 'lazada';
    }

    return 'unknown';
}

/**
 * Auto-detect column mapping from headers
 */
export function autoDetectColumns(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};

    for (const header of headers) {
        for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(header)) {
                    mapping[field as keyof ColumnMapping] = header;
                    break;
                }
            }
        }
    }

    return mapping;
}

/**
 * Parse Excel/CSV file
 */
export function parseFile(file: File): Promise<{
    headers: string[];
    rows: Record<string, any>[];
    source: string;
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                if (jsonData.length < 2) {
                    reject(new Error('File is empty or has no data rows'));
                    return;
                }

                // First row is headers
                const headers = jsonData[0].map((h: any) => String(h || '').trim());

                // Rest are data rows
                const rows = jsonData.slice(1).map((row) => {
                    const obj: Record<string, any> = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                }).filter((row) => Object.values(row).some((v) => v !== undefined && v !== ''));

                // Detect source
                const source = detectMarketplace(headers);

                resolve({ headers, rows, source });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Map rows to orders using column mapping
 */
export function mapRowsToOrders(
    rows: Record<string, any>[],
    mapping: ColumnMapping,
    source: string
): ParsedOrder[] {
    const orders: ParsedOrder[] = [];

    for (const row of rows) {
        const orderId = row[mapping.orderId || ''];
        if (!orderId) continue; // Skip rows without order ID

        // Parse total amount
        let total = 0;
        if (mapping.total && row[mapping.total]) {
            const totalStr = String(row[mapping.total]).replace(/[^\d.-]/g, '');
            total = parseFloat(totalStr) || 0;
        }

        // Parse date
        let orderDate: Date | undefined;
        if (mapping.orderDate && row[mapping.orderDate]) {
            const dateVal = row[mapping.orderDate];
            if (typeof dateVal === 'number') {
                // Excel serial date
                orderDate = XLSX.SSF.parse_date_code(dateVal);
            } else {
                orderDate = new Date(dateVal);
            }
        }

        // Parse product
        const products: { name: string; qty: number; price: number }[] = [];
        if (mapping.productName && row[mapping.productName]) {
            products.push({
                name: String(row[mapping.productName] || ''),
                qty: parseInt(row[mapping.productQty || '']) || 1,
                price: parseFloat(String(row[mapping.productPrice || '']).replace(/[^\d.-]/g, '')) || 0,
            });
        }

        orders.push({
            sourceOrderId: String(orderId),
            orderNumber: String(orderId),
            orderDate: orderDate instanceof Date && !isNaN(orderDate.getTime()) ? orderDate : undefined,
            customerName: row[mapping.customerName || ''] ? String(row[mapping.customerName || '']) : undefined,
            customerPhone: row[mapping.customerPhone || ''] ? String(row[mapping.customerPhone || '']) : undefined,
            customerAddress: row[mapping.customerAddress || ''] ? String(row[mapping.customerAddress || '']) : undefined,
            products,
            totalAmount: total,
            courier: row[mapping.courier || ''] ? String(row[mapping.courier || '']) : undefined,
            awb: row[mapping.awb || ''] ? String(row[mapping.awb || '']) : undefined,
            rawData: row,
        });
    }

    return orders;
}

/**
 * Clean phone number to Indonesian format
 */
export function cleanPhoneNumber(phone?: string): string | undefined {
    if (!phone) return undefined;

    let cleaned = String(phone).replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}
