import { createClient } from '@/utils/supabase/server';
import CaptionGenerator from '@/components/caption-gen/CaptionGenerator';
import { ScrollToTopButton } from '@/components/caption-gen/ScrollToTopButton';
import { MessageSquare, Sparkles, TrendingUp } from 'lucide-react';

// Force dynamic rendering to avoid cookies error
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Caption Generator - AI Pembuat Caption | CekKirim',
  description:
    'Generator caption jualan otomatis untuk Instagram, WhatsApp, TikTok',
};

async function getCaptions() {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('caption_templates')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('usage_count', { ascending: false });

  return templates || [];
}

export default async function CaptionGeneratorPage() {
  const templates = await getCaptions();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-100 rounded-full p-3 mb-4">
            <MessageSquare className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Caption Generator AI 🤖
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bingung mau nulis caption jualan? Tinggal pilih template, copy, dan
            share! 50+ caption siap pakai untuk semua kategori produk.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {templates.length}+
            </div>
            <p className="text-gray-600">Template Caption</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
            <p className="text-gray-600">Kategori Produk</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
            <p className="text-gray-600">Gratis!</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-12 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ✨ Kenapa Harus Pakai Caption Generator?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Hemat Waktu</h3>
              <p className="text-sm opacity-90">
                Tidak perlu pusing mikir caption. Langsung copy & paste!
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Tingkatkan Engagement</h3>
              <p className="text-sm opacity-90">
                Caption yang menarik = lebih banyak yang tertarik beli!
              </p>
            </div>
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Banyak Pilihan</h3>
              <p className="text-sm opacity-90">
                Hard selling, soft selling, promo - semua ada!
              </p>
            </div>
          </div>
        </div>

        {/* Main Generator */}
        <CaptionGenerator templates={templates} />

        {/* Tips */}
        <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            💡 Tips Menggunakan Caption:
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>
                Sesuaikan bagian yang ada [TANDA_KURUNG] dengan info produk Anda
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Tambahkan emoji untuk membuat caption lebih menarik</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Gunakan hashtag yang relevan dengan target market</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>
                A/B testing: Coba berbagai caption dan lihat mana yang paling
                efektif
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Jangan lupa sertakan Call-to-Action (CTA) yang jelas!</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sudah Ketemu Caption yang Cocok?
            </h2>
            <p className="text-gray-600 mb-6">
              Langsung copy dan bagikan ke social media Anda!
              <br />
              Tool ini 100% GRATIS dan bisa digunakan tanpa batas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <ScrollToTopButton />
              <a
                href="/tools"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
              >
                Tools Lainnya
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
