#!/bin/bash

# =============================================================================
# Upgrade Admin Realtime (Phase 137)
# Live Revenue Pulse
# =============================================================================

echo "Setting up Realtime Admin Dashboard..."
echo "================================================="
echo ""

# 1. Live Revenue Widget
echo "1. Creating Component: src/components/admin/LiveRevenueWidget.tsx"
mkdir -p src/components/admin

cat <<EOF > src/components/admin/LiveRevenueWidget.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { BadgeDollarSign, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple sound effect for "Cha-ching"
// In production, put an mp3 in public/sounds/ka-ching.mp3
const PLAY_SOUND = true;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
};

interface LiveRevenueWidgetProps {
    initialRevenue: number;
}

export function LiveRevenueWidget({ initialRevenue }: LiveRevenueWidgetProps) {
    const [revenue, setRevenue] = useState(initialRevenue);
    const [lastIncrement, setLastIncrement] = useState<number | null>(null);
    const supabase = createClient();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize Audio
        audioRef.current = new Audio('/sounds/coin-drop.mp3'); // Ensure this file exists or update path
        audioRef.current.volume = 0.5;

        // Subscribe to Transactions
        const channel = supabase
            .channel('realtime-revenue')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: 'status=eq.PAID' // Only listen to PAID transactions
                },
                (payload) => {
                    const newAmount = payload.new.amount || 0;
                    if (newAmount > 0) {
                        setRevenue((prev) => prev + newAmount);
                        setLastIncrement(newAmount);
                        
                        // Play Sound
                        if (PLAY_SOUND && audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play().catch(e => console.log('Audio play failed', e));
                        }

                        // Clear increment flash after 2s
                        setTimeout(() => setLastIncrement(null), 2000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="relative overflow-hidden glass-card p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BadgeDollarSign className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-400">Total Pendapatan</span>
                </div>
                
                {/* Live Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-green-400 tracking-wider">LIVE</span>
                </div>
            </div>

            <div className="relative">
                <h3 className="text-3xl font-black text-white tracking-tight">
                    {formatCurrency(revenue)}
                </h3>

                {/* Floating Increment Animation */}
                <AnimatePresence>
                    {lastIncrement && (
                        <motion.div
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, y: -20, scale: 1.1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-2 right-0 flex items-center gap-1 text-green-400 font-bold text-lg"
                        >
                            <TrendingUp className="w-4 h-4" />
                            +{formatCurrency(lastIncrement)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="mt-2 text-xs text-gray-500">
                Update otomatis saat transaksi `PAID` masuk.
            </p>
        </div>
    );
}
EOF
echo "   [✓] LiveRevenueWidget created."
echo ""

# 2. Database Setup (Enable Realtime)
echo "2. Alert: Enabling Replication"
echo "   Make sure 'supabase_realtime' publication includes 'transactions' table."
echo "   Run logic: ALTER PUBLICATION supabase_realtime ADD TABLE transactions;"
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run this script."
echo "2. Add /public/sounds/coin-drop.mp3 (Find a free sound online)."
echo "3. Ensure Replication is enabled for 'transactions' in Supabase Dashboard -> Database -> Replication."
