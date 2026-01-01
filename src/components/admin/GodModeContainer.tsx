'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import OverviewView from './views/OverviewView';
import SecurityView from './views/SecurityView';
import FinancialDashboard from './FinancialDashboard';
import MarketplaceManager from './MarketplaceManager';

export default function GodModeContainer({ adminKey }: { adminKey: string }) {
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-72 p-8 overflow-y-auto">
                {/* Dynamic Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                            {activeTab === 'OVERVIEW' && 'COMMAND CENTER'}
                            {activeTab === 'FINANCE' && 'FINANCIAL VAULT'}
                            {activeTab === 'MARKET' && 'MARKETPLACE OPS'}
                            {activeTab === 'SECURITY' && 'SECURITY RADAR'}
                            {activeTab === 'USERS' && 'USER SURVEILLANCE'}
                            {activeTab === 'LOGS' && 'SYSTEM LOGS'}
                        </h2>
                        <p className="text-slate-500">Real-time system monitoring & control.</p>
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
                    {activeTab === 'SECURITY' && <SecurityView />}
                    {activeTab === 'FINANCE' && <FinancialDashboard customKey={adminKey} />}
                    {activeTab === 'MARKET' && <MarketplaceManager adminKey={adminKey} />}
                    {activeTab === 'USERS' && (
                        <div className="bg-white p-10 rounded-xl border text-center">
                            <p className="text-slate-400 text-lg font-medium">User Surveillance Module</p>
                            <p className="text-slate-300 text-sm mt-2">Coming in Phase 11-20</p>
                        </div>
                    )}
                    {activeTab === 'LOGS' && (
                        <div className="bg-white p-10 rounded-xl border text-center">
                            <p className="text-slate-400 text-lg font-medium">System Logs Module</p>
                            <p className="text-slate-300 text-sm mt-2">Coming in Phase 40</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
