import React from 'react';
import {
    LayoutDashboard, Users, Wallet, ShoppingBag,
    ShieldAlert, Server, LogOut
} from 'lucide-react';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
    const menuItems = [
        { id: 'OVERVIEW', label: 'Command Center', icon: LayoutDashboard },
        { id: 'FINANCE', label: 'Financial Vault', icon: Wallet },
        { id: 'MARKET', label: 'Marketplace & SMM', icon: ShoppingBag },
        { id: 'USERS', label: 'User Surveillance', icon: Users },
        { id: 'SECURITY', label: 'Security & Hacker', icon: ShieldAlert },
        { id: 'LOGS', label: 'System Logs', icon: Server },
    ];

    return (
        <div className="w-72 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-black tracking-tighter">
                    GOD<span className="text-blue-500">MODE</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">v1.0.0 • Phase 1-50</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
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

            <div className="p-4 border-t border-slate-800">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition">
                    <LogOut size={16} /> Logout Secure Session
                </button>
            </div>
        </div>
    );
}
