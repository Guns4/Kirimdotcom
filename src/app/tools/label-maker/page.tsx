import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LabelMakerCanvas from '@/components/label-maker/LabelMakerCanvas';
import { Printer, Star } from 'lucide-react';
import { ScrollToButton } from '@/components/ui/ScrollToButton';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Label Maker - Buat Label Pengiriman | CekKirim',
    description: 'Desain label pengiriman dengan logo toko Anda sendiri',
};

async function getUserData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // Check if premium (placeholder - implement actual premium check)
    const isPremium = false; // TODO: Check from user subscription

    return { user, isPremium };
}

export default async function LabelMakerPage() {
    const { user, isPremium } = await getUserData();

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-purple-100 rounded-full p-3 mb-4">
                        <Printer className="w-12 h-12 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Label Maker - Branding Tool
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Buat label pengiriman yang profesional dengan logo toko Anda sendiri. Tinggalkan kesan pertama yang WOW! 🎨
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl mb-2">🎨</div>
                        <h3 className="font-semibold text-gray-900 mb-1">Custom Design</h3>
                        <p className="text-sm text-gray-600">Upload logo & atur warna</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <h3 className="font-semibold text-gray-900 mb-1">Instant Download</h3>
                        <p className="text-sm text-gray-600">PDF siap cetak langsung</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <h3 className="font-semibold text-gray-900 mb-1">Hemat Biaya</h3>
                        <p className="text-sm text-gray-600">Tidak perlu desainer</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-md text-center">
                        <div className="text-3xl mb-2">✨</div>
                        <h3 className="font-semibold text-gray-900 mb-1">Profesional</h3>
                        <p className="text-sm text-gray-600">Brand lebih kredibel</p>
                    </div>
                </div>

                {/* Main editor */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <LabelMakerCanvas isPremium={isPremium} />
                </div>

                {/* Tutorial */}
                <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <h2 className="text-xl font-bold text-blue-900 mb-4">
                        📝 Cara Menggunakan:
                    </h2>
                    <ol className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Isi nama toko, alamat, dan nomor WhatsApp Anda</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Upload logo toko (opsional, tapi sangat disarankan!)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>Sesuaikan ukuran font dan gaya border sesuai selera</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>Klik "Download Label (PDF)" untuk mendapatkan file siap cetak</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">5.</span>
                            <span>Cetak di kertas stiker atau HVS biasa, lalu tempel di paket!</span>
                        </li>
                    </ol>
                </div>

                {/* Testimonials */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                        ⭐ Kata Mereka yang Sudah Pakai
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Label dengan logo sendiri bikin toko saya terlihat lebih profesional. Customer jadi lebih percaya!"
                            </p>
                            <p className="text-sm font-semibold text-gray-900">- Budi, Toko Elektronik</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Praktis banget! Dulu harus ke desainer, sekarang tinggal edit sendiri. Hemat waktu & uang."
                            </p>
                            <p className="text-sm font-semibold text-gray-900">- Siti, Online Shop</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Repeat order naik 20% sejak pakai label branded. Customer ingat toko saya!"
                            </p>
                            <p className="text-sm font-semibold text-gray-900">- Ahmad, Reseller Fashion</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Mulai Branding Toko Anda Sekarang!
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        Tool ini 100% GRATIS. Buat label sebanyak yang Anda mau!
                    </p>
                    <ScrollToButton targetY={200}>
                        Mulai Buat Label →
                    </ScrollToButton>
                </div>
            </div>
        </main>
    );
}
