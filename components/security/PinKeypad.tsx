'use client';

import { useState } from 'react';
import { verifyPin } from '@/app/actions/security-pin';

export default function PinKeypad({ onSuccess }: { onSuccess: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNum = (num: string) => {
        if (pin.length < 6) setPin(prev => prev + num);
        setError('');
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
        <div className="max-w-xs mx-auto p-4 bg-white rounded-xl shadow-lg border">
            <h3 className="text-center font-bold mb-4">Enter Transaction PIN</h3>

            {/* Display Dots */}
            <div className="flex justify-center gap-2 mb-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border ${i < pin.length ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-300'}`} />
                ))}
            </div>

            {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button key={n} onClick={() => handleNum(n.toString())} className="p-4 text-xl font-semibold bg-gray-50 rounded-lg active:bg-gray-200">
                        {n}
                    </button>
                ))}
                <div />
                <button onClick={() => handleNum('0')} className="p-4 text-xl font-semibold bg-gray-50 rounded-lg active:bg-gray-200">
                    0
                </button>
                <button onClick={handleBackspace} className="p-4 text-xl font-semibold text-red-500 bg-gray-50 rounded-lg active:bg-gray-200">
                    ⌫
                </button>
            </div>

            <button
                onClick={handleSubmit}
                disabled={pin.length !== 6 || loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
                {loading ? 'Verifying...' : 'Confirm'}
            </button>
        </div>
    );
}
