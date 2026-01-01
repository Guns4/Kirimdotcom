'use client';
import React, { useState, useEffect } from 'react';
import { Gamepad2, AlertTriangle, Power, RefreshCw, Package } from 'lucide-react';

export default function GachaMaster({ adminKey }: { adminKey: string }) {
    const [items, setItems] = useState<any[]>([]);
    const [totalProb, setTotalProb] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/gamification/gacha', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setTotalProb(parseFloat(data.total_probability || 0));
            }
        } catch (error) {
            console.error('Failed to fetch gacha items:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchItems();
    }, [adminKey]);

    const handleProbabilityChange = async (itemId: string, newProb: number) => {
        try {
            const res = await fetch('/api/admin/gamification/gacha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    action: 'UPDATE_PROBABILITY',
                    item_id: itemId,
                    updates: { probability_percent: newProb }
                })
            });

            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleEmergencyStop = async () => {
        if (!confirm('⚠️ EMERGENCY STOP!\n\nAksi ini akan:\n- Set semua hadiah mahal ke 0%\n- Set ZONK ke 95%\n\nLanjutkan?')) return;

        try {
            const res = await fetch('/api/admin/gamification/gacha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ action: 'EMERGENCY_STOP' })
            });

            if (res.ok) {
                alert('✅ Emergency stop activated! Game economy secured.');
                fetchItems();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
            case 'EPIC': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
            case 'RARE': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const probColor = totalProb === 100 ? 'text-green-600' : totalProb > 100 ? 'text-red-600' : 'text-orange-600';

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Gamepad2 size={24} className="text-purple-600" />
                        Gacha Master Control
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Atur probabilitas hadiah & kelola ekonomi game
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleEmergencyStop}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                    >
                        <Power size={16} />
                        Emergency Stop
                    </button>
                    <button
                        onClick={fetchItems}
                        disabled={loading}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* PROBABILITY METER */}
            <div className="bg-white p-6 rounded-xl border shadow">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-700">Total Probabilitas:</span>
                    <span className={`text-3xl font-black ${probColor}`}>
                        {totalProb.toFixed(2)}%
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4">
                    <div
                        className={`h-4 rounded-full transition-all ${totalProb === 100
                                ? 'bg-green-500'
                                : totalProb > 100
                                    ? 'bg-red-500 animate-pulse'
                                    : 'bg-orange-500'
                            }`}
                        style={{ width: `${Math.min(totalProb, 100)}%` }}
                    />
                </div>
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                    {totalProb === 100 && <span className="text-green-600">✅ Valid - Total = 100%</span>}
                    {totalProb < 100 && <span className="text-orange-600">⚠️ Warning - Total &lt; 100%</span>}
                    {totalProb > 100 && <span className="text-red-600">❌ Error - Total &gt; 100%!</span>}
                </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 bg-slate-50 border-b font-bold">
                    Gacha Prize Items ({items.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Hadiah</th>
                                <th className="p-4 text-left">Type</th>
                                <th className="p-4 text-left">Nilai</th>
                                <th className="p-4 text-left">Rarity</th>
                                <th className="p-4 text-center">Probability (%)</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{item.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'BALANCE'
                                                    ? 'bg-green-100 text-green-700'
                                                    : item.type === 'PHYSICAL'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : item.type === 'VOUCHER'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-green-600">
                                            {item.type !== 'ZONK' ? formatCurrency(item.value) : '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-black inline-block ${getRarityColor(item.rarity)}`}>
                                            {item.rarity}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            value={item.probability_percent}
                                            onChange={(e) => handleProbabilityChange(item.id, parseFloat(e.target.value))}
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="w-20 border rounded px-2 py-1 text-center font-bold"
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.type === 'PHYSICAL' ? (
                                            <span className={`font-bold ${(item.stock_remaining || 0) === 0 ? 'text-red-600' : 'text-slate-600'
                                                }`}>
                                                {item.stock_remaining || 0} / {item.stock_limit || '∞'}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">∞</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {item.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INFO */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-sm text-purple-800">
                <strong>🎲 Game Economy Safety:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>Total = 100%:</strong> Valid distribution, game berjalan normal</li>
                    <li><strong>Emergency Stop:</strong> Gunakan saat ada bot/bug - semua hadiah jadi ZONK</li>
                    <li><strong>Budget menipis?</strong> Turunkan % hadiah besar, naikkan ZONK</li>
                    <li><strong>Promo event?</strong> Naikkan % hadiah mahal sementara waktu</li>
                    <li>Stock Physical Item habis? Item masih bisa keluar gacha (harus dihandle di frontend)</li>
                </ul>
            </div>
        </div>
    );
}
