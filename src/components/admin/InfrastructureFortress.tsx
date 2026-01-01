'use client';
import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Activity, AlertTriangle, Shield } from 'lucide-react';

export default function InfrastructureFortress({ adminKey }: { adminKey: string }) {
    const [health, setHealth] = useState<any>(null);
    const [stats, setStats] = useState<any[]>([]);
    const [security, setSecurity] = useState<any>({ incidents: [], blocked_ips: [] });

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/fortress/monitor', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => {
                    setHealth(data.health);
                    setStats(data.stats || []);
                    setSecurity(data.security || { incidents: [], blocked_ips: [] });
                });
        }
    }, [adminKey]);

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-300';
            case 'WARNING': return 'text-orange-600 bg-orange-50 border-orange-300';
            default: return 'text-green-600 bg-green-50 border-green-300';
        }
    };

    const handleBanIP = async (ip: string) => {
        if (!confirm(`Ban IP ${ip}?`)) return;

        await fetch('/api/admin/fortress/monitor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminKey },
            body: JSON.stringify({ action: 'BAN_IP', ip_address: ip, reason: 'MANUAL', duration_hours: 24 })
        });

        alert('IP banned for 24 hours');
    };

    return (
        <div className="space-y-6">
            {/* SERVER HEALTH MATRIX */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Server size={20} />
                    Server Health Matrix
                </h3>
                {health && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                            <Cpu className="mb-2 text-blue-400" size={24} />
                            <div className="text-2xl font-black">{health.avg_cpu?.toFixed(1)}%</div>
                            <div className="text-xs opacity-75">CPU Usage</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                            <Activity className="mb-2 text-purple-400" size={24} />
                            <div className="text-2xl font-black">{health.avg_ram?.toFixed(1)}%</div>
                            <div className="text-xs opacity-75">RAM Usage</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                            <HardDrive className="mb-2 text-green-400" size={24} />
                            <div className="text-2xl font-black">{health.avg_disk?.toFixed(1)}%</div>
                            <div className="text-xs opacity-75">Disk Usage</div>
                        </div>
                        <div className={`p-4rounded-lg border-2 ${getHealthColor(health.status)}`}>
                            <Shield className="mb-2" size={24} />
                            <div className="text-xl font-black">{health.status}</div>
                            <div className="text-xs">System Status</div>
                        </div>
                    </div>
                )}
            </div>

            {/* SECURITY FORTRESS (Hacker Aesthetic) */}
            <div className="bg-black border-2 border-green-500 p-6 rounded-xl text-green-400 font-mono">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-green-300">
                    <Shield size={20} />
                    [SECURITY FORTRESS] CYBER DEFENSE STATUS
                </h3>

                {/* Attack Map */}
                <div className="mb-4 p-4 bg-green-950/30 border border-green-700 rounded">
                    <div className="text-sm mb-2">&gt; RECENT SECURITY INCIDENTS:</div>
                    <div className="space-y-1">
                        {security.incidents.slice(0, 5).map((inc: any, idx: number) => (
                            <div key={idx} className="text-xs flex justify-between">
                                <span>[{inc.attack_type}] from {inc.ip_source?.toString()}</span>
                                <span className={inc.severity === 'CRITICAL' ? 'text-red-500 animate-pulse' : ''}>
                                    {inc.severity} ({inc.count}x)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blocked IPs */}
                <div className="p-4 bg-red-950/30 border border-red-700 rounded">
                    <div className="text-sm mb-2 text-red-400">&gt; BANNED IP ADDRESSES [{security.blocked_ips.length}]:</div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {security.blocked_ips.slice(0, 10).map((blocked: any) => (
                            <div key={blocked.id} className="text-xs flex justify-between items-center">
                                <span>{blocked.ip_address} | {blocked.reason}</span>
                                <button
                                    onClick={() => handleBanIP(blocked.ip_address)}
                                    className="px-2 py-0.5 bg-green-700 text-black rounded text-xs hover:bg-green-600"
                                >
                                    UNBAN
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 text-xs text-green-600">
                    🛡️ HONEYPOT ACTIVE | 2FA REQUIRED | IP WHITELIST ENFORCED
                </div>
            </div>

            {/* SERVER STATS GRAPH */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4">Server Performance (Last 24h)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.slice(0, 12).map((stat, idx) => (
                        <div key={idx} className="p-3 border rounded text-sm">
                            <div className="font-bold">{new Date(stat.timestamp).toLocaleTimeString('id-ID')}</div>
                            <div className="text-xs text-slate-600">
                                CPU: {stat.cpu_usage_percent?.toFixed(1)}% | RAM: {stat.ram_usage_percent?.toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
