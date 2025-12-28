'use client';

import { useState, useEffect } from 'react';
import { submitFeedback } from '@/app/actions/feedback';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

export default function NPSSurvey() {
    const [isVisible, setIsVisible] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Logic: Show after 30 seconds if not shown in last 30 days
        const lastShown = localStorage.getItem('last_nps_survey');
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        if (!lastShown || (now - parseInt(lastShown)) > thirtyDays) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 30000); // 30 seconds delay (testing: set small if needed, but 30s is good UX)
            return () => clearTimeout(timer);
        }
    }, []);

    const handleScore = async (selectedScore: number) => {
        setScore(selectedScore);

        // Submit immediately
        await submitFeedback({
            type: 'nps',
            rating: selectedScore,
            message: 'NPS Submission',
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: navigator.userAgent
        });

        // Save timestamp
        localStorage.setItem('last_nps_survey', Date.now().toString());

        setSubmitted(true);
        setTimeout(() => {
            setIsVisible(false);
        }, 3000);
    };

    const handleClose = () => {
        setIsVisible(false);
        // Snooze for 1 day if closed without answer
        localStorage.setItem('last_nps_survey', (Date.now() - (29 * 24 * 60 * 60 * 1000)).toString());
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:bottom-8 max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
                >
                    <div className="p-6">
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {!submitted ? (
                            <>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                                    Seberapa besar kemungkinan Anda merekomendasikan kami?
                                </h3>
                                <p className="text-sm text-gray-500 text-center mb-6">
                                    (0 = Tidak Mungkin, 10 = Sangat Mungkin)
                                </p>

                                <div className="flex justify-between gap-1 mb-4">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleScore(num)}
                                            className={`
                                                flex-1 aspect-square rounded-md text-sm font-medium transition-all
                                                ${score === num
                                                    ? 'bg-indigo-600 text-white transform scale-110'
                                                    : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300'}
                                            `}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 px-1">
                                    <span>Tidak Mungkin</span>
                                    <span>Sangat Mungkin</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-3 animate-bounce" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Terima Kasih!
                                </h3>
                                <p className="text-gray-500">
                                    Masukan Anda membantu kami berkembang.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
