'use client';
import React, { useState } from 'react';
import FinancialDashboard from './FinancialDashboard';
import MarketplaceManager from './MarketplaceManager';

export default function GodModeDashboard() {
    const [adminKey, setAdminKey] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [activeTab, setActiveTab] = useState('FINANCE'); // FINANCE | MARKET | UTILITY

    const handleLogin = () => {
        // Simple client-side validation (server still validates)
        if (adminKey.length > 3) {
            setIsAuth(true);
        } else {
            alert('Invalid secret key');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    if (!isAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <h1 className="text-4xl font-extrabold mb-2 tracking-tighter">
                    CEKKIRIM<span className="text-blue-500">ADMIN</span>
                </h1>
                <p className="text-gray-400 mb-8">God Mode Access Control</p>
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
                    <input
                        type="password"
                        placeholder="Enter Secret Key"
                        className="bg-gray-700 text-white border border-gray-600 p-3 rounded w-64 mb-4 focus:outline-none focus:border-blue-500 block"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold transition"
                    >
                        ENTER COMMAND CENTER
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tighter">
                        GOD<span className="text-blue-500">MODE</span>
                    </h1>
                    <p className="text-xs text-gray-500">Central Command</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('FINANCE')}
                        className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'FINANCE'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800'
                            }`}
                    >
                        💰 Keuangan (Fintech)
                    </button>

                    <button
                        onClick={() => setActiveTab('MARKET')}
                        className={`w-full text-left px-4 py-3 rounded transition ${activeTab === 'MARKET'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800'
                            }`}
                    >
                        📦 Toko & SMM
                    </button>

                    <button
                        disabled
                        className="w-full text-left px-4 py-3 rounded text-gray-600 cursor-not-allowed"
                    >
                        ⚙️ Utilitas & Ongkir (Soon)
                    </button>
                </nav>

                <div className="p-4 text-xs text-gray-600 border-t border-gray-800">
                    Admin Session Active
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {activeTab === 'FINANCE' ? 'Financial Control' : 'Marketplace & Products'}
                        </h2>
                        <p className="text-gray-500">
                            {activeTab === 'FINANCE'
                                ? 'Approval withdraw dan monitor saldo user.'
                                : 'Kelola stok fisik dan sinkronisasi SMM.'}
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow text-sm font-mono border">
                        🔐 Secret Key Active
                    </div>
                </header>

                {/* DYNAMIC VIEW */}
                {activeTab === 'FINANCE' && <FinancialDashboard customKey={adminKey} />}
                {activeTab === 'MARKET' && <MarketplaceManager adminKey={adminKey} />}
            </div>
        </div>
    );
}
