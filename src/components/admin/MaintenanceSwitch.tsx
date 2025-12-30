'use client';

import { useState } from 'react';
import { toggleMaintenanceMode } from '@/app/actions/admin-metrics';
import { AlertTriangle, Power, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MaintenanceSwitchProps {
  initialStatus: boolean;
}

export function MaintenanceSwitch({ initialStatus }: MaintenanceSwitchProps) {
  const [isMaintenance, setIsMaintenance] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const confirmed = window.confirm(
      isMaintenance
        ? 'Matikan Mode Perbaikan? Website akan kembali bisa diakses publik.'
        : "⚠️ AKTIFKAN DARURAT? Website akan menampilkan halaman 'Under Maintenance' untuk SEMUA user."
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await toggleMaintenanceMode(isMaintenance);
      setIsMaintenance(!isMaintenance);
      toast.success(
        isMaintenance ? 'Website Online Kembali' : 'Mode Darurat Aktif'
      );
    } catch (error) {
      toast.error('Gagal mengubah status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border transition-all ${isMaintenance ? 'bg-red-500/10 border-red-500/30' : 'glass-card border-white/10'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div
            className={`p-3 rounded-xl ${isMaintenance ? 'bg-red-500/20' : 'bg-white/5'}`}
          >
            <Power
              className={`w-6 h-6 ${isMaintenance ? 'text-red-400' : 'text-gray-400'}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Emergency Switch
              {isMaintenance && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs animate-pulse">
                  ACTIVE
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              Matikan akses website sementara jika terjadi bug kritis atau
              serangan.
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 ${
            isMaintenance ? 'bg-red-600' : 'bg-gray-600'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ x: isMaintenance ? 24 : 4 }}
            className="w-6 h-6 bg-white rounded-full shadow-lg"
          />
        </button>
      </div>

      {isMaintenance && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          <ShieldAlert className="w-4 h-4" />
          <span className="font-semibold">
            Website sedang dalam mode perbaikan!
          </span>
        </div>
      )}
    </div>
  );
}
