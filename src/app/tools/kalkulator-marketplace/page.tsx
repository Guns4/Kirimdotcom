import { MarketplaceCalculator } from '@/components/tools/MarketplaceCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kalkulator Cuan Marketplace (Shopee, Tokopedia, TikTok) - CekKirim',
    description: 'Hitung profit bersih jualan di Shopee, Tokopedia, dan TikTok Shop dengan akurat. Cek potongan biaya admin terbaru 2025.',
}

export default function MarketplaceCalculatorPage() {
    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Kalkulator Cuan Marketplace 💰
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Hitung estimasi pendapatan bersih dan profit Anda setelah dipotong biaya admin Shopee, Tokopedia, dan TikTok Shop.
                        Data persentase biaya admin diupdate secara berkala.
                    </p>
                </div>

                <MarketplaceCalculator />

                <div className="mt-12 text-center text-xs text-gray-500">
                    <p>* Perhitungan ini adalah estimasi berdasarkan persentase biaya admin umum.</p>
                    <p>Kebijakan biaya dapat berubah sewaktu-waktu oleh pihak marketplace.</p>
                </div>
            </div>
        </div>
    )
}
