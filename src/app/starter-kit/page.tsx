import { createClient } from '@/utils/supabase/server';
import BundlePricingCard from '@/components/starter-kit/BundlePricingCard';
import TestimonialSection from '@/components/starter-kit/TestimonialSection';
import { PurchaseButton } from '@/components/starter-kit/PurchaseButton';
import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Paket Siap Jualan - Starter Kit Pemula | CekKirim',
    description: 'Paket lengkap untuk memulai bisnis online. Hemat 30% dengan bundling E-book + Premium + Template. Garansi uang kembali!',
};

async function getStarterKitData() {
    const supabase = await createClient();

    // Fetch bundle data
    const { data: bundle } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('bundle_slug', 'starter-kit-pemula')
        .eq('is_active', true)
        .single();

    // Fetch testimonials
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .eq('related_product_type', 'starter_kit')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

    return { bundle, testimonials: testimonials || [] };
}

export default async function StarterKitPage() {
    const { bundle, testimonials } = await getStarterKitData();

    if (!bundle) {
        redirect('/shop');
    }

    // Type assertion - bundle is guaranteed to exist after redirect
    const bundleData = bundle as any;

    const handlePurchase = async () => {
        'use server';
        // TODO: Implement purchase flow
        redirect('/checkout?bundle=starter-kit-pemula');
    };

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Mulai Jualan Online Hari Ini! 🚀
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Paket Lengkap untuk Pemula: E-book + Premium + Template
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-lg">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span>✅</span> Panduan Lengkap
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span>✅</span> Akses Premium
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span>✅</span> Template Gratis
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem - Agitate - Solution */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Problem */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Bingung Mulai Jualan Online? 🤔
                            </h2>
                            <ul className="space-y-4 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 text-xl">❌</span>
                                    <span>Gak tau cara kelola stok dan orderan</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 text-xl">❌</span>
                                    <span>Tracking paket masih manual & ribet</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 text-xl">❌</span>
                                    <span>Nota & invoice masih tulis tangan</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-red-500 text-xl">❌</span>
                                    <span>Takut rugi karena salah strategi</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solution */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Solusinya Ada Di Sini! ✨
                            </h3>
                            <ul className="space-y-4 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✅</span>
                                    <span className="font-semibold">E-book 150 Halaman</span> - Panduan step-by-step
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✅</span>
                                    <span className="font-semibold">Akses Premium 1 Bulan</span> - Auto tracking & analytics
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✅</span>
                                    <span className="font-semibold">Template Nota</span> - Siap pakai, profesional
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 text-xl">✅</span>
                                    <span className="font-semibold">Bonus Komunitas</span> - Networking seller sukses
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Investasi Terbaik untuk Bisnis Anda 💎
                        </h2>
                        <p className="text-xl text-gray-600">
                            Hemat <span className="font-bold text-green-600">30%</span> dengan paket bundling!
                        </p>
                    </div>

                    <BundlePricingCard
                        bundleName={bundleData.bundle_name}
                        description={bundleData.description}
                        originalPrice={bundleData.original_price}
                        bundlePrice={bundleData.bundle_price}
                        discountPercentage={bundleData.discount_percentage}
                        items={bundleData.items}
                        features={bundleData.features}
                        badgeText={bundleData.badge_text}
                        onPurchase={handlePurchase}
                    />
                </div>
            </section>

            {/* Testimonials */}
            <TestimonialSection testimonials={testimonials} />

            {/* FAQ Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Pertanyaan yang Sering Ditanyakan
                    </h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Apakah cocok untuk pemula yang belum pernah jualan online?',
                                a: 'Sangat cocok! E-book kami ditulis khusus untuk pemula dengan bahasa yang mudah dipahami dan step-by-step guide.',
                            },
                            {
                                q: 'Berapa lama akses premium-nya?',
                                a: 'Akses premium berlaku selama 1 bulan penuh (30 hari) sejak pembelian. Anda bisa perpanjang dengan harga spesial.',
                            },
                            {
                                q: 'Apakah bisa refund jika tidak puas?',
                                a: 'Ya! Kami memberikan garansi uang kembali 7 hari tanpa pertanyaan jika Anda merasa tidak puas.',
                            },
                            {
                                q: 'Bagaimana cara akses materi setelah beli?',
                                a: 'Setelah pembayaran terkonfirmasi, semua materi langsung bisa diakses di dashboard akun Anda.',
                            },
                        ].map((faq, index) => (
                            <details
                                key={index}
                                className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition"
                            >
                                <summary className="font-semibold text-gray-900 text-lg">
                                    {faq.q}
                                </summary>
                                <p className="mt-3 text-gray-600">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Siap Mulai Perjalanan Sukses Anda? 🎯
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Jangan tunda lagi! Ribuan seller sudah membuktikan hasilnya.
                        Sekarang giliran Anda!
                    </p>
                    <PurchaseButton />
                    <p className="mt-6 text-blue-100">
                        ⏰ Promo terbatas! Stok tersisa hanya untuk 50 pembeli pertama
                    </p>
                </div>
            </section>
        </main>
    );
}
