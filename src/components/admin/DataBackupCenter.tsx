'use client';
import React, { useState } from 'react';
import { HardDrive, Download, Database, Users, ShoppingCart, DollarSign, Key } from 'lucide-react';

export default function DataBackupCenter({ adminKey }: { adminKey: string }) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (table: string) => {
        setDownloading(table);
        try {
            const res = await fetch(`/api/admin/system/export?table=${table}`, {
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${table}_backup_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to export data');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
        setDownloading(null);
    };

    const tables = [
        { key: 'users', label: 'User Data', icon: Users, color: 'blue' },
        { key: 'orders', label: 'Order History', icon: ShoppingCart, color: 'green' },
        { key: 'transactions', label: 'Financial Transactions', icon: DollarSign, color: 'purple' },
        { key: 'products', label: 'Product Catalog', icon: Database, color: 'orange' },
        { key: 'api_keys', label: 'SaaS API Keys', icon: Key, color: 'red' }
    ];

    const getColorClass = (color: string) => {
        const colors: any = {
            blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            green: 'bg-green-50 border-green-200 hover:bg-green-100',
            purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            red: 'bg-red-50 border-red-200 hover:bg-red-100'
        };
        return colors[color] || colors.blue;
    };

    const getIconColor = (color: string) => {
        const colors: any = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
            orange: 'text-orange-600',
            red: 'text-red-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <HardDrive size={24} /> Data Backup Center
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Export your data as CSV for backups, migration, or analysis
                </p>
            </div>

            {/* INFO BANNER */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                    <Database size={18} />
                    Automated Daily Backups
                </div>
                <p className="text-sm text-blue-700">
                    Click any button below to download an instant CSV backup. Recommended: backup monthly or before major changes.
                </p>
            </div>

            {/* BACKUP BUTTONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => {
                    const IconComponent = table.icon;
                    return (
                        <button
                            key={table.key}
                            onClick={() => handleDownload(table.key)}
                            disabled={downloading === table.key}
                            className={`p-6 rounded-xl border-2 transition flex flex-col items-start gap-3 text-left disabled:opacity-50 ${getColorClass(table.color)}`}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <IconComponent size={32} className={getIconColor(table.color)} />
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{table.label}</h4>
                                    <p className="text-xs text-slate-500">Export as CSV</p>
                                </div>
                            </div>

                            <div className="w-full flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                                <Download size={16} className="text-slate-600" />
                                <span className="text-sm font-bold text-slate-700">
                                    {downloading === table.key ? 'Downloading...' : 'Download Now'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* USAGE TIPS */}
            <div className="bg-slate-50 p-6 rounded-xl border">
                <h4 className="font-bold text-slate-800 mb-3">📋 Backup Best Practices</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Monthly Backups:</strong> Download all tables on the 1st of each month</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Before Updates:</strong> Always backup before major system changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Store Safely:</strong> Keep backups in cloud storage (Google Drive, Dropbox)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span><strong>Test Restores:</strong> Periodically verify backups can be restored</span>
                    </li>
                </ul>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-black text-slate-800">CSV</div>
                    <div className="text-xs text-slate-500 mt-1">Format</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-black text-slate-800">10K</div>
                    <div className="text-xs text-slate-500 mt-1">Max Rows</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                    <div className="text-2xl font-black text-slate-800">~2s</div>
                    <div className="text-xs text-slate-500 mt-1">Download Time</div>
                </div>
            </div>
        </div>
    );
}
