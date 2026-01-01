'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Play, Pause, AlertCircle } from 'lucide-react';

export default function CXForensics({ adminKey }: { adminKey: string }) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [nps, setNps] = useState<any>(null);
    const [issues, setIssues] = useState<any[]>([]);

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/cx/sessions', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => {
                    setSessions(data.sessions || []);
                    setNps(data.nps);
                });

            fetch('/api/admin/cx/issues', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => setIssues(data.issues || []));
        }
    }, [adminKey]);

    const npsColor = nps && nps.nps_score > 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="space-y-6">
            {/* NPS DASHBOARD */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl text-white">
                <h3 className="font-bold mb-2">Net Promoter Score (NPS)</h3>
                <div className={`text-6xl font-black ${npsColor} mix-blend-screen`}>
                    {nps ? nps.nps_score : 0}
                </div>
                <div className="text-sm opacity-90 mt-2">
                    {nps && `${nps.promoters_count} promoters, ${nps.detractors_count} detractors`}
                </div>
            </div>

            {/* SESSION REPLAY */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Recent User Sessions (Mock Player)
                </h4>
                <div className="space-y-2">
                    {sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="p-3 border rounded hover:bg-slate-50 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm">Session {session.id.slice(0, 8)}</div>
                                <div className="text-xs text-slate-500">Duration: {session.session_duration}s | Page: {session.page_visited}</div>
                                {session.has_errors && <span className="text-xs text-red-600">⚠️ Contains errors</span>}
                            </div>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1">
                                <Play size={12} />
                                Replay
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-xs text-slate-500">
                    🔒 Privacy: Sensitive data (passwords, credit cards) are masked
                </div>
            </div>

            {/* RAGE CLICK MONITOR */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    Top UX Issues (Rage Clicks & Errors)
                </h4>
                <div className="space-y-2">
                    {issues.slice(0, 10).map((issue, idx) => (
                        <div key={idx} className="p-3 border rounded">
                            <div className="flex justify-between">
                                <span className="font-bold text-sm">{issue.url_path}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${issue.impact_level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {issue.issue_type}
                                </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                {issue.total_occurrences} occurrences | Impact: {issue.impact_level}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
