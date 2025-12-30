import { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // valid slug: [courier, resi] e.g. ['jne', 'CGK123456']
  if (slug.length < 2) return { title: 'Cek Resi' };

  const courier = slug[0].toUpperCase();
  const resi = slug[1];

  return {
    title: `Lacak Paket ${courier} ${resi} - Status Terkini`,
    description: `Cek status pengiriman paket ${courier} dengan nomor resi ${resi}. Lacak posisi paket secara real-time.`,
    openGraph: {
      title: `Lacak Paket ${courier} - ${resi}`,
      description: `Status pengiriman terkini untuk nomor resi ${resi} (${courier})`,
    },
  };
}

export default async function TrackingPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug.length < 2) {
    notFound();
  }

  const courierCode = slug[0].toLowerCase();
  const resiNumber = slug[1];

  // ParcelDelivery Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ParcelDelivery',
    deliveryStatus: {
      '@type': 'DeliveryEvent',
      availableFrom: new Date().toISOString(),
    },
    trackingNumber: resiNumber,
    provider: {
      '@type': 'Organization',
      name: courierCode.toUpperCase(),
    },
    expectedArrivalFrom: new Date().toISOString(),
    hasDeliveryMethod: 'http://schema.org/ParcelService',
  };

  return (
    <main className="min-h-screen bg-slate-950 py-20 px-4">
      <JsonLd data={jsonLd} />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-indigo-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Tracking {courierCode.toUpperCase()}
          </h1>
          <p className="text-xl font-mono text-indigo-300 mb-6">{resiNumber}</p>

          <div className="bg-white/5 rounded-xl p-6 text-left">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Status Pengiriman
            </h2>
            {/* 
                           In a real app, we would fetch tracking data server-side here.
                           For now, we render the layout and schema as requested.
                        */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <div className="w-0.5 h-full bg-white/10 my-1" />
              </div>
              <div className="pb-8">
                <p className="text-white font-medium">Sedang Memuat Data...</p>
                <p className="text-sm text-gray-400">
                  Menghubungi server ekspedisi
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/?tracking=${resiNumber}&courier=${courierCode}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium"
            >
              <Truck className="w-5 h-5" />
              Lihat Detail Lengkap
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
