#!/bin/bash

# Setup Vendor Marketplace Module
echo "🚀 Setting up Vendor Marketplace (Gig Economy)..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_marketplace.sql
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Photographer', 'Designer', 'Admin', 'Packaging'
    description TEXT,
    portfolio_urls TEXT[],
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS vendor_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    delivery_days INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public profiles" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public services" ON vendor_services FOR SELECT USING (true);

-- Vendor manage own
CREATE POLICY "Vendors manage own profile" ON vendors 
    FOR ALL USING (auth.uid() = user_id);
    
CREATE POLICY "Vendors manage own services" ON vendor_services 
    FOR ALL USING (EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid()));
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/marketplace.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

export const getVendors = async (category?: string) => {
    const supabase = await createClient()
    let q = supabase.from('vendors').select('*, vendor_services(*)')
    
    if (category && category !== 'All') {
        q = q.eq('category', category)
    }
    
    const { data } = await q.order('rating', { ascending: false })
    return data || []
}

export const registerVendor = async (data: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { error } = await supabase.from('vendors').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        return { success: true }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating Marketplace UI..."
mkdir -p src/app/marketplace
mkdir -p src/components/marketplace

cat << 'EOF' > src/app/marketplace/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getVendors } from '@/app/actions/marketplace'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Camera, PenTool, Box, UserCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MarketplacePage() {
    const [vendors, setVendors] = useState<any[]>([])
    const [category, setCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadVendors()
    }, [category])

    const loadVendors = async () => {
        setLoading(true)
        const data = await getVendors(category)
        setVendors(data)
        setLoading(false)
    }

    const categories = [
        { id: 'All', label: 'Semua', icon: null },
        { id: 'Photographer', label: 'Foto Produk', icon: Camera },
        { id: 'Designer', label: 'Desain Logo', icon: PenTool },
        { id: 'Packaging', label: 'Supplier Packing', icon: Box },
        { id: 'Admin', label: 'Jasa Admin', icon: UserCheck },
    ]

    return (
        <div className="space-y-6 container-custom py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Seller Marketplace
                    </h1>
                    <p className="text-muted-foreground">Temukan jasa profesional untuk menumbuhkan bisnis Anda.</p>
                </div>
                <Button>Daftar sebagai Vendor</Button>
            </div>

            <Tabs defaultValue="All" onValueChange={setCategory}>
                <TabsList className="bg-white/50 backdrop-blur-sm border">
                    {categories.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                            {cat.icon && <cat.icon className="w-4 h-4" />}
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {loading ? (
                <div>Loading...</div>
            ) : vendors.length === 0 ? (
                <EmptyState title="Belum ada Vendor" description="Jadilah yang pertama membuka jasa di sini!" icon={UserCheck} />
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {vendors.map(vendor => (
                        <Card key={vendor.id} className="hover:shadow-lg transition-all border-indigo-50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary">{vendor.category}</Badge>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        {vendor.rating}
                                    </div>
                                </div>
                                <CardTitle className="text-xl mt-2">{vendor.business_name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {vendor.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {vendor.vendor_services?.slice(0, 2).map((svc: any) => (
                                        <div key={svc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                            <span>{svc.title}</span>
                                            <span className="font-semibold text-indigo-600">
                                                Rp {svc.price.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    <Button className="w-full mt-4" variant="outline">
                                        Lihat Profil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
EOF

echo "✅ Vendor Marketplace Setup Complete!"
