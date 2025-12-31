#!/bin/bash

# setup-app-flashsale.sh
# ----------------------
# Setup script for App-Exclusive Flash Sale System
# Context: Phase 1986-2000 (Hype & Traffic)
# Features: Countdown, Web Blocker, Deep Link to App Store

echo "🚀 Starting Flash Sale System Setup..."

# 1. Verify Dependencies
echo "📦 Verifying dependencies..."
if ! grep -q "framer-motion" package.json; then
  echo "Installing framer-motion..."
  npm install framer-motion
fi
if ! grep -q "lucide-react" package.json; then
  echo "Installing lucide-react..."
  npm install lucide-react
fi
if ! grep -q "date-fns" package.json; then
  echo "Installing date-fns..."
  npm install date-fns
fi

# 2. Create Components Directory
echo "📂 Creating component directories..."
mkdir -p src/components/flashsale
mkdir -p src/app/flash-sale

# 3. Create Countdown Component
echo "clock Creating Countdown Component..."
cat > src/components/flashsale/Countdown.tsx << 'EOF'
'use client';

import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownProps {
  ids: string;
  targetDate: string; // ISO string
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    
    const calculateTime = () => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);
      
      if (diff <= 0) {
        return { h: 0, m: 0, s: 0 };
      }
      
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      
      return { h, m, s };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 text-white font-mono font-bold text-sm md:text-base">
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.h).padStart(2, '0')}</div>
      <span>:</span>
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.m).padStart(2, '0')}</div>
      <span>:</span>
      <div className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.s).padStart(2, '0')}</div>
    </div>
  );
}
EOF

# 4. Create Flash Sale Item Card with Blocker Logic
echo "🛍️ Creating Flash Sale Card Component..."
cat > src/components/flashsale/FlashSaleCard.tsx << 'EOF'
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
EOF

# 5. Create Flash Sale Page
echo "📄 Creating Flash Sale Page..."
cat > src/app/flash-sale/page.tsx << 'EOF'
import React from 'react';
import Countdown from '@/components/flashsale/Countdown';
import FlashSaleCard from '@/components/flashsale/FlashSaleCard';
import { Sparkles } from 'lucide-react';

// Mock Data for Prototype
const MOCK_ITEMS = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB - Titanium (Flash Deal)',
    price: 1000000,
    originalPrice: 24999000,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80',
    stock: 10,
    sold: 9,
  },
  {
    id: '2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling',
    price: 500000,
    originalPrice: 5999000,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    stock: 50,
    sold: 32,
  },
  {
    id: '3',
    title: 'Dyson V15 Detect Absolute Vacuum',
    price: 99000,
    originalPrice: 12999000,
    image: 'https://images.unsplash.com/photo-1558317374-a3594743e527?w=800&q=80',
    stock: 5,
    sold: 2,
  },
  {
    id: '4',
    title: 'MacBook Air M2 13-inch Midnight',
    price: 2500000,
    originalPrice: 18999000,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    stock: 20,
    sold: 15,
  }
];

export default function FlashSalePage() {
  // Set target to tomorrow midnight for demo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="animate-pulse" />
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Flash Sale 12.12</h1>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-medium opacity-90">Berakhir dalam:</span>
            <Countdown ids="main-timer" targetDate={tomorrow.toISOString()} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Rebutan Barang Mewah, Harga Murah!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Kesempatan langka hanya untuk pengguna aplikasi setia kami. 
            Download aplikasi sekarang untuk klaim harga gila ini.
          </p>
        </div>

        {/* Filter / Tags (Optional Visual) */}
        <div className="flex gap-2 overflow-x-auto pb-6 justify-center">
          {['Semua', 'Elektronik', 'Fashion', 'Gadget', 'Rumah Tangga'].map((tag, i) => (
            <button 
              key={tag}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === 0 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_ITEMS.map((item) => (
            <FlashSaleCard key={item.id} item={item} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-zinc-900 dark:bg-zinc-800 rounded-2xl relative overflow-hidden text-center">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">Belum Punya Aplikasinya?</h3>
            <p className="text-zinc-300 mb-6 max-w-xl mx-auto">
              Jangan lewatkan Flash Sale berikutnya. Install aplikasi CekKirim sekarang dan nyalakan notifikasi!
            </p>
            <a 
              href="https://play.google.com/store/apps/details?id=com.cekkirim.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
            >
              <Smartphone size={20} />
              Download di Play Store
            </a>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
      </main>
    </div>
  );
}
EOF

# 6. Make script executable and run basic audit message
echo "✅ Setup Complete!"
echo "--------------------------------------------------------"
echo "👉 Created: src/components/flashsale/Countdown.tsx"
echo "👉 Created: src/components/flashsale/FlashSaleCard.tsx"
echo "👉 Created: src/app/flash-sale/page.tsx"
echo "--------------------------------------------------------"
echo "⚠️  NOTE: Check 'package.json' for 'framer-motion' and 'lucide-react'."
echo "   If missing, the script attempted to install them."
echo "   Run 'npm run dev' to test at http://localhost:3000/flash-sale"
