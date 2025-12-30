import { Metadata } from 'next';
import ImageCompressorWrapper from '@/components/tools/ImageCompressorWrapper';

export const metadata: Metadata = {
  title: 'Kompres Foto Produk (Gratis & Cepat) - CekKirim',
  description:
    'Kompres ukuran foto produk marketplace tanpa mengurangi kualitas secara signifikan. Dilengkapi fitur watermark otomatis. Proses 100% aman di browser Anda.',
};

export default function ImageCompressorPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Kompres Foto Produk ⚡
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Optimalkan gambar produkmu agar loading toko makin ngebut. Hemat
            kuota, hemat storage, tanpa perlu upload ke server.
          </p>
        </div>

        <ImageCompressorWrapper />

        <div className="mt-16 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          <p>
            Keamanan Terjamin: Foto Anda diproses langsung di browser
            (Client-Side) dan tidak pernah dikirim ke server kami.
          </p>
        </div>
      </div>
    </div>
  );
}
