import { getCourierStatistics } from '@/app/actions/reviews';
import { CourierLeaderboard } from '@/components/reviews/CourierLeaderboard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Statistik & Review Kurir - CekKirim',
  description: 'Lihat rating dan review kurir pengiriman terbaik di Indonesia',
};

export default async function StatisticsPage() {
  // Fetch statistics (server-side)
  const monthlyStats = await getCourierStatistics('month');
  const allTimeStats = await getCourierStatistics('all');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Statistik Kurir
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Data review dan rating dari pengguna CekKirim untuk membantu Anda
            memilih kurir terbaik
          </p>
        </div>

        {/* Leaderboards */}
        <div className="space-y-8">
          {/* Monthly Leaderboard */}
          <CourierLeaderboard
            title="🏆 Kurir Terbaik Bulan Ini"
            description="Berdasarkan rating dan jumlah review 30 hari terakhir"
            stats={monthlyStats}
            period="month"
          />

          {/* All-Time Leaderboard */}
          <CourierLeaderboard
            title="⭐ Leaderboard Sepanjang Masa"
            description="Akumulasi semua review sejak awal"
            stats={allTimeStats}
            period="all"
          />
        </div>

        {/* Info Box */}
        <div className="mt-12 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            💡 Tentang Data Ini
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              • Data diambil dari review pengguna yang telah menggunakan layanan
              tracking di CekKirim
            </li>
            <li>• Rating ditampilkan dalam skala 1-5 bintang</li>
            <li>• Sentiment analysis otomatis berdasarkan komentar pengguna</li>
            <li>• Data diupdate secara real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
