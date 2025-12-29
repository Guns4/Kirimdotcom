'use client';

import { useState, useRef, useEffect } from 'react';
import tips from '@/data/social-tips.json';
import { Download, RefreshCw, Type, Instagram, Shuffle } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function SocialStudioPage() {
    // State
    const [title, setTitle] = useState('Judul Postingan');
    const [content, setContent] = useState('Ketik konten kreatif Anda di sini atau gunakan tombol Acak untuk inspirasi.');
    const [category, setCategory] = useState('INFO TERBARU');
    const [theme, setTheme] = useState<'blue' | 'dark' | 'orange' | 'pink'>('blue');

    // Core
    const previewRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    // Load initial random tip
    useEffect(() => {
        handleRandom();
    }, []);

    const handleRandom = () => {
        const randomIndex = Math.floor(Math.random() * tips.length);
        const t = tips[randomIndex];
        setTitle(t.title);
        setContent(t.content);
        setCategory(t.category);
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setGenerating(true);
        try {
            // Wait for fonts/images to be ready
            await document.fonts.ready;

            const canvas = await html2canvas(previewRef.current, {
                scale: 2, // Retina
                useCORS: true,
                backgroundColor: null,
            });
            const link = document.createElement('a');
            link.download = `IG-Post-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error(e);
            alert('Gagal generate gambar. Coba lagi.');
        } finally {
            setGenerating(false);
        }
    };

    // Style Map
    const themes = {
        blue: 'bg-gradient-to-br from-indigo-600 to-blue-700',
        dark: 'bg-gradient-to-br from-gray-900 to-gray-800',
        orange: 'bg-gradient-to-br from-orange-500 to-red-600',
        pink: 'bg-gradient-to-br from-pink-500 to-rose-600',
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <Instagram className="w-8 h-8 text-pink-600" />
                Social Media Studio
            </h1>

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* CONFIG PANEL (Left) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">Konten Text</label>
                            <button onClick={handleRandom} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <Shuffle className="w-3 h-3" /> Acak Tips
                            </button>
                        </div>

                        <div className="space-y-3">
                            <input
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                placeholder="Kategori (e.g. BREAKING NEWS)"
                                className="w-full border p-2 rounded text-sm font-medium tracking-wide uppercase"
                            />
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Judul besar..."
                                className="w-full border p-2 rounded text-lg font-bold"
                            />
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Isi konten..."
                                rows={5}
                                className="w-full border p-2 rounded text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tema Warna</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`h-10 rounded-lg transition-all border-2 ${theme === t ? 'border-indigo-600 scale-105' : 'border-transparent'
                                        } ${themes[t]}`}
                                    title={t}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            onClick={handleDownload}
                            disabled={generating}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-[0.98]"
                        >
                            {generating ? (
                                <>Loading...</>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download PNG
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* VISUAL PREVIEW (Right/Center) */}
                <div className="lg:col-span-8 flex justify-center bg-gray-50 border border-gray-200 rounded-xl p-8 lg:p-12 overflow-auto">

                    {/* CANVAS 1080x1080 scaled down for preview */}
                    <div
                        ref={previewRef}
                        className={`w-[540px] h-[540px] flex-shrink-0 shadow-2xl flex flex-col justify-between p-12 relative overflow-hidden text-white transition-colors duration-500 ${themes[theme]}`}
                    >
                        {/* Background FX */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-10 -mb-10 mix-blend-overlay"></div>

                        {/* Header */}
                        <div className="relative z-10">
                            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-[0.2em] mb-8 border border-white/20 uppercase shadow-sm">
                                {category || 'LOGISTICS'}
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.1] drop-shadow-md break-words">
                                {title || 'Judul Postingan'}
                            </h2>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex-1 flex items-center mt-4 mb-4">
                            <p className="text-xl lg:text-2xl font-medium leading-relaxed opacity-95 whitespace-pre-wrap drop-shadow-sm font-sans">
                                {content || 'Isi konten Anda akan muncul di sini.'}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white text-indigo-900 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">
                                    CK
                                </div>
                                <div className="leading-tight">
                                    <p className="font-bold text-base">CekKirim.com</p>
                                    <p className="text-xs opacity-80">Platform Logistik #1</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs opacity-70 font-medium tracking-wide">FOLLOW OUR INSTAGRAM</p>
                                <p className="font-mono text-base font-bold">@cekkirim.id</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
