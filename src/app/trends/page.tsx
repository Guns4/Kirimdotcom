import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  getCourierTrends,
  triggerTrendCalculation,
} from '@/app/actions/trends';
import { CourierPerformanceChart } from '@/components/analytics/CourierPerformanceChart';
import { TrendingUp, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Tren Pengiriman Logistik Indonesia 2025 | CekKirim.com',
  description:
    'Lihat data analitik terbaru performa kurir pengiriman di Indonesia. Siapa yang paling cepat? JNE, J&T, atau SiCepat? Cek datanya di sini.',
  openGraph: {
    title: 'Ranking Kurir Tercepat Indonesia 2025',
    description:
      'Data real-time rata-rata pengiriman logistik berdasarkan ribuan data resi.',
    type: 'website',
  },
};

export default async function TrendsPage() {
  // In production, cron job handles this.
  // Here we trigger it ONCE per request for "live demo" feel (careful with perf),
  // or better yet, assume cron ran.
  // Let's just fetch existing data.

  // Optional: trigger calculation if dev mode or manual
  // await triggerTrendCalculation()

  const trends = await getCourierTrends();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container-custom py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Logistics Intelligence 2025
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Siapa Juara Kurir <span className="text-blue-600">Tercepat?</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Kami menganalisis ribuan data resi setiap hari untuk memberikan
              transparansi performa logistik di Indonesia. Data ini membantu
              seller dan buyer memilih ekspedisi terbaik.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/#cek-resi">
                  Cek Resi Paketmu
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                asChild
              >
                <Link href="/docs">Untuk Developer</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Chart Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Truck className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Performa Pengiriman Minggu Ini
              </h2>
            </div>

            <Suspense
              fallback={
                <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl" />
              }
            >
              <CourierPerformanceChart data={trends} />
            </Suspense>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
              <strong>Disclaimer:</strong> Data dihitung dari selisih waktu
              paket dibuat ("manifested") hingga diterima ("delivered"). Hanya
              mencakup data yang dilacak melalui CekKirim.com dan tidak mewakili
              performa nasional secara keseluruhan.
            </div>
          </div>

          {/* SEO Content Section */}
          <article className="prose prose-gray max-w-none">
            <h3>Mengapa Kecepatan Pengiriman Penting?</h3>
            <p>
              Dalam era e-commerce, kecepatan pengiriman menjadi faktor penentu
              kepuasan pelanggan. Kurir seperti JNE, J&T, SiCepat, dan AnterAja
              berlomba memberikan layanan terbaik. Melalui halaman{' '}
              <strong>Logistics Trends</strong> ini, kami ingin menyajikan data
              objektif.
            </p>
            <p>
              Seller online dapat menggunakan data ini untuk menentukan
              ekspedisi default di marketplace mereka, sehingga mengurangi
              risiko komplain "paket lama sampai".
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
