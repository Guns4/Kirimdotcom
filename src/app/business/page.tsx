import HeroSection from '@/components/business/HeroSection';
import FeaturesGrid from '@/components/business/FeaturesGrid';
import PricingTable from '@/components/business/PricingTable';

export const metadata = {
    title: 'CekKirim API - Solusi Logistik untuk Developer',
    description: 'API Ongkir dan Resi terlengkap untuk e-commerce dan aplikasi bisnis.',
};

export default function BusinessPage() {
    return (
        <main className="min-h-screen font-sans">
            {/* 1. Hero Section: Value Proposition & Demo Code */}
            <HeroSection />

            {/* 2. Features: Mengapa memilih kita? */}
            <FeaturesGrid />

            {/* 3. Pricing: Transparansi Harga */}
            <PricingTable />

            {/* 4. CTA Akhir */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Siap Mengembangkan Bisnis Anda?</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                        Bergabung dengan ribuan developer lain yang telah menghemat waktu dan biaya dengan CekKirim API.
                    </p>
                    <a href="/console" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-blue-500/50">
                        Buat Akun Developer Gratis
                    </a>
                </div>
            </section>
        </main>
    );
}
