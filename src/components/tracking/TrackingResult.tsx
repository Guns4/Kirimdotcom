'use client';

import { useState } from 'react';
import { Clock, Package, CheckCircle, TruckIcon, MapPin, Zap } from 'lucide-react';

interface TrackingHistory {
  date: string;
  desc: string;
  location: string;
}

interface TrackingData {
  waybill: string;
  courier: string;
  status: 'ON_PROCESS' | 'DELIVERED' | 'PENDING';
  history: TrackingHistory[];
}

interface TrackingResultProps {
  data: TrackingData;
}

export default function TrackingResult({ data }: TrackingResultProps) {
  const [showAd, setShowAd] = useState(true);

  const statusConfig = {
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ON_PROCESS: { icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    DELIVERED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  };

  const currentStatus = statusConfig[data.status];
  const StatusIcon = currentStatus.icon;

  // Detect if package is delayed (ON_PROCESS for > 3 days)
  const isDelayed = data.status === 'ON_PROCESS' && data.history.length > 3;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header Status Card */}
      <div className={`${currentStatus.bg} rounded-2xl p-6 border-2 border-${data.status === 'DELIVERED' ? 'green' : 'blue'}-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${currentStatus.color} bg-white rounded-full p-3 shadow-md`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resi: {data.waybill}</p>
              <h3 className="text-xl font-bold text-gray-900">
                {data.status === 'DELIVERED' ? 'Paket Sudah Sampai!' : 
                 data.status === 'ON_PROCESS' ? 'Paket Dalam Perjalanan' : 'Paket Diproses'}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{data.courier}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Riwayat Pengiriman
        </h4>
        
        <div className="space-y-4">
          {data.history.map((item, index) => (
            <div key={index}>
              {/* Timeline Item */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  {index !== data.history.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{item.desc}</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.date).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* STRATEGIC AD PLACEMENT - Between ON_PROCESS and DELIVERED */}
              {index === Math.floor(data.history.length / 2) && showAd && (
                <div className="my-6">
                  {/* Ad Banner */}
                  <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setShowAd(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                        🎁
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900">Promo Akhir Tahun!</h5>
                        <p className="text-sm text-gray-600">Diskon hingga 50% untuk produk pilihan</p>
                        <a 
                          href="/shop" 
                          className="inline-block mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                        >
                          Belanja Sekarang →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CROSS-SELL PPOB - Show if delayed */}
      {isDelayed && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 rounded-full p-3 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">Paket Belum Sampai?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sambil menunggu, yuk isi pulsa darurat! Proses instant, langsung masuk 🚀
              </p>
              <a
                href="/ppob"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Beli Pulsa Sekarang
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Google AdSense Placeholder */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center">
        <p className="text-xs text-gray-400 mb-2">Advertisement</p>
        <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300">
          {/* Replace with actual AdSense code */}
          <p className="text-sm text-gray-500">Google AdSense 728x90</p>
          <p className="text-xs text-gray-400 mt-1">Insert your ad code here</p>
        </div>
      </div>
    </div>
  );
}
