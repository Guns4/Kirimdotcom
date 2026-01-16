'use client';
import React, { useState, useEffect } from 'react';
import { ADMIN_MODULES } from '@/config/adminModules';
import { Search, Activity, LogOut } from 'lucide-react';
import Omnibar from './ui/Omnibar';
import NotificationBell from './ui/NotificationBell';
import AdminTodoWidget from './ui/AdminTodoWidget';

// Import Views
import OverviewView from './views/OverviewView';
import SecurityView from './views/SecurityView';
import UserManager from './views/UserManager';
import FinancialDashboard from './FinancialDashboard';
import MonetizationManager from './MonetizationManager';
import SettingsManager from './SettingsManager';
import SaaSManager from './SaaSManager';
import ContentCMS from './ContentCMS';
import SupportDesk from './SupportDesk';
import WebhookMonitor from './WebhookMonitor';
import SystemControls from './SystemControls';
import DataBackupCenter from './DataBackupCenter';
import AdminActivityLog from './AdminActivityLog';
import BroadcastManager from './BroadcastManager';
import ProfitEngine from './ProfitEngine';
import MobileAppManager from './MobileAppManager';
import PluginRepository from './PluginRepository';
import AgentCommandCenter from './AgentCommandCenter';
import FleetLiveMap from './FleetLiveMap';
import AIControlDeck from './AIControlDeck';
import CourierControl from './CourierControl';
import CODReconcileDesk from './CODReconcileDesk';
import ProblematicShipment from './ProblematicShipment';
import GachaMaster from './GachaMaster';
import LoyaltyConfig from './LoyaltyConfig';
import BadgeFactory from './BadgeFactory';
import CustomerSegmentation from './CustomerSegmentation';
import FunnelViz from './FunnelViz';
import GrowthHackingDeck from './GrowthHackingDeck';
import CXForensics from './CXForensics';
import KnowledgeCenter from './KnowledgeCenter';
import InfrastructureFortress from './InfrastructureFortress';
import EcosystemGovernance from './EcosystemGovernance';
import DistributionLicensing from './DistributionLicensing';

export default function GodModeContainer({ adminKey }: { adminKey: string }) {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [showOmnibar, setShowOmnibar] = useState(false);
    const [health, setHealth] = useState<any>({
        database: 'Checking...',
        smm_provider: 'Checking...',
        midtrans: 'Checking...'
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowOmnibar(true);
            }
            if (e.key === 'Escape') setShowOmnibar(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/admin/system-health');
                if (res.ok) setHealth(await res.json());
            } catch (e) { }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {showOmnibar && <Omnibar adminKey={adminKey} onClose={() => setShowOmnibar(false)} />}

            {/* SIDEBAR */}
            <div className="w-72 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-black tracking-tighter">
                        GOD<span className="text-blue-500">MODE</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Complete System v10.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {ADMIN_MODULES.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition text-sm font-bold
                ${activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-lg translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* TODO WIDGET */}
                <div className="p-4">
                    <AdminTodoWidget adminKey={adminKey} />
                </div>

                {/* HEALTH */}
                <div className="p-4 border-t border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500">System Status</span>
                        <Activity size={12} className={health.database === 'ONLINE' ? 'text-green-500 animate-pulse' : 'text-red-500'} />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-sm">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <main className="flex-1 ml-72 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">
                            {ADMIN_MODULES.find(m => m.id === activeTab)?.label}
                        </h2>
                        <p className="text-slate-500">
                            {ADMIN_MODULES.find(m => m.id === activeTab)?.description}
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <NotificationBell adminKey={adminKey} />
                        <button onClick={() => setShowOmnibar(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
                            <Search size={16} />
                            <span className="hidden md:inline">Ctrl + K</span>
                        </button>
                    </div>
                </header>

                <div className="animate-in fade-in duration-500">
                    {activeTab === 'OVERVIEW' && <OverviewView />}
                    {activeTab === 'AI_INTEL' && <AIControlDeck adminKey={adminKey} />}
                    {activeTab === 'GAME' && (
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2">
                                <GachaMaster adminKey={adminKey} />
                            </div>
                            <div className="space-y-6">
                                <LoyaltyConfig adminKey={adminKey} />
                                <BadgeFactory adminKey={adminKey} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'GROWTH' && (
                        <div className="space-y-6">
                            <FunnelViz adminKey={adminKey} />
                            <div className="grid grid-cols-2 gap-6">
                                <CustomerSegmentation adminKey={adminKey} />
                                <GrowthHackingDeck adminKey={adminKey} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'CX' && <CXForensics adminKey={adminKey} />}
                    {activeTab === 'KNOWLEDGE' && <KnowledgeCenter adminKey={adminKey} />}
                    {activeTab === 'FORTRESS' && <InfrastructureFortress adminKey={adminKey} />}
                    {activeTab === 'COMMERCE' && <EcosystemGovernance adminKey={adminKey} />}
                    {activeTab === 'DISTRO' && <DistributionLicensing adminKey={adminKey} />}
                    {activeTab === 'LOGISTICS' && (
                        <div className="space-y-6">
                            <CourierControl adminKey={adminKey} />
                            <CODReconcileDesk adminKey={adminKey} />
                            <ProblematicShipment adminKey={adminKey} />
                        </div>
                    )}
                    {activeTab === 'O2O' && <AgentCommandCenter adminKey={adminKey} />}
                    {activeTab === 'FLEET' && <FleetLiveMap adminKey={adminKey} />}
                    {activeTab === 'MOBILE' && <MobileAppManager adminKey={adminKey} />}
                    {activeTab === 'PLUGINS' && <PluginRepository adminKey={adminKey} />}
                    {activeTab === 'CONTROLS' && <SystemControls adminKey={adminKey} />}
                    {activeTab === 'COMMS' && <BroadcastManager adminKey={adminKey} />}
                    {activeTab === 'INTEL' && <ProfitEngine adminKey={adminKey} />}
                    {activeTab === 'BACKUP' && (
                        <div className="space-y-6">
                            <DataBackupCenter adminKey={adminKey} />
                            <AdminActivityLog adminKey={adminKey} />
                        </div>
                    )}
                    {activeTab === 'SUPPORT' && <SupportDesk adminKey={adminKey} />}
                    {activeTab === 'SYSTEM' && <WebhookMonitor adminKey={adminKey} />}
                    {activeTab === 'SAAS' && <SaaSManager adminKey={adminKey} />}
                    {activeTab === 'CMS' && <ContentCMS adminKey={adminKey} />}
                    {activeTab === 'MONETIZATION' && <MonetizationManager adminKey={adminKey} />}
                    {activeTab === 'SECURITY' && <SecurityView adminKey={adminKey} />}
                    {activeTab === 'FINANCE' && <FinancialDashboard customKey={adminKey} />}
                    {activeTab === 'USERS' && <UserManager adminKey={adminKey} />}
                    {activeTab === 'SETTINGS' && <SettingsManager adminKey={adminKey} />}
                </div>
            </main>
        </div>
    );
}
