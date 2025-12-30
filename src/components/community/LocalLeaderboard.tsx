'use client';

import { SellerProfile } from '@/lib/community-ranking';
import { Download, Share2, Award } from 'lucide-react';
import { useState } from 'react';

interface Props {
    district: string;
    topSellers: SellerProfile[];
}

export default function LocalLeaderboard({ district, topSellers }: Props) {
    const [showBadge, setShowBadge] = useState<SellerProfile | null>(null);

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100 shadow-sm my-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                    <Award className="w-8 h-8 text-yellow-600" />
                    Top Seller di Kecamatan {district}
                </h2>
                <p className="text-gray-600 mt-2">
                    Apresiasi untuk pahlawan UMKM lokal dengan pengiriman terbanyak bulan ini.
                </p>
            </div>

            <div className="grid gap-4 max-w-3xl mx-auto">
                {topSellers.map((seller, index) => (
                    <div
                        key={seller.id}
                        className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-yellow-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-100 text-blue-800'}
              `}>
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{seller.name}</h3>
                                <p className="text-xs text-gray-500">{seller.shipment_count.toLocaleString()} Paket Terkirim • ⭐ {seller.rating}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBadge(seller)}
                            className="text-xs md:text-sm bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                        >
                            <Award className="w-4 h-4" />
                            Masuk Top 5?
                        </button>
                    </div>
                ))}
            </div>

            {/* Badge Modal/Overlay */}
            {showBadge && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowBadge(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20">
                                <Award className="w-24 h-24" />
                            </div>
                            <p className="text-sm opacity-90 mb-1">PENGHARGAAN RESMI</p>
                            <h3 className="text-2xl font-bold mb-2">TOP SELLER {district.toUpperCase()}</h3>
                            <div className="my-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                                <p className="text-lg font-bold">"{showBadge.name}"</p>
                            </div>
                            <p className="text-xs opacity-75">Verified by CekKirim.com</p>
                        </div>

                        <h4 className="text-center font-bold text-gray-800 mb-2">Selamat, Juragan! 🎉</h4>
                        <p className="text-center text-sm text-gray-600 mb-6">
                            Ayo pamerkan prestasimu ke pelanggan.
                        </p>

                        <div className="flex gap-2">
                            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Simpan Gambar
                            </button>
                            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
