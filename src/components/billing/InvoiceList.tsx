'use client';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateInvoicePDF } from '@/lib/invoice-generator';

// Mock data generator for MVP
function getMockInvoices() {
    return [
        { id: 'INV-001', date: '2025-10-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
        { id: 'INV-002', date: '2025-11-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
        { id: 'INV-003', date: '2025-12-01', amount: 99000, status: 'Paid', plan: 'Pro Plan' },
    ];
}

export default function InvoiceList({ userId }: { userId: string }) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setInvoices(getMockInvoices());
            setLoading(false);
        }, 500);
    }, []);

    const handleDownload = (invoice: any) => {
        generateInvoicePDF(invoice);
    };

    if (loading) return <div className="py-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {inv.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {inv.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDownload(inv)}
                                    className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 ml-auto"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
