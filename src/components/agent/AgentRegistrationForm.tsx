'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Upload, MapPin, CheckCircle, Store } from 'lucide-react';
import { submitAgentRegistration } from '@/lib/agent-service';

// Dynamically import Map to avoid SSR issues
const AgentMap = dynamic(() => import('@/components/maps/AgentMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

export default function AgentRegistrationForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    const [formData, setFormData] = useState({
        shop_name: '',
        shop_address: '',
        phone_number: '',
        ktp_url: 'https://placehold.co/600x400/png?text=KTP+Placeholder', // Mock upload
        shop_photo_url: 'https://placehold.co/600x400/png?text=Shop+Photo' // Mock upload
    });

    const handleSubmit = async () => {
        if (!coords) {
            alert('Mohon pilih lokasi toko di peta');
            return;
        }
        setLoading(true);
        try {
            await submitAgentRegistration({
                ...formData,
                latitude: coords.lat,
                longitude: coords.lng
            });
            setStep(3); // Success
        } catch (err) {
            alert('Terjadi kesalahan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-100">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
                <p className="text-gray-600 mb-6">
                    Terima kasih, pembayaran Rp 100.000 telah diterima (Simulasi). <br />
                    Tim kami akan memverifikasi warung Anda dalam 24 jam.
                </p>
                <button disabled className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed">
                    Menunggu Verifikasi
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>1</div>
                <div className="h-1 flex-1 bg-gray-200"><div className={`h-full bg-blue-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} /></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>2</div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-600" /> Data Warung
                    </h2>
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Toko / Warung</label>
                        <input
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Contoh: Warung Berkah Jaya"
                            value={formData.shop_name}
                            onChange={e => setFormData({ ...formData, shop_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                        <textarea
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Jl. Mawar No. 12, RT/RW..."
                            value={formData.shop_address}
                            onChange={e => setFormData({ ...formData, shop_address: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Upload Foto Toko (Depan)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-xs">Klik untuk upload foto</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setStep(2)}
                        disabled={!formData.shop_name}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-700 disabled:opacity-50"
                    >
                        Lanjut: Lokasi
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600" /> Pin Lokasi Peta
                    </h2>
                    <p className="text-sm text-gray-500">Geser peta dan klik untuk menandai lokasi tepat warung Anda.</p>

                    <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative">
                        {/* 
                        NOTE: We define onLocationSelect logic here. 
                        Ideally AgentMap should accept an onClick prop.
                        For this snippet, we assume AgentMap handles internal state or exposes a callback.
                        Since AgentMap implementation from previous steps might differ, we'll assume a standard interface
                        or simulate the selection with a placeholder if component details vary.
                        
                        For simplicity in this generated file, we will simulate the map interaction if AgentMap isn't fully reused.
                     */}
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <button
                                onClick={() => setCoords({ lat: -6.200000, lng: 106.816666 })}
                                className="bg-white shadow-md px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50"
                            >
                                <MapPin className="w-4 h-4 text-red-500" />
                                {coords ? 'Lokasi Terpilih' : 'Simulasi: Pilih Lokasi Saat Ini'}
                            </button>
                        </div>
                    </div>

                    {coords && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-800 flex justify-between items-center">
                            <span>Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}</span>
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    )}

                    <div className="border-t pt-4 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-600">Biaya Aktivasi Agen</span>
                            <span className="font-bold text-lg">Rp 100.000</span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !coords}
                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Memproses...' : 'Bayar & Daftar Sekarang'}
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className="w-full text-gray-500 text-sm mt-3 hover:text-gray-800"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
