'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Package, MapPin } from 'lucide-react';

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
  deliveryDays = 0,
  origin = '',
  destination = '',
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Determine status styling
  const isDelivered =
    status.toUpperCase().includes('DELIVERED') ||
    status.toUpperCase().includes('TERKIRIM');
  const isTransit =
    status.toUpperCase().includes('TRANSIT') ||
    status.toUpperCase().includes('PERJALANAN');

  const gradientClass = isDelivered
    ? 'from-green-500 to-emerald-600'
    : isTransit
      ? 'from-blue-500 to-indigo-600'
      : 'from-indigo-500 to-purple-600';

  const statusEmoji = isDelivered ? '✅' : isTransit ? '🚚' : '📦';
  const statusText = isDelivered
    ? 'Paket Terkirim!'
    : isTransit
      ? 'Dalam Perjalanan'
      : 'Sedang Diproses';

  /**
   * Download card as image
   */
  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // 2x for better quality
        backgroundColor: null,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cekkirim-${trackingNumber}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  /**
   * Share via Web Share API or fallback to WhatsApp
   */
  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `cekkirim-${trackingNumber}.png`, {
          type: 'image/png',
        });

        // Try Web Share API (mobile)
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: `${statusEmoji} Tracking ${courier}`,
              text: `Paket ${trackingNumber} - ${statusText}`,
              files: [file],
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        } else {
          // Fallback: WhatsApp Web
          const text = encodeURIComponent(
            `${statusEmoji} *${statusText}*\n\nKurir: ${courier}\nNo. Resi: ${trackingNumber}\n\nCek tracking lengkap di:\nhttps://cekkirim.com/cek-resi?q=${trackingNumber}`
          );
          window.open(`https://wa.me/?text=${text}`, '_blank');
        }
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shareable Card (9:16 aspect ratio for Instagram Story) */}
      <div
        ref={cardRef}
        className="relative w-full max-w-sm mx-auto"
        style={{ aspectRatio: '9/16' }}
      >
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-3xl overflow-hidden`}
        >
          {/* Decorative Circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8 text-white">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-black mb-2">{statusEmoji}</h1>
            <h2 className="text-2xl font-bold mb-1">{statusText}</h2>
            {deliveryDays > 0 && (
              <p className="text-white/90 text-sm">dalam {deliveryDays} hari</p>
            )}
          </div>

          {/* Main Info */}
          <div className="space-y-6">
            {/* Courier Badge */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Kurir</span>
              </div>
              <h3 className="text-3xl font-black">{courier}</h3>
            </div>

            {/* Route */}
            {origin && destination && (
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">{origin}</span>
                  </div>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{destination}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Number */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-xs opacity-75 mb-1">No. Resi</p>
              <p className="font-mono text-lg font-bold tracking-wider">
                {trackingNumber}
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center">
            <div className="inline-block bg-white/25 backdrop-blur-md rounded-full px-6 py-3">
              <p className="text-sm font-bold">
                Tracked with <span className="text-white">CekKirim.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Info Text */}
      <p className="text-center text-sm text-gray-500">
        Bagikan tracking kamu ke Instagram atau WhatsApp Story! 📸
      </p>
    </div>
  );
}
