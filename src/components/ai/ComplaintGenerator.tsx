'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Check, Loader2, X } from 'lucide-react';

interface ComplaintGeneratorProps {
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

export function ComplaintGenerator({ trackingData }: ComplaintGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [complaintText, setComplaintText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateComplaint = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'complaint',
          trackingData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate complaint');
      }

      const data = await response.json();
      setComplaintText(data.advice);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal membuat teks komplain'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    if (!complaintText) {
      generateComplaint();
    }
  };

  const handleCopy = async () => {
    if (complaintText) {
      await navigator.clipboard.writeText(complaintText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpenModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 text-orange-300 rounded-lg transition-all text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        🤖 Buat Teks Komplain
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50"
            >
              <div className="glass-card p-6 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Generator Teks Komplain
                      </h3>
                      <p className="text-sm text-gray-400">
                        AI akan membuatkan teks profesional untuk Anda
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Tracking Info */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-2">Informasi Paket:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Resi:</span>
                      <span className="text-white ml-2 font-mono">
                        {trackingData.resiNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Kurir:</span>
                      <span className="text-white ml-2">
                        {trackingData.courier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generated Text */}
                <div className="space-y-3">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                      <p className="text-sm text-gray-400">
                        Membuat teks komplain profesional...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {complaintText && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                          {complaintText}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Salin Teks
                            </>
                          )}
                        </button>

                        <button
                          onClick={generateComplaint}
                          disabled={isLoading}
                          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all disabled:opacity-50"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-3 text-center">
                        💡 Tip: Sesuaikan teks di atas sebelum mengirim ke
                        customer service
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
