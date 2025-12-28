import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createWARotator, getUserRotators } from '@/app/actions/waRotatorActions';
import WARotatorForm from '@/components/wa-rotator/WARotatorForm';
import { RotatorCard } from '@/components/wa-rotator/RotatorCard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
                                <RotatorCard key={rotator.id} rotator={rotator} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
