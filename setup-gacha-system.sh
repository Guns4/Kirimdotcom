#!/bin/bash

# =============================================================================
# Addictive Engagement: Gacha System
# =============================================================================

echo "Initializing Gacha System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: gacha_schema.sql"
cat <<EOF > gacha_schema.sql
-- Table: gacha_history
create table if not exists public.gacha_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reward_type text not null, -- 'zonk', 'points', 'pulsa', 'jackpot'
  reward_value integer default 0, -- points amount
  reward_label text, -- e.g. "Voucher Pulsa 50rb"
  cost integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.gacha_history enable row level security;

create policy "Users can view own gacha history"
  on public.gacha_history for select
  using (auth.uid() = user_id);
EOF

# 2. Server Action (Anti-Cheat Logic)
echo "2. Creating Server Logic: src/app/actions/gacha.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/gacha.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const GACHA_COST = 10;

interface GachaResult {
  success: boolean;
  rewardType?: 'zonk' | 'points' | 'pulsa' | 'jackpot';
  rewardValue?: number;
  rewardLabel?: string;
  newBalance?: number;
  error?: string;
}

export async function playGacha(): Promise<GachaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // 1. Transaction: Deduct Cost
  // We utilize the existing 'award_points' function with negative value for safety/logging
  const { data: deductRes, error: deductError } = await supabase.rpc('award_points', {
    p_user_id: user.id,
    p_points: -GACHA_COST,
    p_action_type: 'play_gacha',
    p_description: 'Spin Gacha Cost'
  });

  // If error (likely insufficient balance if function handles it, or just DB error)
  // Our RPC returns jsonb with success=false if balance < 0
  if (deductError || (deductRes && !deductRes.success)) {
     return { success: false, error: 'Poin tidak cukup!' };
  }

  // 2. RNG Logic (Server Side)
  const rand = Math.random() * 100; // 0 to 100
  let rewardType: 'zonk' | 'points' | 'pulsa' | 'jackpot' = 'zonk';
  let rewardValue = 0;
  let rewardLabel = 'Zonk! Coba lagi.';

  // Weights: 
  // Zonk: 70% (0 - 70)
  // Points: 20% (70 - 90)
  // Pulsa: 9.9% (90 - 99.9)
  // Jackpot: 0.1% (> 99.9)

  if (rand < 70) {
     // ZONK
     rewardType = 'zonk';
     rewardLabel = 'Zonk! Jangan menyerah!';
  } else if (rand < 90) {
     // POINTS: 5 to 50
     rewardType = 'points';
     rewardValue = Math.floor(Math.random() * (50 - 5 + 1)) + 5;
     rewardLabel = \`+\${rewardValue} Poin\`;
     
     // Grant Prize
     await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: rewardValue,
        p_action_type: 'gacha_win',
        p_description: 'Gacha Win: Points'
     });

  } else if (rand < 99.9) {
     // PULSA (Simulated Item)
     rewardType = 'pulsa';
     rewardLabel = 'Voucher Pulsa 5rb';
     // In real app: Insert into 'user_vouchers' table
     // Here: we just log it
  } else {
     // JACKPOT
     rewardType = 'jackpot';
     rewardValue = 1000;
     rewardLabel = 'JACKPOT! 1000 Poin';
     
     await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: rewardValue,
        p_action_type: 'gacha_jackpot',
        p_description: 'JACKPOT WIN'
     });
  }

  // 3. Log History
  await supabase.from('gacha_history').insert({
     user_id: user.id,
     reward_type: rewardType,
     reward_value: rewardValue,
     reward_label: rewardLabel,
     cost: GACHA_COST
  });

  // Get final balance
  const { data: profile } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single();

  revalidatePath('/rewards');
  return {
    success: true,
    rewardType,
    rewardValue,
    rewardLabel,
    newBalance: profile?.points_balance || 0
  };
}
EOF

# 3. UI Component (Shaking Chest)
echo "3. Creating UI Component: src/components/game/GachaMachine.tsx"
mkdir -p src/components/game
cat <<EOF > src/components/game/GachaMachine.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { playGacha } from '@/app/actions/gacha';
import { Loader2, Coins, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

// Simple Chest SVG or generic box
const ChestIcon = ({ open }: { open: boolean }) => (
    <div className={cn("text-6xl transition-all", open ? "scale-110" : "")}>
        {open ? '🎒' : '📦'} 
    </div>
);
// Using Emoji for simplicity in script, user can replace with SVG. 
// "Peti Harta Karun" -> usually 📦 or 🏴‍☠️ chest. Let's use a nice div with animation.

export function GachaMachine({ userPoints }: { userPoints: number }) {
  const [balance, setBalance] = useState(userPoints);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState<{type: string, label: string} | null>(null);

  const handlePlay = async () => {
    if (balance < 10) {
        toast.error('Poin tidak cukup! Butuh 10 poin.');
        return;
    }

    setIsPlaying(true);
    setResult(null);
    setShake(true);

    // Initial Delay for suspense
    setTimeout(async () => {
        const res = await playGacha();
        setShake(false);
        setIsPlaying(false);

        if (res.success) {
            setBalance(res.newBalance || 0);
            setResult({ type: res.rewardType || 'zonk', label: res.rewardLabel || '' });

            if (res.rewardType === 'jackpot' || res.rewardType === 'pulsa') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success('🎉 SELAMAT! ' + res.rewardLabel);
            } else if (res.rewardType === 'points') {
                toast.success('Dapat Poin! ' + res.rewardLabel);
            } else {
                toast('Zonk! Coba lagi besok.', { icon: '😅' });
            }
        } else {
            toast.error(res.error || 'Gagal memutar gacha');
        }
    }, 2000); // 2 seconds spin time
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 rounded-2xl text-center text-white relative overflow-hidden max-w-sm mx-auto shadow-2xl border border-white/10">
       <div className="absolute top-0 left-0 w-full h-full pattern-grid-lg opacity-10 pointer-events-none" />
       
       <div className="relative z-10">
           <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Gift className="text-yellow-400" />
              Mystery Machine
           </h2>
           <p className="text-sm text-gray-300 mb-6">Test keberuntunganmu! 10 Poin / Spin</p>

           <div className="h-48 flex items-center justify-center mb-6">
               <div className={cn(
                   "text-[8rem] select-none transition-transform duration-100",
                   shake ? "animate-shake" : "",
                   result ? "animate-bounce" : ""
               )}>
                   {result ? (
                       result.type === 'zonk' ? '🥔' :
                       result.type === 'pulsa' ? '📱' :
                       result.type === 'jackpot' ? '💎' : '💰'
                   ) : '📦'}
               </div>
           </div>

           {result && (
               <div className="mb-6 animate-in zoom-in slide-in-from-bottom-5">
                   <p className="text-lg font-bold text-yellow-300">{result.label}</p>
               </div>
           )}

           <div className="flex flex-col gap-3">
               <Button 
                 onClick={handlePlay} 
                 disabled={isPlaying || balance < 10}
                 className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform"
               >
                 {isPlaying ? 'Memutar...' : 'Putar Gacha (10 Poin)'}
               </Button>
               <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  Saldo: <span className="text-white font-bold">{balance}</span>
               </div>
           </div>
       </div>

       <style jsx global>{\`
           @keyframes shake {
               0% { transform: translate(1px, 1px) rotate(0deg); }
               10% { transform: translate(-1px, -2px) rotate(-1deg); }
               20% { transform: translate(-3px, 0px) rotate(1deg); }
               30% { transform: translate(3px, 2px) rotate(0deg); }
               40% { transform: translate(1px, -1px) rotate(1deg); }
               50% { transform: translate(-1px, 2px) rotate(-1deg); }
               60% { transform: translate(-3px, 1px) rotate(0deg); }
               70% { transform: translate(3px, 1px) rotate(-1deg); }
               80% { transform: translate(-1px, -1px) rotate(1deg); }
               90% { transform: translate(1px, 2px) rotate(0deg); }
               100% { transform: translate(1px, -2px) rotate(-1deg); }
           }
           .animate-shake {
               animation: shake 0.5s;
               animation-iteration-count: infinite;
           }
       \`}</style>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Gacha System Ready!"
echo "1. Run 'gacha_schema.sql' in Supabase."
echo "2. Import <GachaMachine userPoints={...} /> in your rewards page."
