import { createClient } from '@/utils/supabase/server';
import { getAffiliateDashboardStats } from '@/app/actions/affiliateActions';
import { redirect } from 'next/navigation';
import { TrendingUp, Wallet, Users, Clock } from 'lucide-react';

export const metadata = {
  title: 'Affiliate Dashboard | CekKirim',
  description: 'Monitor your affiliate earnings and performance',
};

async function getAffiliateData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/affiliate');
  }

  const { data, error } = await getAffiliateDashboardStats();

  return { data, error };
}

export default async function AffiliateDashboardPage() {
  const { data, error } = await getAffiliateData();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Belum Terdaftar sebagai Affiliate
          </h1>
          <p className="text-gray-600 mb-8">
            Daftar sekarang dan mulai dapatkan komisi dari setiap penjualan!
          </p>
          <a
            href="/register-affiliate"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    );
  }

  const { affiliate, stats } = data;

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Affiliate
          </h1>
          <p className="text-gray-600">
            Kode Affiliate Anda:{' '}
            <span className="font-mono font-bold text-purple-600">
              {affiliate.affiliate_code}
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Total Pendapatan
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatRupiah(stats.totalEarnings)}
            </p>
          </div>

          {/* Available Balance */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Saldo Tersedia
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatRupiah(stats.availableBalance)}
            </p>
          </div>

          {/* Total Referrals */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Total Referral
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalClicks}
            </p>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Komisi Pending
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatRupiah(stats.pendingEarnings)}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/shop"
              className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg p-4 transition text-center"
            >
              <p className="font-semibold text-purple-900">
                📢 Promosikan Produk
              </p>
              <p className="text-sm text-purple-700 mt-1">
                Dapatkan link affiliate
              </p>
            </a>

            <a
              href="/dashboard/affiliate/withdraw"
              className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg p-4 transition text-center"
            >
              <p className="font-semibold text-green-900">💰 Tarik Saldo</p>
              <p className="text-sm text-green-700 mt-1">Min. Rp 50,000</p>
            </a>

            <a
              href="/dashboard/affiliate/statistics"
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg p-4 transition text-center"
            >
              <p className="font-semibold text-blue-900">📊 Lihat Statistik</p>
              <p className="text-sm text-blue-700 mt-1">Analisa performa</p>
            </a>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Komisi Terbaru
          </h2>

          {stats.recentEarnings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Belum ada komisi yang dihasilkan
              </p>
              <a
                href="/shop"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Mulai Promosikan Produk
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Produk
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Nilai Transaksi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Komisi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEarnings.map((earning: any) => (
                    <tr
                      key={earning.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(earning.earned_at).toLocaleDateString(
                          'id-ID'
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {earning.purchase_type}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatRupiah(earning.purchase_amount)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        {formatRupiah(earning.commission_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            earning.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : earning.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {earning.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
