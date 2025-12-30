import { SmartPasteTool } from '@/components/tools/SmartPasteTool';
import { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Paste: Bersihkan Teks Resi dari Chat | CekKirim.com',
  description:
    'Tool gratis untuk mengekstrak nomor resi dari chat WhatsApp yang kotor/berantakan. Otomatis deteksi JNE, J&T, SiCepat, dll.',
};

export default function SmartPastePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-5xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI Text Cleaner
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pembersih Teks Resi
          </h1>
          <p className="text-gray-600 text-lg">
            Copy chat WhatsApp dari customer, Paste di sini. Kami akan ambil
            nomor resinya saja dan siapkan untuk pelacakan massal.
          </p>
        </div>

        <SmartPasteTool />
      </div>
    </div>
  );
}
