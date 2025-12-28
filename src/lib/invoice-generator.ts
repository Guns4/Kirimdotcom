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
    doc.text(`Invoice #: ${invoice.id}`, 160, 30);
    doc.text(`Date: ${invoice.date}`, 160, 36);

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
            [`Subscription - ${invoice.plan}`, '1 Month', `Rp ${invoice.amount.toLocaleString()}`],
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
    doc.text(`Rp ${invoice.amount.toLocaleString()}`, 170, finalY);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business.', 14, 280);

    // Save
    doc.save(`Invoice-${invoice.id}.pdf`);
}
