'use client';

import { createTrip } from '@/app/actions/jastip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function PostTripForm() {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await createTrip(new FormData(e.currentTarget));
        if (res.error) toast.error(res.error);
        else toast.success('Jadwal Jastip Telah Diposting!');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-xl bg-card">
            <h3 className="font-bold text-lg">Buka Jastip Baru</h3>
            <div className="grid grid-cols-2 gap-4">
                <Input name="origin" placeholder="Dari Kota (Asal)" required />
                <Input name="destination" placeholder="Ke Kota (Tujuan)" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input name="date" type="date" required />
                <Input name="capacity" type="number" placeholder="Kapasitas (Kg)" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Input name="price" type="number" placeholder="Fee per Kg (opsional)" />
                <Input name="wa" type="tel" placeholder="Nomor WA (628...)" required />
            </div>
            <Textarea name="notes" placeholder="Catatan: Terima makanan, elektronik, dll." />
            <Button type="submit" className="w-full">Posting Jadwal</Button>
        </form>
    );
}
