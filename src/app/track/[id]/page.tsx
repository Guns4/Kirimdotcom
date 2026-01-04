import React from 'react';
import Link from 'next/link';

export default async function TrackingResult({ params }: { params: Promise<{ id: string }> }) {
  // Await params karena di Next.js 15 params adalah Promise
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <a href="/track" className="text-blue-600 hover:underline mb-4 inline-block">ΓåÉ Cek Resi Lain</a>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Status */}
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Resi: {id}</h1>
            <p className="opacity-90 mt-1">Status: <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded text-sm">OTW (SEDANG DIKIRIM)</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Kolom Kiri: Timeline */}
            <div className="md:col-span-1 p-6 border-r border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-800 mb-4">Riwayat Perjalanan</h3>
              <div className="space-y-6 border-l-2 border-blue-200 ml-2 pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] bg-blue-500 h-4 w-4 rounded-full border-2 border-white"></div>
                  <p className="text-sm font-bold text-gray-800">Paket Diterima di Gudang Jakarta</p>
                  <p className="text-xs text-gray-500">Hari ini, 10:00 WIB</p>
                </div>
                <div className="relative opacity-60">
                  <div className="absolute -left-[21px] bg-gray-300 h-4 w-4 rounded-full border-2 border-white"></div>
                  <p className="text-sm font-bold text-gray-800">Kurir Menjemput Paket</p>
                  <p className="text-xs text-gray-500">Kemarin, 14:30 WIB</p>
                </div>
                <div className="relative opacity-60">
                  <div className="absolute -left-[21px] bg-gray-300 h-4 w-4 rounded-full border-2 border-white"></div>
                  <p className="text-sm font-bold text-gray-800">Order Dibuat</p>
                  <p className="text-xs text-gray-500">Kemarin, 13:00 WIB</p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Peta (Placeholder) */}
            <div className="md:col-span-2 p-6 relative min-h-[300px] bg-blue-50 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">φ╖║∩╕Å</span>
                <p className="mt-2 font-semibold text-gray-600">Live Map Tracking</p>
                <p className="text-xs text-gray-400">(Peta akan muncul di sini setelah API Vendor aktif)</p>

                {/* Banner Iklan (Monetisasi) */}
                <div className="mt-8 p-4 bg-yellow-100 border border-yellow-200 rounded text-yellow-800 text-sm">
                  φ┤Ñ <strong>Promo:</strong> Diskon 50% Ongkir untuk member baru!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
