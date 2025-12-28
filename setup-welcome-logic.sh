#!/bin/bash

# Features
echo "  1. Time-Based Greeting"
echo "     - Selamat Pagi (05:00-11:59)"
echo "     - Selamat Siang (12:00-14:59)"
echo "     - Selamat Sore (15:00-17:59)"
echo "     - Selamat Malam (18:00-04:59)"
echo ""
echo "  2. Shop Name Personalization"
echo "     - 'Selamat Pagi, [Nama Toko]!'"
echo "     - Pending packages counter"
echo ""
echo "  3. Quick Resume"
echo "     - Show last tracked resi"
echo "     - One-click to continue tracking"
echo ""
echo "  4. Daily Tips"
echo "     - 12 rotating business tips"
echo "     - Changes daily based on day of year"

echo "Creating src/components/dashboard/PersonalizedWelcome.tsx..."

# Ensure directory exists
mkdir -p src/components/dashboard

# Write the component file
cat << 'EOF' > src/components/dashboard/PersonalizedWelcome.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Package, ArrowRight, Lightbulb, RefreshCw } from 'lucide-react';

interface WelcomeData {
    shopName?: string;
    pendingPackages?: number;
    lastTracking?: {
        resi: string;
        courier: string;
        status: string;
    };
}

/**
 * Get time-based greeting
 */
export function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { text: 'Selamat Pagi', emoji: '🌅' };
    } else if (hour >= 12 && hour < 15) {
        return { text: 'Selamat Siang', emoji: '☀️' };
    } else if (hour >= 15 && hour < 18) {
        return { text: 'Selamat Sore', emoji: '🌇' };
    } else {
        return { text: 'Selamat Malam', emoji: '🌙' };
    }
}

/**
 * Daily Business Tips
 */
const DAILY_TIPS = [
    { tip: 'Foto produk yang bagus bisa meningkatkan konversi hingga 40%!', category: 'Foto' },
    { tip: 'Respon chat dalam 5 menit pertama = 10x lebih mungkin closing.', category: 'Chat' },
    { tip: 'Packing rapi dengan bubble wrap mencegah komplain dan rating buruk.', category: 'Packing' },
    { tip: 'Kirim paket sebelum jam 2 siang agar bisa pickup hari ini.', category: 'Pengiriman' },
    { tip: 'Follow up pelanggan 3 hari setelah terima paket untuk minta review.', category: 'Review' },
    { tip: 'Gunakan resi instant untuk pelanggan yang urgent!', category: 'Resi' },
    { tip: 'Cek ongkir di 3 ekspedisi berbeda untuk hemat biaya.', category: 'Ongkir' },
    { tip: 'Update stok setiap hari untuk hindari "Maaf, Habis".', category: 'Stok' },
    { tip: 'Kasih bonus kecil (stiker/permen) = pelanggan ingat terus!', category: 'Branding' },
    { tip: 'Jangan lupa catat pengeluaran kecil seperti lakban dan bensin.', category: 'Keuangan' },
    { tip: 'Buat template chat untuk pertanyaan yang sering diulang.', category: 'Efisiensi' },
    { tip: 'Pakai asuransi untuk barang di atas 500rb!', category: 'Asuransi' },
];

/**
 * Get daily tip based on date
 */
export function getDailyTip(): typeof DAILY_TIPS[0] {
    const today = new Date();
    const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

/**
 * Welcome Header Component
 */
export function WelcomeHeader({ shopName, pendingPackages }: WelcomeData) {
    const [greeting, setGreeting] = useState(getGreeting());

    useEffect(() => {
        // Update greeting every minute
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {greeting.emoji} {greeting.text}
                    </p>
                    <h1 className="text-2xl font-bold mt-1">
                        {shopName || 'Seller'}!
                    </h1>
                </div>

                {typeof pendingPackages === 'number' && pendingPackages > 0 && (
                    <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                        <div className="text-2xl font-bold">{pendingPackages}</div>
                        <div className="text-xs text-white/80">paket pending</div>
                    </div>
                )}
            </div>

            {typeof pendingPackages === 'number' && pendingPackages > 0 && (
                <p className="mt-4 text-white/90">
                    Ada <strong>{pendingPackages} paket</strong> yang belum dikirim hari ini.
                </p>
            )}
        </div>
    );
}

/**
 * Quick Resume Last Tracking
 */
export function QuickResume({ lastTracking }: { lastTracking?: WelcomeData['lastTracking'] }) {
    if (!lastTracking) return null;

    return (
        <Link
            href={`/cek-resi/${lastTracking.courier.toLowerCase()}/${lastTracking.resi}`}
            className="flex items-center justify-between p-4 bg-surface-100 hover:bg-surface-200 rounded-xl transition group"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                    <p className="text-sm text-surface-500">Lanjutkan Cek Resi Terakhir</p>
                    <p className="font-semibold text-surface-900">
                        {lastTracking.courier.toUpperCase()} • {lastTracking.resi}
                    </p>
                    <p className="text-xs text-surface-500">{lastTracking.status}</p>
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-500 transition" />
        </Link>
    );
}

/**
 * Daily Tip Card
 */
export function DailyTipCard() {
    const [tip, setTip] = useState(getDailyTip());

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
                            💡 Tips {tip.category}
                        </span>
                    </div>
                    <p className="text-surface-700 text-sm leading-relaxed">
                        {tip.tip}
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Combined Personalized Dashboard Header
 */
export function PersonalizedDashboard({ shopName, pendingPackages, lastTracking }: WelcomeData) {
    return (
        <div className="space-y-4">
            <WelcomeHeader shopName={shopName} pendingPackages={pendingPackages} />

            <div className="grid gap-4 md:grid-cols-2">
                <QuickResume lastTracking={lastTracking} />
                <DailyTipCard />
            </div>
        </div>
    );
}

export default PersonalizedDashboard;
EOF

echo "File overwritten: src/components/dashboard/PersonalizedWelcome.tsx"
echo ""

# Usage
echo "USAGE"
echo "-----"
echo ""
cat << 'EOF'

// In dashboard/page.tsx

import { PersonalizedDashboard } from '@/components/dashboard/PersonalizedWelcome';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's shop name
  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_name')
    .eq('id', user?.id)
    .single();
    
  // Get pending packages count
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id)
    .eq('status', 'pending');
    
  // Get last tracking from localStorage (client-side)
  // Or from database
  const { data: lastTracking } = await supabase
    .from('tracking_history')
    .select('resi, courier, status')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="p-6">
      <PersonalizedDashboard
        shopName={profile?.shop_name}
        pendingPackages={count || 0}
        lastTracking={lastTracking}
      />
      
      {/* Other dashboard content */}
    </div>
  );
}
EOF
