'use client';
import React, { useState, useEffect } from 'react';
import { Truck, Power, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

export default function CourierControl({ adminKey }: { adminKey: string }) {
    const [couriers, setCouriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logistics/couriers', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setCouriers(data.couriers || []);
            }
        } catch (error) {
            console.error('Failed to fetch couriers:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchCouriers();
    }, [adminKey]);

    const handleToggle = async (code: string, currentStatus: boolean) => {
        const action = !currentStatus;
        const confirmMsg = action
            ? `Aktifkan ${code.toUpperCase()}?`
            : `⚠️ Matikan ${code.toUpperCase()}?\n\nUser tidak akan bisa memilih kurir ini di checkout!`;

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/logistics/couriers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    courier_code: code,
                    action: 'TOGGLE_ACTIVE',
                    value: action
                })
            });

            if (res.ok) {
                fetchCouriers();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleHealthChange = async (code: string, health: string) => {
        try {
            const res = await fetch('/api/admin/logistics/couriers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    courier_code: code,
                    action: 'UPDATE_HEALTH',
                    value: health
                })
            });

            if (res.ok) {
                fetchCouriers();
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

    const activeCount = couriers.filter(c => c.is_active).length;
    const overloadCount = couriers.filter(c => c.health_status === 'OVERLOAD').length;

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Kurir</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{couriers.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-600 font-bold text-sm">Aktif</div>
                    <div className="text-3xl font-black text-green-900 mt-1">{activeCount}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="text-orange-600 font-bold text-sm">Overload</div>
                    <div className="text-3xl font-black text-orange-900 mt-1">{overloadCount}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 font-bold text-sm">Avg Delivery</div>
                    <div className="text-3xl font-black text-purple-900 mt-1">
                        {couriers.length > 0
                            ? Math.round(couriers.reduce((acc, c) => acc + c.avg_delivery_days, 0) / couriers.length)
                            : 0} hari
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Truck size={24} /> Domestic Courier Control
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola ekspedisi Indonesia - aktif/nonaktif & status kesehatan
                    </p>
                </div>
                <button
                    onClick={fetchCouriers}
                    disabled={loading}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* COURIER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {couriers.map((courier) => (
                    <div
                        key={courier.code}
                        className={`bg-white p-5 rounded-xl border-2 ${courier.is_active
                                ? courier.health_status === 'OVERLOAD'
                                    ? 'border-orange-300'
                                    : 'border-green-300'
                                : 'border-gray-300 opacity-60'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-lg text-slate-800">{courier.name}</h4>
                                <code className="text-xs text-slate-500 uppercase">{courier.code}</code>
                            </div>
                            <button
                                onClick={() => handleToggle(courier.code, courier.is_active)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${courier.is_active ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${courier.is_active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Ongkir Dasar:</span>
                                <span className="font-bold">{formatCurrency(courier.base_price || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Fee COD:</span>
                                <span className="font-bold">{courier.cod_fee_percent}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Markup Admin:</span>
                                <span className="font-bold text-green-600">{courier.admin_markup_percent}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Estimasi:</span>
                                <span className="font-bold">{courier.avg_delivery_days} hari</span>
                            </div>
                        </div>

                        {/* HEALTH STATUS */}
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Status Kesehatan:
                            </label>
                            <select
                                value={courier.health_status}
                                onChange={(e) => handleHealthChange(courier.code, e.target.value)}
                                disabled={!courier.is_active}
                                className={`w-full border rounded px-2 py-1 text-xs font-bold ${courier.health_status === 'NORMAL'
                                        ? 'bg-green-50 border-green-300 text-green-700'
                                        : courier.health_status === 'OVERLOAD'
                                            ? 'bg-orange-50 border-orange-300 text-orange-700'
                                            : 'bg-red-50 border-red-300 text-red-700'
                                    }`}
                            >
                                <option value="NORMAL">✅ Normal</option>
                                <option value="OVERLOAD">⚡ Overload (+3 hari)</option>
                                <option value="MAINTENANCE">🔧 Maintenance</option>
                            </select>
                        </div>

                        {/* BADGES */}
                        <div className="mt-3 flex gap-1 flex-wrap">
                            {courier.supports_cod && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                    COD
                                </span>
                            )}
                            {courier.supports_insurance && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                    Asuransi
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* INFO */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <strong>💡 Tips Courier Control:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Toggle OFF = User tidak bisa pilih kurir ini di checkout</li>
                    <li>Status OVERLOAD = User melihat warning "+3 hari lebih lama"</li>
                    <li>Markup Admin = Cuan otomatis dari selisih ongkir</li>
                    <li>Saat Lebaran, set semua kurir ke OVERLOAD</li>
                </ul>
            </div>
        </div>
    );
}
