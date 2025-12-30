import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { popularRoutes } from '@/data/popular-routes';

// Take top 12 routes for display
const topRoutes = popularRoutes.slice(0, 12);

export function PopularRoutesSection() {
  return (
    <section className="py-12 border-t border-white/10">
      <div className="container-custom">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Rute Ongkir Populer</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {topRoutes.map((route, index) => (
            <Link
              key={index}
              href={`/cek-ongkir/${route.originSlug}-ke-${route.destinationSlug}`}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all group text-sm"
            >
              <span className="text-gray-300 group-hover:text-white truncate">
                {route.origin}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="text-gray-300 group-hover:text-white truncate">
                {route.destination}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Lihat tarif ongkir ke seluruh Indonesia dengan{' '}
            <Link href="/" className="text-indigo-400 hover:text-indigo-300">
              Kalkulator Ongkir
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
