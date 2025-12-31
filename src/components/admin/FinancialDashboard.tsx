'use client';
import React, { useEffect, useState } from 'react';

// ==========================================
// Types
// ==========================================

type WithdrawRequest = {
    id: string;
    trx_id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    created_at: string;
    users: {
        id: string;
        email: string;
        full_name: string;
        wallet_balance: number;
    };
};

type FinancialStats = {
    pending_withdrawals: {
        count: number;
        total_amount: number;
    };
    total_user_balance: number;
    users_with_balance: number;
    today: {
        topup_count: number;
        topup_amount: number;
        approved_withdrawals: number;
        net_inflow: number;
    };
    this_month: {
        topup_amount: number;
    };
};

// ==========================================
// Main Component
// ==========================================

export default function FinancialDashboard() {
    const [adminKey, setAdminKey] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    // ==========================================
    // Authentication
    // ==========================================

    const handleLogin = () => {
        if (!adminKey) {
            alert('Please enter admin secret key');
            return;
        }
        setIsAuth(true);
        fetchData();
    };

    // ==========================================
    // Fetch Data
    // ==========================================

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'x-admin-secret': adminKey };

            // Fetch stats
            const resStats = await fetch('/api/admin/wallet/stats', { headers });
            if (resStats.ok) {
                const data = await resStats.json();
                setStats(data.stats);
            }

            // Fetch withdrawal list
            const resWd = await fetch(`/api/admin/wallet/withdraw-list?status=${activeTab}`, { headers });
            if (resWd.ok) {
                const data = await resWd.json();
                setWithdrawals(data.withdrawals || []);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            alert('Failed to load data. Check admin key.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuth) {
            fetchData();
        }
    }, [activeTab, isAuth]);

    // ==========================================
    // Process Withdrawal
    // ==========================================

    const processWithdraw = async (trx_id: string, action: 'APPROVE' | 'REJECT') => {
        const withdrawal = withdrawals.find((w) => w.trx_id === trx_id);
        if (!withdrawal) return;

        const confirmMsg =
            action === 'APPROVE'
                ? `✅ APPROVE withdrawal of Rp ${withdrawal.amount.toLocaleString()} to ${withdrawal.account_holder}?\n\n⚠️ Make sure you have ALREADY transferred the money manually!`
                : `❌ REJECT withdrawal and REFUND Rp ${withdrawal.amount.toLocaleString()} to user wallet?`;

        if (!confirm(confirmMsg)) return;

        setProcessing(trx_id);

        try {
            const res = await fetch('/api/admin/wallet/process-withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey,
                },
                body: JSON.stringify({
                    trx_id,
                    action,
                    admin_note: `Processed via dashboard by admin at ${new Date().toLocaleString()}`,
                }),
            });

            const result = await res.json();

            if (result.success) {
                alert(`✅ ${action} successful!`);
                fetchData(); // Refresh
            } else {
                alert(`❌ Failed: ${result.error}`);
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    // ==========================================
    // Login Screen
    // ==========================================

    if (!isAuth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 shadow-xl">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Vault Access</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Enter admin secret key to access financial control center
                </p>
                <input
                    type="password"
                    placeholder="Admin Secret Key"
                    className="border-2 border-gray-300 p-3 rounded-lg w-80 mb-4 focus:border-blue-500 focus:outline-none"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
                >
                    🚪 UNLOCK DASHBOARD
                </button>
            </div>
        );
    }

    // ==========================================
    // Dashboard Screen
    // ==========================================

    return (
        <div className="bg-white min-h-screen">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Pending Withdrawals */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-yellow-700 font-bold uppercase">⏳ Pending Withdrawals</p>
                        <span className="text-2xl">📤</span>
                    </div>
                    <p className="text-4xl font-black text-yellow-900">{stats?.pending_withdrawals.count || 0}</p>
                    <p className="text-sm text-yellow-600 mt-1">
                        Total: Rp {(stats?.pending_withdrawals.total_amount || 0).toLocaleString()}
                    </p>
                </div>

                {/* User Balance (Liability) */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-green-700 font-bold uppercase">💰 Total User Balance</p>
                        <span className="text-2xl">🏦</span>
                    </div>
                    <p className="text-4xl font-black text-green-900">
                        Rp {(stats?.total_user_balance || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                        {stats?.users_with_balance || 0} users with balance
                    </p>
                </div>

                {/* Today's Activity */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-blue-700 font-bold uppercase">📊 Today's Activity</p>
                        <span className="text-2xl">📈</span>
                    </div>
                    <p className="text-4xl font-black text-blue-900">
                        Rp {(stats?.today.net_inflow || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        In: Rp {(stats?.today.topup_amount || 0).toLocaleString()} ({stats?.today.topup_count || 0} topups)
                    </p>
                    <p className="text-xs text-blue-600">
                        Out: Rp {(stats?.today.approved_withdrawals || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b-2 mb-6 flex space-x-4">
                {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 font-bold transition-all ${activeTab === tab
                                ? 'border-b-4 border-blue-600 text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab === 'PENDING' && `📤 PENDING (${stats?.pending_withdrawals.count || 0})`}
                        {tab === 'APPROVED' && '✅ APPROVED'}
                        {tab === 'REJECTED' && '❌ REJECTED'}
                    </button>
                ))}
                <button
                    onClick={fetchData}
                    className="ml-auto text-sm text-blue-500 hover:underline"
                    disabled={loading}
                >
                    {loading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Withdrawal List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : withdrawals.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                        No {activeTab.toLowerCase()} withdrawals. {activeTab === 'PENDING' && 'All caught up! ☕'}
                    </div>
                ) : (
                    withdrawals.map((wd) => (
                        <div
                            key={wd.id}
                            className="border-2 border-gray-200 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-black text-gray-800">
                                        Rp {wd.amount.toLocaleString()}
                                    </span>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-mono">
                                        {wd.trx_id}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-700">
                                        <strong>To:</strong> {wd.account_holder}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Bank:</strong> {wd.bank_name} - {wd.account_number}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        <strong>User:</strong> {wd.users?.full_name || wd.users?.email} (Balance: Rp{' '}
                                        {wd.users?.wallet_balance?.toLocaleString() || 0})
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Requested: {new Date(wd.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {activeTab === 'PENDING' && (
                                <div className="flex gap-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => processWithdraw(wd.trx_id, 'REJECT')}
                                        disabled={processing === wd.trx_id}
                                        className="px-5 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing === wd.trx_id ? '⏳' : '❌'} REJECT
                                    </button>
                                    <button
                                        onClick={() => processWithdraw(wd.trx_id, 'APPROVE')}
                                        disabled={processing === wd.trx_id}
                                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm shadow-md transition-all disabled:opacity-50"
                                    >
                                        {processing === wd.trx_id ? '⏳' : '✅'} APPROVE
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
