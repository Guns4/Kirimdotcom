import { Metadata } from 'next';
import { CalculatorWrapper } from '@/components/tools/CalculatorWrapper';

export const metadata: Metadata = {
  title: 'Kalkulator Cuan Marketplace (Shopee, Tokopedia, TikTok) - CekKirim',
  description:
    'Hitung profit bersih dan biaya admin Shopee, Tokopedia, TikTok Shop. Simulasi harga jual agar tidak boncos.',
};

export default function MarketplaceCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Kalkulator Cuan Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Simulasi biaya admin, layanan, dan gratis ongkir. Pastikan harga
            jualmu sudah cover semua potongan!
          </p>
        </div>

        <CalculatorWrapper />
      </div>
    </div>
  );
}
