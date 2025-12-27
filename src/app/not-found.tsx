import Link from 'next/link';

/**
 * Custom 404 Page
 * Friendly "Page Not Found" with illustration
 */

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface-50 to-white">
            {/* Illustration */}
            <div className="relative mb-8">
                <svg className="w-64 h-64" viewBox="0 0 400 400" fill="none">
                    {/* Background circle */}
                    <circle cx="200" cy="200" r="150" fill="#EEF2FF" />

                    {/* Lost package box */}
                    <g transform="translate(120, 100)">
                        {/* Box body */}
                        <path d="M0 60L80 20L160 60L80 100L0 60Z" fill="#C7D2FE" stroke="#6366F1" strokeWidth="3" />
                        <path d="M0 60V140L80 180V100L0 60Z" fill="#E0E7FF" stroke="#6366F1" strokeWidth="3" />
                        <path d="M160 60V140L80 180V100L160 60Z" fill="#A5B4FC" stroke="#6366F1" strokeWidth="3" />

                        {/* Box flaps */}
                        <path d="M0 60L30 40L80 70L50 90L0 60Z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
                        <path d="M160 60L130 40L80 70L110 90L160 60Z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />

                        {/* Question mark on box */}
                        <text x="65" y="130" fontSize="40" fill="#6366F1" fontWeight="bold">?</text>
                    </g>

                    {/* Confused eyes */}
                    <circle cx="160" cy="280" r="8" fill="#6366F1" />
                    <circle cx="240" cy="280" r="8" fill="#6366F1" />

                    {/* Confused mouth */}
                    <path d="M180 310 Q200 300 220 310" stroke="#6366F1" strokeWidth="4" fill="none" strokeLinecap="round" />

                    {/* Floating question marks */}
                    <text x="80" y="120" fontSize="24" fill="#A5B4FC">?</text>
                    <text x="300" y="140" fontSize="20" fill="#A5B4FC">?</text>
                    <text x="320" y="260" fontSize="28" fill="#C7D2FE">?</text>

                    {/* Stars */}
                    <circle cx="100" cy="180" r="4" fill="#FCD34D" />
                    <circle cx="310" cy="200" r="3" fill="#FCD34D" />
                    <circle cx="280" cy="320" r="4" fill="#FCD34D" />
                </svg>

                {/* 404 Badge */}
                <div className="absolute top-4 right-4 bg-primary-500 text-white text-3xl font-bold px-4 py-2 rounded-xl shadow-lg transform rotate-12">
                    404
                </div>
            </div>

            {/* Text */}
            <h1 className="text-3xl font-bold text-surface-900 mb-3 text-center">
                Waduh, Paketnya Nyasar! 📦
            </h1>
            <p className="text-surface-500 text-center max-w-md mb-8">
                Halaman yang kamu cari tidak ditemukan. Mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Kembali ke Home
                </Link>
                <Link
                    href="/cek-resi"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-surface-200 hover:border-surface-300 text-surface-700 font-semibold rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Cek Resi
                </Link>
            </div>

            {/* Fun fact */}
            <p className="mt-12 text-xs text-surface-400">
                Fun fact: 404 adalah kode error HTTP yang artinya "Not Found" 🤓
            </p>
        </div>
    );
}
