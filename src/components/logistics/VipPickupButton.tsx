'use client';

import { useState } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function VipPickupButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRequest() {
        if (!confirm('Request VIP Pickup sekarang? Biaya Rp 10.000 akan dipotong.')) return;

        setLoading(true);
        try {
            // Mock Location (Jakarta Pusat)
            const mockLocation = { lat: -6.175110, lng: 106.865036, address: 'Gudang Utama' };

            const res = await fetch('/api/logistics/pickup/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockLocation)
            });
            const data = await res.json();

            if (data.success) {
                toast.success('VIP Pickup Requested!');
                router.push('/dashboard/manifest/pickup'); // Redirect to tracker
            } else {
                toast.error('Gagal: ' + data.error);
            }
        } catch (e) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleRequest}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 font-semibold"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            VIP Pickup (+10rb)
        </button>
    );
}
