'use client';

import { useState, useEffect } from 'react';
import { X, Smile, Meh, Frown } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';
import { usePathname } from 'next/navigation';

export default function NPSSurvey() {
    const [isVisible, setIsVisible] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Check local storage to see if already taken recently
        const lastTaken = localStorage.getItem('nps_last_taken');
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        if (lastTaken && Date.now() - parseInt(lastTaken) < thirtyDays) {
            return;
        }

        // Show after 30 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 30000);

        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (selectedRating: number) => {
        setRating(selectedRating);
        // Optimistic update
        setSubmitted(true);

        // Setup simple message based on score
        let msg = '';
        if (selectedRating >= 9) msg = 'Promoter';
        else if (selectedRating >= 7) msg = 'Passive';
        else msg = 'Detractor';

        await submitFeedback('nps', msg, selectedRating, pathname);

        // Save timestamp
        localStorage.setItem('nps_last_taken', Date.now().toString());

        // Hide after 3s
        setTimeout(() => setIsVisible(false), 3000);
    };

    const handleClose = () => {
        setIsVisible(false);
        // Remind later (e.g. 3 days)? For now just mark as taken to avoid annoyance
        localStorage.setItem('nps_last_taken', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white border rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>

                {!submitted ? (
                    <>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">
                            Seberapa mungkin Anda merekomendasikan CekKirim ke teman?
                        </h3>
                        <div className="flex justify-between items-center mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <span>Tidak Mungkin</span>
                            <span>Sangat Mungkin</span>
                        </div>
                        <div className="flex gap-1 justify-center">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleSubmit(num)}
                                    className={`
                                        w-8 h-10 rounded text-sm font-bold transition-all hover:-translate-y-1
                                        ${num <= 6 ? 'bg-red-50 text-red-600 hover:bg-red-100' : ''}
                                        ${num >= 7 && num <= 8 ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : ''}
                                        ${num >= 9 ? 'bg-green-50 text-green-600 hover:bg-green-100' : ''}
                                    `}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                            <Smile className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Terima Kasih!</h3>
                        <p className="text-sm text-gray-500">Masukan Anda sangat berarti bagi kami.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
