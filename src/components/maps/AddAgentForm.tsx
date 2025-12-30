'use client';

import { useState } from 'react';
import { submitNewAgent } from '@/app/actions/agent-locator';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddAgentForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await submitNewAgent(formData);
            if (result.success) {
                toast.success(`Berhasil! +${result.pointsEarned} Poin`, {
                    description: result.message
                });
                setIsOpen(false);
                setFormData({ name: '', address: '', notes: '' });
            } else {
                toast.error('Gagal', { description: result.message });
            }
        } catch (err) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" /> Tambah Lokasi Agen
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Kontribusi Agen Baru
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Agen / Toko</label>
                                <input
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: JNE Cicendo / Toko Berkah"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Jl. Raya..."
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                                🎁 Dapatkan <strong>50 Poin</strong> untuk setiap lokasi valid yang dikonfirmasi.
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Lokasi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
