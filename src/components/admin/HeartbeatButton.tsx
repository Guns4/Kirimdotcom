'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react'; // Assuming you have lucide-react
import { checkInAction } from '@/app/actions/dms-action';
import { toast } from 'sonner';

export function HeartbeatButton() {
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const res = await checkInAction();
            if (res.success) {
                toast.success('Heartbeat sent! Business continuity timer reset.');
            } else {
                toast.error('Failed to send heartbeat.');
            }
        } catch (err) {
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500">
                <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-zinc-100">Dead Man's Switch</h3>
                <p className="text-sm text-zinc-400">Confirm you are active to reset the contingency timer.</p>
            </div>
            <Button
                onClick={handleCheckIn}
                disabled={loading}
                variant="outline"
                className="border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-400"
            >
                {loading ? 'Signaling...' : 'I am Here'}
            </Button>
        </div>
    );
}
