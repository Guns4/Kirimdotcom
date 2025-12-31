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
