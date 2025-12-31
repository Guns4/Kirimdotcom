import { jsPDF } from 'jspdf';

export interface StickerData {
    senderName: string;
    senderPhone: string;
    template: 'BASIC' | 'PREMIUM';
}

export function generateStickerPDF(data: StickerData) {
    // A4 Size: 210 x 297 mm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Layout configuration for 2 columns x 5 rows = 10 stickers
    const cols = 2;
    const rows = 5;
    const marginX = 10;
    const marginY = 10;
    const boxWidth = 90; // (210 - 20) / 2 = 95 -> slightly smaller for gap
    const boxHeight = 50; // (297 - 20) / 5 = 55 -> slightly smaller
    const gapX = 5;
    const gapY = 5;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = marginX + (c * (boxWidth + gapX));
            const y = marginY + (r * (boxHeight + gapY));

            drawSticker(doc, x, y, boxWidth, boxHeight, data);
        }
    }

    doc.save(`shipping-stickers-${data.senderName}.pdf`);
}

function drawSticker(doc: jsPDF, x: number, y: number, w: number, h: number, data: StickerData) {
    if (data.template === 'BASIC') {
        // Basic Template: Simple Border
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(x, y, w, h);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("PENGIRIM:", x + 5, y + 10);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(data.senderName, x + 5, y + 18);
        doc.text(data.senderPhone, x + 5, y + 24);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("PENERIMA:", x + 5, y + 35);
        doc.line(x + 5, y + 42, x + w - 5, y + 42); // Empty line for writing
    }
    else if (data.template === 'PREMIUM') {
        // Premium Template: Red Border, Fragile Icon text
        doc.setDrawColor(200, 0, 0); // Red
        doc.setLineWidth(1);
        doc.rect(x, y, w, h);

        // Header Background
        doc.setFillColor(200, 0, 0);
        doc.rect(x, y, w, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("FRAGILE - JANGAN DIBANTING", x + w / 2, y + 7, { align: 'center' });

        // Reset Text Color
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(8);
        doc.text("PENGIRIM:", x + 5, y + 18);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(data.senderName, x + 25, y + 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(data.senderPhone, x + 25, y + 24);

        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.line(x + 5, y + 30, x + w - 5, y + 30); // Separator

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("KEPADA:", x + 5, y + 38);

        // Dotted lines for Recipient
        doc.setLineDash([1, 1], 0);
        doc.line(x + 25, y + 38, x + w - 5, y + 38);
        doc.line(x + 25, y + 45, x + w - 5, y + 45);
        doc.setLineDash([], 0); // Reset
    }
}
