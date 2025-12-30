'use client';

import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

interface Props {
    studentName: string;
    courseTitle: string;
    date: string;
    certificateId: string;
}

export default function CertificateGenerator({ studentName, courseTitle, date, certificateId }: Props) {

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Background (Simple Border)
        doc.setLineWidth(2);
        doc.setDrawColor(212, 175, 55); // Gold color
        doc.rect(10, 10, 277, 190);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(40, 40, 40);
        doc.text('CERTIFICATE OF COMPLETION', 148.5, 50, { align: 'center' });

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text('This is to certify that', 148.5, 75, { align: 'center' });

        // Student Name
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(32);
        doc.setTextColor(0, 0, 0);
        doc.text(studentName, 148.5, 95, { align: 'center' });

        // Line under name
        doc.setLineWidth(0.5);
        doc.line(70, 100, 227, 100);

        // Course Title
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text(`Has successfully passed the exam for`, 148.5, 120, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(33, 33, 33);
        doc.text(courseTitle, 148.5, 135, { align: 'center' });

        // Footer Info
        doc.setFontSize(12);
        doc.setTextColor(120, 120, 120);
        doc.text(`Date: ${date}`, 50, 170);
        doc.text(`ID: ${certificateId}`, 230, 170, { align: 'right' });

        // Signature Line
        doc.line(110, 170, 190, 170);
        doc.setFontSize(10);
        doc.text('Authorized Signature', 148.5, 175, { align: 'center' });

        // Save
        doc.save(`Certificate-${certificateId}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
        >
            <Download className="w-5 h-5" /> Download Sertifikat
        </button>
    );
}
