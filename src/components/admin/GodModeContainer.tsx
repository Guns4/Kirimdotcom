'use client';
import React, { useState, useEffect } from 'react';
import { ADMIN_MODULES } from '@/config/adminModules';
import { Search, Activity, LogOut } from 'lucide-react';
import Omnibar from './ui/Omnibar';

// Import Views
import OverviewView from './views/OverviewView';
import SecurityView from './views/SecurityView';
import UserManager from './views/UserManager';
import FinancialDashboard from './FinancialDashboard';
import MarketplaceManager from './MarketplaceManager';
import MonetizationManager from './MonetizationManager';

export default function GodModeContainer({ adminKey }: { adminKey: string }) {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [showOmnibar, setShowOmnibar] = useState(false);
    const [health, setHealth] = useState<any>({
        database: 'Checking...',
        smm_provider: 'Checking...',
        midtrans: 'Checking...'
    });

    // Keyboard Shortcut Listener (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowOmnibar(true);
            }
            if (e.key === 'Escape') {
                setShowOmnibar(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Health Check Loop (every 30 seconds)
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/admin/system-health');
                if (res.ok) {
                    const data = await res.json();
                    setHealth(data);
                }
            } catch (e) {
                console.error('Health check failed:', e);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {showOmnibar && <Omnibar adminKey={adminKey} onClose={() => setShowOmnibar(false)} />}

            {/* MODULAR SIDEBAR */}
            <div className="w-72 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-black tracking-tighter">
                        GOD<span className="text-blue-500">MODE</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">System Phase 151-250</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {ADMIN_MODULES.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 text-sm font-bold
                ${activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* HEALTH STATUS MINI WIDGET */}
                <div className="p-4 border-t border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500">System Status</span>
                        <Activity
                            size={12}
                            className={health.database === 'ONLINE' ? 'text-green-500 animate-pulse' : 'text-red-500'}
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Database</span>
                            <span className={health.database === 'ONLINE' ? 'text-green-500' : 'text-red-500'}>
                                {health.database}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">SMM API</span>
                            <span className={health.smm_provider === 'ONLINE' ? 'text-green-500' : 'text-orange-500'}>
                                {health.smm_provider}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Midtrans</span>
                            <span className={health.midtrans === 'ONLINE' ? 'text-green-500' : 'text-orange-500'}>
                                {health.midtrans}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition">
                        <LogOut size={16} /> Logout Secure Session
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 ml-72 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                            {ADMIN_MODULES.find(m => m.id === activeTab)?.label || activeTab}
                        </h2>
                        <p className="text-slate-500">
                            {ADMIN_MODULES.find(m => m.id === activeTab)?.description}
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* OMNIBAR TRIGGER BUTTON */}
                        <button
                            onClick={() => setShowOmnibar(true)}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition"
                        >
                            <Search size={16} />
                            <span className="hidden md:inline">Search (Ctrl + K)</span>
                            <span className="md:hidden">Search</span>
                        </button>
                        <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Session Secure
                        </div>
                    </div>
                </header>

                <div className="animate-in fade-in duration-500">
                    {activeTab === 'OVERVIEW' && <OverviewView />}
                    {activeTab === 'MONETIZATION' && <MonetizationManager adminKey={adminKey} />}
                    {activeTab === 'SECURITY' && <SecurityView adminKey={adminKey} />}
                    {activeTab === 'FINANCE' && <FinancialDashboard customKey={adminKey} />}
                    {activeTab === 'MARKET' && <MarketplaceManager adminKey={adminKey} />}
                    {activeTab === 'USERS' && <UserManager adminKey={adminKey} />}
                </div>
            </main>
        </div>
    );
}
