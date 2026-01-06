import React from 'react';
import Link from 'next/link';
import { AffiliateLinkedText } from '@/components/affiliate/AffiliateLinkedText';
import { AdUnit } from '@/components/ads/AdUnit'; // Assuming this exports named AdUnit
import { LazyAd } from '@/components/ads/LazyAd';
import { ArrowLeft, Package, MapPin, Truck } from 'lucide-react';

export default async function TrackingResult({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Mock Data mimicking a real DB response
  const trackingData = {
    id: id,
    status: 'OTW (SEDANG DIKIRIM)',
    courier: 'JNE',
    origin: 'Jakarta',
    destination: 'Bandung',
    description:
      'Paket berisi sepatu running Nike dan baju kaos polos. Harap hati-hati barang mudah penyok.',
    history: [
      {
        status: 'Paket Diterima di Gudang Jakarta',
        time: 'Hari ini, 10:00 WIB',
        active: true,
      },
      {
        status: 'Kurir Menjemput Paket',
        time: 'Kemarin, 14:30 WIB',
        active: false,
      },
      { status: 'Order Dibuat', time: 'Kemarin, 13:00 WIB', active: false },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/track"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Cek Resi Lain
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tracking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Status */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold font-mono tracking-wider">
                    {trackingData.id}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 opacity-90">
                    <Truck className="w-4 h-4" />
                    <span>{trackingData.courier} Regular</span>
                  </div>
                </div>
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase border border-white/30">
                  {trackingData.status}
                </span>
              </div>

              <div className="p-6">
                {/* Affiliate Injection Area */}
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Isi Paket
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {/* THE MONEY MAKER: Keywords injected here */}
                    <AffiliateLinkedText text={trackingData.description} />
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    *Link produk dideteksi otomatis oleh AI
                  </p>
                </div>

                {/* Timeline */}
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Riwayat Perjalanan
                </h3>
                <div className="space-y-8 relative pl-2 ml-2">
                  {/* Vertical Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

                  {trackingData.history.map((item, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${item.active ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-slate-300'}`}
                      ></div>
                      <div className="-mt-1">
                        <p
                          className={`text-sm font-bold ${item.active ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {item.status}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Native Ad (In-Feed) */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <p className="text-xs font-bold text-gray-300 mb-2 uppercase text-center">
                Sponsored
              </p>
              <AdUnit slot="native-feed" format="fluid" />
            </div>
          </div>

          {/* Right Column: Sidebar & Monetization */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[250px] flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute inset-0 bg-blue-50/50 group-hover:bg-blue-50 transition-colors"></div>
              <div className="relative z-10">
                <MapPin className="w-12 h-12 text-blue-200 mx-auto mb-3" />
                <p className="font-bold text-slate-700">Live Map</p>
                <ButtonLink
                  href="/pricing"
                  text="Upgrade ke PRO untuk melihat lokasi kurir secara realtime"
                />
              </div>
            </div>

            {/* Sticky Sidebar Ad */}
            <div className="sticky top-6">
              <LazyAd slot="sidebar-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Micro Component
function ButtonLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline max-w-[200px]"
    >
      {text}
    </Link>
  );
}
