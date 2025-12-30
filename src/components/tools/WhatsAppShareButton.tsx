'use client';

import { useState } from 'react';
import { MessageCircle, Send, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackingData {
  resiNumber: string;
  courier: string;
  currentStatus: string;
  history?: { desc: string; date: string; location?: string }[];
}

interface WhatsAppShareButtonProps {
  trackingData: TrackingData;
}

export function WhatsAppShareButton({
  trackingData,
}: WhatsAppShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleOpen = () => {
    // Generate dynamic message
    const latestStatus =
      trackingData.history?.[0]?.desc || trackingData.currentStatus;
    const trackingLink =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://cekkirim.com';

    const template = `Halo kak, paket pesananmu dengan resi ${trackingData.resiNumber} menggunakan ${trackingData.courier} saat ini posisinya sudah sampai di ${latestStatus}. Mohon ditunggu ya! - Cek di: ${trackingLink}`;

    setMessage(template);
    setIsOpen(true);
  };

  const handleSend = () => {
    if (!buyerPhone) {
      alert('Mohon isi nomor HP pembeli');
      return;
    }

    // Format phone number (ensure starts with 62)
    let formattedPhone = buyerPhone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-green-500/30"
      >
        <MessageCircle className="w-4 h-4" />
        Kirimi Pembeli
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                  Kabar ke Pembeli
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nomor WhatsApp Pembeli
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Pesan Preview
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleSend}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  Kirim Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
