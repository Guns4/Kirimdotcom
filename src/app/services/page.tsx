'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Search, Star, ShieldCheck, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Gig {
    id: string;
    title: string;
    rate_per_hour: number;
    city: string;
    skills: string[];
    freelancer_id: string;
}

export default function GigMarketPage() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadGigs();
    }, []);

    async function loadGigs() {
        setLoading(true);
        // Mock query - in real app would join profile
        let query = supabase.from('gigs').select('*').eq('is_active', true);
        if (city) query = query.ilike('city', `%${city}%`);

        const { data } = await query;
        if (data) setGigs(data);
        setLoading(false);
    }

    async function handleBook(gig: Gig) {
        const hours = 5; // Simplified for demo
        const total = gig.rate_per_hour * hours;

        if (!confirm(`Booking "${gig.title}" untuk 5 jam seharga Rp ${total.toLocaleString('id-ID')}? Saldo akan ditahan sementara (Escrow).`)) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Harap login untuk membooking');
                return;
            }

            // 1. Create Booking (Escrow)
            const { error } = await supabase.from('gig_bookings').insert({
                gig_id: gig.id,
                client_id: user.id,
                freelancer_id: gig.freelancer_id,
                hours: hours,
                total_amount: total,
                status: 'IN_PROGRESS', // Assume payment success immediately for demo
                escrow_held_at: new Date().toISOString()
            });

            if (error) throw error;
            toast.success('Booking Berhasil! Uang aman di Escrow.', {
                description: 'Pekerja akan diberitahu segera.'
            });
        } catch (e: any) {
            toast.error('Booking Gagal: ' + e.message);
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pasar Tenaga Lepas</h1>
                    <p className="text-gray-500">Cari bantuan packing, admin, atau kurir fleksibel di kota Anda.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter Kota (e.g. Jakarta)..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadGigs()}
                        />
                    </div>
                    <button onClick={loadGigs} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Belum ada tenaga lepas di lokasi ini.</p>
                            <button className="mt-4 text-blue-600 font-medium hover:underline text-sm" onClick={() => setCity('')}>
                                Tampilkan Semua
                            </button>
                        </div>
                    ) : gigs.map(gig => (
                        <div key={gig.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{gig.title}</h3>
                                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                    Rp {gig.rate_per_hour.toLocaleString('id-ID')}<span className="font-normal text-green-600">/hr</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded w-fit">
                                <MapPin className="w-4 h-4 text-gray-400" /> {gig.city}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {gig.skills?.slice(0, 3).map((skill: string) => (
                                    <span key={skill} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 capitalize">
                                        {skill.replace('-', ' ')}
                                    </span>
                                ))}
                                {(gig.skills?.length || 0) > 3 && (
                                    <span className="text-xs text-gray-400 self-center">+{gig.skills!.length - 3}</span>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Garansi Escrow
                                </div>
                                <button
                                    onClick={() => handleBook(gig)}
                                    className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition active:scale-95 shadow-sm"
                                >
                                    Booking
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
