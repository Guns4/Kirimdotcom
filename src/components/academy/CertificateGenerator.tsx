'use client';

import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface CertificateProps {
    studentName: string;
    courseName: string;
    date: string;
    certificateId: string;
}

export default function CertificateGenerator({ data }: { data: CertificateProps }) {
    const [generating, setGenerating] = useState(false);

    const generatePDF = () => {
        setGenerating(true);
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Background / Border
        doc.setLineWidth(3);
        doc.setDrawColor(20, 30, 70); // Dark Blue
        doc.rect(10, 10, 277, 190); // Border

        doc.setLineWidth(1);
        doc.setDrawColor(218, 165, 32); // Gold
        doc.rect(15, 15, 267, 180); // Inner Border

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(20, 30, 70);
        doc.text('CERTIFICATE', 148.5, 50, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('OF COMPLETION', 148.5, 60, { align: 'center' });

        // Body
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('This record certificates that', 148.5, 80, { align: 'center' });

        // Name
        doc.setFont('times', 'bolditalic');
        doc.setFontSize(36);
        doc.setTextColor(0);
        doc.text(data.studentName, 148.5, 100, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(70, 105, 227, 105); // Underline name

        // Course Info
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('has successfully completed the course requirements for', 148.5, 120, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(20, 30, 70);
        doc.text(data.courseName, 148.5, 135, { align: 'center' });

        // Footer
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Date: ${data.date}`, 50, 170);
        doc.text(`ID: ${data.certificateId}`, 230, 170, { align: 'right' });

        // Signature Line
        doc.line(110, 170, 190, 170);
        doc.setFontSize(10);
        doc.text('Academy Director', 150, 175, { align: 'center' });

        // Save
        doc.save(`${data.certificateId}.pdf`);
        setGenerating(false);
    };

    return (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-8">
            <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    🏆
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Exam Passed!</h3>
                <p className="text-gray-600">You have earned the {data.courseName}.</p>
            </div>

            <button
                onClick={generatePDF}
                disabled={generating}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mx-auto"
            >
                {generating ? 'Printing...' : <><Download size={20} /> Download Certificate</>}
            </button>
        </div>
    );
}
