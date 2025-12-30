'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { playGacha } from '@/app/actions/gacha';
import { Coins, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Optional confetti - install with: npm install canvas-confetti
let confetti: any = null;
try {
    confetti = require('canvas-confetti');
} catch (e) {
    // Confetti not installed, will use toast only
}

export function GachaMachine({ userPoints }: { userPoints: number }) {
    const [balance, setBalance] = useState(userPoints);
    const [isPlaying, setIsPlaying] = useState(false);
    const [shake, setShake] = useState(false);
    const [result, setResult] = useState<{ type: string, label: string } | null>(null);

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
                    if (confetti) {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
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
                            result.type === 'zonk' ? '😔' :
                                result.type === 'pulsa' ? '📱' :
                                    result.type === 'jackpot' ? '💎' : '🎁'
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

            <style jsx global>{`
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
       `}</style>
        </div>
    );
}
