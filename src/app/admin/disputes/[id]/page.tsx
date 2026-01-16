import { getDisputeDetails } from '@/app/actions/dispute-resolution';
import { DisputePanel } from '@/components/admin/disputes/DisputePanel';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { dispute, messages, evidence } = await getDisputeDetails(id);

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
