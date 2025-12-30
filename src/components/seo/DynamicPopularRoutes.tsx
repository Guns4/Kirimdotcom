import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { getPopularRoutesFromDB } from '@/app/actions/popular-routes';

// Server Component that fetches dynamic popular routes
export async function DynamicPopularRoutes() {
  // Fetch actual popular routes from search history
  const routes = await getPopularRoutesFromDB(8);

  if (routes.length === 0) return null;

  return (
    <div className="container-custom py-8 border-b border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">
          Rute Ongkir Populer
        </h3>
        <span className="text-xs text-gray-500 ml-2">
          (berdasarkan pencarian)
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {routes.map((route, index) => (
          <Link
            key={index}
            href={`/cek-ongkir/${route.originSlug}-ke-${route.destinationSlug}`}
            className="flex items-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all group text-sm"
          >
            <span className="text-gray-400 group-hover:text-white truncate">
              {route.origin}
            </span>
            <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
            <span className="text-gray-400 group-hover:text-white truncate">
              {route.destination}
            </span>
            {route.searchCount > 0 && (
              <span className="text-xs text-indigo-400 ml-auto">
                {route.searchCount}x
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
