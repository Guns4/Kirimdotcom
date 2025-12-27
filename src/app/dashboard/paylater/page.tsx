import { getPayLaterAccount, getPayLaterTransactions, applyForPayLater, makePayLaterRepayment } from '@/app/actions/payLaterActions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'PayLater - Talangan Ongkir | CekKirim',
    description: 'Advance payment untuk ongkir, bayar belakangan',
};

async function getPayLaterData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/dashboard/paylater');
    }

    const { data: account } = await getPayLaterAccount();
    const { data: transactions } = await getPayLaterTransactions(20);

    return { account, transactions: transactions || [] };
}

export default async function PayLaterDashboardPage() {
    const { account, transactions } = await getPayLaterData();

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // No account yet - show application
    if (!account) {
        const handleApply = async (formData: FormData) => {
            'use server';
            const limit = parseInt(formData.get('limit') as string);
            await applyForPayLater(limit);
            redirect('/dashboard/paylater?applied=true');
        };

        return (
            <main className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-10 h-10 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                PayLater: Talangan Ongkir
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Cashflow seller macet karena COD lama cair? Kami bayari dulu ongkirnya!
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="text-center p-4">
                                <div className="text-4xl mb-2">🚀</div>
                                <h3 className="font-semibold text-gray-900 mb-1">Kirim Sekarang</h3>
                                <p className="text-sm text-gray-600">Bayar ongkir nanti</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="text-4xl mb-2">💰</div>
                                <h3 className="font-semibold text-gray-900 mb-1">Cashflow Lancar</h3>
                                <p className="text-sm text-gray-600">Tidak tunggu COD</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="text-4xl mb-2">📈</div>
                                <h3 className="font-semibold text-gray-900 mb-1">Bisnis Tumbuh</h3>
                                <p className="text-sm text-gray-600">Scaling lebih cepat</p>
                            </div>
                        </div>

                        {/* Application Form */}
                        <form action={handleApply} className="max-w-md mx-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Limit Kredit yang Diajukan
                                </label>
                                <select
                                    name="limit"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="1000000">Rp 1.000.000</option>
                                    <option value="2500000">Rp 2.500.000</option>
                                    <option value="5000000">Rp 5.000.000</option>
                                    <option value="10000000">Rp 10.000.000</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                Ajukan PayLater Sekarang
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                * Persetujuan memerlukan verifikasi riwayat transaksi
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    // Has account - show dashboard
    const utilizationPercent = ((account.credit_limit - account.available_credit) / account.credit_limit) * 100;

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        PayLater Dashboard
                    </h1>
                    <p className="text-gray-600">Kelola talangan ongkir Anda</p>
                </div>

                {/* Status Banner */}
                {!account.is_approved && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                            <div>
                                <p className="font-semibold text-yellow-900">Menunggu Persetujuan</p>
                                <p className="text-sm text-yellow-700">
                                    Aplikasi PayLater Anda sedang diproses. Kami akan memberitahu via email.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Credit Limit */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Limit</h3>
                        <p className="text-2xl font-bold text-gray-900">{formatRupiah(account.credit_limit)}</p>
                    </div>

                    {/* Available Credit */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Tersedia</h3>
                        <p className="text-2xl font-bold text-gray-900">{formatRupiah(account.available_credit)}</p>
                    </div>

                    {/* Used Credit */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Terpakai</h3>
                        <p className="text-2xl font-bold text-gray-900">{formatRupiah(account.used_credit)}</p>
                    </div>

                    {/* Outstanding */}
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Outstanding</h3>
                        <p className="text-2xl font-bold text-gray-900">{formatRupiah(account.current_outstanding)}</p>
                    </div>
                </div>

                {/* Credit Utilization Bar */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Utilisasi Kredit</h2>
                    <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                        <div
                            className={`h-6 rounded-full ${utilizationPercent > 80
                                    ? 'bg-red-500'
                                    : utilizationPercent > 50
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                            style={{ width: `${utilizationPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {utilizationPercent.toFixed(1)}% dari limit terpakai
                    </p>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Transaksi Terbaru</h2>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Belum ada transaksi</p>
                            <p className="text-sm text-gray-400">
                                Gunakan PayLater saat checkout untuk advance ongkir
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipe</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Jumlah</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx: any) => (
                                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {formatDate(tx.created_at)}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tx.transaction_type === 'advance'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                >
                                                    {tx.transaction_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                                {formatRupiah(tx.amount)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tx.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : tx.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {tx.status}
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
