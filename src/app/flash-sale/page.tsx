import React from 'react';
import Countdown from '@/components/flashsale/Countdown';
import FlashSaleCard from '@/components/flashsale/FlashSaleCard';
import { Sparkles, Smartphone } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mock Data for Prototype
const MOCK_ITEMS = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB - Titanium (Flash Deal)',
    price: 1000000,
    originalPrice: 24999000,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80',
    stock: 10,
    sold: 9,
  },
  {
    id: '2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling',
    price: 500000,
    originalPrice: 5999000,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    stock: 50,
    sold: 32,
  },
  {
    id: '3',
    title: 'Dyson V15 Detect Absolute Vacuum',
    price: 99000,
    originalPrice: 12999000,
    image: 'https://images.unsplash.com/photo-1558317374-a3594743e527?w=800&q=80',
    stock: 5,
    sold: 2,
  },
  {
    id: '4',
    title: 'MacBook Air M2 13-inch Midnight',
    price: 2500000,
    originalPrice: 18999000,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    stock: 20,
    sold: 15,
  }
];

export default function FlashSalePage() {
  // Set target to tomorrow midnight for demo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Flash Sale 12.12</h1>
          </div>

          <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-medium opacity-90">Berakhir dalam:</span>
            <Countdown ids="main-timer" targetDate={tomorrow.toISOString()} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Rebutan Barang Mewah, Harga Murah!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Kesempatan langka hanya untuk pengguna aplikasi setia kami.
            Download aplikasi sekarang untuk klaim harga gila ini.
          </p>
        </div>

        {/* Filter / Tags (Optional Visual) */}
        <div className="flex gap-2 overflow-x-auto pb-6 justify-center">
          {['Semua', 'Elektronik', 'Fashion', 'Gadget', 'Rumah Tangga'].map((tag, i) => (
            <button
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_ITEMS.map((item) => (
            <FlashSaleCard key={item.id} item={item} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-zinc-900 dark:bg-zinc-800 rounded-2xl relative overflow-hidden text-center">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Belum Punya Aplikasinya?</h3>
            <p className="text-zinc-300 mb-6 max-w-xl mx-auto">
              Jangan lewatkan Flash Sale berikutnya. Install aplikasi CekKirim sekarang dan nyalakan notifikasi!
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.cekkirim.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
            >
              <Smartphone size={20} />
              Download di Play Store
            </a>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
      </main>
    </div>
  );
}
