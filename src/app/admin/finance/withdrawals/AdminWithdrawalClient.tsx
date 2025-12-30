'use client';

import { processWithdrawal } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function WithdrawalActions({ id }: { id: string }) {
    const handle = async (action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action}?`)) return;

        const res = await processWithdrawal(id, action);
        if (res.success) toast.success(`Request ${action}D`);
        else toast.error('Failed');
    };

    return (
        <div className="flex gap-2">
            <Button size="sm" onClick={() => handle('APPROVE')} className="bg-green-600 hover:bg-green-700 h-8 px-2">
                <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handle('REJECT')} className="h-8 px-2">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
