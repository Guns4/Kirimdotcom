import { getCreditScore, getCreditScoreHistory, getPerformanceMetrics, getRiskCategoryDetails, requestScoreRecalculation } from '@/app/actions/creditScoreActions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingUp, Award, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

export const metadata = {
    title: 'Credit Score - Skor Kredit | CekKirim',
    description: 'Lihat skor kredit dan kelayakan pinjaman Anda',
};

async function getCreditScoreData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/dashboard/credit-score');
    }

    const { data: currentScore } = await getCreditScore();
    const { data: history } = await getCreditScoreHistory(6);
    const { data: metrics } = await getPerformanceMetrics();

    return { currentScore, history: history || [], metrics };
}

export default async function CreditScorePage() {
    const { currentScore, history, metrics } = await getCreditScoreData();

    const handleRecalculate = async () => {
        'use server';
        await requestScoreRecalculation();
        redirect('/dashboard/credit-score?recalculated=true');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // No score yet
    if (!currentScore) {
        return (
            <main className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-10 h-10 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            Credit Score Belum Tersedia
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Mulai bertransaksi untuk mendapatkan skor kredit Anda
                        </p>

                        <form action={handleRecalculate}>
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                            >
                                Hitung Skor Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    const riskDetails = getRiskCategoryDetails(currentScore.risk_category);
    const scoreFactors = currentScore.score_factors;

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Credit Score Anda
                        </h1>
                        <p className="text-gray-600">Terakhir diperbarui: {formatDate(currentScore.calculated_at)}</p>
                    </div>

                    <form action={handleRecalculate}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Hitung Ulang
                        </button>
                    </form>
                </div>

                {/* Main Score Card */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm mb-2">Skor Kredit Anda</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-7xl font-bold">{currentScore.score}</h2>
                                <div>
                                    <p className="text-2xl font-semibold">/ 850</p>
                                    {currentScore.score_change !== 0 && (
                                        <p className={`text-sm ${currentScore.score_change > 0 ? 'text-green-200' : 'text-red-200'}`}>
                                            {currentScore.score_change > 0 ? '+' : ''}{currentScore.score_change} dari sebelumnya
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className={`inline-block px-6 py-3 rounded-full bg-${riskDetails.color}-100 mb-4`}>
                                <p className={`text-${riskDetails.color}-900 font-bold text-lg`}>
                                    {riskDetails.label}
                                </p>
                            </div>
                            <p className="text-purple-100">{riskDetails.description}</p>
                            <p className="text-sm text-purple-200 mt-2">
                                💳 Limit: {riskDetails.creditLimitSuggestion}
                            </p>
                        </div>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-8">
                        <div className="w-full bg-white/20 rounded-full h-4">
                            <div
                                className="h-4 rounded-full bg-white shadow-lg"
                                style={{ width: `${(currentScore.score / 850) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-purple-200 mt-2">
                            <span>0</span>
                            <span>300</span>
                            <span>600</span>
                            <span>750</span>
                            <span>850</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Score Factors */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Faktor Penilaian</h2>

                        <div className="space-y-6">
                            {scoreFactors?.order_success && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Tingkat Keberhasilan Pengiriman (40%)
                                        </span>
                                        <span className="text-lg font-bold text-purple-600">
                                            {scoreFactors.order_success.score}/340
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full bg-purple-500"
                                            style={{ width: `${(scoreFactors.order_success.score / 340) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Rate: {scoreFactors.order_success.rate}%
                                    </p>
                                </div>
                            )}

                            {scoreFactors?.dispute_rate && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Tingkat Dispute (30%)
                                        </span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {scoreFactors.dispute_rate.score}/255
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full bg-blue-500"
                                            style={{ width: `${(scoreFactors.dispute_rate.score / 255) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Rate: {scoreFactors.dispute_rate.rate}%
                                    </p>
                                </div>
                            )}

                            {scoreFactors?.payment_history && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Riwayat Pembayaran (20%)
                                        </span>
                                        <span className="text-lg font-bold text-green-600">
                                            {scoreFactors.payment_history.score}/170
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full bg-green-500"
                                            style={{ width: `${(scoreFactors.payment_history.score / 170) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Reliability: {scoreFactors.payment_history.reliability}%
                                    </p>
                                </div>
                            )}

                            {scoreFactors?.account_age && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Usia Akun (10%)
                                        </span>
                                        <span className="text-lg font-bold text-yellow-600">
                                            {scoreFactors.account_age.score}/85
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full bg-yellow-500"
                                            style={{ width: `${(scoreFactors.account_age.score / 85) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {scoreFactors.account_age.days} hari
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-6">
                        {/* Strengths */}
                        {currentScore.strengths && currentScore.strengths.length > 0 && (
                            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="w-6 h-6 text-green-600" />
                                    <h3 className="text-lg font-bold text-green-900">Kekuatan</h3>
                                </div>
                                <ul className="space-y-2">
                                    {currentScore.strengths.map((strength: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-green-800">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weaknesses */}
                        {currentScore.weaknesses && currentScore.weaknesses.length > 0 && (
                            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                    <h3 className="text-lg font-bold text-orange-900">Area Perbaikan</h3>
                                </div>
                                <ul className="space-y-2">
                                    {currentScore.weaknesses.map((weakness: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-orange-800">
                                            <span className="text-orange-500 mt-1">!</span>
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score History */}
                {history.length > 1 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Riwayat Skor</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tanggal</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Skor</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Perubahan</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kategori</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record: any) => (
                                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {formatDate(record.calculated_at)}
                                            </td>
                                            <td className="py-3 px-4 text-lg font-bold text-gray-900">
                                                {record.score}
                                            </td>
                                            <td className="py-3 px-4">
                                                {record.score_change !== 0 && (
                                                    <span className={`text-sm font-semibold ${record.score_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {record.score_change > 0 ? '+' : ''}{record.score_change}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-${getRiskCategoryDetails(record.risk_category).color}-100 text-${getRiskCategoryDetails(record.risk_category).color}-800`}>
                                                    {getRiskCategoryDetails(record.risk_category).label}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
