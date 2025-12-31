import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

export interface ShippingLabelData {
    id: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    courier: string; // JNE, JNT, SICEPAT
    service: string; // REG, YES, etc.
    resi: string;
    weight: number;
    items: string;
}

export function generateBulkLabels(labels: ShippingLabelData[]) {
    // 1. Sort by Courier
    const sortedLabels = [...labels].sort((a, b) => a.courier.localeCompare(b.courier));

    // A6 Size: 105 x 148 mm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6'
    });

    sortedLabels.forEach((label, index) => {
        if (index > 0) doc.addPage();

        // Border
        doc.setLineWidth(1);
        doc.rect(5, 5, 95, 138);

        // Header: Courier Logo Placeholder & Service
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(label.courier.toUpperCase(), 10, 15);

        doc.setFontSize(14);
        doc.text(label.service, 80, 15, { align: 'right' });

        doc.line(5, 18, 100, 18);

        // Barcode (Resi)
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, label.resi, {
            format: "CODE128",
            displayValue: true,
            width: 2,
            height: 40,
            fontSize: 14
        });
        const barcodeData = canvas.toDataURL('image/png');
        doc.addImage(barcodeData, 'PNG', 10, 22, 85, 25);

        doc.line(5, 50, 100, 50);

        // Recipient Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Penerima:", 10, 58);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(label.recipientName, 10, 65);
        doc.text(label.recipientPhone, 10, 71);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitAddress = doc.splitTextToSize(label.recipientAddress, 85);
        doc.text(splitAddress, 10, 78);

        // Footer Info
        const bottomY = 110;
        doc.line(5, bottomY, 100, bottomY);

        doc.setFontSize(10);
        doc.text(`Berat: ${label.weight} kg`, 10, bottomY + 8);

        const splitItems = doc.splitTextToSize(`Isi: ${label.items}`, 85);
        doc.text(splitItems, 10, bottomY + 16);

        // Sorting Code (Mock)
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(label.courier.substring(0, 3) + "-001", 90, 135, { align: 'right' });
    });

    doc.save(`bulk-labels-${Date.now()}.pdf`);
}

export function generateManifest(courier: string, labels: ShippingLabelData[]) {
    // Filter for courier
    const courierLabels = labels.filter(l => l.courier === courier);
    if (courierLabels.length === 0) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.text(`Manifest Serah Terima - ${courier}`, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 15, 30);
    doc.text(`Total Paket: ${courierLabels.length}`, 15, 37);

    // Table
    const tableData = courierLabels.map((l, i) => [
        i + 1,
        l.resi,
        l.recipientName,
        l.service,
        `${l.weight} kg`
    ]);

    (doc as any).autoTable({
        startY: 45,
        head: [['No', 'Resi', 'Penerima', 'Layanan', 'Berat']],
        body: tableData,
    });

    // Signature
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Diserahkan Oleh,", 30, finalY);
    doc.text("(...........................)", 30, finalY + 25);

    doc.text("Diterima Oleh (Kurir),", 130, finalY);
    doc.text("(...........................)", 130, finalY + 25);

    doc.save(`manifest-${courier}-${Date.now()}.pdf`);
}
