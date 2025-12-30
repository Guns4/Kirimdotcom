'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Package, RefreshCw, Search } from 'lucide-react';

interface ErrorStateProps {
  type: 'not-found' | 'rate-limit' | 'network' | 'general';
  message?: string;
  onRetry?: () => void;
  suggestions?: string[];
}

export function ErrorState({
  type,
  message,
  onRetry,
  suggestions,
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'not-found':
        return {
          icon: Package,
          title: 'Data Tidak Ditemukan',
          defaultMessage:
            'Nomor resi tidak ditemukan. Pastikan nomor resi benar dan kurir yang dipilih sesuai.',
          color: 'from-orange-500 to-amber-500',
          defaultSuggestions: [
            'Periksa kembali nomor resi Anda',
            'Pastikan kurir yang dipilih sudah benar',
            'Coba kurir lain jika tidak yakin',
            'Tunggu beberapa jam jika paket baru dikirim',
          ],
        };
      case 'rate-limit':
        return {
          icon: AlertCircle,
          title: 'Sistem Sedang Sibuk',
          defaultMessage:
            'Terlalu banyak permintaan saat ini. Silakan coba beberapa saat lagi.',
          color: 'from-yellow-500 to-orange-500',
          defaultSuggestions: [
            'Tunggu 1-2 menit sebelum mencoba lagi',
            'Sistem akan kembali normal segera',
          ],
        };
      case 'network':
        return {
          icon: RefreshCw,
          title: 'Koneksi Terputus',
          defaultMessage:
            'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
          color: 'from-red-500 to-pink-500',
          defaultSuggestions: [
            'Periksa koneksi internet Anda',
            'Coba refresh halaman',
            'Hubungi support jika masalah berlanjut',
          ],
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Terjadi Kesalahan',
          defaultMessage: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          color: 'from-gray-500 to-gray-600',
          defaultSuggestions: ['Coba lagi dalam beberapa saat'],
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;
  const displaySuggestions = suggestions || config.defaultSuggestions;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 border-red-500/30"
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-20 h-20 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white text-center mb-3">
        {config.title}
      </h3>

      {/* Message */}
      <p className="text-gray-300 text-center mb-6">
        {message || config.defaultMessage}
      </p>

      {/* Suggestions */}
      {displaySuggestions && displaySuggestions.length > 0 && (
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2 mb-3">
            <Search className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-indigo-300">
              Saran untuk Anda:
            </p>
          </div>
          <ul className="space-y-2">
            {displaySuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="text-sm text-gray-400 flex items-start gap-2"
              >
                <span className="text-indigo-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <div className="flex justify-center">
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
