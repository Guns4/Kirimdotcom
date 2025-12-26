'use client'

import { useState } from 'react'
import { BarChart3, Settings2, Image, Users } from 'lucide-react'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { UserManagement } from './UserManagement'
import { LogoUploader } from './LogoUploader'

interface AdminTabsProps {
    settings: {
        logo_url?: string | null
        maintenance_mode?: boolean
    } | null
}

type TabId = 'analytics' | 'users' | 'settings'

export default function AdminTabs({ settings }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('analytics')

    const tabs = [
        { id: 'analytics' as TabId, label: 'Analytics', icon: BarChart3 },
        { id: 'users' as TabId, label: 'Pengguna', icon: Users },
        { id: 'settings' as TabId, label: 'Pengaturan', icon: Settings2 },
    ]

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'analytics' && <AnalyticsDashboard />}

                {activeTab === 'users' && <UserManagement />}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Logo Settings */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <Image className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Logo Website</h2>
                                    <p className="text-sm text-gray-400">
                                        Upload logo baru untuk mengubah tampilan website
                                    </p>
                                </div>
                            </div>

                            <LogoUploader currentLogoUrl={settings?.logo_url || null} />
                        </div>

                        {/* Maintenance Mode */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Settings2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Mode Pemeliharaan</h2>
                                    <p className="text-sm text-gray-400">
                                        Status: {settings?.maintenance_mode ? '🔴 Aktif' : '🟢 Tidak Aktif'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">📌 Quick Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <a
                                    href="https://supabase.com/dashboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-sm">
                                        S
                                    </div>
                                    <span className="text-gray-300">Supabase Dashboard</span>
                                </a>
                                <a
                                    href="https://vercel.com/dashboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
                                        ▲
                                    </div>
                                    <span className="text-gray-300">Vercel Dashboard</span>
                                </a>
                                <a
                                    href="https://analytics.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-sm">
                                        G
                                    </div>
                                    <span className="text-gray-300">Google Analytics</span>
                                </a>
                                <a
                                    href="https://search.google.com/search-console"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm">
                                        S
                                    </div>
                                    <span className="text-gray-300">Search Console</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
