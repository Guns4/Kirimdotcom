'use client';

import { useEffect, useState } from 'react';
import { getRecentErrors } from '@/app/actions/errorLoggingActions';
import { AlertTriangle, Clock } from 'lucide-react';

export default function RecentErrorsWidget() {
    const [errors, setErrors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRecentErrors().then(data => {
            setErrors(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Errors</h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {errors.length === 0 ? (
                    <p className="text-zinc-500 text-sm">System healthy. No errors reported.</p>
                ) : (
                    errors.map((err) => (
                        <div key={err.id} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300 break-words mb-1">
                                {err.error_message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-red-500/70">
                                <Clock className="w-3 h-3" />
                                {new Date(err.created_at).toLocaleString()}
                                <span className="w-1 h-1 bg-red-400 rounded-full" />
                                <span className="truncate max-w-[200px]">{err.url}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
