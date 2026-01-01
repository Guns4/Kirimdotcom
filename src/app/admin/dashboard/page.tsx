'use client';
import React, { useState } from 'react';
import GodModeContainer from '@/components/admin/GodModeContainer';

export default function AdminPage() {
    const [isAuth, setIsAuth] = useState(false);
    const [adminKey, setAdminKey] = useState('');

    const handleLogin = () => {
        if (adminKey.length > 3) {
            setIsAuth(true);
        } else {
            alert('Invalid clearance key');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    // Login Screen
    if (!isAuth) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-white tracking-tighter">
                            GOD<span className="text-blue-500">MODE</span>
                        </h1>
                        <p className="text-slate-400 mt-2">Restricted Access Level 5</p>
                    </div>
                    <input
                        type="password"
                        placeholder="Enter Secret Clearance Key"
                        className="w-full bg-slate-900 border border-slate-600 text-white px-4 py-3 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/50"
                    >
                        INITIALIZE SYSTEM
                    </button>
                </div>
            </div>
        );
    }

    return <GodModeContainer adminKey={adminKey} />;
}
