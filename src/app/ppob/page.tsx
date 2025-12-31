import PPOBWidget from '@/components/ppob/PPOBWidget';
import { Zap, Wifi, Droplet, Phone } from 'lucide-react';

export default function PPOBPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            PPOB - Bayar Semua Tagihan
          </h1>
          <p className="text-xl text-gray-600">
            Pulsa, listrik, PDAM, dan tagihan lainnya. Semua dalam satu tempat!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* PPOB Widget */}
          <div>
            <PPOBWidget />
          </div>

          {/* Other Services */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Layanan Lainnya
            </h2>

            {/* Coming Soon Services */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-not-allowed opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Token Listrik</h3>
                  <p className="text-sm text-gray-600">Beli token PLN instant</p>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Segera
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-not-allowed opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Wifi className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Paket Data</h3>
                  <p className="text-sm text-gray-600">Beli kuota internet murah</p>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Segera
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-not-allowed opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Droplet className="w-7 h-7 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">PDAM</h3>
                  <p className="text-sm text-gray-600">Bayar tagihan air</p>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Segera
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-not-allowed opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Tagihan Telepon</h3>
                  <p className="text-sm text-gray-600">Bayar pascabayar</p>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Segera
                </span>
              </div>
            </div>

            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white mt-8">
              <h3 className="font-bold text-xl mb-2">🎁 Promo Spesial!</h3>
              <p className="text-sm opacity-90 mb-4">
                Beli pulsa Rp 50.000 ke atas, dapat cashback Rp 5.000!
              </p>
              <p className="text-xs opacity-75">Valid hingga 31 Januari 2026</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Kenapa Belanja di Sini?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Instant</h4>
              <p className="text-sm text-gray-600">Proses cepat 1-5 menit</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-bold text-gray-900 mb-2">Aman</h4>
              <p className="text-sm text-gray-600">Data terenkripsi SSL</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">Hemat</h4>
              <p className="text-sm text-gray-600">Harga terbaik di pasaran</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎁</div>
              <h4 className="font-bold text-gray-900 mb-2">Bonus</h4>
              <p className="text-sm text-gray-600">Cashback & reward points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
