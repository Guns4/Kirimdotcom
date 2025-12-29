#!/bin/bash

# =============================================================================
# Gig Economy: Jastip (Jasa Titip) Board
# =============================================================================

echo "Initializing Jastip Board..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: jastip_schema.sql"
cat <<EOF > jastip_schema.sql
-- Table: jastip_trips
create table if not exists public.jastip_trips (
  id uuid default gen_random_uuid() primary key,
  traveler_id uuid references auth.users(id) on delete cascade not null,
  
  -- Route
  origin_city text not null,
  destination_city text not null,
  
  -- Schedule
  departure_date date not null,
  return_date date, -- Optional if one way
  
  -- Capacity
  capacity_kg integer default 5,
  price_per_kg integer default 0, -- 0 = Negotiable
  
  -- Details
  notes text,
  whatsapp_number text not null, -- For direct booking
  
  -- Status
  status text default 'open', -- 'open', 'full', 'completed'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for search
create index idx_jastip_route on public.jastip_trips(origin_city, destination_city);
create index idx_jastip_date on public.jastip_trips(departure_date);

-- RLS
alter table public.jastip_trips enable row level security;

create policy "Public can view open trips"
  on public.jastip_trips for select
  using (status = 'open');

create policy "Users can post trips"
  on public.jastip_trips for insert
  with check (auth.uid() = traveler_id);

create policy "Travelers can manage own trips"
  on public.jastip_trips for update
  using (auth.uid() = traveler_id);
EOF

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/jastip.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/jastip.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTrip(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const origin = formData.get('origin') as string;
  const destination = formData.get('destination') as string;
  const date = formData.get('date') as string;
  const capacity = Number(formData.get('capacity'));
  const price = Number(formData.get('price'));
  const wa = formData.get('wa') as string;
  const notes = formData.get('notes') as string;

  const { error } = await supabase.from('jastip_trips').insert({
    traveler_id: user.id,
    origin_city: origin,
    destination_city: destination,
    departure_date: date,
    capacity_kg: capacity,
    price_per_kg: price,
    whatsapp_number: wa,
    notes: notes,
    status: 'open'
  });

  if (error) {
      console.error(error);
      return { error: 'Gagal posting trip.' };
  }

  revalidatePath('/jastip');
  return { success: true };
}

export async function getTrips(filters?: { from?: string, to?: string }) {
  const supabase = createClient();
  let query = supabase
    .from('jastip_trips')
    .select('*, profiles(full_name, avatar_url)') // Assuming profiles relation view
    .eq('status', 'open')
    .order('departure_date', { ascending: true });

  if (filters?.from) query = query.ilike('origin_city', \`%\${filters.from}%\`);
  if (filters?.to) query = query.ilike('destination_city', \`%\${filters.to}%\`);

  const { data } = await query;
  return data || [];
}
EOF

# 3. UI Components
echo "3. Creating UI: src/components/jastip..."
mkdir -p src/components/jastip

# Trip List Card
cat <<EOF > src/components/jastip/TripList.tsx
import { getTrips } from '@/app/actions/jastip';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export async function TripList({ from, to }: { from?: string, to?: string }) {
  const trips = await getTrips({ from, to });

  if (trips.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">Tidak ada jadwal jastip rute ini.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip: any) => (
        <Card key={trip.id} className="p-4 flex flex-col gap-4 border-2 hover:border-primary/50 transition-colors">
            {/* Header: Route */}
            <div className="flex items-center gap-2 text-lg font-bold">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-red-500" /> {trip.origin_city}</span>
                <span className="text-muted-foreground">→</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-green-500" /> {trip.destination_city}</span>
            </div>

            {/* Date & Capacity */}
            <div className="flex justify-between text-sm text-muted-foreground bg-muted p-2 rounded-lg">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.departure_date}</span>
                <Badge variant="outline">Sisa {trip.capacity_kg} Kg</Badge>
            </div>

            {/* Traveler & Note */}
            <div>
               <p className="font-medium text-sm">Traveler: {trip.profiles?.full_name || 'User'}</p>
               <p className="text-xs text-muted-foreground line-clamp-2 italic">"{trip.notes || 'Bisa titip apa saja asal legal.'}"</p>
            </div>
            
            {/* Pricing */}
            <div className="font-mono font-bold text-primary">
                {trip.price_per_kg ? \`Rp \${trip.price_per_kg.toLocaleString()}/kg\` : 'Harga Nego'}
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2">
                <Button className="w-full bg-green-600 hover:bg-green-700 relative" asChild>
                    <a href={\`https://wa.me/\${trip.whatsapp_number}?text=Halo, saya mau titip barang dari \${trip.origin_city} ke \${trip.destination_city} tanggal \${trip.departure_date}\`} target="_blank">
                        <Phone className="w-4 h-4 mr-2" /> Titip Barang
                    </a>
                </Button>
            </div>
            
            {/* Safety Tip */}
            <div className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 bg-yellow-500/10 p-1 rounded">
                <ShieldCheck className="w-3 h-3 text-yellow-600" /> 
                Gunakan <Link href="/pay/create" className="underline font-bold text-yellow-600">Rekber</Link> agar aman.
            </div>
        </Card>
      ))}
    </div>
  );
}
EOF

# Post Form
cat <<EOF > src/components/jastip/PostTripForm.tsx
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
EOF

echo ""
echo "================================================="
echo "Jastip Board Ready!"
echo "1. Run 'jastip_schema.sql' in Supabase."
echo "2. Import <TripList /> for the board view."
echo "3. Import <PostTripForm /> for the traveler view."
