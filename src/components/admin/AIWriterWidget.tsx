'use client';

import { useState } from 'react';
import { generateArticle } from '@/app/actions/aiWriterActions';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AIWriterWidget() {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!keyword) return;
        setLoading(true);
        try {
            await generateArticle(keyword);
            setKeyword('');
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                AI Content Generator
            </h3>
            <p className="text-indigo-100 text-sm mb-4">
                Buat artikel SEO otomatis dalam hitungan detik.
            </p>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Masukkan keyword (misal: Cara Cek Resi JNE)"
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm placeholder-indigo-200 outline-none focus:bg-white/30 transition-all"
                    disabled={loading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !keyword}
                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buat'}
                </button>
            </div>
        </div>
    );
}
