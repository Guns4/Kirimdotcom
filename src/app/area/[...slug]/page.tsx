import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRegionBySlug, getAllLocationPaths } from '@/lib/seo-locations';
import { MapPin, Truck, CheckCircle } from 'lucide-react';
import LocalLeaderboard from '@/components/community/LocalLeaderboard';
import { getTopSellers } from '@/lib/community-ranking';
import dynamic from 'next/dynamic';

// Dynamic Import for Map (Client Side Only)
const AgentMap = dynamic(() => import('@/components/maps/AgentMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">Loading Map...</div>
});

interface Props {
    params: Promise<{
        slug: string[];
    }>;
}

// 1. Generate Static Params (Build Time)
export async function generateStaticParams() {
    const paths = getAllLocationPaths();
    // Limit for dev/build performance if list is huge, 
    // but for <1000 items it's fine.
    return paths.map((p) => ({
        slug: p.slug,
    }));
}

// 2. Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const region = getRegionBySlug(slug);

    if (!region) return { title: 'Area Not Found' };

    const title = `Cek Ongkir & Resi Tercepat di Kecamatan ${region.district}, ${region.city}`;
    const desc = `Layanan cek ongkir semua ekspedisi (JNE, J&T, SiCepat) dan tracking resi akurat untuk wilayah Kecamatan ${region.district}, ${region.city}, ${region.province}. Support COD & PayLater.`;

    return {
        title,
        description: desc,
        alternates: {
            canonical: `/area/${slug.join('/')}`
        },
        openGraph: {
            title,
            description: desc,
        }
    };
}

// 3. Page Content
export default async function AreaPage({ params }: Props) {
    const { slug } = await params;
    const region = getRegionBySlug(slug);

    if (!region) notFound();

    const mapQuery = encodeURIComponent(`Kecamatan ${region.district}, ${region.city}, courier service`);
    const topSellers = await getTopSellers(region.district);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-blue-900 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-800 px-4 py-1 rounded-full text-sm font-medium mb-4">
                        <MapPin className="w-4 h-4 text-blue-300" />
                        <span>Layanan Prioritas: {region.province}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">
                        Kirim Paket dari <span className="text-blue-300">{region.district}</span>?
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        Solusi logistik terlengkap untuk warga {region.district}, {region.city}.
                        Bandingkan harga termurah dari 20+ ekspedisi dalam satu klik.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Truck className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Pickup Gratis</h3>
                        <p className="text-gray-600">
                            Kurir kami siap jemput paket di seluruh area {region.district} tanpa biaya tambahan.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Bisa COD</h3>
                        <p className="text-gray-600">
                            Kirim barang dulu, bayar nanti. Tersedia untuk pengiriman dari {region.city}.
                        </p>
                    </div>

                    {/* Card 3 (Map) */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden md:col-span-1 h-64 md:h-auto min-h-[250px] relative">
                        <iframe
                            width="100%"
                            height="100%"
                            className="absolute inset-0 border-0"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${mapQuery}`}
                        ></iframe>
                        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 p-4 text-center text-xs text-gray-500">
                                (Map requires API Key)
                            </div>
                        )}
                    </div>
                </div>

                {/* Localized Content Body */}
                <div className="mt-12 max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold mb-4">
                        Jangkauan Pengiriman di {region.district}
                    </h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Bagi masyarakat {region.cityType} {region.city}, khususnya di kecamatan <strong>{region.district}</strong> (Kode Pos: {region.postalCode || '...'}, CekKirim.com hadir sebagai platform agregator logistik nomor 1.
                        Kami menjangkau seluruh kelurahan di area {region.district} untuk memastikan paket Anda sampai dengan aman.
                    </p>

                    <h3 className="text-lg font-bold mb-2 mt-6">Ekspedisi Tersedia:</h3>
                    <div className="flex flex-wrap gap-2">
                        {['JNE', 'J&T', 'SiCepat', 'AnterAja', 'ID Express', 'Ninja Xpress', 'Lion Parcel'].map(ex => (
                            <span key={ex} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                {ex}
                            </span>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                        <p className="font-medium text-blue-900">
                            💡 Tips: Gunakan fitur "Cek Ongkir" di halaman utama untuk mendapatkan harga diskon spesial warga {region.province}.
                        </p>
                    </div>
                </div>

                {/* Local Community Leaderboard */}
                <LocalLeaderboard district={region.district} topSellers={topSellers} />

                {/* Agent Finder Map */}
                <AgentMap districtName={region.district} />

                {/* CTA */}
                <div className="text-center mt-12 mb-8">
                    <a href="/" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1">
                        Cek Ongkir {region.district} Sekarang
                    </a>
                </div>
            </div>
        </div>
    );
}
