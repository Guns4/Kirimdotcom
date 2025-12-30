'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTrip(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const origin = formData.get('origin') as string;
    const destination = formData.get('destination') as string;
    const date = formData.get('date') as string;
    const capacity = Number(formData.get('capacity'));
    const price = Number(formData.get('price')) || 0;
    const wa = formData.get('wa') as string;
    const notes = formData.get('notes') as string;

    const { error } = await (supabase as any).from('jastip_trips').insert({
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

export async function getTrips(filters?: { from?: string; to?: string }) {
    const supabase = await createClient();
    let query = (supabase as any)
        .from('jastip_trips')
        .select('*, profiles:traveler_id(full_name, avatar_url)')
        .eq('status', 'open')
        .order('departure_date', { ascending: true });

    if (filters?.from) query = query.ilike('origin_city', `%${filters.from}%`);
    if (filters?.to) query = query.ilike('destination_city', `%${filters.to}%`);

    const { data } = await query;
    return data || [];
}
