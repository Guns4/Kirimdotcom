'use client';
import React, { useState, useEffect } from 'react';
import { Rocket, Zap } from 'lucide-react';

export default function GrowthHackingDeck({ adminKey }: { adminKey: string }) {
    const [automations, setAutomations] = useState<any[]>([]);

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/marketing/campaigns', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => setAutomations(data.automations || []));
        }
    }, [adminKey]);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await fetch('/api/admin/marketing/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminKey },
            body: JSON.stringify({ type: 'AUTOMATION', action: 'TOGGLE', id, updates: { is_active: !currentStatus } })
        });

        setAutomations(automations.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a));
    };

    return (
        <div className="bg-white rounded-xl shadow border p-6">
            <div className="flex items-center gap-2 mb-4">
                <Rocket size={20} className="text-purple-600" />
                <h4 className="font-bold">Marketing Automation</h4>
            </div>

            <div className="space-y-3">
                {automations.map((auto) => (
                    <div key={auto.id} className="p-3 rounded-lg border hover:bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold text-sm">{auto.campaign_name}</div>
                                <div className="text-xs text-slate-500">{auto.trigger_event}</div>
                            </div>
                            <button
                                onClick={() => handleToggle(auto.id, auto.is_active)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${auto.is_active ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${auto.is_active ? 'translate-x-5' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="text-xs text-slate-600 mb-2">{auto.message_template}</div>
                        <div className="flex gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{auto.action_type}</span>
                            <span className="text-slate-500">{auto.total_sent} sent</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
