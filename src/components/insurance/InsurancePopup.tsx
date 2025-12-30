'use client';

import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { purchaseProtection } from '@/app/actions/insurance';
import { toast } from 'sonner';

interface InsurancePopupProps {
    resi: string;
    isDelivered: boolean; // Only offer if NOT yet delivered
}

export function InsurancePopup({ resi, isDelivered }: InsurancePopupProps) {
    const [isVisible, setIsVisible] = useState(!isDelivered); // Default logic
    const [loading, setLoading] = useState(false);

    if (!isVisible || isDelivered) return null;

    const handlePurchase = async () => {
        setLoading(true);
        const res = await purchaseProtection(resi);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Paket berhasil dilindungi! 🛡️');
            setIsVisible(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
            <div className="bg-card border border-primary/20 shadow-2xl rounded-xl p-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -right-4 -top-4 bg-primary/10 w-24 h-24 rounded-full blur-2xl" />

                <div className="flex items-start gap-4 relative">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">Cemas Paket Hilang?</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                            Lindungi paket <strong>{resi}</strong> ini sebesar <strong>Rp 500.000</strong> hanya dengan biaya <strong>Rp 1.000</strong>.
                        </p>
                        <div className="flex gap-2">
                            <Button size="sm" className="h-8 text-xs w-full" onClick={handlePurchase} disabled={loading}>
                                {loading ? 'Memproses...' : 'Lindungi Sekarang'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setIsVisible(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
