'use client';
import { useState } from 'react';
import { Radio, Save, Activity } from 'lucide-react';

export default function WebhooksPage() {
    const [url, setUrl] = useState('https://api.toko-online-anda.com/callbacks/cekkirim');
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Webhooks</h2>
                <p className="text-slate-500">Kami akan mengirim data ke server Anda saat status resi berubah.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Radio size={18} className="text-red-500" /> Endpoint URL
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Active</span>
                </div>

                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {isEditing ? (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                        >
                            <Save size={18} /> Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-50"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Events to subscribe:</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" checked readOnly className="rounded text-blue-600" />
                            Package Status Updated (ON_PROCESS → DELIVERED)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" checked readOnly className="rounded text-blue-600" />
                            Problem Shipment (RTS / LOST)
                        </label>
                    </div>
                </div>
            </div>

            {/* Recent Deliveries Log */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Activity size={18} /> Recent Deliveries
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    <div className="px-6 py-3 flex justify-between items-center hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-mono font-bold">200 OK</span>
                            <span className="text-sm text-slate-600">Event: status.updated</span>
                        </div>
                        <span className="text-xs text-slate-400">2 mins ago</span>
                    </div>
                    <div className="px-6 py-3 flex justify-between items-center hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-mono font-bold">500 ERR</span>
                            <span className="text-sm text-slate-600">Event: status.updated</span>
                        </div>
                        <span className="text-xs text-slate-400">15 mins ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
