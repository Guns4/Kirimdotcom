#!/bin/bash

# Setup Customer CRM Module
echo "🚀 Setting up Customer CRM Module..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_crm.sql
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT, -- Normalized phone number
    email TEXT,
    address TEXT,
    city TEXT,
    total_spend NUMERIC DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    tags TEXT[], -- ['VIP', 'Blacklist', 'New']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, phone),
    UNIQUE(user_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_total_spend ON customers(total_spend);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customers" ON customers
    FOR ALL USING (auth.uid() = user_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/crm.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { safeAction } from '@/lib/safe-action'
import { z } from 'zod'

const CustomerSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    tags: z.array(z.string()).optional()
})

export const getCustomers = async (query = '') => {
    const supabase = await createClient()
    let q = supabase.from('customers').select('*').order('total_spend', { ascending: false })
    
    if (query) {
        q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    }
    
    const { data } = await q
    return data || []
}

export const upsertCustomerFromOrder = async (orderData: { name: string, phone: string, total: number }) => {
    // This is a helper to run when an Order is completed
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Simply check by phone (simplified logic)
    const { data: existing } = await supabase
        .from('customers')
        .select('id, total_spend, orders_count')
        .eq('user_id', user.id)
        .eq('phone', orderData.phone)
        .single()

    if (existing) {
        await supabase.from('customers').update({
            total_spend: (existing.total_spend || 0) + orderData.total,
            orders_count: (existing.orders_count || 0) + 1,
            last_order_at: new Date().toISOString()
        }).eq('id', existing.id)
    } else {
        await supabase.from('customers').insert({
            user_id: user.id,
            name: orderData.name,
            phone: orderData.phone,
            total_spend: orderData.total,
            orders_count: 1,
            last_order_at: new Date().toISOString()
        })
    }
}

export const addCustomer = async (data: z.infer<typeof CustomerSchema>) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')
        
        const { error } = await supabase.from('customers').insert({
            user_id: user.id,
            ...data
        })
        
        if (error) throw error
        revalidatePath('/dashboard/customers')
        return { success: true }
    })
}
EOF

# 3. Create UI
echo "🎨 Creating UI Components..."
mkdir -p src/components/crm
mkdir -p src/app/dashboard/customers

cat << 'EOF' > src/app/dashboard/customers/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { getCustomers } from '@/app/actions/crm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User, Trophy, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/badge'

export default function CRMDashboard() {
    const [customers, setCustomers] = useState<any[]>([])
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => loadCustomers(), 500)
        return () => clearTimeout(timer)
    }, [query])

    const loadCustomers = async () => {
        setIsLoading(true)
        const data = await getCustomers(query)
        setCustomers(data)
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Customer Database (CRM)</h1>
            
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Search by name or phone..." 
                        className="pl-9"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : customers.length === 0 ? (
                <EmptyState
                    title="No Customers Found"
                    description="Customers will appear here automatically when you create orders."
                    icon={User}
                />
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Orders</th>
                                <th className="p-4 font-medium">Total Spend</th>
                                <th className="p-4 font-medium">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {customers.map((c, i) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                            {c.name.substring(0,2)}
                                        </div>
                                        {c.name}
                                        {i < 3 && <Trophy className="w-3 h-3 text-yellow-500" />}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div>{c.phone || '-'}</div>
                                        <div className="text-xs">{c.email}</div>
                                    </td>
                                    <td className="p-4">{c.orders_count}</td>
                                    <td className="p-4 text-green-600 font-mono">
                                        Rp {Number(c.total_spend).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {Number(c.total_spend) > 1000000 ? (
                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">VIP</Badge>
                                        ) : (
                                            <Badge variant="outline">Regular</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
EOF

echo "✅ CRM Module Setup Complete!"
