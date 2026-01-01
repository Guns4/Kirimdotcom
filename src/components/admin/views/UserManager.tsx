'use client';
import React, { useState, useEffect } from 'react';
import { User, Ban, Unlock, RefreshCw } from 'lucide-react';

export default function UserManager({ adminKey }: { adminKey: string }) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users/list', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchUsers();
    }, [adminKey]);

    const handleAction = async (userId: string, action: string) => {
        const reason = action === 'BAN' ? prompt('Alasan Banned?') : '';
        if (action === 'BAN' && !reason) return;

        if (!confirm(`Yakin melakukan ${action} pada user ini?`)) return;

        try {
            await fetch('/api/admin/users/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ user_id: userId, action, reason })
            });
            alert(`${action} berhasil!`);
            fetchUsers();
        } catch (error) {
            alert('Gagal melakukan aksi');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">User Surveillance Grid</h3>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4">User Identity</th>
                            <th className="p-4">Wallet Balance</th>
                            <th className="p-4">Security Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className={`hover:bg-slate-50 transition ${u.is_banned ? 'bg-red-50' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-200 p-2 rounded-full">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{u.full_name || 'No Name'}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-green-700">
                                        Rp {u.wallet_balance?.toLocaleString() || 0}
                                    </td>
                                    <td className="p-4">
                                        {u.is_banned ? (
                                            <div>
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">BANNED</span>
                                                {u.ban_reason && (
                                                    <div className="mt-1 text-xs text-red-600">Reason: {u.ban_reason}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">ACTIVE</span>
                                        )}
                                        {u.failed_pin_attempts > 0 && (
                                            <div className="mt-1 text-xs text-orange-600">⚠️ {u.failed_pin_attempts}x Wrong PIN</div>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {u.is_banned ? (
                                            <button
                                                onClick={() => handleAction(u.id, 'UNBAN')}
                                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                                                title="Unban User"
                                            >
                                                <Unlock size={14} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAction(u.id, 'BAN')}
                                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                                title="Ban User"
                                            >
                                                <Ban size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleAction(u.id, 'RESET_PIN')}
                                            className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                                            title="Reset PIN Lock"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
