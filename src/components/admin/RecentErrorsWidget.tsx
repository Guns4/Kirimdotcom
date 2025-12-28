'use client';

import { useEffect, useState } from 'react';
import { getRecentErrors } from '@/app/actions/errorLoggingActions';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function RecentErrorsWidget() {
    const [errors, setErrors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadErrors = async () => {
            try {
                const { data } = await getRecentErrors(5);
                setErrors(data || []);
            } finally {
                setLoading(false);
            }
        };
        loadErrors();
    }, []);

    if (loading) return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;

    if (errors.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500 min-h-[150px]">
                <AlertTriangle className="w-8 h-8 mb-2 text-green-500" />
                <p>Tidak ada error terbaru</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Errors (Client)
            </h3>
            <div className="space-y-4">
                {errors.map((err) => (
                    <div key={err.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                        <p className="font-medium text-red-600 line-clamp-1">{err.message}</p>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>{new Date(err.created_at).toLocaleString('id-ID')}</span>
                            <span className="max-w-[150px] truncate">{err.meta?.url}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
