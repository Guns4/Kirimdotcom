'use client';

import { useState } from 'react';
import { generateBulkLabels, generateManifest, ShippingLabelData } from '@/lib/bulk-label-generator';
import { Printer, FileText, Loader2 } from 'lucide-react';

// Mock Data for Demo
const MOCK_SHIPMENTS: ShippingLabelData[] = [
    { id: '1', recipientName: 'Budi Santoso', recipientPhone: '08123456789', recipientAddress: 'Jl. Merdeka No. 1, Jakarta', courier: 'JNE', service: 'REG', resi: 'JNE000123456', weight: 1, items: 'Baju Kaos' },
    { id: '2', recipientName: 'Siti Aminah', recipientPhone: '08198765432', recipientAddress: 'Jl. Sudirman No. 45, Bandung', courier: 'SICEPAT', service: 'SIUNT', resi: '000123456789', weight: 2, items: 'Sepatu' },
    { id: '3', recipientName: 'Ahmad Rizki', recipientPhone: '08134567890', recipientAddress: 'Jl. Diponegoro No. 10, Surabaya', courier: 'JNT', service: 'EZ', resi: 'JP1234567890', weight: 1.5, items: 'Tas Ransel' },
    { id: '4', recipientName: 'Dewi Lestari', recipientPhone: '08122334455', recipientAddress: 'Jl. Malioboro No. 5, Yogyakarta', courier: 'JNE', service: 'YES', resi: 'JNE000987654', weight: 0.5, items: 'Aksesoris' },
    { id: '5', recipientName: 'Eko Prasetyo', recipientPhone: '08155443322', recipientAddress: 'Jl. Pahlawan No. 20, Semarang', courier: 'SICEPAT', service: 'GOKIL', resi: '000987654321', weight: 5, items: 'Elektronik' },
];

export default function BulkLabelGenerator() {
    const [generating, setGenerating] = useState(false);

    const handleGenerateLabels = async () => {
        setGenerating(true);
        try {
            // In real app, fetch shipments from props or API context
            await generateBulkLabels(MOCK_SHIPMENTS);
        } catch (error) {
            console.error(error);
            alert('Failed to generate labels');
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateManifests = async () => {
        setGenerating(true);
        try {
            const couriers = Array.from(new Set(MOCK_SHIPMENTS.map(s => s.courier)));
            for (const courier of couriers) {
                generateManifest(courier, MOCK_SHIPMENTS);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate manifests');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Printer size={20} className="text-gray-600" /> Bulk Operations
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleGenerateLabels}
                    disabled={generating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    {generating ? <Loader2 className="animate-spin" /> : <Printer size={18} />}
                    Print All Labels (A6)
                </button>

                <button
                    onClick={handleGenerateManifests}
                    disabled={generating}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    {generating ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
                    Download Manifests
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
                Generates sorted labels for {MOCK_SHIPMENTS.length} shipments ready for packing.
            </p>
        </div>
    );
}
