'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function MorningBriefing({ userName, summaryText }: { userName: string, summaryText: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);

    useEffect(() => {
        // Auto-play condition could be checked here (e.g. check localStorage for 'last_briefing_date')
    }, []);

    const handlePlay = () => {
        if (!('speechSynthesis' in window)) {
            alert('Browser Anda tidak mendukung Text-to-Speech.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance();
        utterance.text = `Selamat pagi ${userName}. Berikut ringkasan Anda hari ini: ${summaryText}`;
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            setHasPlayed(true);
        };

        window.speechSynthesis.cancel(); // Clears any previous
        window.speechSynthesis.speak(utterance);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    if (hasPlayed) return null; // Hide after playing

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fade-in mx-4 mt-4">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Volume2 size={20} /> Morning Briefing
                </h3>
                <p className="text-blue-100 text-sm opacity-90">
                    Dengarkan ringkasan penjualan & status paket Anda hari ini.
                </p>
            </div>
            <button
                onClick={isPlaying ? handleStop : handlePlay}
                className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-50 transition-colors shadow-md"
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
        </div>
    );
}
