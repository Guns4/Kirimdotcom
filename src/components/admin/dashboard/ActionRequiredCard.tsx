import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ActionMetrics {
    pendingWithdrawals: number;
    openComplaints: number;
}

export function ActionRequiredCard({ data }: { data: ActionMetrics }) {
    const totalActions = data.pendingWithdrawals + data.openComplaints;
    const isCritical = totalActions > 10;

    return (
        <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${isCritical ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${isCritical ? 'text-red-800' : 'text-gray-500'}`}>
                        Action Required
                    </span>
                </div>
                {totalActions > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {totalActions}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <Link href="/admin/finance/withdrawals" className="flex items-center justify-between text-sm group cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-colors">
                    <span className="text-gray-600">Withdrawals Pending</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                        {data.pendingWithdrawals} <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                    </span>
                </Link>
                <div className="border-t border-gray-200/50" />
                <Link href="/admin/support" className="flex items-center justify-between text-sm group cursor-pointer hover:bg-white/50 p-2 rounded-lg transition-colors">
                    <span className="text-gray-600">Open Tickets</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                        {data.openComplaints} <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                    </span>
                </Link>
            </div>
        </div>
    );
}
