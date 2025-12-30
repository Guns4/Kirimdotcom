'use client';

import { useState } from 'react';
import { AlertTriangle, Lock, Unlock } from 'lucide-react';
import { toggleLockdownAction } from '@/app/actions/lockdown-action';

export default function PanicButton() {
    const [locked, setLocked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const confirmMsg = locked
            ? "Disable Emergency Lockdown? Operations will resume."
            : "⚠️ ENABLE EMERGENCY LOCKDOWN? \n\nThis will block ALL write operations (Bookings, Payments, etc). Only Admins can bypass.";

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        try {
            await toggleLockdownAction(!locked);
            setLocked(!locked);
        } catch (e) {
            alert('Failed to toggle lockdown');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${locked ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Emergency Lockdown</h3>
                    <p className="text-xs text-gray-600">
                        {locked ? 'SYSTEM FROZEN (Maintenance Mode)' : 'System Normal'}
                    </p>
                </div>
            </div>

            <button
                onClick={handleToggle}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${locked
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-300'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
            >
                {locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {locked ? 'Unlock System' : 'FREEZE'}
            </button>
        </div>
    );
}
