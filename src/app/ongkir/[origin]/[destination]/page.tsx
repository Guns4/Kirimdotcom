import { generateRouteCombinations, cities } from '@/lib/seo-cities';
import Link from 'next/link';
import { Metadata } from 'next';

// 1. Static Params Generation (ISR)
export async function generateStaticParams() {
  const combinations = generateRouteCombinations();
  // Limit to top 500 routes for build performance, others generated on demand
  return combinations.slice(0, 500);
}

// 2. Dynamic Metadata
type Props = {
  params: Promise<{ origin: string; destination: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { origin, destination } = await params;
  const o = capitalize(origin);
  const d = capitalize(destination);
  const year = new Date().getFullYear();

  return {
    title: `Ongkir ${o} ke ${d} Terbaru ${year} - Mulai Rp 8.000`,
    description: `Cek tarif pengiriman terlengkap dari ${o} ke ${d}. Bandingkan harga JNE, J&T, SiCepat, Cargo. Estimasi 1-3 hari sampai. Update tarif ${year}.`,
    keywords: [
      `ongkir ${origin} ${destination}`,
      `tarif pengiriman ${origin} ${destination}`,
      `ekspedisi ${origin} ${destination}`,
      `jne ${origin} ${destination}`,
    ],
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// 3. Page Component
export default async function RoutePage({ params }: Props) {
  const { origin, destination } = await params;
  const o = capitalize(origin);
  const d = capitalize(destination);

  // Schema Markup (FAQ)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Berapa ongkir termurah dari ${o} ke ${d}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Ongkir termurah dari ${o} ke ${d} mulai dari Rp 8.000 - Rp 12.000 tergantung ekspedisi dan layanan yang digunakan (Reguler/Ekonomi/Cargo).`,
        },
      },
      {
        '@type': 'Question',
        name: `Berapa lama pengiriman dari ${o} ke ${d}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Estimasi pengiriman dari ${o} ke ${d} adalah 1-3 hari untuk layanan Reguler dan 3-7 hari untuk layanan Cargo/Trucking.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ongkir {o} ke {d} <br />
            <span className="text-yellow-400">Terbaru 2025</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bandingkan tarif JNE, J&T, SiCepat, Shopee Express, dan Cargo. Mulai{' '}
            <strong>Rp 8.000/kg</strong>.
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 inline-flex gap-8 items-center border border-white/20">
            <div className="text-left">
              <div className="text-xs text-blue-300 uppercase tracking-widest">
                ASAL
              </div>
              <div className="text-2xl font-bold">{o}</div>
            </div>
            <div className="text-3xl opacity-50">✈️</div>
            <div className="text-left">
              <div className="text-xs text-blue-300 uppercase tracking-widest">
                TUJUAN
              </div>
              <div className="text-2xl font-bold">{d}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Table Comparison Pattern */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-xl text-gray-800">
              Perbandingan Tarif (Estimasi)
            </h2>
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Updated Hari Ini
            </span>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
              <tr>
                <th className="px-6 py-4">Ekspedisi</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Estimasi</th>
                <th className="px-6 py-4 text-right">Harga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Dummy Rows for SEO Page - In real app, fetch these */}
              {[
                {
                  name: 'JNE',
                  service: 'REG',
                  est: '2-3 Hari',
                  price: 'Rp 12.000',
                },
                {
                  name: 'J&T',
                  service: 'EZ',
                  est: '2-3 Hari',
                  price: 'Rp 12.000',
                },
                {
                  name: 'SiCepat',
                  service: 'REG',
                  est: '1-2 Hari',
                  price: 'Rp 11.500',
                },
                {
                  name: 'JNE',
                  service: 'JTR (Cargo)',
                  est: '4-7 Hari',
                  price: 'Rp 55.000 (Min 10kg)',
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {row.service}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{row.est}</td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 text-center">
            <p className="text-sm text-gray-500 mb-4">
              *Harga di atas adalah estimasi. Cek harga real-time akurat
              sekarang.
            </p>
            <Link
              href="/cek-ongkir"
              className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
            >
              Cek Ongkir Real-Time Akurat 🚀
            </Link>
          </div>
        </div>

        {/* FAQ Section with Schema */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2">
                Berapa ongkir termurah dari {o} ke {d}?
              </h3>
              <p className="text-gray-600">
                Untuk paket kecil (dibawah 1kg), tarif termurah biasanya dimulai
                dari Rp 8.000 - Rp 12.000 menggunakan layanan ekonomi. Untuk
                paket besar (di atas 10kg), layanan Kargo seperti JNE JTR atau
                J&T Cargo jauh lebih murah.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2">
                Ekspedisi apa saja yang tersedia?
              </h3>
              <p className="text-gray-600">
                Kami menyediakan perbandingan tarif untuk JNE, J&T, SiCepat,
                Anteraja, Pos Indonesia, Lion Parcel, dan berbagai layanan kargo
                lainnya.
              </p>
            </div>
          </div>
        </section>

        {/* Internal Linking */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Rute Populer Lainnya dari {o}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cities
              .slice(0, 12)
              .filter((c) => c.toLowerCase() !== origin)
              .map((city) => (
                <Link
                  key={city}
                  href={`/ongkir/${origin}/${city.toLowerCase()}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition"
                >
                  Ongkir ke {city}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
