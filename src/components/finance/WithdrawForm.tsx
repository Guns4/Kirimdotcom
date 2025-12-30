'use client';

import { requestWithdrawal } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function WithdrawForm({ maxBalance }: { maxBalance: number }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await requestWithdrawal(new FormData(e.currentTarget));
        if (res.error) toast.error(res.error);
        else toast.success('Permintaan Penarikan Terkirim!');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-xl bg-card">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Bank</Label>
                    <Input name="bankName" placeholder="BCA / Mandiri / GoPay" required />
                </div>
                <div className="space-y-2">
                    <Label>No. Rekening</Label>
                    <Input name="accNum" placeholder="12345xxxxx" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Atas Nama</Label>
                <Input name="accHolder" placeholder="Nama Pemilik Rekening" required />
            </div>
            <div className="space-y-2">
                <Label>Nominal (Max: Rp {maxBalance.toLocaleString('id-ID')})</Label>
                <Input name="amount" type="number" min="10000" max={maxBalance} required />
            </div>
            <Button type="submit" className="w-full">Tarik Dana</Button>
        </form>
    );
}
