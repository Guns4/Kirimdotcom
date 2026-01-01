import React from 'react';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

export default function SecurityView() {
    // Mock Data (Will be replaced with real API)
    const threats = [
        { id: 1, type: 'BRUTE_FORCE', ip: '192.168.1.55', time: '10:42 AM', details: 'Failed PIN 5x' },
        { id: 2, type: 'SQL_INJECTION', ip: '45.22.11.90', time: '09:15 AM', details: 'Payload: OR 1=1' },
        { id: 3, type: 'API_SPAM', ip: '103.44.22.1', time: '08:00 AM', details: 'Rate limit hit (200 req/s)' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-red-900/10 border border-red-200 p-4 rounded-lg flex items-center gap-3">
                <AlertTriangle className="text-red-600" />
                <div>
                    <h3 className="font-bold text-red-900">Security Alert Level: MODERATE</h3>
                    <p className="text-sm text-red-700">Terdeteksi 3 percobaan anomali hari ini.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-bold flex justify-between">
                    <span>🛡️ Live Threat Monitor</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">System Active</span>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Details</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {threats.map((t) => (
                            <tr key={t.id} className="hover:bg-red-50 transition">
                                <td className="px-6 py-4 font-bold text-red-600">{t.type}</td>
                                <td className="px-6 py-4 font-mono">{t.ip}</td>
                                <td className="px-6 py-4 text-slate-500">{t.time}</td>
                                <td className="px-6 py-4">{t.details}</td>
                                <td className="px-6 py-4">
                                    <button className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-black">BAN IP</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
