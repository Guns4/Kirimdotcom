'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalRequest {
    id: string;
    requester_id: string;
    action_type: string;
    amount?: number;
    payload: any;
    created_at: string;
}

export default function ApprovalDashboard({ adminId }: { adminId: string }) {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRequests = async () => {
            // Fetch PENDING requests where I am NOT the requester
            const { data, error } = await supabase
                .from('approval_requests')
                .select('*')
                .eq('status', 'PENDING')
                .neq('requester_id', adminId); // Cannot approve own requests

            if (data) setRequests(data);
            setLoading(false);
        };

        fetchRequests();
    }, [adminId]);

    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${decision} this request?`)) return;

        const { error } = await supabase
            .from('approval_requests')
            .update({
                status: decision,
                approver_id: adminId,
                updated_at: new Date()
            })
            .eq('id', id);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            setRequests(prev => prev.filter(r => r.id !== id));
            alert('Request ' + decision);
        }
    };

    if (loading) return <div>Loading approvals...</div>;

    if (requests.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <p>All clean! No pending approvals required.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="text-orange-500" />
                Pending Approvals ({requests.length})
            </h2>

            <div className="grid gap-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-lg">{req.action_type}</div>
                            <div className="text-sm text-gray-500">
                                Requester: {req.requester_id} <br />
                                Date: {new Date(req.created_at).toLocaleString()}
                            </div>
                            {req.amount && (
                                <div className="mt-2 text-green-600 font-mono font-bold">
                                    Amount: Rp {req.amount.toLocaleString()}
                                </div>
                            )}
                            <pre className="mt-2 bg-gray-100 p-2 text-xs rounded max-w-md overflow-auto">
                                {JSON.stringify(req.payload, null, 2)}
                            </pre>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDecision(req.id, 'REJECTED')}
                                className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleDecision(req.id, 'APPROVED')}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
