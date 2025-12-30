import Link from 'next/link';
import { ArrowRight, Zap, BookOpen } from 'lucide-react';

interface BlogCTAProps {
  variant?: 'tools' | 'ebook' | 'both';
  className?: string;
}

export default function BlogCTA({
  variant = 'tools',
  className = '',
}: BlogCTAProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white ${className}`}
    >
      {variant === 'tools' && (
        <div className="text-center">
          <Zap className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">
            Siap Terapkan Tips di Atas?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Gunakan tools gratis CekKirim untuk mempermudah bisnis online Anda!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Cek Ongkir Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools"
              className="bg-blue-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-900 transition-colors"
            >
              Lihat Semua Tools
            </Link>
          </div>
        </div>
      )}

      {variant === 'ebook' && (
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Mau Belajar Lebih Dalam?</h3>
          <p className="text-lg mb-6 opacity-90">
            Download ebook lengkap kami untuk panduan step-by-step!
          </p>
          <Link
            href="/ebooks"
            className="bg-white text-purple-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Lihat Ebook Premium
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {variant === 'both' && (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center">
            Langkah Selanjutnya 🚀
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <Zap className="w-12 h-12 mb-3" />
              <h4 className="font-bold text-xl mb-2">Tools Gratis</h4>
              <p className="mb-4 opacity-90">
                Gunakan tools kami untuk optimasi bisnis Anda
              </p>
              <Link
                href="/tools"
                className="text-white underline hover:no-underline inline-flex items-center gap-1"
              >
                Coba Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <BookOpen className="w-12 h-12 mb-3" />
              <h4 className="font-bold text-xl mb-2">Ebook Premium</h4>
              <p className="mb-4 opacity-90">
                Panduan lengkap untuk scaling bisnis online
              </p>
              <Link
                href="/ebooks"
                className="text-white underline hover:no-underline inline-flex items-center gap-1"
              >
                Lihat Ebook
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
