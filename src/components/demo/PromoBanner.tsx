'use client';

import { useFeature } from '@/hooks/useFeature';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function PromoBanner() {
  // 1. Check Flag
  const isPromoActive = useFeature('promo_lebaran');
  const [isVisible, setIsVisible] = useState(true);

  // 2. Conditional Render
  if (!isPromoActive || !isVisible) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-3 relative shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <p className="font-medium text-sm text-center w-full">
          🎉 <span className="font-bold">PROMO LEBARAN:</span> Diskon Ongkir 50%
          ke Seluruh Jawa!
          <a
            href="#"
            className="underline ml-2 text-indigo-100 hover:text-white"
          >
            Cek Sekarang
          </a>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-indigo-500 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
