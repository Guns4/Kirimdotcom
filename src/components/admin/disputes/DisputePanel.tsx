'use client';

import { useState } from 'react';
import { MessageSquare, Image as ImageIcon, CheckCircle, XCircle, FileText } from 'lucide-react';
import { resolveDispute } from '@/app/actions/dispute-resolution';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface DisputePanelProps {
    dispute: any;
    messages: any[];
    evidence: any[];
}

export function DisputePanel({ dispute, messages, evidence }: DisputePanelProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResolve = async (winner: 'BUYER' | 'SELLER') => {
        if (!notes.trim()) {
            toast.error('Harap isi alasan keputusan');
            return;
        }

        if (!confirm(`Yakin ${winner === 'BUYER' ? 'menangkan Pembeli' : 'menangkan Seller'}?`)) {
            return;
        }

        setLoading(true);
        try {
            const result = await resolveDispute(dispute.id, winner, notes);
            toast.success(`Sengketa diselesaikan! ${winner === 'BUYER' ? 'Pembeli' : 'Seller'} menerima Rp ${result.amount.toLocaleString('id-ID')}`);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyelesaikan sengketa');
        } finally {
            setLoading(false);
        }
    };

    const isResolved = dispute.status !== 'OPEN' && dispute.status !== 'INVESTIGATING';

    return (
        <div className="space-y-6">
            {/* Dispute Header */}
            <div className="bg-white p-6 rounded-xl border">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Sengketa #{dispute.id.slice(0, 8)}</h2>
                        <p className="text-sm text-gray-500">Order ID: {dispute.order_id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isResolved ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {dispute.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Pembeli</p>
                        <p className="font-semibold text-gray-900">{dispute.buyer?.email || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-600">Seller</p>
                        <p className="font-semibold text-gray-900">{dispute.seller?.email || 'N/A'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Alasan Sengketa</p>
                    <p className="text-sm text-gray-900">{dispute.reason}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">Rp {Number(dispute.amount).toLocaleString('id-ID')}</span>
                    <span className="text-xs text-gray-500">
                        Dibuat {format(new Date(dispute.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </span>
                </div>
            </div>

            {/* Chat History */}
            <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Riwayat Chat
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Belum ada percakapan</p>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender_type === 'BUYER' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_type === 'BUYER'
                                        ? 'bg-blue-100 text-blue-900'
                                        : msg.sender_type === 'SELLER'
                                            ? 'bg-orange-100 text-orange-900'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}>
                                    <p className="text-xs font-semibold mb-1">{msg.sender_type} ({msg.sender?.email})</p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {format(new Date(msg.created_at), 'HH:mm', { locale: idLocale })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Evidence Gallery */}
            <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Bukti Foto ({evidence.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {evidence.map(ev => (
                        <div key={ev.id} className="group relative">
                            <img
                                src={ev.file_url}
                                alt={ev.description || 'Evidence'}
                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => window.open(ev.file_url, '_blank')}
                            />
                            {ev.description && (
                                <p className="text-xs text-gray-600 mt-1">{ev.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                by {ev.uploader?.email}
                            </p>
                        </div>
                    ))}
                    {evidence.length === 0 && (
                        <p className="col-span-full text-sm text-gray-500 text-center py-8">Tidak ada bukti foto</p>
                    )}
                </div>
            </div>

            {/* Resolution Panel */}
            {!isResolved && (
                <div className="bg-white p-6 rounded-xl border">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Keputusan Admin
                    </h3>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan alasan keputusan Anda (untuk transparansi)..."
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4 h-28"
                        disabled={loading}
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleResolve('BUYER')}
                            disabled={loading || !notes.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Menangkan Pembeli
                        </button>
                        <button
                            onClick={() => handleResolve('SELLER')}
                            disabled={loading || !notes.trim()}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Menangkan Seller
                        </button>
                    </div>
                </div>
            )}

            {/* Resolution Info (if already resolved) */}
            {isResolved && dispute.resolution_notes && (
                <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
                    <h3 className="font-bold text-green-900 mb-2">Keputusan Final</h3>
                    <p className="text-sm text-green-800 mb-2">{dispute.resolution_notes}</p>
                    <p className="text-xs text-green-700">
                        Diselesaikan pada {format(new Date(dispute.resolved_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </p>
                </div>
            )}
        </div>
    );
}
