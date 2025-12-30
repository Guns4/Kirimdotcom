import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default async function DisputesPage() {
    const supabase = await createClient();

    const { data: disputes } = await supabase
        .from('disputes')
        .select('*, buyer:buyer_id(email), seller:seller_id(email)')
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Resolusi Sengketa</h1>
                <p className="text-gray-500">Kelola dan putuskan sengketa marketplace</p>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Pembeli</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Seller</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tanggal</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {disputes?.map(dispute => (
                            <tr key={dispute.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                                    {dispute.id.slice(0, 8)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {dispute.buyer?.email || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {dispute.seller?.email || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                    Rp {Number(dispute.amount).toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${dispute.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                                            dispute.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-200 text-gray-700'
                                        }`}>
                                        {dispute.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                    {format(new Date(dispute.created_at), 'dd MMM yy', { locale: idLocale })}
                                </td>
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/disputes/${dispute.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Lihat Detail →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!disputes || disputes.length === 0) && (
                    <div className="p-12 text-center text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Tidak ada sengketa</p>
                    </div>
                )}
            </div>
        </div>
    );
}
