'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, Download, Loader2, Package } from 'lucide-react';

interface FlexShareProps {
    resi: string;
    itemName?: string; // Optional: e.g. "iPhone 15 Pro"
    imageUrl?: string; // Optional: From unboxing video thumbnail
}

// Dynamic import of html2canvas to avoid SSR issues
let html2canvas: any = null;
if (typeof window !== 'undefined') {
    import('html2canvas').then((module) => {
        html2canvas = module.default;
    });
}

export function FlexShareGenerator({ resi, itemName = 'Mysterious Package', imageUrl }: FlexShareProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!canvasRef.current || !html2canvas) return;
        setIsGenerating(true);

        try {
            // Small delay to ensure images load
            await new Promise(r => setTimeout(r, 500));

            const canvas = await html2canvas(canvasRef.current, {
                useCORS: true,
                scale: 2, // High res for Insta
                backgroundColor: null,
            });

            const link = document.createElement('a');
            link.download = `CekKirim-Story-${resi}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Gen Error:', error);
            alert('Gagal membuat gambar. Coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4">
            {/* Incentive Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center w-full max-w-sm shadow-lg">
                <div className="flex justify-center mb-2">
                    <Instagram className="w-6 h-6" />
                </div>
                <p className="font-bold text-lg">Dapat 50 Poin!</p>
                <p className="text-sm opacity-90">Share ke Story & Tag <span className="font-bold">@CekKirim</span></p>
            </div>

            {/* Canvas Preview (Hidden/Shown) */}
            <div className="relative group">
                <div
                    ref={canvasRef}
                    className="w-[300px] h-[533px] relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white shrink-0 shadow-2xl rounded-2xl"
                >
                    {/* Background Image / Overlay */}
                    {imageUrl ? (
                        <div className="absolute inset-0">
                            <img src={imageUrl} alt="Background" className="w-full h-full object-cover opacity-60" crossOrigin="anonymous" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 pattern-grid-lg opacity-20" />
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <span className="text-xs font-bold tracking-wider uppercase">Tracking Update</span>
                            </div>
                        </div>

                        {/* Center: "New Gear" */}
                        <div className="flex flex-col items-center justify-center flex-1 gap-4">
                            <div className="bg-yellow-400 text-black px-6 py-2 rounded-full transform -rotate-6 shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                                <span className="text-xl font-black uppercase italic tracking-widest">NEW GEAR</span>
                            </div>
                            <div className="bg-white text-black px-6 py-2 rounded-full transform rotate-3 shadow-xl">
                                <span className="text-xl font-black uppercase italic tracking-widest">ARRIVED</span>
                            </div>

                            <div className="mt-8 text-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2 border border-white/30">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    {itemName}
                                </h2>
                                <p className="text-sm text-gray-400 font-mono tracking-widest mt-1">
                                    {resi}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Tracked with</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="font-black text-2xl tracking-tighter">
                                    CekKirim
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button onClick={handleDownload} disabled={isGenerating} size="lg" className="w-full max-w-sm rounded-full shadow-xl">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isGenerating ? 'Generating...' : 'Download Story Image'}
            </Button>

        </div>
    );
}
