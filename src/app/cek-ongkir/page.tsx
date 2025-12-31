import ShippingCalculator from '@/components/shipping/ShippingCalculator';

export default function CekOngkirPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Cek Ongkir Terbaik
                    </h1>
                    <p className="text-lg text-gray-600">
                        Bandingkan harga dari berbagai kurir, pilih yang paling hemat!
                    </p>
                </div>

                <ShippingCalculator />

                {/* Features Section */}
                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="font-bold text-gray-900 mb-2">Instant Check</h3>
                        <p className="text-sm text-gray-600">
                            Hasil langsung dalam hitungan detik
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="font-bold text-gray-900 mb-2">Harga Terbaik</h3>
                        <p className="text-sm text-gray-600">
                            Rekomendasi otomatis untuk penawaran terbaik
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                        <div className="text-4xl mb-3">🚚</div>
                        <h3 className="font-bold text-gray-900 mb-2">Multi Kurir</h3>
                        <p className="text-sm text-gray-600">
                            JNE, SiCepat, JNT, AnterAja, dan masih banyak lagi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
