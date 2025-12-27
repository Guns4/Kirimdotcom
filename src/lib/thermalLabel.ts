'use client';

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface LabelData {
    // Order info
    orderNumber: string;

    // Sender
    senderName: string;
    senderPhone?: string;
    senderAddress?: string;

    // Recipient
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientCity?: string;
    recipientPostalCode?: string;

    // Shipping
    courier?: string;
    awb?: string;
    weight?: number;

    // Products
    productName?: string;
    quantity?: number;

    // Notes
    notes?: string;
}

const LABEL_WIDTH = 100; // mm
const LABEL_HEIGHT = 150; // mm

/**
 * Generate QR Code as Data URL
 */
async function generateQRCode(text: string): Promise<string> {
    try {
        return await QRCode.toDataURL(text, {
            width: 150,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });
    } catch (error) {
        console.error('QR generation error:', error);
        return '';
    }
}

/**
 * Generate single shipping label PDF
 */
export async function generateLabelPDF(label: LabelData): Promise<jsPDF> {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [LABEL_WIDTH, LABEL_HEIGHT],
    });

    let y = 5;
    const margin = 5;
    const contentWidth = LABEL_WIDTH - margin * 2;

    // ============ HEADER ============
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, LABEL_WIDTH, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING LABEL', LABEL_WIDTH / 2, 10, { align: 'center' });

    y = 20;

    // ============ QR CODE ============
    const trackingUrl = `https://cekkirim.com/track?awb=${label.awb || label.orderNumber}`;
    const qrDataUrl = await generateQRCode(trackingUrl);

    if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', LABEL_WIDTH - 35, y, 30, 30);
    }

    // ============ COURIER & AWB ============
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    if (label.courier) {
        doc.text(label.courier.toUpperCase(), margin, y + 5);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (label.awb) {
        doc.text(`AWB: ${label.awb}`, margin, y + 12);
    }

    doc.text(`Order: ${label.orderNumber}`, margin, y + 18);

    if (label.weight) {
        doc.text(`Berat: ${label.weight} gr`, margin, y + 24);
    }

    y = 55;

    // ============ DIVIDER ============
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, LABEL_WIDTH - margin, y);

    y += 5;

    // ============ RECIPIENT (PENERIMA) ============
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth, 55, 'F');

    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PENERIMA:', margin + 3, y);

    y += 5;
    doc.setFontSize(12);
    doc.text(label.recipientName.toUpperCase(), margin + 3, y);

    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(label.recipientPhone, margin + 3, y);

    y += 5;
    doc.setFontSize(9);

    // Split address into lines
    const addressLines = doc.splitTextToSize(label.recipientAddress, contentWidth - 6);
    addressLines.forEach((line: string) => {
        doc.text(line, margin + 3, y);
        y += 4;
    });

    if (label.recipientCity) {
        doc.text(`${label.recipientCity} ${label.recipientPostalCode || ''}`, margin + 3, y);
        y += 4;
    }

    y = 120;

    // ============ SENDER (PENGIRIM) ============
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PENGIRIM:', margin, y);

    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label.senderName, margin, y);

    if (label.senderPhone) {
        y += 4;
        doc.text(label.senderPhone, margin, y);
    }

    // ============ PRODUCT INFO ============
    if (label.productName) {
        y += 6;
        doc.setFontSize(8);
        doc.text(`Isi: ${label.productName} x${label.quantity || 1}`, margin, y);
    }

    // ============ NOTES ============
    if (label.notes) {
        y += 5;
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Catatan: ${label.notes}`, margin, y);
    }

    // ============ FOOTER ============
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Scan QR untuk lacak paket - cekkirim.com', LABEL_WIDTH / 2, LABEL_HEIGHT - 3, { align: 'center' });

    return doc;
}

/**
 * Generate batch labels (multiple labels in one PDF)
 */
export async function generateBatchLabelsPDF(labels: LabelData[]): Promise<jsPDF> {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [LABEL_WIDTH, LABEL_HEIGHT],
    });

    for (let i = 0; i < labels.length; i++) {
        if (i > 0) {
            doc.addPage([LABEL_WIDTH, LABEL_HEIGHT]);
        }

        const label = labels[i];
        let y = 5;
        const margin = 5;
        const contentWidth = LABEL_WIDTH - margin * 2;

        // Header
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, LABEL_WIDTH, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SHIPPING LABEL', LABEL_WIDTH / 2, 10, { align: 'center' });

        y = 20;

        // QR Code
        const trackingUrl = `https://cekkirim.com/track?awb=${label.awb || label.orderNumber}`;
        const qrDataUrl = await generateQRCode(trackingUrl);

        if (qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', LABEL_WIDTH - 35, y, 30, 30);
        }

        // Courier & AWB
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');

        if (label.courier) {
            doc.text(label.courier.toUpperCase(), margin, y + 5);
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (label.awb) {
            doc.text(`AWB: ${label.awb}`, margin, y + 12);
        }

        doc.text(`Order: ${label.orderNumber}`, margin, y + 18);

        if (label.weight) {
            doc.text(`Berat: ${label.weight} gr`, margin, y + 24);
        }

        y = 55;

        // Divider
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(margin, y, LABEL_WIDTH - margin, y);

        y += 5;

        // Recipient
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y, contentWidth, 55, 'F');

        y += 5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('PENERIMA:', margin + 3, y);

        y += 5;
        doc.setFontSize(12);
        doc.text(label.recipientName.toUpperCase(), margin + 3, y);

        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label.recipientPhone, margin + 3, y);

        y += 5;
        doc.setFontSize(9);

        const addressLines = doc.splitTextToSize(label.recipientAddress, contentWidth - 6);
        addressLines.forEach((line: string) => {
            doc.text(line, margin + 3, y);
            y += 4;
        });

        if (label.recipientCity) {
            doc.text(`${label.recipientCity} ${label.recipientPostalCode || ''}`, margin + 3, y);
        }

        y = 120;

        // Sender
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('PENGIRIM:', margin, y);

        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(label.senderName, margin, y);

        if (label.senderPhone) {
            y += 4;
            doc.text(label.senderPhone, margin, y);
        }

        // Product
        if (label.productName) {
            y += 6;
            doc.setFontSize(8);
            doc.text(`Isi: ${label.productName} x${label.quantity || 1}`, margin, y);
        }

        // Footer
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Scan QR untuk lacak paket - cekkirim.com', LABEL_WIDTH / 2, LABEL_HEIGHT - 3, { align: 'center' });
    }

    return doc;
}

/**
 * Download single label
 */
export async function downloadLabel(label: LabelData) {
    const doc = await generateLabelPDF(label);
    doc.save(`Label-${label.orderNumber}.pdf`);
}

/**
 * Download batch labels
 */
export async function downloadBatchLabels(labels: LabelData[]) {
    const doc = await generateBatchLabelsPDF(labels);
    doc.save(`Labels-Batch-${labels.length}.pdf`);
}

/**
 * Print label directly (opens print dialog)
 */
export async function printLabel(label: LabelData) {
    const doc = await generateLabelPDF(label);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}

/**
 * Print batch labels
 */
export async function printBatchLabels(labels: LabelData[]) {
    const doc = await generateBatchLabelsPDF(labels);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}
