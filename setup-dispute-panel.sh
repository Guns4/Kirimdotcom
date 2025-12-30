#!/bin/bash

# =============================================================================
# Marketplace: Dispute Resolution Panel Setup (Task 97)
# =============================================================================

echo "Initializing Dispute Resolution System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: dispute_resolution_schema.sql"
cat <<EOF > dispute_resolution_schema.sql
-- Enum: Dispute Status
CREATE TYPE dispute_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CANCELLED');

-- Table: Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL, -- Reference to order/transaction
    buyer_id UUID REFERENCES auth.users(id),
    seller_id UUID REFERENCES auth.users(id),
    amount DECIMAL(19,4) NOT NULL, -- Amount in dispute
    reason TEXT NOT NULL, -- Buyer's complaint
    status dispute_status DEFAULT 'OPEN',
    resolved_by UUID REFERENCES auth.users(id), -- Admin who resolved
    resolution_notes TEXT, -- Admin's decision reasoning
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table: Dispute Messages (Chat History)
CREATE TABLE IF NOT EXISTS public.dispute_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    sender_type TEXT NOT NULL, -- BUYER, SELLER, ADMIN
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Dispute Evidence (Photos/Files)
CREATE TABLE IF NOT EXISTS public.dispute_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    file_url TEXT NOT NULL, -- URL to Supabase Storage or external
    file_type TEXT, -- image/jpeg, image/png, etc
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer ON public.disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller ON public.disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON public.dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON public.dispute_evidence(dispute_id);

-- RLS Policies (Admin only for now)
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all
-- (Requires admin_profiles table from Task 93)
CREATE POLICY "Admins can view disputes" ON disputes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view messages" ON dispute_messages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view evidence" ON dispute_evidence
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
EOF

# 2. Server Actions (Resolution Logic)
echo "2. Creating Actions: src/app/actions/dispute-resolution.ts"
mkdir -p src/app/actions

cat <<'EOF' > src/app/actions/dispute-resolution.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function resolveDispute(
    disputeId: string, 
    winner: 'BUYER' | 'SELLER', 
    notes: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Get Dispute Details
    const { data: dispute } = await supabase
        .from('disputes')
        .select('*, buyer:buyer_id(email), seller:seller_id(email)')
        .eq('id', disputeId)
        .single();

    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== 'OPEN' && dispute.status !== 'INVESTIGATING') {
        throw new Error('Dispute already resolved');
    }

    // 2. Update Dispute Status
    const newStatus = winner === 'BUYER' ? 'RESOLVED_BUYER' : 'RESOLVED_SELLER';
    
    await supabase
        .from('disputes')
        .update({
            status: newStatus,
            resolved_by: user.id,
            resolution_notes: notes,
            resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);

    // 3. Process Refund/Payment
    if (winner === 'BUYER') {
        // Refund money to buyer
        await supabase.from('ledger_entries').insert({
            user_id: dispute.buyer_id,
            amount: dispute.amount,
            type: 'DISPUTE_REFUND',
            description: `Refund dari Sengketa #${disputeId.slice(0, 8)}`
        });
    } else {
        // Release payment to seller
        await supabase.from('ledger_entries').insert({
            user_id: dispute.seller_id,
            amount: dispute.amount,
            type: 'DISPUTE_RELEASE',
            description: `Pembayaran dari Sengketa #${disputeId.slice(0, 8)}`
        });
    }

    revalidatePath('/admin/disputes');
    return { success: true, winner, amount: dispute.amount };
}

export async function getDisputeDetails(disputeId: string) {
    const supabase = await createClient();

    const [dispute, messages, evidence] = await Promise.all([
        supabase
            .from('disputes')
            .select('*, buyer:buyer_id(email), seller:seller_id(email)')
            .eq('id', disputeId)
            .single(),
        supabase
            .from('dispute_messages')
            .select('*, sender:sender_id(email)')
            .eq('dispute_id', disputeId)
            .order('created_at', { ascending: true }),
        supabase
            .from('dispute_evidence')
            .select('*, uploader:uploaded_by(email)')
            .eq('dispute_id', disputeId)
            .order('created_at', { ascending: false })
    ]);

    return {
        dispute: dispute.data,
        messages: messages.data || [],
        evidence: evidence.data || []
    };
}
EOF

# 3. Admin UI Component
echo "3. Creating UI: src/components/admin/disputes/DisputePanel.tsx"
mkdir -p src/components/admin/disputes

cat <<'EOF' > src/components/admin/disputes/DisputePanel.tsx
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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isResolved ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'
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
                                <div className={`max-w-[70%] p-3 rounded-lg ${
                                    msg.sender_type === 'BUYER' 
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
EOF

# 4. Admin Page
echo "4. Creating Page: src/app/admin/disputes/page.tsx"
mkdir -p src/app/admin/disputes

cat <<'EOF' > src/app/admin/disputes/page.tsx
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
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        dispute.status === 'OPEN' ? 'bg-red-100 text-red-700' :
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
EOF

# 5. Dispute Detail Page
echo "5. Creating Detail Page: src/app/admin/disputes/[id]/page.tsx"
mkdir -p src/app/admin/disputes/[id]

cat <<'EOF' > src/app/admin/disputes/[id]/page.tsx
import { getDisputeDetails } from '@/app/actions/dispute-resolution';
import { DisputePanel } from '@/components/admin/disputes/DisputePanel';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
    const { dispute, messages, evidence } = await getDisputeDetails(params.id);

    if (!dispute) {
        return <div className="p-8">Sengketa tidak ditemukan</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link 
                href="/admin/disputes" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Sengketa
            </Link>

            <DisputePanel dispute={dispute} messages={messages} evidence={evidence} />
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Dispute Resolution Panel Setup Complete!"
echo "1. Run 'dispute_resolution_schema.sql' in Supabase."
echo "2. Visit '/admin/disputes' to view all disputes."
echo "3. Click 'Lihat Detail' to resolve disputes."
echo "4. Add 'Disputes' menu item to admin sidebar."
