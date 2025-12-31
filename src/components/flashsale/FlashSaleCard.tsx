'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Lock, Smartphone, ShoppingCart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

interface FlashSaleItemProps {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: number;
  sold: number;
}

export default function FlashSaleCard({ item }: { item: FlashSaleItemProps }) {
  const [isApp, setIsApp] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Detect environment: Check for 'source=app' query param or custom UserAgent
    // Real-world: You might have a specific header or WebView token.
    const userAgent = window.navigator.userAgent;
    const isAppCheck = userAgent.includes('CekKirimApp') || searchParams.get('source') === 'app';
    setIsApp(isAppCheck);
  }, [searchParams]);

  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  const percentSold = (item.sold / item.stock) * 100;

  const handleBuy = () => {
    if (isApp) {
      // Proceed to checkout
      console.log('Proceeding to checkout for item', item.id);
      // router.push(/checkout/${item.id});
      alert('Berhasil masuk ke checkout (Simulasi)');
    } else {
      // Should not be reachable if button is disabled, but safety check
      window.location.href = 'https://play.google.com/store/apps/details?id=com.cekkirim.app';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <Zap size={12} fill="currentColor" />
        -{discount}% OFF
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Web Blocker Overlay - Visual Feedback */}
        {!isApp && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
            <Lock className="text-white w-8 h-8 mb-2" />
            <p className="text-white text-sm font-medium">Hanya di Aplikasi</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 min-h-[3rem] mb-2">
          {item.title}
        </h3>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-red-600 font-bold text-lg">
            Rp {item.price.toLocaleString('id-ID')}
          </span>
          <span className="text-zinc-400 text-sm line-through decoration-red-500/50">
            Rp {item.originalPrice.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Stock Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Terjual</span>
            <span className={percentSold > 80 ? 'text-red-500 font-bold' : ''}>
              {item.sold}/{item.stock}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentSold}%` }}
              className={`h-full rounded-full ${percentSold > 80 ? 'bg-red-600' : 'bg-orange-500'}`}
            />
          </div>
          {percentSold > 90 && (
            <p className="text-[10px] text-red-500 mt-1 font-medium animate-pulse">
              🔥 Segera Habis!
            </p>
          )}
        </div>

        {/* Action Button */}
        {isApp ? (
          <button
            onClick={handleBuy}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <ShoppingCart size={18} />
            Beli Sekarang
          </button>
        ) : (
          <a
            href="https://play.google.com/store/apps/details?id=com.cekkirim.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Smartphone size={18} />
            Buka App untuk Beli
          </a>
        )}
      </div>
    </div>
  );
}
