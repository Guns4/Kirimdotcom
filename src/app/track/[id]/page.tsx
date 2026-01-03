import React from 'react';
import Link from 'next/link'; // Import Link yang benar

export default async function TrackingResult({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* FIX: Menggunakan Link component, bukan a href */}
        <Link href="/track" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Cek Resi Lain
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Resi: {id}</h1>
            <p className="opacity-90 mt-1">Status: <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded text-sm">OTW (SEDANG DIKIRIM)</span></p>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">Riwayat Perjalanan</h3>
            <div className="space-y-6 border-l-2 border-blue-200 ml-2 pl-4">
              <div className="relative">
                <div className="absolute -left-[21px] bg-blue-500 h-4 w-4 rounded-full border-2 border-white"></div>
                <p className="text-sm font-bold text-gray-800">Paket Diterima di Gudang Jakarta</p>
                <p className="text-xs text-gray-500">Update Terkini</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-center">
               <p className="font-bold text-yellow-800">Iklan: Diskon Ongkir 50% untuk Member Baru!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
