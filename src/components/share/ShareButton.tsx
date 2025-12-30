'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { ShareableCard } from './ShareableCard';

interface ShareButtonProps {
  trackingData: {
    resiNumber: string;
    courier: string;
    currentStatus: string;
    statusDate: string;
    history: Array<{
      date: string;
      desc: string;
      location: string;
    }>;
  };
}

export function ShareButton({ trackingData }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const trackingUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/track/${trackingData.courier}/${trackingData.resiNumber}`
      : '';

  const exportAsImage = async (format: 'png' | 'jpeg') => {
    if (!cardRef.current) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);

      // Download
      const link = document.createElement('a');
      link.download = `tracking-${trackingData.resiNumber}.${format}`;
      link.href = dataUrl;
      link.click();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareToWhatsApp = () => {
    const text = `Cek status paket ${trackingData.courier} - ${trackingData.resiNumber}\n\n${trackingUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-indigo-500/30"
        >
          <Share2 className="w-4 h-4" />
          Bagikan
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-2">
                {/* Export as PNG */}
                <button
                  onClick={() => exportAsImage('png')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Save as PNG
                    </p>
                    <p className="text-xs text-gray-400">High quality</p>
                  </div>
                </button>

                {/* Export as JPG */}
                <button
                  onClick={() => exportAsImage('jpeg')}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Save as JPG
                    </p>
                    <p className="text-xs text-gray-400">Smaller size</p>
                  </div>
                </button>

                <div className="my-2 border-t border-white/10" />

                {/* Copy Link */}
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {copiedLink ? 'Link Tersalin!' : 'Copy Link'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {trackingUrl.replace('https://', '')}
                    </p>
                  </div>
                </button>

                {/* Share to WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <Share2 className="w-4 h-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      Share to WhatsApp
                    </p>
                    <p className="text-xs text-gray-400">Send to customer</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Gambar berhasil disimpan!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-white font-medium">Mengekspor gambar...</p>
          </div>
        </div>
      )}

      {/* Hidden Card for Export */}
      <div className="fixed -left-[9999px] top-0">
        <ShareableCard ref={cardRef} trackingData={trackingData} />
      </div>
    </>
  );
}
