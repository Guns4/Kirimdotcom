'use client';

import { useState, useEffect } from 'react';
import { Bell, BellRing, Mail, Phone, X, Check, Loader2 } from 'lucide-react';
import {
  subscribeToTracking,
  unsubscribeFromTracking,
  checkSubscriptionStatus,
} from '@/app/actions/tracking-notify';

interface TrackingNotifyButtonProps {
  resi: string;
  courierCode: string;
  currentStatus?: string;
}

export function TrackingNotifyButton({
  resi,
  courierCode,
  currentStatus,
}: TrackingNotifyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if already subscribed
  useEffect(() => {
    async function check() {
      const result = await checkSubscriptionStatus(resi);
      setIsSubscribed(result.isSubscribed);
      if (result.email) setEmail(result.email);
      if (result.whatsapp) setWhatsapp(result.whatsapp);
      setChecking(false);
    }
    check();
  }, [resi]);

  const handleSubscribe = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await subscribeToTracking({
      resi,
      courierCode,
      email: email || undefined,
      whatsapp: whatsapp || undefined,
      currentStatus,
    });

    setLoading(false);

    if (result.success) {
      setIsSubscribed(true);
      setSuccess(
        'Notifikasi aktif! Kami akan mengirim update via ' +
          (email ? 'email' : 'WhatsApp')
      );
      setTimeout(() => setIsOpen(false), 2000);
    } else {
      setError(result.error || 'Terjadi kesalahan');
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    const result = await unsubscribeFromTracking(resi);
    setLoading(false);

    if (result.success) {
      setIsSubscribed(false);
      setIsOpen(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-gray-400"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isSubscribed
            ? 'bg-green-600/20 text-green-400 border border-green-500/30'
            : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30'
        }`}
      >
        {isSubscribed ? (
          <>
            <BellRing className="w-4 h-4" />
            <span className="text-sm">Notifikasi Aktif</span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4" />
            <span className="text-sm">Pantau Resi</span>
          </>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              {isSubscribed ? 'Pengaturan Notifikasi' : 'Pantau Resi Ini'}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubscribed ? (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Notifikasi aktif untuk resi{' '}
                <span className="text-white font-mono">{resi}</span>
              </p>
              <div className="text-sm text-gray-300 mb-4">
                {email && <p>📧 {email}</p>}
                {whatsapp && <p>📱 {whatsapp}</p>}
              </div>
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Hentikan Notifikasi'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Dapatkan notifikasi otomatis saat status paket berubah.
              </p>

              {/* Email Input */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* WhatsApp Input */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  WhatsApp (opsional)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Error/Success Messages */}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && (
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {success}
                </p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubscribe}
                disabled={loading || (!email && !whatsapp)}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Aktifkan Notifikasi
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Gratis untuk pengguna premium
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
