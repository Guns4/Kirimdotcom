import { Shield, Search, AlertTriangle } from 'lucide-react';

export const metadata = {
    title: 'Cek Customer Blacklist - Fraud Prevention | CekKirim',
    description: 'Cek apakah calon pembeli Anda aman atau bermasalah. Database komunitas seller Indonesia.',
};

export default function BlacklistCheckerPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Cek Customer Blacklist 🛡️
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Lindungi bisnis Anda! Cek apakah calon pembeli pernah dilaporkan seller lain.
                    </p>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-yellow-900 mb-2">Penting!</h3>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Data berasal dari laporan komunitas seller</li>
                                <li>• Gunakan sebagai referensi, bukan bukti mutlak</li>
                                <li>• Setiap laporan harus disertai bukti screenshot</li>
                                <li>• Laporan palsu akan ditindak</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Search Form - Client Component Here */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Cek Nomor HP Customer
                    </h2>
                    {/* This would be a client component */}
                    <div className="text-center py-12 text-gray-500">
                        Search component will be here
                    </div>
                </div>

                {/* Risk Levels Explained */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Level Risiko
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Aman / Belum Ada Data</h3>
                                <p className="text-sm text-gray-600">0 laporan. Customer belum pernah dilaporkan.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-900">Waspada</h3>
                                <p className="text-sm text-yellow-800">1-2 laporan. Pernah ada masalah minor. Tetap waspada.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900">BAHAYA</h3>
                                <p className="text-sm text-red-800">3+ laporan. Sering bermasalah (tolak COD, retur abuse). Pertimbangkan ulang!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report CTA */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">
                        Pernah Kena Customer Bermasalah?
                    </h2>
                    <p className="mb-6">
                        Bantu seller lain dengan melaporkan customer bermasalah
                    </p>
                    <a
                        href="/blacklist/report"
                        className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Laporkan Customer
                    </a>
                </div>
            </div>
        </main>
    );
}
