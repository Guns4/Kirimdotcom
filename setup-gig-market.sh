#!/bin/bash

# =============================================================================
# Service Economy: Gig Market Setup
# =============================================================================

echo "Initializing Gig Market..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: gig_market_schema.sql"
cat <<EOF > gig_market_schema.sql
-- Gigs Table (Services Offered)
CREATE TABLE IF NOT EXISTS public.gigs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    rate_per_hour DECIMAL(19,4) NOT NULL,
    city TEXT NOT NULL,
    skills TEXT[], -- ['packing', 'admin', 'driver']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig Bookings (Escrow System)
CREATE TABLE IF NOT EXISTS public.gig_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gig_id UUID REFERENCES public.gigs(id),
    client_id UUID REFERENCES auth.users(id),
    freelancer_id UUID REFERENCES auth.users(id),
    hours INTEGER NOT NULL,
    total_amount DECIMAL(19,4) NOT NULL,
    status TEXT DEFAULT 'PENDING_ESCROW', -- PENDING_ESCROW, IN_PROGRESS, COMPLETED, DISPUTED, CANCELLED
    escrow_held_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

# 2. UI Components
echo "2. Creating Components..."
mkdir -p src/app/services

# Service Listing Page
cat <<EOF > src/app/services/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Search, Star, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function GigMarketPage() {
    const [gigs, setGigs] = useState<any[]>([]);
    const [city, setCity] = useState('');
    const supabase = createClient();

    useEffect(() => {
        loadGigs();
    }, []);

    async function loadGigs() {
        let query = supabase.from('gigs').select('*, freelancer:freelancer_id(email)').eq('is_active', true);
        if (city) query = query.ilike('city', \`%\${city}%\`);
        
        const { data } = await query;
        if (data) setGigs(data);
    }

    async function handleBook(gig: any) {
        const hours = 5; // Simplified for demo
        const total = gig.rate_per_hour * hours;
        
        if (!confirm(\`Booking \${gig.title} untuk 5 jam seharga Rp \${total.toLocaleString('id-ID')}? Saldo akan ditahan sementara (Escrow).\`)) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return toast.error('Login required');

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
            toast.success('Booking Berhasil! Uang aman di Escrow.');
        } catch (e: any) {
            toast.error('Booking Gagal: ' + e.message);
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pasar Tenaga Lepas</h1>
                    <p className="text-gray-500">Cari bantuan packing, admin, atau kurir fleksibel.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Filter Kota..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onBlur={loadGigs}
                        />
                    </div>
                    <button onClick={loadGigs} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gigs.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
                        Belum ada tenaga lepas di lokasi ini.
                    </div>
                ) : gigs.map(gig => (
                    <div key={gig.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg">{gig.title}</h3>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                Rp {gig.rate_per_hour.toLocaleString('id-ID')}/jam
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4" /> {gig.city}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {gig.skills?.map((skill: string) => (
                                <span key={skill} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{skill}</span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                Garansi Escrow
                            </div>
                            <button 
                                onClick={() => handleBook(gig)}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                            >
                                Booking
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Gig Market Setup Complete!"
echo "1. Run 'gig_market_schema.sql'."
echo "2. Visit '/services' to browse gigs."
