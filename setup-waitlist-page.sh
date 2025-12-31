#!/bin/bash

# setup-waitlist-page.sh
# ----------------------
# Viral Waitlist Page with Gamification
# Features: Email Capture, Referral Logic, Social Proof Counter

echo "🚀 Setting up Viral Waitlist System..."

# 1. Create Waitlist Components
echo "🧩 Creating Components..."
mkdir -p src/components/growth

# Referral Widget (Badge Logic)
cat > src/components/growth/ReferralWidget.tsx << 'EOF'
'use client';

import React from 'react';
import { Copy, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralWidgetProps {
  referralCode: string;
  referralCount: number;
}

export default function ReferralWidget({ referralCode, referralCount }: ReferralWidgetProps) {
  const referralLink = `https://cekkirim.com/waitlist?ref=${referralCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Link copied to clipboard! Share it to your friends.');
  };

  // Gamification Logic
  const getBadge = () => {
    if (referralCount >= 5) return { label: 'EARLY ADOPTER', color: 'bg-yellow-500', icon: '👑' };
    if (referralCount >= 1) return { label: 'SUPPORTER', color: 'bg-blue-500', icon: '💎' };
    return { label: 'NEWBIE', color: 'bg-gray-500', icon: '🌱' };
  };

  const badge = getBadge();
  const nextTarget = referralCount >= 5 ? 10 : (referralCount >= 1 ? 5 : 1);
  const progress = Math.min(100, (referralCount / 5) * 100);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md w-full mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Your Status</h3>
        <span className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1`}>
          {badge.icon} {badge.label}
        </span>
      </div>

      <div className="mb-6 text-center">
        <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1">{referralCount}</div>
        <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">Friends Invited</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Progress to Early Adopter</span>
          <span>{referralCount}/5</span>
        </div>
        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        <p className="text-xs text-zinc-400 mt-2 text-center">
          Invite {nextTarget - referralCount} more friends to unlock next tier!
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
        <code className="flex-1 text-sm font-mono truncate text-zinc-600 dark:text-zinc-300">
          {referralLink}
        </code>
        <button 
          onClick={copyToClipboard}
          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}
EOF

# 2. Create Waitlist Page
echo "📄 Creating Waitlist Page..."
mkdir -p src/app/waitlist

cat > src/app/waitlist/page.tsx << 'EOF'
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Users } from 'lucide-react';
import ReferralWidget from '@/components/growth/ReferralWidget';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralData, setReferralData] = useState({ code: '', count: 0 });

  // Fake Social Proof Number (static start + random increment)
  const [waitlistCount] = useState(2450 + Math.floor(Math.random() * 50));

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock API Call
    setTimeout(() => {
      setJoined(true);
      setLoading(false);
      // Generate fake referral for demo
      setReferralData({
        code: btoa(email).substring(0, 8).toUpperCase(),
        count: 0
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      <main className="max-w-2xl w-full text-center relative z-10">
        {/* Social Proof Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20"
        >
          <Users size={16} className="text-green-400" />
          <span className="text-sm font-medium">
            <span className="text-green-400 font-bold">{waitlistCount.toLocaleString()}</span> Orang menunggu antrian
          </span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
          Revolusi Logistik<br />Segera Hadir.
        </h1>
        
        <p className="text-xl text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Satu aplikasi untuk Cek Resi, Bandingkan Ongkir, dan Manajemen Bisnis Online. 
          Jadilah yang pertama mencoba CekKirim di Android.
        </p>

        {!joined ? (
          <form onSubmit={handleJoin} className="relative max-w-md mx-auto">
            <input 
              type="email" 
              required
              placeholder="Masukkan email Anda..."
              className="w-full pl-6 pr-32 py-4 bg-zinc-900 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-white text-black font-bold px-6 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Processing...' : (
                <>
                  Join List <Send size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl mb-8 inline-block">
              <p className="text-green-400 font-bold text-lg">🎉 Selamat! Anda masuk antrian prioritas.</p>
              <p className="text-green-400/80 text-sm">Cek email Anda untuk verifikasi.</p>
            </div>
            
            <ReferralWidget {...referralData} />
          </motion.div>
        )}
      </main>

      <footer className="absolute bottom-6 text-zinc-600 text-sm">
        &copy; 2024 CekKirim.com
      </footer>
    </div>
  );
}
EOF

echo "✅ Waitlist Page Setup Complete!"
