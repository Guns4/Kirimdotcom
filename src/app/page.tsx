'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [resi, setResi] = useState('');
  const router = useRouter();

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resi.trim()) {
      router.push(`/track/${resi.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cek<span className="text-blue-600">Kirim</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            Platform Logistik & PPOB Terintegrasi No. #1
          </p>
          <p className="text-lg text-gray-500">
            Cek resi dan ongkir dalam satu tempat - Cepat, Akurat, Gratis!
          </p>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tracking Feature Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
              Cek Resi
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Lacak paket Anda secara real-time dari berbagai kurir
            </p>

            <form onSubmit={handleTrackingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Resi / AWB
                </label>
                <input
                  type="text"
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  placeholder="Contoh: JP123456789"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                Lacak Sekarang
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Support: JNE, JNT, SiCepat, AnterAja, dan lainnya
              </p>
            </div>
          </div>

          {/* Shipping Calculator Feature Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
              <span className="text-4xl">💰</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
              Cek Ongkir
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Bandingkan harga ongkir dari berbagai kurir dan temukan yang
              paling hemat
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">⚡</span>
                <span>Hasil instant dalam hitungan detik</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🚚</span>
                <span>Perbandingan multi kurir sekaligus</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">💡</span>
                <span>Rekomendasi harga terbaik otomatis</span>
              </div>
            </div>

            <Link
              href="/cek-ongkir"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-green-500/30 hover:shadow-green-500/40 text-center"
            >
              Cek Ongkir Sekarang
            </Link>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Gratis! Tanpa perlu login
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-200">
        &copy; 2024 KirimDotCom Ecosystem - Platform Logistik Terpercaya
      </footer>
    </div>
  );
}
