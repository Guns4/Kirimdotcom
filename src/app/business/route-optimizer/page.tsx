import RouteOptimizer from '@/components/business/RouteOptimizer';
import { Zap, TrendingDown, Target, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Route Optimizer - B2B Intelligence | CekKirim',
  description:
    'Optimasi biaya pengiriman massal dengan algoritma cerdas. Hemat hingga 30% dari ongkir bulanan Anda.',
};

export default function RouteOptimizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🚀 B2B Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Route Optimizer
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Upload data pengiriman massal Anda, dapatkan rekomendasi kurir
            termurah untuk setiap paket. Hemat jutaan rupiah per bulan!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <RouteOptimizer />
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Analysis</h3>
            <p className="text-sm text-gray-600">
              Algoritma AI menganalisis ribuan kombinasi dalam hitungan detik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Hemat 20-40%</h3>
            <p className="text-sm text-gray-600">
              Rata-rata client kami hemat 30% dari biaya ongkir bulanan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Criteria</h3>
            <p className="text-sm text-gray-600">
              Pilih berdasarkan harga, kecepatan, atau balance keduanya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">No Commitment</h3>
            <p className="text-sm text-gray-600">
              Gratis analyze. Pakai rekomendasi kami atau tidak, terserah Anda.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2">Upload CSV</h3>
              <p className="text-sm text-gray-600">
                Format: Tujuan, Berat. Download template jika perlu.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2">AI Proses</h3>
              <p className="text-sm text-gray-600">
                Sistem compare 5+ kurir untuk setiap paket Anda.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2">Lihat Hemat</h3>
              <p className="text-sm text-gray-600">
                Laporan detail: potensi penghematan per paket dan total.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
