import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Package, Clock, TrendingDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: {
        kota: string;
        kecamatan: string;
    };
}

// Generate static params for SSG
export async function generateStaticParams() {
    const supabase = await createClient();

    const { data: kecamatanList } = await supabase
        .from('kecamatan')
        .select('kecamatan_slug, cities(city_slug)')
        .limit(100); // Limit for build time

    if (!kecamatanList) return [];

    return kecamatanList.map((k: any) => ({
        kota: k.cities.city_slug,
        kecamatan: k.kecamatan_slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    const supabase = await createClient();

    const { data: kecamatan } = await supabase
        .from('kecamatan')
        .select('*, cities(*)')
        .eq('kecamatan_slug', params.kecamatan)
        .eq('cities.city_slug', params.kota)
        .single();

    if (!kecamatan) {
        return {
            title: 'Halaman Tidak Ditemukan',
        };
    }

    const couriers = kecamatan.available_couriers?.join(', ') || 'JNE, J&T, SiCepat';

    return {
        title: `Cek Ongkir ke ${kecamatan.kecamatan_name}, ${kecamatan.cities.city_name} - Bandingkan ${kecamatan.available_couriers?.length || 10}+ Ekspedisi`,
        description: `Cari tarif ongkir termurah ke ${kecamatan.kecamatan_name}, ${kecamatan.cities.city_name}. Tersedia ${couriers}. Estimasi sampai ${kecamatan.avg_delivery_days} hari. Gratis tracking real-time!`,
        keywords: [
            `ongkir ${kecamatan.kecamatan_name}`,
            `ekspedisi ${kecamatan.kecamatan_name}`,
            `kirim paket ${kecamatan.kecamatan_name}`,
            `cek ongkir ${kecamatan.cities.city_name}`,
            `JNE ${kecamatan.kecamatan_name}`,
            `J&T ${kecamatan.kecamatan_name}`,
        ],
        openGraph: {
            title: `Cek Ongkir ke ${kecamatan.kecamatan_name}, ${kecamatan.cities.city_name}`,
            description: `Bandingkan tarif ongkir dari ${couriers} ke ${kecamatan.kecamatan_name}`,
        },
    };
}

export default async function KecamatanPage({ params }: PageProps) {
    const supabase = await createClient();

    // Fetch kecamatan data
    const { data: kecamatan } = await supabase
        .from('kecamatan')
        .select('*, cities(*)')
        .eq('kecamatan_slug', params.kecamatan)
        .eq('cities.city_slug', params.kota)
        .single();

    if (!kecamatan) {
        notFound();
    }

    // Increment search count
    await supabase
        .from('kecamatan')
        .update({
            search_count: (kecamatan.search_count || 0) + 1,
            last_searched_at: new Date().toISOString()
        })
        .eq('id', kecamatan.id);

    // Get nearby kecamatan (same city)
    const { data: nearbyKecamatan } = await supabase
        .from('kecamatan')
        .select('kecamatan_name, kecamatan_slug')
        .eq('city_id', kecamatan.city_id)
        .neq('id', kecamatan.id)
        .limit(6);

    // Get popular cities for internal linking
    const { data: popularCities } = await supabase
        .from('cities')
        .select('city_name, city_slug, total_kecamatan')
        .eq('is_popular', true)
        .limit(5);

    const couriers = kecamatan.available_couriers?.join(', ') || 'JNE, J&T, SiCepat, AnterAja';

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6">
                    <ol className="flex items-center gap-2 text-gray-600">
                        <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                        <ChevronRight className="w-4 h-4" />
                        <li><Link href="/cek-ongkir" className="hover:text-blue-600">Cek Ongkir</Link></li>
                        <ChevronRight className="w-4 h-4" />
                        <li><Link href={`/cek-ongkir/${params.kota}`} className="hover:text-blue-600">{kecamatan.cities.city_name}</Link></li>
                        <ChevronRight className="w-4 h-4" />
                        <li className="text-gray-900 font-semibold">{kecamatan.kecamatan_name}</li>
                    </ol>
                </nav>

                {/* Main Content */}
                <article className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Cek Ongkir ke {kecamatan.kecamatan_name}, {kecamatan.cities.city_name}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{kecamatan.cities.province}</span>
                            </div>
                            {kecamatan.postal_code && (
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <span>Kode Pos: {kecamatan.postal_code}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Estimasi: {kecamatan.avg_delivery_days} hari</span>
                            </div>
                        </div>
                    </header>

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
                        <h2 className="text-2xl font-bold mb-3">
                            Bandingkan Ongkir Sekarang! 📦
                        </h2>
                        <p className="mb-4 opacity-90">
                            Masukkan detail pengiriman Anda dan dapatkan perbandingan harga dari semua ekspedisi
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Cek Ongkir Gratis →
                        </Link>
                    </div>

                    {/* Intro */}
                    <section className="prose max-w-none mb-8">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Mau kirim paket ke <strong>{kecamatan.kecamatan_name}, {kecamatan.cities.city_name}</strong>?
                            Bandingkan tarif ongkir dari berbagai ekspedisi di sini! Kami menyediakan perbandingan harga dari {couriers} dan ekspedisi lainnya.
                        </p>
                    </section>

                    {/* Ekspedisi Section */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ekspedisi yang Melayani {kecamatan.kecamatan_name}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {kecamatan.available_couriers?.map((courier: string) => (
                                <div key={courier} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{courier}</p>
                                            <p className="text-sm text-gray-600">Layanan reguler & express</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Delivery Time */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Estimasi Waktu Pengiriman
                        </h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <p className="text-gray-700">
                                Rata-rata waktu pengiriman ke <strong>{kecamatan.kecamatan_name}, {kecamatan.cities.city_name}</strong> adalah{' '}
                                <span className="font-bold text-blue-600">{kecamatan.avg_delivery_days} hari kerja</span>.
                                Namun, waktu sebenarnya bisa bervariasi tergantung layanan yang dipilih (reguler/express) dan lokasi asal pengiriman.
                            </p>
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            <TrendingDown className="inline w-6 h-6 mr-2" />
                            Tips Hemat Ongkir ke {kecamatan.kecamatan_name}
                        </h2>
                        <ol className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">1.</span>
                                <span><strong>Bandingkan harga</strong> dari berbagai ekspedisi sebelum checkout</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">2.</span>
                                <span><strong>Pilih layanan reguler</strong> jika tidak terburu-buru untuk hemat biaya</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">3.</span>
                                <span><strong>Manfaatkan promo</strong> gratis ongkir dari marketplace atau toko</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">4.</span>
                                <span><strong>Kirim dalam jumlah banyak</strong> untuk mendapat potongan harga volume</span>
                            </li>
                        </ol>
                    </section>
                </article>

                {/* Internal Linking: Nearby Kecamatan */}
                {nearbyKecamatan && nearbyKecamatan.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Kecamatan Lain di {kecamatan.cities.city_name}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {nearbyKecamatan.map((k: any) => (
                                <Link
                                    key={k.kecamatan_slug}
                                    href={`/cek-ongkir/${params.kota}/${k.kecamatan_slug}`}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition"
                                >
                                    <p className="font-semibold text-gray-900">{k.kecamatan_name}</p>
                                    <p className="text-sm text-blue-600 mt-1">Lihat tarif →</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Internal Linking: Popular Cities */}
                {popularCities && popularCities.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Cek Ongkir ke Kota Lainnya
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {popularCities.map((city: any) => (
                                <Link
                                    key={city.city_slug}
                                    href={`/cek-ongkir/${city.city_slug}`}
                                    className="inline-block bg-gray-100 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                                >
                                    <span className="font-semibold text-gray-900">{city.city_name}</span>
                                    <span className="text-sm text-gray-600 ml-2">({city.total_kecamatan} kecamatan)</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
