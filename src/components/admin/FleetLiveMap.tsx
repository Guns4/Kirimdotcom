'use client';
import React, { useState, useEffect } from 'react';
import { Map as MapIcon, RefreshCw, Navigation } from 'lucide-react';

export default function FleetLiveMap({ adminKey }: { adminKey: string }) {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/fleet/tracking', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setDrivers(data.drivers || []);
            }
        } catch (error) {
            console.error('Failed to fetch drivers:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) {
            fetchDrivers();
            const interval = setInterval(fetchDrivers, 10000); // Auto-refresh every 10s
            return () => clearInterval(interval);
        }
    }, [adminKey]);

    const activeDrivers = drivers.filter(d => d.status === 'DELIVERING');
    const idleDrivers = drivers.filter(d => d.status === 'IDLE');

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Fleet</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{drivers.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-600 font-bold text-sm">On Delivery</div>
                    <div className="text-3xl font-black text-green-900 mt-1">{activeDrivers.length}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="text-orange-600 font-bold text-sm">Idle</div>
                    <div className="text-3xl font-black text-orange-900 mt-1">{idleDrivers.length}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 font-bold text-sm">Avg Speed</div>
                    <div className="text-3xl font-black text-purple-900 mt-1">
                        {drivers.length > 0
                            ? Math.round(drivers.reduce((acc, d) => acc + (d.speed_kmh || 0), 0) / drivers.length)
                            : 0} km/h
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MapIcon size={24} /> Fleet Live Tracking
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time GPS tracking of delivery fleet (updates every 10s)
                    </p>
                </div>
                <button
                    onClick={fetchDrivers}
                    disabled={loading}
                    className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* MAP PLACEHOLDER */}
            <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                <MapIcon size={64} className="mx-auto text-slate-400 mb-4" />
                <h4 className="font-bold text-slate-600 mb-2">Interactive Map - Map Integration Required</h4>
                <p className="text-sm text-slate-500 mb-4">
                    To enable live fleet tracking, integrate Leaflet or Mapbox:
                </p>
                <code className="bg-white px-3 py-2 rounded text-xs text-slate-700">
                    npm install react-leaflet leaflet
                </code>
                <div className="mt-4 text-xs text-slate-400">
                    Showing driver list below as fallback
                </div>
            </div>

            {/* DRIVER LIST (Fallback) */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-bold">Active Drivers</div>
                <div className="divide-y divide-slate-100">
                    {drivers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No active drivers found
                        </div>
                    ) : (
                        drivers.map((driver) => (
                            <div key={driver.driver_id} className="p-4 hover:bg-slate-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Navigation size={16} className="text-blue-600" />
                                            <span className="font-bold text-slate-800">{driver.driver_code}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-bold ${driver.status === 'DELIVERING'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}
                                            >
                                                {driver.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            {driver.vehicle_type} • Battery: {driver.battery_level || 'N/A'}%
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <div>Lat: {driver.current_lat}</div>
                                        <div>Long: {driver.current_long}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* INFO */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                <strong>💡 Fleet Tracking Setup:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Drivers update location via mobile app every 10-30 seconds</li>
                    <li>Map shows drivers updated within last 1 minute</li>
                    <li>Battery monitoring prevents driver phone shutdown</li>
                    <li>Integrate Leaflet/Mapbox for visual map display</li>
                </ul>
            </div>
        </div>
    );
}
