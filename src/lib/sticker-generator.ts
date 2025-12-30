// Sticker Generator Service
// Generate A4 PDF with 10 shipping stickers

import jsPDF from 'jspdf';

export interface StickerData {
    shopName: string;
    whatsapp: string;
    message: string;
    templateId: string;
}

export interface StickerTemplate {
    id: string;
    name: string;
    isPremium: boolean;
    price: number;
    previewUrl?: string; // For UI preview
    render: (doc: jsPDF, x: number, y: number, width: number, height: number, data: StickerData) => void;
}

// A4 Dimensions (mm)
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const MARGIN = 10;
const COL_GAP = 5;
const ROW_GAP = 5;

// Sticker Dimensions (2 Cols x 5 Rows)
// Width: (210 - 20 - 5) / 2 = 92.5 mm
// Height: (297 - 20 - 20) / 5 = 51.4 mm
const STICKER_WIDTH = 90;
const STICKER_HEIGHT = 50;

export const STICKER_TEMPLATES: StickerTemplate[] = [
    {
        id: 'basic',
        name: 'Basic (Gratis)',
        isPremium: false,
        price: 0,
        render: (doc, x, y, w, h, data) => {
            // Border
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.rect(x, y, w, h);

            // Header (Shop Name)
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(data.shopName.toUpperCase(), x + w / 2, y + 10, { align: 'center' });

            // Divider
            doc.line(x + 5, y + 15, x + w - 5, y + 15);

            // Content
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Penerima:', x + 5, y + 22);
            doc.line(x + 5, y + 32, x + w - 5, y + 32); // Line for Name
            doc.text('Telp:', x + 5, y + 38);
            doc.line(x + 15, y + 38, x + w / 2 - 5, y + 38); // Line for Phone

            // Message (Bottom)
            if (data.message) {
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(data.message, x + w / 2, y + h - 5, { align: 'center' });
                doc.setTextColor(0);
            }

            // WA (Bottom Right)
            doc.setFontSize(8);
            doc.text(`WA: ${data.whatsapp}`, x + w - 5, y + h - 2, { align: 'right' });
        }
    },
    {
        id: 'premium',
        name: 'Premium (Rp 5.000)',
        isPremium: true,
        price: 5000,
        render: (doc, x, y, w, h, data) => {
            // Background
            doc.setFillColor(255, 240, 245); // Light Pink
            doc.rect(x, y, w, h, 'F');

            // Border (Dashed)
            doc.setDrawColor(255, 105, 180); // Hot Pink
            doc.setLineDashPattern([2, 2], 0);
            doc.rect(x + 1, y + 1, w - 2, h - 2);
            doc.setLineDashPattern([], 0); // Reset

            // Icon (Fragile / Video)
            // Simulating icon with text/shape
            doc.setFillColor(255, 0, 0);
            doc.circle(x + 8, y + 8, 4, 'F');
            doc.setTextColor(255);
            doc.setFontSize(6);
            doc.text('REC', x + 8, y + 9, { align: 'center' });

            // Header
            doc.setTextColor(0);
            doc.setFontSize(16);
            doc.setFont('courier', 'bold');
            doc.text(data.shopName, x + 15, y + 10);

            // Important Message Banner
            if (data.message) {
                doc.setFillColor(255, 0, 0); // Red
                doc.rect(x, y + h - 10, w, 10, 'F');
                doc.setTextColor(255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(data.message.toUpperCase(), x + w / 2, y + h - 3.5, { align: 'center' });
            }

            // Body
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Kepada:', x + 5, y + 20);
            doc.setLineDashPattern([1, 1], 0);
            doc.line(x + 20, y + 20, x + w - 5, y + 20); // Name
            doc.line(x + 5, y + 28, x + w - 5, y + 28);  // Address 1
            doc.line(x + 5, y + 36, x + w - 5, y + 36);  // Address 2
            doc.setLineDashPattern([], 0);

            // WA
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(data.whatsapp, x + w - 5, y + 8, { align: 'right' });
        }
    }
];

export async function generateStickerPDF(data: StickerData): Promise<void> {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const template = STICKER_TEMPLATES.find(t => t.id === data.templateId) || STICKER_TEMPLATES[0];

    // Layout: 2 Cols, 5 Rows
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 2; col++) {
            const x = MARGIN + (col * (STICKER_WIDTH + COL_GAP));
            const y = MARGIN + (row * (STICKER_HEIGHT + ROW_GAP));

            template.render(doc, x, y, STICKER_WIDTH, STICKER_HEIGHT, data);
        }
    }

    // Save
    doc.save(`stiker-pengiriman-${data.shopName}.pdf`);
}
