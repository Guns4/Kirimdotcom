import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createWARotator, getUserRotators } from '@/app/actions/waRotatorActions';
import WARotatorForm from '@/components/wa-rotator/WARotatorForm';
import { Copy, ExternalLink, Trash2, TrendingUp } from 'lucide-react';

export const metadata = {
    title: 'WhatsApp CS Rotator - Free Tool | CekKirim',
    description: 'Bagikan 1 link, otomatis diarahkan ke beberapa CS WhatsApp secara bergantian',
};

async function getRotatorData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/tools/wa-rotator');
    }

    const { data: rotators } = await getUserRotators();

    return { rotators: rotators || [] };
}

export default async function WARotatorToolPage() {
    const { rotators } = await getRotatorData();

    const handleCreateRotator = async (data: {
        linkName: string;
        slug: string;
        csNumbers: Array<{ number: string; name: string }>;
        defaultMessage: string;
    }) => {
        'use server';
        const result = await createWARotator(data);
        if (result.success) {
            redirect('/tools/wa-rotator?created=true');
        } else {
            throw new Error(result.message);
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        WhatsApp CS Rotator 🔄
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Tool <span className="font-bold text-green-600">GRATIS</span> untuk membagi chat WhatsApp ke beberapa CS secara otomatis!
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="text-3xl mb-3">⚡</div>
                        <h3 className="font-bold text-gray-900 mb-2">Beban Merata</h3>
                        <p className="text-sm text-gray-600">
                            Chat terbagi rata ke semua CS, tidak ada yang overload
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-bold text-gray-900 mb-2">Tracking Lengkap</h3>
                        <p className="text-sm text-gray-600">
                            Lihat berapa banyak orang yang klik link Anda
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="text-3xl mb-3">🎯</div>
                        <h3 className="font-bold text-gray-900 mb-2">Link Pendek</h3>
                        <p className="text-sm text-gray-600">
                            1 link untuk semua CS, mudah dibagikan
                        </p>
                    </div>
                </div>

                {/* Create Form */}
                <WARotatorForm onSubmit={handleCreateRotator} />

                {/* Existing Rotators */}
                {rotators.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Link Rotator Anda
                        </h2>

                        <div className="grid gap-6">
                            {rotators.map((rotator: any) => (
                                <div key={rotator.id} className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {rotator.link_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-blue-600 font-mono text-sm">
                                                <span>cekkirim.com/wa/{rotator.slug}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/wa/${rotator.slug}`);
                                                    }}
                                                    className="p-1 hover:bg-blue-50 rounded"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={`/wa/${rotator.slug}`}
                                                    target="_blank"
                                                    className="p-1 hover:bg-blue-50 rounded"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>

                                        <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-xs text-blue-600 font-semibold">Total Klik</p>
                                            <p className="text-2xl font-bold text-blue-900">
                                                {formatNumber(rotator.total_clicks)}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-xs text-green-600 font-semibold">Konversi WA</p>
                                            <p className="text-2xl font-bold text-green-900">
                                                {formatNumber(rotator.total_conversions)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3">
                                            <p className="text-xs text-purple-600 font-semibold">Jumlah CS</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                {rotator.cs_count}
                                            </p>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-3">
                                            <p className="text-xs text-yellow-600 font-semibold">Conv. Rate</p>
                                            <p className="text-2xl font-bold text-yellow-900">
                                                {rotator.conversion_rate}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* CS List */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Customer Service:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {JSON.parse(rotator.cs_numbers || '[]').map((cs: any, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                                >
                                                    📱 {cs.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
