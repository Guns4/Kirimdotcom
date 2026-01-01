'use client';
import React, { useState, useEffect } from 'react';
import { Cpu, Printer, Package, RefreshCw, AlertCircle, CheckCircle, Battery } from 'lucide-react';

export default function IoTDeviceGrid({ adminKey }: { adminKey: string }) {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/iot/status', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setDevices(data.devices || []);
            }
        } catch (error) {
            console.error('Failed to fetch devices:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) {
            fetchAgents();
            const interval = setInterval(fetchDevices, 30000); // Auto-refresh every 30s
            return () => clearInterval(interval);
        }
    }, [adminKey]);

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'THERMAL_PRINTER': return <Printer size={32} />;
            case 'SMART_LOCKER': return <Package size={32} />;
            default: return <Cpu size={32} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return 'border-green-500 bg-green-50';
            case 'OFFLINE': return 'border-red-500 bg-red-50';
            case 'ERROR': return 'border-orange-500 bg-orange-50';
            default: return 'border-gray-300 bg-gray-50';
        }
    };

    const filteredDevices = devices.filter(d => {
        if (filter === 'ERROR') return d.actual_status === 'ERROR' || d.actual_status === 'OFFLINE';
        if (filter === 'ALL') return true;
        return d.actual_status === filter;
    });

    const onlineCount = devices.filter(d => d.actual_status === 'ONLINE').length;
    const offlineCount = devices.filter(d => d.actual_status === 'OFFLINE').length;
    const errorCount = devices.filter(d => d.actual_status === 'ERROR').length;

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Devices</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{devices.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-600 font-bold text-sm">Online</div>
                    <div className="text-3xl font-black text-green-900 mt-1">{onlineCount}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-red-600 font-bold text-sm">Offline</div>
                    <div className="text-3xl font-black text-red-900 mt-1">{offlineCount}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="text-orange-600 font-bold text-sm">Errors</div>
                    <div className="text-3xl font-black text-orange-900 mt-1">{errorCount}</div>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Cpu size={24} /> IoT Device Monitor
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time status of printers, lockers, and other hardware
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="ALL">All Devices</option>
                        <option value="ONLINE">Online Only</option>
                        <option value="OFFLINE">Offline Only</option>
                        <option value="ERROR">Errors Only</option>
                    </select>
                    <button
                        onClick={fetchDevices}
                        disabled={loading}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* DEVICE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDevices.map((device) => (
                    <div
                        key={device.id}
                        className={`p-4 rounded-xl border-2 ${getStatusColor(device.actual_status)}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={`${device.actual_status === 'ONLINE' ? 'text-green-600' : 'text-red-600'}`}>
                                {getDeviceIcon(device.device_type)}
                            </div>
                            <div className="flex items-center gap-1">
                                {device.actual_status === 'ONLINE' ? (
                                    <CheckCircle size={20} className="text-green-600" />
                                ) : (
                                    <AlertCircle size={20} className="text-red-600" />
                                )}
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="font-bold text-slate-800 text-sm">
                                {device.device_type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                                {device.device_id.substring(0, 16)}...
                            </div>
                        </div>

                        {device.agents && (
                            <div className="text-xs text-slate-600 mb-2">
                                📍 {device.agents.business_name || device.agents.agent_code}
                            </div>
                        )}

                        {device.battery_level !== null && (
                            <div className="flex items-center gap-2 text-xs mb-2">
                                <Battery size={14} className={device.battery_level < 20 ? 'text-red-600' : 'text-green-600'} />
                                <span className={device.battery_level < 20 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                                    {device.battery_level}%
                                </span>
                            </div>
                        )}

                        {device.last_heartbeat && (
                            <div className="text-xs text-slate-400">
                                Last seen: {new Date(device.last_heartbeat).toLocaleString()}
                            </div>
                        )}

                        {device.error_message && (
                            <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                ⚠️ {device.error_message}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredDevices.length === 0 && (
                <div className="bg-white p-12 rounded-xl border text-center text-slate-400">
                    No devices found matching filter
                </div>
            )}

            {/* INFO */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <strong>💡 IoT Monitoring:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Devices offline &gt; 5 minutes are marked OFFLINE automatically</li>
                    <li>Red battery (&lt;20%) requires urgent attention</li>
                    <li>Monitor printer paper status via metadata</li>
                    <li>Smart lockers show capacity in metadata</li>
                </ul>
            </div>
        </div>
    );
}
