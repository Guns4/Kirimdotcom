'use client';

import { useState } from 'react';
import { Download, Trash2, Shield, AlertTriangle, FileText } from 'lucide-react';
import { exportUserData, deleteUserAccount } from '@/app/actions/privacy';

export default function PrivacyCenter() {
    const [loading, setLoading] = useState('');

    const handleDownload = async () => {
        setLoading('download');
        try {
            const data = await exportUserData();
            // Trigger browser download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-data-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert('Gagal mengunduh data.');
        } finally {
            setLoading('');
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "APAKAH ANDA YAKIN? Tindakan ini tidak dapat dibatalkan. Data Anda akan dihapus permanen atau dianonymize."
        );
        if (!confirmed) return;

        setLoading('delete');
        try {
            await deleteUserAccount();
            alert('Akun telah dijadwalkan untuk penghapusan. Anda akan logout.');
            // Force logout / redirect
            window.location.href = '/login';
        } catch (e) {
            alert('Gagal memproses penghapusan akun. Hubungi support.');
        } finally {
            setLoading('');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Privacy Center</h2>
                    <p className="text-sm text-gray-500">Kelola data dan hak privasi Anda (GDPR Compliance)</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. Export Data */}
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-blue-50 rounded text-blue-600 h-fit">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Unduh Data Saya (Data Portability)</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-md">
                                Dapatkan salinan lengkap data personal, riwayat transaksi, dan aktivitas Anda dalam format JSON.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={loading === 'download'}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                        {loading === 'download' ? 'Processing...' : 'Download JSON'}
                    </button>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Consent Log */}
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="p-2 bg-green-50 rounded text-green-600 h-fit">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Syarat & Ketentuan</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Status: <span className="text-green-600 font-bold">Disetujui</span> (v2.4 - 2024)
                            </p>
                        </div>
                    </div>
                    <button className="text-sm text-blue-600 font-medium hover:underline">
                        Lihat Riwayat
                    </button>
                </div>

                <hr className="border-gray-100" />

                {/* 3. Delete Account */}
                <div className="bg-red-50 p-6 rounded-xl flex items-start justify-between border border-red-100">
                    <div className="flex gap-4">
                        <div className="p-2 bg-white rounded text-red-600 h-fit shadow-sm">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-900">Hapus Akun Permanen (Right to be Forgotten)</h3>
                            <p className="text-sm text-red-700 mt-1 max-w-md">
                                Tindakan ini akan menghapus informasi personal Anda. Data transaksi akan dianonymize untuk keperluan audit legal.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={loading === 'delete'}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {loading === 'delete' ? 'Deleting...' : 'Hapus Akun'}
                    </button>
                </div>
            </div>
        </div>
    );
}
