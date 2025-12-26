import Link from 'next/link'
import { Search, Home, Package } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8 relative">
                    <div className="text-[150px] font-bold text-white/5 select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="text-gray-400 mb-8">
                    Maaf, halaman yang Anda cari tidak ada atau mungkin sudah dipindahkan.
                    Seperti paket yang salah alamat! 📦
                </p>

                {/* Action Button */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30"
                    >
                        <Home className="w-5 h-5" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Quick Links */}
                <div className="glass-card p-6 text-left">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-indigo-400" />
                        Mungkin Anda mencari:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/"
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                        >
                            🏠 Halaman Utama
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                        >
                            💎 Paket Premium
                        </Link>
                        <Link
                            href="/statistics"
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                        >
                            📊 Statistik Kurir
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all text-sm"
                        >
                            🔑 Masuk Akun
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
