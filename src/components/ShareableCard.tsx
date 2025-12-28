'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2 } from 'lucide-react';

/**
 * Shareable Tracking Receipt Card
 * Instagram/WA Story-ready design with brand gradient
 */

interface ShareableCardProps {
    trackingNumber: string;
    courier: string;
    status: string;
    deliveryDays?: number;
    origin?: string;
    destination?: string;
}

export function ShareableCard({
    trackingNumber,
    courier,
    status,
    deliveryDays,
    origin,
    destination,
}: ShareableCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const downloadImage = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true, // Helpful if loading external images/fonts
            });

            const link = document.createElement('a');
            link.download = `cekkirim-${trackingNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate image:', error);
        }
    };

    const shareToWhatsApp = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
            });

            canvas.toBlob((blob) => {
                if (!blob) return;

                const file = new File([blob], `cekkirim-${trackingNumber}.png`, {
                    type: 'image/png',
                });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    // Native Share API (Mobile)
                    navigator.share({
                        files: [file],
                        title: 'Status Paket CekKirim',
                        text: `✅ Paket ${courier} ${status}!\n\nCek ongkir & tracking gratis di CekKirim.com 📦`,
                    }).catch((err) => console.error('Error sharing:', err));
                } else {
                    // Fallback: WhatsApp Web link (cannot attach image directly via URL scheme)
                    const text = encodeURIComponent(
                        `✅ Paket ${courier} ${status}!\n\nLink Tracking: https://cekkirim.com/cek-resi/${courier}/${trackingNumber}`
                    );
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                }
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    };

    const getStatusEmoji = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('DELIVERED') || s.includes('SAMPAI')) return '✅';
        if (s.includes('TRANSIT') || s.includes('DALAM PERJALANAN')) return '🚚';
        if (s.includes('MANIFEST') || s.includes('PICKUP')) return '📦';
        return '📍';
    };

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('DELIVERED') || s.includes('SAMPAI'))
            return 'from-green-500 to-emerald-600';
        if (s.includes('TRANSIT') || s.includes('DALAM PERJALANAN')) return 'from-blue-500 to-indigo-600';
        return 'from-primary-500 to-accent-500'; // Default brand gradient
    };

    return (
        <div className="space-y-6">
            {/* Shareable Container: 9:16 Aspect Ratio for Stories */}
            <div className="flex justify-center">
                <div
                    ref={cardRef}
                    className="relative w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] rounded-3xl overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '9/16' }}
                >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(status)}`} />

                    {/* Decorative Elements */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Content Layer */}
                    <div className="relative h-full flex flex-col items-center justify-between p-8 text-white">

                        {/* 1. Header Area */}
                        <div className="text-center space-y-4 pt-4">
                            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-sm font-semibold tracking-wide">
                                {courier.toUpperCase()}
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-7xl mb-2 drop-shadow-xl">{getStatusEmoji(status)}</div>
                                <h1 className="text-3xl font-bold leading-tight drop-shadow-md px-2 line-clamp-2">
                                    {status}
                                </h1>
                            </div>
                        </div>

                        {/* 2. Tracking Details */}
                        <div className="w-full space-y-6 text-center">
                            {deliveryDays && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                    <div className="text-white/80 text-xs uppercase tracking-wider mb-1">Estimasi Pengiriman</div>
                                    <div className="text-4xl font-bold">{deliveryDays} Hari</div>
                                </div>
                            )}

                            {origin && destination && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 px-2">
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-xs text-white/70">Asal</div>
                                            <div className="text-lg font-semibold truncate">{origin}</div>
                                        </div>
                                        <div className="text-xl opacity-60">→</div>
                                        <div className="text-right flex-1 min-w-0">
                                            <div className="text-xs text-white/70">Tujuan</div>
                                            <div className="text-lg font-semibold truncate">{destination}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Footer / Watermark */}
                        <div className="w-full text-center space-y-4 pb-4">
                            <div className="pt-4 border-t border-white/20 w-3/4 mx-auto">
                                <div className="text-xs text-white/60 mb-1">Nomor Resi</div>
                                <div className="font-mono text-lg font-bold tracking-wider">{trackingNumber}</div>
                            </div>

                            <div className="flex flex-col items-center justify-center opacity-90">
                                <div className="text-2xl font-bold tracking-tight">CekKirim.com</div>
                                <div className="text-xs font-medium text-white/80">Cek Ongkir & Tracking Gratis 🚀</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                    onClick={downloadImage}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-900 text-white rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Download</span>
                </button>
                <button
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share WA</span>
                </button>
            </div>
        </div>
    );
}

export default ShareableCard;
