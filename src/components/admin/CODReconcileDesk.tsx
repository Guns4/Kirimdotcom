'use client';
import React, { useState, useEffect } from 'react';
import { DollarSign, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function CODReconcileDesk({ adminKey }: { adminKey: string }) {
    const [reconciliations, setReconciliations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const fetchReconciliations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logistics/cod', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setReconciliations(data.reconciliations || []);
            }
        } catch (error) {
            console.error('Failed to fetch reconciliations:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchReconciliations();
    }, [adminKey]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            courier_code: formData.get('courier'),
            transfer_date: formData.get('date'),
            total_amount: parseFloat(formData.get('amount') as string),
            file_url: formData.get('file_url'), // In production, upload file first
            csv_data: [] // Parse CSV file here
        };

        try {
            const res = await fetch('/api/admin/logistics/cod', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ COD reconciliation created!');
                setShowUpload(false);
                fetchReconciliations();
                e.currentTarget.reset();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleDisbursement = async (id: string) => {
        if (!confirm('Cairkan COD ke seller?\n\nUang akan otomatis masuk ke saldo seller.')) return;

        try {
            const res = await fetch('/api/admin/logistics/cod', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    reconciliation_id: id,
                    action: 'COMPLETE'
                })
            });

            if (res.ok) {
                alert('✅ Pencairan berhasil!');
                fetchReconciliations();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const totalPending = reconciliations
        .filter(r => r.status !== 'COMPLETED')
        .reduce((acc, r) => acc + parseFloat(r.total_amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* SUMMARY CARD */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm opacity-90 mb-1">Total Uang COD Masuk</div>
                        <div className="text-4xl font-black">{formatCurrency(totalPending)}</div>
                        <div className="text-xs opacity-75 mt-2">
                            Menunggu rekonsiliasi & pencairan
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-4 py-2 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Upload Laporan
                    </button>
                </div>
            </div>

            {/* UPLOAD FORM */}
            {showUpload && (
                <div className="bg-white p-6 rounded-xl border shadow">
                    <h4 className="font-bold mb-4">Upload Laporan COD dari Kurir</h4>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Kurir
                                </label>
                                <select name="courier" required className="w-full border rounded px-3 py-2">
                                    <option value="jne">JNE</option>
                                    <option value="jnt">J&T Express</option>
                                    <option value="sicepat">SiCepat</option>
                                    <option value="anteraja">AnterAja</option>
                                    <option value="ninja">Ninja Xpress</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Tanggal Transfer
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Total Uang
                            </label>
                            <input
                                type="number"
                                name="amount"
                                required
                                placeholder="50000000"
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Bukti Transfer / CSV
                            </label>
                            <input
                                type="text"
                                name="file_url"
                                placeholder="https://... (optional)"
                                className="w-full border rounded px-3 py-2"
                            />
                            <div className="text-xs text-slate-500 mt-1">
                                Upload file CSV berisi list resi untuk auto-matching
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold"
                            >
                                Create Reconciliation
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="px-4 py-2 bg-slate-200 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* RECONCILIATION LIST */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 bg-slate-50 border-b font-bold flex items-center gap-2">
                    <DollarSign size={18} />
                    Riwayat Rekonsiliasi COD
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Tanggal</th>
                                <th className="p-4 text-left">Kurir</th>
                                <th className="p-4 text-left">Total Uang</th>
                                <th className="p-4 text-left">Matched</th>
                                <th className="p-4 text-left">Missing</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reconciliations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        <FileText className="mx-auto mb-2 opacity-50" size={32} />
                                        Belum ada data rekonsiliasi COD
                                    </td>
                                </tr>
                            ) : (
                                reconciliations.map((recon) => (
                                    <tr key={recon.id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <div className="font-bold">
                                                {new Date(recon.transfer_date).toLocaleDateString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-blue-600 uppercase">
                                                {recon.courier_configs?.name || recon.courier_code}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-green-600">
                                                {formatCurrency(recon.total_amount)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-green-700 font-bold">
                                                {formatCurrency(recon.matched_amount || 0)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`font-bold ${(recon.missing_amount || 0) > 0 ? 'text-red-600' : 'text-slate-400'
                                                }`}>
                                                {formatCurrency(recon.missing_amount || 0)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold ${recon.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : recon.status === 'MATCHED'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : recon.status === 'PARTIAL'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {recon.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {recon.status !== 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleDisbursement(recon.id)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-bold flex items-center gap-1"
                                                >
                                                    <CheckCircle size={12} />
                                                    Cairkan
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INFO */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                <strong>💡 Cara Pakai COD Reconciliation:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Kurir transfer uang COD mingguan ke rekening PT Anda</li>
                    <li>Upload laporan mereka (CSV berisi list resi)</li>
                    <li>Sistem auto-match resi dengan database order</li>
                    <li>Klik "Cairkan" → Uang masuk saldo seller otomatis</li>
                    <li>Status PARTIAL = Ada uang hilang, perlu investigasi</li>
                </ul>
            </div>
        </div>
    );
}
