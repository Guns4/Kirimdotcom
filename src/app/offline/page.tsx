export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    You are Offline
                </h1>

                <p className="text-gray-600 mb-8">
                    Sepertinya koneksi internet Anda terputus. Silakan cek koneksi dan coba lagi.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                >
                    Coba Lagi
                </button>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Tips:</strong> Aplikasi CekKirim sudah ter-install. Beberapa halaman masih bisa dibuka secara offline.
                    </p>
                </div>
            </div>
        </main>
    );
}
