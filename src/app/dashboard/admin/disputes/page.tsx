'use client';

import { useState, useEffect } from 'react';
import { getDisputes, updateDisputeStatus } from '@/app/actions/dispute';
import { CheckCircle, XCircle, Clock, ShieldAlert, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    const data = await getDisputes();
    setDisputes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleAction = async (
    id: string,
    status: 'Approved' | 'Rejected',
    phoneHash: string
  ) => {
    if (!confirm(`Are you sure you want to ${status} this dispute?`)) return;

    const res = await updateDisputeStatus(id, status, phoneHash);
    if (res.success) {
      toast.success(`Dispute ${status}`);
      fetchDisputes();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-indigo-400" />
        COD Disputes Center
      </h1>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Phone Hash</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((d) => (
                <tr
                  key={d.id}
                  className="text-sm hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-gray-400">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                  <td
                    className="p-4 text-gray-500 font-mono text-xs max-w-[150px] truncate"
                    title={d.phone_hash}
                  >
                    {d.phone_hash.substring(0, 10)}...
                  </td>
                  <td className="p-4 text-white max-w-md">
                    <p className="line-clamp-2">{d.reason}</p>
                  </td>
                  <td className="p-4 text-indigo-300">{d.contact_info}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        d.status === 'Approved'
                          ? 'bg-green-500/20 text-green-400'
                          : d.status === 'Rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {d.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAction(d.id, 'Approved', d.phone_hash)
                          }
                          className="p-1 hover:bg-green-500/20 rounded text-green-400"
                          title="Approve (Clear Record)"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleAction(d.id, 'Rejected', d.phone_hash)
                          }
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
