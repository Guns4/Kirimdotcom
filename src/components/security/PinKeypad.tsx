'use client';

import { useState } from 'react';
import { verifyPin } from '@/app/actions/security-pin';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface PinKeypadProps {
    onSuccess: () => void;
    title?: string;
}

export default function PinKeypad({ onSuccess, title = "Enter Transaction PIN" }: PinKeypadProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNum = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleBackspace = () => setPin(prev => prev.slice(0, -1));

    const handleSubmit = async () => {
        if (pin.length !== 6) return;
        setLoading(true);
        try {
            await verifyPin(pin);
            onSuccess();
        } catch (e: any) {
            setError(e.message);
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xs mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-center font-bold text-lg mb-6 text-zinc-800 dark:text-zinc-100">{title}</h3>
            
            <div className="flex justify-center gap-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                            i < pin.length 
                            ? 'bg-primary border-primary scale-110 shadow-[0_0_10px_rgba(var(--primary),0.5)]' 
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                        }`} 
                    />
                ))}
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium mb-4 animate-shake">{error}</p>}

            <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button 
                        key={n} 
                        onClick={() => handleNum(n.toString())} 
                        className="h-14 w-full flex items-center justify-center text-xl font-bold rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-800 dark:text-zinc-200"
                    >
                        {n}
                    </button>
                ))}
                <div />
                <button 
                    onClick={() => handleNum('0')} 
                    className="h-14 w-full flex items-center justify-center text-xl font-bold rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-800 dark:text-zinc-200"
                >
                    0
                </button>
                <button 
                    onClick={handleBackspace} 
                    className="h-14 w-full flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-red-500"
                >
                    <Delete size={20} />
                </button>
            </div>

            <Button 
                onClick={handleSubmit} 
                className="w-full h-12 mt-8 font-bold text-base rounded-xl"
                disabled={pin.length !== 6 || loading}
            >
                {loading ? 'Verifying...' : 'Confirm PIN'}
            </Button>
        </div>
    );
}
