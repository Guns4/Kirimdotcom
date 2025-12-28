import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Truck, Clock, MapPin } from 'lucide-react';
import { generateRouteCombinations, getCityBySlug, getPopularRoutes } from '@/lib/seo-cities';

interface PageProps {
    params: Promise<{
        origin: string;
        destination: string;
    }>;
}

// Generate static params for all city combinations
export async function generateStaticParams() {
    const combinations = generateRouteCombinations();
    // Limit to top 500 routes for build performance
    return combinations.slice(0, 500);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { origin, destination } = await params;
    const originCity = getCityBySlug(origin);
    const destCity = getCityBySlug(destination);

    if (!originCity || !destCity) {
        return { title: 'Halaman Tidak Ditemukan' };
    }

    const title = `Ongkir ${originCity.name} ke ${destCity.name} Terbaru 2025 - Mulai Rp 8.000`;
    const description = `Cek ongkir termurah dari ${originCity.name} ke ${destCity.name}. Bandingkan tarif JNE, J&T, SiCepat, AnterAja. Estimasi 1-3 hari. Hemat hingga 50%!`;

    return {
        title,
        description,
        keywords: [
            `ongkir ${originCity.name} ${destCity.name}`,
            `tarif pengiriman ${originCity.name} ke ${destCity.name}`,
            `ekspedisi ${originCity.name} ${destCity.name}`,
            `jne ${originCity.name} ${destCity.name}`,
            `jnt ${originCity.name} ${destCity.name}`,
            `sicepat ${originCity.name} ${destCity.name}`,
        ],
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

// Mock shipping data - in production, fetch from API or database
function getShippingRates(origin: string, destination: string) {
    return [
        { courier: 'JNE', service: 'REG', price: 15000, etd: '2-3 hari', logo: '🔵' },
        { courier: 'JNE', service: 'YES', price: 25000, etd: '1 hari', logo: '🔵' },
        { courier: 'J&T', service: 'EZ', price: 12000, etd: '2-4 hari', logo: '🔴' },
        { courier: 'J&T', service: 'Express', price: 18000, etd: '1-2 hari', logo: '🔴' },
        { courier: 'SiCepat', service: 'REG', price: 11000, etd: '2-3 hari', logo: '🟠' },
        { courier: 'SiCepat', service: 'BEST', price: 14000, etd: '1-2 hari', logo: '🟠' },
        { courier: 'AnterAja', service: 'Reguler', price: 10000, etd: '2-4 hari', logo: '🟢' },
        { courier: 'AnterAja', service: 'Same Day', price: 35000, etd: '6 jam', logo: '🟢' },
    ];
}

export default async function SEORoutePage({ params }: PageProps) {
    const { origin, destination } = await params;
    const originCity = getCityBySlug(origin);
    const destCity = getCityBySlug(destination);

    if (!originCity || !destCity) {
        notFound();
    }

    const rates = getShippingRates(origin, destination);
    const cheapestRate = Math.min(...rates.map(r => r.price));
    const popularRoutes = getPopularRoutes(origin, destination, 12);

    return (
        <main className="min-h-screen bg-surface-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-accent-500 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-lg font-medium">{originCity.name}</span>
                        </div>
                        <ArrowRight className="w-8 h-8" />
                        <div className="text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-lg font-medium">{destCity.name}</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Ongkir {originCity.name} ke {destCity.name}
                    </h1>
                    <p className="text-xl text-white/90">
                        Mulai dari <span className="font-bold text-2xl">Rp {cheapestRate.toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-sm text-white/70 mt-2">Update Januari 2025</p>
                </div>
            </section>

            {/* Price Comparison Table */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-surface-900 mb-6">
                        Perbandingan Tarif Ekspedisi
                    </h2>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-surface-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-surface-700">Ekspedisi</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-surface-700">Layanan</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-surface-700">Tarif (1kg)</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-surface-700">Estimasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {rates.map((rate, idx) => (
                                        <tr key={idx} className="hover:bg-surface-50">
                                            <td className="px-6 py-4">
                                                <span className="text-xl mr-2">{rate.logo}</span>
                                                <span className="font-medium">{rate.courier}</span>
                                            </td>
                                            <td className="px-6 py-4 text-surface-600">{rate.service}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-primary-600">
                                                Rp {rate.price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-right text-surface-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {rate.etd}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="text-sm text-surface-500 mt-4 text-center">
                        * Tarif dapat berubah sewaktu-waktu. Cek harga terbaru di form di atas.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 px-4 bg-surface-100">
                <div className="max-w-4xl mx-auto text-center">
                    <Truck className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-surface-900 mb-4">
                        Kirim Paket Sekarang
                    </h2>
                    <p className="text-surface-600 mb-6">
                        Dapatkan harga ongkir real-time dan bandingkan semua ekspedisi
                    </p>
                    <Link
                        href={`/cek-ongkir?from=${origin}&to=${destination}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-semibold"
                    >
                        <span>Cek Ongkir Real-Time</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Internal Links - Popular Routes */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-surface-900 mb-6">
                        Rute Populer Lainnya
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {popularRoutes.map((route, idx) => {
                            const from = getCityBySlug(route.origin);
                            const to = getCityBySlug(route.destination);
                            if (!from || !to) return null;

                            return (
                                <Link
                                    key={idx}
                                    href={`/ongkir/${route.origin}/${route.destination}`}
                                    className="p-4 bg-white rounded-lg border border-surface-200 hover:border-primary-300 hover:shadow-md transition"
                                >
                                    <div className="text-sm font-medium text-surface-900">
                                        {from.name} → {to.name}
                                    </div>
                                    <div className="text-xs text-surface-500 mt-1">
                                        Mulai Rp 8.000
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Schema */}
            <section className="py-12 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-surface-900 mb-6">
                        FAQ Ongkir {originCity.name} ke {destCity.name}
                    </h2>
                    <div className="space-y-4">
                        <details className="bg-surface-50 rounded-lg p-4">
                            <summary className="font-medium cursor-pointer">
                                Berapa ongkir termurah dari {originCity.name} ke {destCity.name}?
                            </summary>
                            <p className="mt-3 text-surface-600">
                                Ongkir termurah dari {originCity.name} ke {destCity.name} mulai dari Rp {cheapestRate.toLocaleString('id-ID')}
                                untuk berat 1 kg menggunakan layanan reguler.
                            </p>
                        </details>
                        <details className="bg-surface-50 rounded-lg p-4">
                            <summary className="font-medium cursor-pointer">
                                Berapa lama pengiriman dari {originCity.name} ke {destCity.name}?
                            </summary>
                            <p className="mt-3 text-surface-600">
                                Estimasi pengiriman reguler 2-4 hari kerja. Untuk layanan express bisa 1-2 hari.
                            </p>
                        </details>
                        <details className="bg-surface-50 rounded-lg p-4">
                            <summary className="font-medium cursor-pointer">
                                Ekspedisi apa saja yang tersedia?
                            </summary>
                            <p className="mt-3 text-surface-600">
                                JNE, J&T Express, SiCepat, AnterAja, POS Indonesia, TIKI, Ninja Express, dan lainnya.
                            </p>
                        </details>
                    </div>
                </div>
            </section>
        </main>
    );
}
