import {
  getOrCreateWallet,
  getWalletTransactions,
  formatIDR,
  depositToWallet,
  withdrawFromWallet,
} from '@/app/actions/walletActions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Plus,
  Minus,
} from 'lucide-react';

export const metadata = {
  title: 'Digital Wallet - Dompet Digital | CekKirim',
  description: 'Kelola saldo digital untuk transaksi lebih mudah',
};

async function getWalletData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/wallet');
  }

  const { data: wallet } = await getOrCreateWallet();
  const { data: transactions } = await getWalletTransactions(20);

  return { wallet, transactions: transactions || [] };
}

export default async function WalletDashboardPage() {
  const { wallet, transactions } = await getWalletData();

  const handleDeposit = async (formData: FormData) => {
    'use server';
    const amount = parseFloat(formData.get('amount') as string);
    await depositToWallet(amount);
    redirect('/dashboard/wallet?deposited=true');
  };

  const handleWithdraw = async (formData: FormData) => {
    'use server';
    const amount = parseFloat(formData.get('amount') as string);
    await withdrawFromWallet(amount);
    redirect('/dashboard/wallet?withdrawn=true');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionType = (tx: any, walletId: string) => {
    if (tx.from_wallet_id === walletId && tx.to_wallet_id === walletId) {
      return 'internal';
    } else if (tx.from_wallet_id === walletId) {
      return 'debit';
    } else {
      return 'credit';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Wallet
          </h1>
          <p className="text-gray-600">Kelola saldo digital Anda</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm mb-2">Total Saldo</p>
              <h2 className="text-5xl font-bold">
                {formatIDR(wallet?.balance || 0)}
              </h2>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-10 h-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">Saldo Tersedia</p>
              <p className="text-xl font-bold">
                {formatIDR(wallet?.available_balance || 0)}
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-xs mb-1">On Hold</p>
              <p className="text-xl font-bold">
                {formatIDR(wallet?.hold_amount || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Deposit */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Top Up Saldo</h3>
                <p className="text-sm text-gray-600">Isi ulang wallet Anda</p>
              </div>
            </div>

            <form action={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="10000"
                  step="1000"
                  required
                  placeholder="100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Top Up Sekarang
              </button>
            </form>
          </div>

          {/* Withdraw */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Minus className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Tarik Saldo</h3>
                <p className="text-sm text-gray-600">
                  Cairkan ke rekening bank
                </p>
              </div>
            </div>

            <form action={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="50000"
                  step="1000"
                  max={wallet ? wallet.available_balance / 100 : 0}
                  required
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: Rp 50,000 | Max:{' '}
                  {formatIDR(wallet?.available_balance || 0)}
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Tarik Saldo
              </button>
            </form>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Riwayat Transaksi
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Belum ada transaksi</p>
              <p className="text-sm text-gray-400">
                Mulai gunakan wallet Anda untuk transaksi
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: any) => {
                const type = getTransactionType(tx, wallet?.id || '');

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          type === 'credit'
                            ? 'bg-green-100'
                            : type === 'debit'
                              ? 'bg-red-100'
                              : 'bg-blue-100'
                        }`}
                      >
                        {type === 'credit' ? (
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        ) : type === 'debit' ? (
                          <TrendingDown className="w-6 h-6 text-red-600" />
                        ) : (
                          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {tx.transaction_type.charAt(0).toUpperCase() +
                            tx.transaction_type.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tx.description || '-'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {type === 'credit' ? '+' : '-'} {formatIDR(tx.amount)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informasi Wallet</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              • Saldo wallet dapat digunakan untuk semua transaksi di CekKirim
            </li>
            <li>• Top up minimum: Rp 10,000</li>
            <li>• Penarikan minimum: Rp 50,000</li>
            <li>
              • Semua transaksi menggunakan teknologi ACID-compliant untuk
              keamanan maksimal
            </li>
            <li>• Proses penarikan akan diproses dalam 1-3 hari kerja</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
