#!/bin/bash

# Setup Freight Forwarder Marketplace
echo "🚀 Setting up Freight Forwarder Marketplace..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_freight.sql
CREATE TABLE IF NOT EXISTS freight_forwarders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    services TEXT[], -- ['LCL', 'FCL', 'Air Freight', 'Express']
    routes TEXT[], -- ['China-Indonesia', 'USA-Indonesia', etc]
    logo_url TEXT,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS freight_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    forwarder_id UUID REFERENCES freight_forwarders(id),
    origin_port TEXT NOT NULL,
    destination_port TEXT NOT NULL,
    cargo_type TEXT NOT NULL, -- 'LCL', 'FCL_20', 'FCL_40', 'FCL_40HC'
    commodity TEXT,
    weight_kg NUMERIC,
    volume_cbm NUMERIC,
    quoted_price NUMERIC,
    currency TEXT DEFAULT 'USD',
    transit_days INTEGER,
    valid_until TIMESTAMPTZ,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freight_routes ON freight_forwarders USING GIN(routes);
CREATE INDEX IF NOT EXISTS idx_freight_services ON freight_forwarders USING GIN(services);

-- RLS
ALTER TABLE freight_forwarders ENABLE ROW LEVEL SECURITY;
ALTER TABLE freight_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read forwarders" ON freight_forwarders FOR SELECT USING (true);
CREATE POLICY "Users manage own quotes" ON freight_quotes FOR ALL USING (auth.uid() = user_id);

-- Seed Freight Forwarders
INSERT INTO freight_forwarders (company_name, email, phone, services, routes, is_verified, rating, reviews_count) VALUES
('Pacific Freight Solutions', 'info@pacificfreight.com', '+62-21-5551234', 
 ARRAY['LCL', 'FCL', 'Air Freight'], 
 ARRAY['China-Indonesia', 'Singapore-Indonesia', 'Japan-Indonesia'], 
 true, 4.7, 89),

('Global Cargo Express', 'sales@globalcargo.com', '+62-21-5555678', 
 ARRAY['LCL', 'FCL', 'Express'], 
 ARRAY['USA-Indonesia', 'Europe-Indonesia', 'Dubai-Indonesia'], 
 true, 4.5, 67),

('Asia Shipping Lines', 'contact@asiashipping.com', '+62-21-5559999', 
 ARRAY['FCL', 'LCL'], 
 ARRAY['China-Indonesia', 'Taiwan-Indonesia', 'Korea-Indonesia'], 
 true, 4.8, 124),

('Sky Cargo International', 'info@skycargo.com', '+62-21-5552222', 
 ARRAY['Air Freight', 'Express'], 
 ARRAY['Worldwide'], 
 true, 4.6, 45)
ON CONFLICT DO NOTHING;
EOF

# 2. Create Server Actions
echo "⚡ Creating Freight Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/freight.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const getFreightForwarders = async (filters?: {
    service?: string
    route?: string
}) => {
    const supabase = await createClient()
    let query = supabase
        .from('freight_forwarders')
        .select('*')
        .eq('is_verified', true)

    if (filters?.service) {
        query = query.contains('services', [filters.service])
    }

    if (filters?.route) {
        query = query.contains('routes', [filters.route])
    }

    const { data } = await query.order('rating', { ascending: false })
    return data || []
}

export const requestQuote = async (quoteData: {
    forwarderId: string
    originPort: string
    destinationPort: string
    cargoType: string
    commodity: string
    weight: number
    volume: number
    notes?: string
}) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('freight_quotes').insert({
            user_id: user.id,
            forwarder_id: quoteData.forwarderId,
            origin_port: quoteData.originPort,
            destination_port: quoteData.destinationPort,
            cargo_type: quoteData.cargoType,
            commodity: quoteData.commodity,
            weight_kg: quoteData.weight,
            volume_cbm: quoteData.volume,
            notes: quoteData.notes
        })

        if (error) throw error
        return { success: true }
    })
}

export const getMyQuotes = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('freight_quotes')
        .select('*, freight_forwarders(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}
EOF

# 3. Create Freight Marketplace UI
echo "🎨 Creating Freight Marketplace..."
mkdir -p src/app/freight
cat << 'EOF' > src/app/freight/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getFreightForwarders, requestQuote } from '@/app/actions/freight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ship, Star, Package, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function FreightMarketplacePage() {
    const [forwarders, setForwarders] = useState<any[]>([])
    const [selectedForwarder, setSelectedForwarder] = useState<any>(null)
    const [quoteForm, setQuoteForm] = useState({
        originPort: '',
        destinationPort: '',
        cargoType: 'LCL',
        commodity: '',
        weight: '',
        volume: '',
        notes: ''
    })

    useEffect(() => {
        loadForwarders()
    }, [])

    const loadForwarders = async () => {
        const data = await getFreightForwarders()
        setForwarders(data)
    }

    const handleRequestQuote = async () => {
        if (!selectedForwarder) return

        try {
            const result = await requestQuote({
                forwarderId: selectedForwarder.id,
                originPort: quoteForm.originPort,
                destinationPort: quoteForm.destinationPort,
                cargoType: quoteForm.cargoType,
                commodity: quoteForm.commodity,
                weight: parseFloat(quoteForm.weight),
                volume: parseFloat(quoteForm.volume),
                notes: quoteForm.notes
            })

            if (result?.success) {
                toast.success('Quote request sent! Forwarder akan menghubungi Anda.')
                setSelectedForwarder(null)
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to request quote')
        }
    }

    return (
        <div className="container-custom py-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-2xl">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Ship className="w-8 h-8" />
                    Freight Forwarder Marketplace
                </h1>
                <p className="mt-2 opacity-90">
                    Untuk importir & eksportir. Bandingkan harga kirim kontainer LCL/FCL dari berbagai forwarder.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forwarders.map(forwarder => (
                    <Card key={forwarder.id} className="hover:shadow-lg transition-all">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-start justify-between">
                                <div>
                                    {forwarder.company_name}
                                    {forwarder.is_verified && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    {forwarder.rating}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Services:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {forwarder.services.map((svc: string) => (
                                        <span key={svc} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                                            {svc}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">Popular Routes:</p>
                                <p className="text-sm mt-1">{forwarder.routes.slice(0, 2).join(', ')}</p>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="w-full gap-2 mt-3"
                                        onClick={() => setSelectedForwarder(forwarder)}
                                    >
                                        <Send className="w-4 h-4" />
                                        Request Quote
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Quote - {forwarder.company_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Origin Port</label>
                                                <Input 
                                                    placeholder="e.g. Shanghai"
                                                    value={quoteForm.originPort}
                                                    onChange={e => setQuoteForm({...quoteForm, originPort: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Destination Port</label>
                                                <Input 
                                                    placeholder="e.g. Jakarta"
                                                    value={quoteForm.destinationPort}
                                                    onChange={e => setQuoteForm({...quoteForm, destinationPort: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Cargo Type</label>
                                            <Select 
                                                value={quoteForm.cargoType} 
                                                onValueChange={v => setQuoteForm({...quoteForm, cargoType: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LCL">LCL (Less than Container Load)</SelectItem>
                                                    <SelectItem value="FCL_20">FCL 20ft</SelectItem>
                                                    <SelectItem value="FCL_40">FCL 40ft</SelectItem>
                                                    <SelectItem value="FCL_40HC">FCL 40ft High Cube</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Commodity</label>
                                            <Input 
                                                placeholder="e.g. Electronics, Garments"
                                                value={quoteForm.commodity}
                                                onChange={e => setQuoteForm({...quoteForm, commodity: e.target.value})}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Weight (kg)</label>
                                                <Input 
                                                    type="number"
                                                    placeholder="1000"
                                                    value={quoteForm.weight}
                                                    onChange={e => setQuoteForm({...quoteForm, weight: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Volume (CBM)</label>
                                                <Input 
                                                    type="number"
                                                    placeholder="10"
                                                    value={quoteForm.volume}
                                                    onChange={e => setQuoteForm({...quoteForm, volume: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <Button onClick={handleRequestQuote} className="w-full">
                                            Send Quote Request
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
EOF

echo "✅ Freight Forwarder Marketplace Setup Complete!"
echo "🚢 Importir dapat request quote untuk pengiriman kontainer LCL/FCL!"
