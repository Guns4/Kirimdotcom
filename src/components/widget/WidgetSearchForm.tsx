'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { courierList } from '@/data/couriers';
import { trackEvent } from '@/lib/tracking';

interface WidgetSearchFormProps {
  color?: string;
}

export function WidgetSearchForm({ color = 'blue' }: WidgetSearchFormProps) {
  const [waybill, setWaybill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waybill.trim()) return;

    setIsSubmitting(true);

    // Tracking
    trackEvent('click_cek_resi', {
      waybill: waybill.trim(),
      source: 'widget_home',
      courier: 'jne', // Default assumption for MVP until auto-detect is active
    });

    // Construct URL for main site
    const courier = 'jne'; // Default or auto-detect?
    // Better: redirect to /cek-resi/[id] or just / with params
    // Assuming /cek-resi/RESI works or just query params

    // We will open in new tab to CekKirim.com
    const url = `https://www.cekkirim.com/cek-resi?resi=${waybill.trim().toUpperCase()}&source=widget`;
    window.open(url, '_blank');

    setIsSubmitting(false);
    setWaybill('');
  };

  // Dynamic color classes
  const getButtonColor = () => {
    switch (color) {
      case 'purple':
        return 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700';
      case 'green':
        return 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700';
      case 'red':
        return 'from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700';
      case 'orange':
        return 'from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600';
      case 'blue':
      default:
        return 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-xl"
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={waybill}
            onChange={(e) => setWaybill(e.target.value)}
            placeholder="Masukkan Nomor Resi..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400 font-medium"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 px-4 bg-gradient-to-r ${getButtonColor()} text-white rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]`}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Cek Resi
        </button>
      </div>

      <div className="mt-2 text-center">
        <a
          href="https://www.cekkirim.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          Powered by CekKirim.com
        </a>
      </div>
    </form>
  );
}
