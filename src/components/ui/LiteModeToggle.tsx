'use client';

import { Zap, ZapOff } from 'lucide-react';
import { useLiteMode } from '@/context/LiteModeContext';

export function LiteModeToggle() {
  const { isLiteMode, toggleLiteMode } = useLiteMode();

  return (
    <button
      onClick={toggleLiteMode}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        isLiteMode
          ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20'
      }`}
      title={
        isLiteMode
          ? 'Mode Hemat (Cepat & Ringan)'
          : 'Mode Normal (Animasi Aktif)'
      }
    >
      {isLiteMode ? (
        <ZapOff className="w-3 h-3" />
      ) : (
        <Zap className="w-3 h-3" />
      )}
      {isLiteMode ? 'Mode Hemat' : 'Mode Normal'}
    </button>
  );
}
