'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { purchaseReport } from '@/app/actions/analytics';
import { toast } from 'sonner';

export function PurchaseButton({ id, price }: { id: string, price: number }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
     if(!confirm(`Beli laporan ini seharga Rp ${price.toLocaleString()}?`)) return;
     setLoading(true);
     const res = await purchaseReport(id, price);
     setLoading(false);
     if(res.error) toast.error(res.error);
     else toast.success('Berhasil dibeli! Akses terbuka.');
  };

  return (
    <Button onClick={handleBuy} disabled={loading} className="h-12 px-8 text-lg font-semibold">
       {loading ? 'Memproses...' : 'Beli Akses'}
    </Button>
  );
}
