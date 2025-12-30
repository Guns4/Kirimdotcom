// Bulk Label Generator Service
// Generate shipping labels and manifests in PDF format

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

export interface LabelData {
    trackingNumber: string;
    courier: string;
    service: string;
    destination: string;
    recipient: string;
    weight: number;
    cost: number;
}

export interface CourierGroup {
    courier: string;
    labels: LabelData[];
}

// Group labels by courier and sort
export function groupAndSortLabels(labels: LabelData[]): CourierGroup[] {
    const grouped = new Map<string, LabelData[]>();

    labels.forEach(label => {
        if (!grouped.has(label.courier)) {
            grouped.set(label.courier, []);
        }
        grouped.get(label.courier)!.push(label);
    });

    // Convert to array and sort by courier name
    const result: CourierGroup[] = [];
    const sortedCouriers = Array.from(grouped.keys()).sort();

    sortedCouriers.forEach(courier => {
        result.push({
            courier,
            labels: grouped.get(courier)!
        });
    });

    return result;
}

// Generate barcode as base64 image
function generateBarcode(trackingNumber: string): string {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, trackingNumber, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: false
    });
    return canvas.toDataURL('image/png');
}

// Generate single label PDF (10x10cm thermal label format)
export function generateBulkLabelsPDF(groupedLabels: CourierGroup[]): jsPDF {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 100] // 10cm x 10cm
    });

    let isFirstPage = true;
    let totalLabels = 0;

    groupedLabels.forEach(group => {
        // Add section header (courier name)
        if (!isFirstPage) {
            doc.addPage();
        } else {
            isFirstPage = false;
        }

        // Courier section title page
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(group.courier, 50, 40, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`${group.labels.length} label(s)`, 50, 50, { align: 'center' });
        doc.setFontSize(8);
        doc.text(`Pages ${totalLabels + 1} - ${totalLabels + group.labels.length}`, 50, 60, { align: 'center' });

        // Generate each label
        group.labels.forEach((label, idx) => {
            doc.addPage();
            totalLabels++;

            // Border
            doc.rect(5, 5, 90, 90);

            // Courier logo area (placeholder)
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(label.courier, 50, 15, { align: 'center' });

            // Service
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(label.service, 50, 22, { align: 'center' });

            // Barcode
            try {
                const barcodeImg = generateBarcode(label.trackingNumber);
                doc.addImage(barcodeImg, 'PNG', 15, 25, 70, 15);
            } catch (e) {
                // Fallback if barcode generation fails
                doc.setFontSize(8);
                doc.text(label.trackingNumber, 50, 32, { align: 'center' });
            }

            // Tracking Number
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(label.trackingNumber, 50, 45, { align: 'center' });

            // Separator
            doc.line(10, 48, 90, 48);

            // Recipient
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('TO:', 10, 54);
            doc.setFont('helvetica', 'normal');
            const recipientLines = doc.splitTextToSize(label.recipient, 75);
            doc.text(recipientLines, 10, 60);

            // Destination
            doc.setFont('helvetica', 'bold');
            const destY = 60 + (recipientLines.length * 5);
            doc.text(label.destination, 10, destY);

            // Weight & Cost
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Weight: ${label.weight} kg`, 10, 85);
            doc.text(`Cost: Rp ${label.cost.toLocaleString('id-ID')}`, 10, 90);

            // Label number
            doc.text(`Label ${totalLabels} of ${groupedLabels.reduce((sum, g) => sum + g.labels.length, 0)}`, 60, 90);
        });
    });

    return doc;
}

// Generate manifest document for a courier
export function generateManifestPDF(group: CourierGroup): jsPDF {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Manifest Serah Terima`, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Kurir: ${group.courier}`, 105, 30, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    doc.text(`Tanggal: ${today}`, 20, 40);

    // Summary
    doc.text(`Total Paket: ${group.labels.length}`, 20, 47);
    const totalWeight = group.labels.reduce((sum, l) => sum + l.weight, 0);
    doc.text(`Total Berat: ${totalWeight.toFixed(2)} kg`, 20, 54);

    // Table
    (doc as any).autoTable({
        head: [['No', 'Resi', 'Tujuan', 'Penerima', 'Berat', 'Biaya']],
        body: group.labels.map((label, idx) => [
            idx + 1,
            label.trackingNumber,
            label.destination,
            label.recipient.substring(0, 30) + (label.recipient.length > 30 ? '...' : ''),
            `${label.weight} kg`,
            `Rp ${label.cost.toLocaleString('id-ID')}`
        ]),
        startY: 65,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Signature section
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(10);
    doc.text('Diserahkan oleh:', 20, finalY);
    doc.text('Diterima oleh:', 120, finalY);

    // Signature boxes
    doc.rect(20, finalY + 5, 60, 30);
    doc.rect(120, finalY + 5, 60, 30);

    doc.setFontSize(8);
    doc.text('(Warehouse Staff)', 50, finalY + 42, { align: 'center' });
    doc.text(`(${group.courier} Courier)`, 150, finalY + 42, { align: 'center' });

    return doc;
}
