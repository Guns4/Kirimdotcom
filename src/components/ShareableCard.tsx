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
                    navigator.share({
                        files: [file],
                        title: 'Status Paket CekKirim',
                        text: `✅ Paket ${courier} ${status}!\n\nCek ongkir & tracking gratis di cekkirim.com 📦`,
                    });
                } else {
                    // Fallback: WhatsApp Web
                    const text = encodeURIComponent(
                        `✅ Paket ${courier} ${status}!\n\nCek ongkir & tracking gratis di cekkirim.com 📦`
                    );
                    window.open(`https://wa.me/?text=${text}`, '_blank');
                }
            });
        } catch (error) {
            console.error('Failed to share:', error);
        }
    };

    const getStatusEmoji = (status: string) => {
        if (status.includes('DELIVERED') || status.includes('SAMPAI')) return '✅';
        if (status.includes('TRANSIT') || status.includes('DALAM PERJALANAN')) return '🚚';
        if (status.includes('MANIFEST')) return '📦';
        return '📍';
    };

    const getStatusColor = (status: string) => {
        if (status.includes('DELIVERED') || status.includes('SAMPAI'))
            return 'from-green-500 to-emerald-600';
        if (status.includes('TRANSIT')) return 'from-blue-500 to-indigo-600';
        return 'from-primary-500 to-accent-500';
    };

    return (
        <div className="space-y-4">
            {/* Shareable Card */}
            <div
                ref={cardRef}
                className="relative w-full max-w-md mx-auto aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(status)}`} />

                {/* Decorative Circles */}
                <div className="absolute top-10 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-between p-8 text-white">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                            {courier.toUpperCase()}
                        </div>
                        <div className="text-6xl">{getStatusEmoji(status)}</div>
                        <h1 className="text-3xl font-bold">{status}</h1>
                    </div>

                    {/* Info */}
                    <div className="w-full space-y-4 text-center">
                        {deliveryDays && (
                            <div className="text-lg">
                                <div className="text-white/80 text-sm mb-1">Estimasi Pengiriman</div>
                                <div className="text-3xl font-bold">{deliveryDays} Hari</div>
                            </div>
                        )}

                        {origin && destination && (
                            <div className="space-y-1">
                                <div className="text-sm text-white/80">{origin}</div>
                                <div className="text-xl">→</div>
                                <div className="text-sm text-white/80">{destination}</div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/20">
                            <div className="text-xs text-white/70 mb-1">Nomor Resi</div>
                            <div className="font-mono font-bold">{trackingNumber}</div>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-bold">CekKirim.com</div>
                        <div className="text-sm text-white/80">Cek Ongkir & Tracking Gratis 🚀</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={downloadImage}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-800 text-white rounded-xl hover:bg-surface-900 transition"
                >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                </button>
                <button
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                    <Share2 className="w-5 h-5" />
                    <span>Share WA</span>
                </button>
            </div>
        </div>
    );
}

export default ShareableCard;
