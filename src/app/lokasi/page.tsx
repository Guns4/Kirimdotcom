'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

// Dynamic import for Leaflet map (SSR override)
const LocationMap = dynamic(() => import('@/components/location/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-xl bg-slate-800 animate-pulse flex items-center justify-center text-gray-500">
      Memuat Peta...
    </div>
  ),
});

export default function LocationPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-indigo-500" />
            Lokasi Agen Terdekat
          </h1>
          <p className="text-gray-400">
            Temukan Drop Point JNE, J&T, SiCepat, dan lainnya di sekitar Anda.
          </p>
        </header>

        <LocationMap />
      </div>
    </main>
  );
}
