'use client';

import { useState } from 'react';
import { Shield, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { getBlacklistReports } from '@/app/actions/blacklistActions';
import { calculateRiskScore, RiskScore } from '@/lib/risk-scoring';
import { TrustSpeedometer } from '@/components/blacklist/TrustSpeedometer';

export default function BlacklistCheckerPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RiskScore | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;

        setLoading(true);
        setHasSearched(false);
        setResult(null);

        try {
            // 1. Fetch Raw Reports
            const reports = await getBlacklistReports(phone);

            // 2. Calculate Score Client-Side
            // We map the raw DB response to the Report interface expected by logic
            const formattedReports = reports.map((r: any) => ({
                id: r.id,
                description: r.description,
                has_evidence: r.has_evidence,
                created_at: r.created_at
            }));

            const riskAnalysis = calculateRiskScore(formattedReports);
            setResult(riskAnalysis);
            setHasSearched(true);
        } catch (err) {
            console.error(err);
            alert('Gagal mengambil data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Cek Customer Blacklist 🛡️
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Analisis risiko calon pembeli menggunakan <span className="text-indigo-600 font-bold">TrustScore AI</span>.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                            Cek Nomor HP Customer
                        </h2>

                        <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto mb-6">
                            <div className="relative flex-1">
                                <input
                                    type="tel"
                                    placeholder="Contoh: 08123456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition font-medium text-lg"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CEK SEKARANG'}
                            </button>
                        </form>

                        {hasSearched && result && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="border-t border-gray-100 my-8"></div>

                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="flex justify-center">
                                        <TrustSpeedometer
                                            score={result.score}
                                            level={result.level}
                                            color={result.color}
                                        />
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-indigo-600" /> Analysis Result
                                        </h3>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Risk Level</span>
                                                <span className="font-bold" style={{ color: result.color }}>{result.level}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Trust Score</span>
                                                <span className="font-bold">{result.score}/100</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Last Report</span>
                                                <span className="text-gray-900 font-medium">Coming Soon</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400">
                                            * Skor dihitung berdasarkan recency & validitas bukti laporan.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Educational Section */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 text-2xl">✓</div>
                        <h3 className="font-bold text-gray-900">AMAN (80-100)</h3>
                        <p className="text-sm text-gray-500 mt-1">Minim laporan atau belum ada data. Transaksi relatif aman.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 text-2xl">⚡</div>
                        <h3 className="font-bold text-gray-900">WASPADA (40-79)</h3>
                        <p className="text-sm text-gray-500 mt-1">Ada riwayat masalah minor. Gunakan proteksi tambahan.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3 text-2xl">⚠️</div>
                        <h3 className="font-bold text-gray-900">BAHAYA (0-39)</h3>
                        <p className="text-sm text-gray-500 mt-1">Sering bermasalah. Hindari transaksi COD.</p>
                    </div>
                </div>

                {/* Report CTA */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white shadow-xl shadow-blue-900/20">
                    <h2 className="text-2xl font-bold mb-4">
                        Pernah Kena Customer Bermasalah?
                    </h2>
                    <p className="mb-6 opacity-90">
                        Bantu seller lain dengan melaporkan customer bermasalah ke database nasional.
                    </p>
                    <a
                        href="/blacklist/report"
                        className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                    >
                        Laporkan Customer
                    </a>
                </div>
            </div>
        </main>
    );
}
