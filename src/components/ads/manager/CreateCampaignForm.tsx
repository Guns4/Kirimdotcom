'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAdCampaign } from '@/app/actions/ads';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function CreateCampaignForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createAdCampaign(formData);
    setLoading(false);

    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success('Kampanye Iklan Berhasil Dibuat!');
        // In real app, redirect or reset form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-xl bg-card">
       <div className="space-y-2">
          <Label>Nama Kampanye</Label>
          <Input name="campaignName" placeholder="Promo Diskon 50%" required />
       </div>
       
       <div className="space-y-2">
          <Label>Banner Iklan</Label>
          <Input type="file" name="banner" accept="image/*" required />
       </div>

       <div className="space-y-2">
          <Label>Target Link (Landing Page)</Label>
          <Input name="targetUrl" placeholder="https://tokosaya.com/promo" type="url" required />
       </div>

       <div className="space-y-2">
          <Label>Target Kurir (Opsional, pisahkan koma)</Label>
          <Input name="couriers" placeholder="jne, sicepat (Kosongkan untuk semua)" />
       </div>

       <div className="space-y-2">
          <Label>Saldo Awal (Rp)</Label>
          <Input name="budget" type="number" min="10000" placeholder="Min. 10.000" required defaultValue="50000" />
          <p className="text-xs text-muted-foreground">Biaya: Rp 100 per tayang.</p>
       </div>

       <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Memproses...' : 'Terbitkan Iklan'}
       </Button>
    </form>
  );
}
