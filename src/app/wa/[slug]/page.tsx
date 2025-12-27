import { getNextCSNumber, recordRotatorClick, recordWAConversion } from '@/app/actions/waRotatorActions';
import { redirect, notFound } from 'next/navigation';
import { MessageCircle, ExternalLink } from 'lucide-react';

export const metadata = {
    title: 'WhatsApp CS Rotator | CekKirim',
    description: 'Mengarahkan ke customer service WhatsApp',
};

interface WARedirectPageProps {
    params: {
        slug: string;
    };
}

export default async function WARedirectPage({ params }: WARedirectPageProps) {
    const { slug } = params;

    // Get next CS number using round-robin
    const result = await getNextCSNumber(slug);

    if (!result) {
        notFound();
    }

    const { cs, index, totalCS, rotatorId, defaultMessage } = result;

    // Record click event
    await recordRotatorClick(rotatorId, slug, cs.number, index);

    // Build WhatsApp URL
    const waURL = `https://wa.me/${cs.number}${defaultMessage ? `?text=${encodeURIComponent(defaultMessage)}` : ''}`;

    // Handle conversion tracking when button is clicked
    const handleWAClick = async () => {
        'use server';
        await recordWAConversion(rotatorId);
        redirect(waURL);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-10 h-10 text-green-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Menghubungkan ke {cs.name}
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Anda akan diarahkan ke WhatsApp Customer Service kami
                    </p>

                    {/* CS Info */}
                    <div className="bg-green-50 rounded-xl p-6 mb-6">
                        <p className="text-sm text-green-800 font-semibold mb-2">
                            Customer Service Aktif:
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                            {cs.name}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                            CS {index + 1} dari {totalCS} CS yang tersedia
                        </p>
                    </div>

                    {/* CTA Button */}
                    <form action={handleWAClick}>
                        <button
                            type="submit"
                            className="group w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold text-lg py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <MessageCircle className="w-6 h-6" />
                            <span>Buka WhatsApp Sekarang</span>
                            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Info */}
                    <p className="text-xs text-gray-500 mt-6">
                        💬 Klik tombol di atas untuk memulai chat via WhatsApp
                    </p>
                </div>

                {/* Ad Banner Slot */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-blue-200">
                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-3">
                            📦 Butuh Solusi untuk Tracking Paket?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            CekKirim - Platform tracking paket & tools gratis untuk seller!
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900">🔍 Tracking Paket</p>
                                <p className="text-xs text-blue-700 mt-1">Semua ekspedisi</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-purple-900">📚 E-book Gratis</p>
                                <p className="text-xs text-purple-700 mt-1">Panduan seller</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm font-semibold text-green-900">🛠️ Tools Gratis</p>
                                <p className="text-xs text-green-700 mt-1">WA rotator & more</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Coba Sekarang - Gratis! →
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Powered by <a href="/" className="font-semibold text-blue-600 hover:underline">CekKirim.com</a>
                    </p>
                </div>
            </div>
        </main>
    );
}
