'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import OverviewView from './views/OverviewView';
import SecurityView from './views/SecurityView';
import UserManager from './views/UserManager';
import FinancialDashboard from './FinancialDashboard';
import MarketplaceManager from './MarketplaceManager';

export default function GodModeContainer({ adminKey }: { adminKey: string }) {
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    const getTabTitle = () => {
        const titles: Record<string, string> = {
            'OVERVIEW': 'COMMAND CENTER',
            'FINANCE': 'FINANCIAL VAULT',
            'MARKET': 'MARKETPLACE OPS',
            'USERS': 'USER SURVEILLANCE',
            'SECURITY': 'SECURITY RADAR',
            'LOGS': 'SYSTEM LOGS',
        };
        return titles[activeTab] || 'ADMIN PANEL';
    };

    const getTabDescription = () => {
        const descriptions: Record<string, string> = {
            'OVERVIEW': 'Real-time analytics and system overview',
            'FINANCE': 'Withdrawal approvals and financial monitoring',
            'MARKET': 'Product management and SMM sync operations',
            'USERS': 'User management, ban control, and surveillance',
            'SECURITY': 'Live threat monitoring and security logs',
            'LOGS': 'System event logs and audit trail',
        };
        return descriptions[activeTab] || 'System Phase 51-100 Active';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-72 p-8 overflow-y-auto">
                {/* Dynamic Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                            {getTabTitle()}
                        </h2>
                        <p className="text-slate-500">{getTabDescription()}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-bold text-slate-600">
                            Admin: Superuser
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </header>

                {/* Content Render */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'OVERVIEW' && <OverviewView />}
                    {activeTab === 'SECURITY' && <SecurityView adminKey={adminKey} />}
                    {activeTab === 'FINANCE' && <FinancialDashboard customKey={adminKey} />}
                    {activeTab === 'MARKET' && <MarketplaceManager adminKey={adminKey} />}
                    {activeTab === 'USERS' && <UserManager adminKey={adminKey} />}
                    {activeTab === 'LOGS' && (
                        <div className="bg-white p-10 rounded-xl border text-center">
                            <p className="text-slate-400 text-lg font-medium">System Logs</p>
                            <p className="text-slate-300 text-sm mt-2">Integrated in Security Tab (Auto-refresh enabled)</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
