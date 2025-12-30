import { terms } from '@/lib/dictionary';
import Link from 'next/link';
import { Book, Search, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kamus Istilah Logistik - CekKirim',
  description:
    'Pahami arti status pengiriman paket Anda. Penjelasan lengkap istilah JNE, J&T, SiCepat, dll.',
};

export default function KamusPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Book className="w-10 h-10 text-indigo-400" />
            Kamus Logistik
          </h1>
          <p className="text-gray-400 text-lg">
            Bingung dengan status paket? Temukan artinya di sini.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {terms.map((term) => (
            <Link
              key={term.slug}
              href={`/kamus/${term.slug}`}
              className="glass-card p-6 hover:bg-white/10 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {term.term}
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {term.definition}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                  {term.courier}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
