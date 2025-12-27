#!/bin/bash

# Setup Referral System Module
echo "🚀 Setting up Referral System 2.0..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_referrals.sql
-- Add ref code to profiles if not exists (assuming profiles table exists, otherwise creating separate)
CREATE TABLE IF NOT EXISTS user_referrals (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by UUID REFERENCES auth.users(id), -- Who invited this user
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id),
    referee_id UUID REFERENCES auth.users(id),
    amount_paid NUMERIC,
    commission_earned NUMERIC, -- 20%
    status TEXT DEFAULT 'PAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referral data" ON user_referrals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own conversions" ON referral_conversions FOR ALL USING (auth.uid() = referrer_id);
EOF

# 2. Create Server Actions
echo "⚡ Creating Server Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/referral.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { nanoid } from 'nanoid'

export const getReferralData = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    let { data: refData } = await supabase.from('user_referrals').select('*').eq('user_id', user.id).single()

    // Generate Code if none
    if (!refData) {
        const code = nanoid(8).toUpperCase()
        const { data, error } = await supabase.from('user_referrals').insert({
            user_id: user.id,
            referral_code: code
        }).select().single()
        
        if (!error) refData = data
    }

    // Get Stats
    const { count } = await supabase.from('referral_conversions').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
    const { data: earnings } = await supabase.from('referral_conversions').select('commission_earned').eq('referrer_id', user.id)
    
    const totalEarnings = earnings?.reduce((acc, curr) => acc + (Number(curr.commission_earned) || 0), 0) || 0

    return {
        code: refData?.referral_code,
        link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cekkirim.com'}?ref=${refData?.referral_code}`,
        total_referred: count || 0,
        total_earnings: totalEarnings
    }
}
EOF

# 3. Create Hook to Track Referral on Sign Up (Simplified Concept)
# Logic: Check cookies for 'ref_code' -> Save to 'user_referrals.referred_by' on auth sign up.

# 4. Create UI
echo "🎨 Creating Affiliate Dashboard..."
mkdir -p src/components/dashboard
cat << 'EOF' > src/components/dashboard/AffiliateCard.tsx
'use client'

import { useEffect, useState } from 'react'
import { getReferralData } from '@/app/actions/referral'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Users, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export function AffiliateCard() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        getReferralData().then(setData)
    }, [])

    if (!data) return null

    const copyLink = () => {
        navigator.clipboard.writeText(data.link)
        toast.success('Link referral disalin!')
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <DollarSign className="w-5 h-5" /> Affiliate Program
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                    Ajak teman pakai Premium dan dapatkan komisi <span className="text-white font-bold">20% selamanya</span>.
                </p>
                
                <div className="flex gap-2">
                    <Input value={data.link} readOnly className="bg-black/20 border-white/10 text-white" />
                    <Button variant="secondary" onClick={copyLink}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                        <div className="text-xl font-bold">{data.total_referred}</div>
                        <div className="text-xs text-gray-400">Teman Diajak</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                        <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-400" />
                        <div className="text-xl font-bold">Rp {data.total_earnings.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Komisi Cair</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
EOF

echo "✅ Referral System Setup Complete!"
