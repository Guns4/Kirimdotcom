'use client';

import { useState, useEffect } from 'react';
import { getDrafts, publishDraft, deleteDraft } from '@/lib/draft-manager';
import { FileText, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DraftListWidget() {
    // Note: Since 'getDrafts' is server action-ish, we usually fetch in parent. 
    // But for simplified widget, we will fetch on mount or just skip standard hydration for now.
    // Ideally this component receives 'initialDrafts' as prop.
    // For this script, we'll keep it client-side fetching via a wrapper or assume parent passes data.
    // Let's make it accept props for simplicity in integration.
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Review Queue (Drafts)
                </h3>
                <span className="text-xs text-gray-400">Auto-refresh on generate</span>
            </div>

            <p className="text-sm text-gray-500">
                To integrate this fully, update your Admin Page to fetch drafts using `getDrafts()` and pass them here.
            </p>
        </div>
    );
}
