'use client';

import jsPDF from 'jspdf';

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  // Invoice info
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  // Seller info
  sellerName: string;
  sellerAddress?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerLogo?: string; // Base64 image

  // Customer info
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;

  // Items
  items: InvoiceItem[];

  // Totals
  subtotal: number;
  shipping?: number;
  discount?: number;
  tax?: number;
  total: number;

  // Payment
  paymentMethod?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;

  // Notes
  notes?: string;

  // Digital signature
  signatureImage?: string; // Base64
  stampImage?: string; // Base64
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Colors
  const primaryColor = '#2563eb';
  const textColor = '#1f2937';
  const grayColor = '#6b7280';

  // Helper: Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ============ HEADER ============
  // Logo (if provided)
  if (data.sellerLogo) {
    try {
      doc.addImage(data.sellerLogo, 'PNG', 15, y, 40, 20);
    } catch (e) {
      // Logo failed, skip
    }
  }

  // Invoice title
  doc.setFontSize(28);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 15, y + 10, { align: 'right' });

  y += 30;

  // Seller info (left)
  doc.setFontSize(12);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(data.sellerName, 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  y += 6;
  if (data.sellerAddress) {
    doc.text(data.sellerAddress, 15, y);
    y += 5;
  }
  if (data.sellerPhone) {
    doc.text(`Tel: ${data.sellerPhone}`, 15, y);
    y += 5;
  }
  if (data.sellerEmail) {
    doc.text(data.sellerEmail, 15, y);
  }

  // Invoice details (right)
  const rightX = pageWidth - 15;
  let rightY = y - 16;

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text('Invoice No:', rightX - 50, rightY);
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(data.invoiceNumber, rightX, rightY, { align: 'right' });

  rightY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor);
  doc.text('Tanggal:', rightX - 50, rightY);
  doc.setTextColor(textColor);
  doc.text(data.invoiceDate, rightX, rightY, { align: 'right' });

  if (data.dueDate) {
    rightY += 6;
    doc.setTextColor(grayColor);
    doc.text('Jatuh Tempo:', rightX - 50, rightY);
    doc.setTextColor(textColor);
    doc.text(data.dueDate, rightX, rightY, { align: 'right' });
  }

  y += 20;

  // ============ CUSTOMER INFO ============
  doc.setFillColor(248, 250, 252);
  doc.rect(15, y, pageWidth - 30, 25, 'F');

  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text('Kepada:', 20, y);

  y += 6;
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(data.customerName, 20, y);

  doc.setFont('helvetica', 'normal');
  if (data.customerAddress) {
    y += 5;
    doc.text(data.customerAddress, 20, y);
  }
  if (data.customerPhone) {
    y += 5;
    doc.text(`Tel: ${data.customerPhone}`, 20, y);
  }

  y += 15;

  // ============ ITEMS TABLE ============
  // Table header
  doc.setFillColor(37, 99, 235);
  doc.rect(15, y, pageWidth - 30, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  y += 7;
  doc.text('Item', 20, y);
  doc.text('Qty', 100, y);
  doc.text('Harga', 125, y);
  doc.text('Total', pageWidth - 20, y, { align: 'right' });

  y += 8;

  // Table rows
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'normal');

  data.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, pageWidth - 30, 10, 'F');
    }

    doc.text(item.name.substring(0, 40), 20, y);
    doc.text(item.quantity.toString(), 100, y);
    doc.text(formatRupiah(item.price), 125, y);
    doc.text(formatRupiah(item.total), pageWidth - 20, y, { align: 'right' });

    y += 10;
  });

  y += 5;

  // ============ TOTALS ============
  const totalsX = pageWidth - 80;

  // Subtotal
  doc.setTextColor(grayColor);
  doc.text('Subtotal', totalsX, y);
  doc.setTextColor(textColor);
  doc.text(formatRupiah(data.subtotal), pageWidth - 20, y, { align: 'right' });
  y += 7;

  // Shipping
  if (data.shipping) {
    doc.setTextColor(grayColor);
    doc.text('Ongkir', totalsX, y);
    doc.setTextColor(textColor);
    doc.text(formatRupiah(data.shipping), pageWidth - 20, y, {
      align: 'right',
    });
    y += 7;
  }

  // Discount
  if (data.discount) {
    doc.setTextColor(grayColor);
    doc.text('Diskon', totalsX, y);
    doc.setTextColor('#dc2626');
    doc.text(`-${formatRupiah(data.discount)}`, pageWidth - 20, y, {
      align: 'right',
    });
    y += 7;
  }

  // Tax
  if (data.tax) {
    doc.setTextColor(grayColor);
    doc.text('Pajak', totalsX, y);
    doc.setTextColor(textColor);
    doc.text(formatRupiah(data.tax), pageWidth - 20, y, { align: 'right' });
    y += 7;
  }

  // Total
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX, y, pageWidth - 15, y);
  y += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text('TOTAL', totalsX, y);
  doc.text(formatRupiah(data.total), pageWidth - 20, y, { align: 'right' });

  y += 20;

  // ============ PAYMENT INFO ============
  if (data.bankName || data.bankAccount) {
    doc.setFillColor(254, 243, 199);
    doc.rect(15, y, pageWidth - 30, 30, 'F');

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text('Pembayaran Transfer ke:', 20, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    if (data.bankName) doc.text(`Bank: ${data.bankName}`, 20, y);
    y += 5;
    if (data.bankAccount) doc.text(`No. Rek: ${data.bankAccount}`, 20, y);
    y += 5;
    if (data.bankAccountName) doc.text(`A/N: ${data.bankAccountName}`, 20, y);

    y += 15;
  }

  // ============ NOTES ============
  if (data.notes) {
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(grayColor);
    doc.text('Catatan:', 15, y);
    y += 5;
    doc.text(data.notes, 15, y);
    y += 10;
  }

  // ============ SIGNATURE & STAMP ============
  const signatureY = y + 10;

  // Stamp (if provided)
  if (data.stampImage) {
    try {
      doc.addImage(data.stampImage, 'PNG', pageWidth - 70, signatureY, 40, 40);
    } catch (e) {
      // Stamp failed
    }
  }

  // Signature (if provided)
  if (data.signatureImage) {
    try {
      doc.addImage(
        data.signatureImage,
        'PNG',
        pageWidth - 65,
        signatureY + 25,
        35,
        20
      );
    } catch (e) {
      // Signature failed
    }
  }

  // Signature line
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth - 75, signatureY + 50, pageWidth - 25, signatureY + 50);

  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.text(data.sellerName, pageWidth - 50, signatureY + 57, {
    align: 'center',
  });

  // ============ FOOTER ============
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.text(
    'Invoice ini dibuat secara otomatis oleh CekKirim.com',
    pageWidth / 2,
    footerY,
    {
      align: 'center',
    }
  );

  return doc;
}

export function downloadInvoice(data: InvoiceData) {
  const doc = generateInvoicePDF(data);
  doc.save(`Invoice-${data.invoiceNumber}.pdf`);
}

export function getInvoiceBlob(data: InvoiceData): Blob {
  const doc = generateInvoicePDF(data);
  return doc.output('blob');
}

export function getInvoiceBase64(data: InvoiceData): string {
  const doc = generateInvoicePDF(data);
  return doc.output('datauristring');
}
