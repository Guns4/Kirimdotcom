'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertTriangle, X, ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function RestockAlert() {
    const [alert, setAlert] = useState<any>(null);
    const [reordering, setReordering] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        checkAlerts();
    }, []);

    async function checkAlerts() {
        // Fetch active alerts for current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('supply_alerts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .eq('alert_type', 'LOW_STOCK_Lakban')
            .single();

        if (data) setAlert(data);
    }

    async function handleReorder() {
        setReordering(true);
        // Mock Reorder Action
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Purchase the item (invoke api/checkout) - optional integration
            // For now just simulate success

            toast.success('Pesanan Lakban berhasil dibuat!', { description: 'Diskon ongkir telah diterapkan.' });
            dismissAlert();
        } catch (e) {
            toast.error('Gagal membuat pesanan');
        } finally {
            setReordering(false);
        }
    }

    async function dismissAlert() {
        if (!alert) return;
        setAlert(null);
        await supabase
            .from('supply_alerts')
            .update({ is_active: false })
            .eq('id', alert.id);
    }

    if (!alert) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-white border-l-4 border-yellow-500 shadow-xl rounded-r-lg p-4 max-w-sm flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm">Stok Menipis!</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-snug">{alert.message}</p>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleReorder}
                            disabled={reordering}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm transition-colors disabled:opacity-70"
                        >
                            {reordering ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
                            {reordering ? 'Memproses...' : 'Re-order Instan'}
                        </button>
                        <button
                            onClick={dismissAlert}
                            className="text-gray-400 hover:text-gray-600 text-xs py-1.5 px-2"
                        >
                            Nanti Saja
                        </button>
                    </div>
                </div>

                <button onClick={dismissAlert} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
