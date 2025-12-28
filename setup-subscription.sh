#!/bin/bash

# =============================================================================
# Setup Subscription Tier System (Phase 96)
# Monetization & Gating Logic
# =============================================================================

echo "Setting up Subscription Logic..."
echo "================================================="
echo ""

# Ensure directories exist
mkdir -p src/lib
mkdir -p src/app/actions

# 1. Database Schema
echo "1. Generating SQL Schema..."
echo "   [!] Run this in Supabase SQL Editor:"

cat <<EOF > subscription_schema.sql
-- Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id text PRIMARY KEY, -- e.g., 'free', 'pro_monthly', 'pro_yearly'
    name text NOT NULL,
    price integer NOT NULL, -- in IDR
    interval text NOT NULL, -- 'month' or 'year'
    limits jsonb NOT NULL, -- e.g. {"check_resi": 10, "export_excel": false, "api_access": false}
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    user_id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
    plan_id text REFERENCES public.subscription_plans(id) NOT NULL,
    status text NOT NULL, -- 'active', 'canceled', 'past_due'
    starts_at timestamp with time zone DEFAULT now(),
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Data (Example Plans)
INSERT INTO public.subscription_plans (id, name, price, interval, limits) VALUES
('free', 'Gratis', 0, 'month', '{"check_resi": 5, "export_excel": false, "api_access": false}'),
('pro', 'Pro Seller', 99000, 'month', '{"check_resi": 500, "export_excel": true, "api_access": false}'),
('business', 'Business', 299000, 'month', '{"check_resi": 10000, "export_excel": true, "api_access": true}')
ON CONFLICT (id) DO NOTHING;

EOF
echo "   [?] subscription_schema.sql created."
echo ""

# 2. Logic (Middleware/Utility)
echo "2. Creating Logic: src/lib/subscription.ts"
# We reuse existing 'tracking' logic if we have daily counts, otherwise we'd need a usage counter.
# For this script, we assume 'analytics_events' can be queried for usage.

cat <<EOF > src/lib/subscription.ts
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export type PlanFeature = 'check_resi' | 'export_excel' | 'api_access';

export async function checkLimit(feature: PlanFeature): Promise<{ allowed: boolean; limit?: number; usage?: number; upgradeUrl?: string }> {
    const supabase = await createClient();
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: false, upgradeUrl: '/login' };

    // 2. Get Subscription
    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status, ends_at, subscription_plans ( limits )')
        .eq('user_id', user.id)
        .single();
    
    // Default to Free if no sub found or expired
    let limits: any = { check_resi: 5, export_excel: false, api_access: false }; // fallback hardcoded free limits
    let isExpired = true;

    if (sub && sub.subscription_plans) {
        // Check expiration
        if (sub.ends_at && new Date(sub.ends_at) > new Date()) {
             limits = (sub.subscription_plans as any).limits;
             isExpired = false;
        }
    }

    // 3. Check Boolean Features
    if (typeof limits[feature] === 'boolean') {
        if (limits[feature] === true) return { allowed: true };
        return { allowed: false, upgradeUrl: '/pricing' };
    }

    // 4. Check Numeric Limits (e.g. Daily Usage)
    if (typeof limits[feature] === 'number') {
        // Count usage today
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        // This query depends on where you log usage. Example: 'analytics_events'
        // If feature is 'check_resi', count 'click_cek_resi' events today
        const eventName = feature === 'check_resi' ? 'click_cek_resi' : 'unknown';
        
        // Note: You need an analytics_events table or similar to track usage
        try {
            const { count, error } = await (supabase as any)
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_name', eventName)
                .eq('user_id', user.id)
                .gte('created_at', startOfDay.toISOString());
            
            if (error) {
                 // If table doesn't exist, ignore and allow (soft fail) or deny
                 console.warn('Analytics check failed', error);
                 return { allowed: true, limit: limits[feature], usage: 0 };
            }

            const usage = count || 0;
            const max = limits[feature];

            if (usage < max) return { allowed: true, limit: max, usage };
            return { allowed: false, limit: max, usage, upgradeUrl: '/pricing' };
        } catch (e) {
            return { allowed: true }; // Fail open if analytics missing
        }
    }

    return { allowed: true }; // Unknown feature, allow by default? Or fail based on policy.
}
EOF
echo "   [?] src/lib/subscription.ts created."
echo ""

# 3. Actions (Handling Downgrade)
echo "3. Creating Actions: src/app/actions/subscriptionActions.ts"

cat <<EOF > src/app/actions/subscriptionActions.ts
'use server'

import { createClient } from '@/utils/supabase/server';

export async function checkSubscriptionStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if expired
    const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (sub && sub.status === 'active') {
        if (sub.ends_at && new Date(sub.ends_at) < new Date()) {
            // Expired! Downgrade to free (or just mark status as expired)
            await supabase
                .from('user_subscriptions')
                .update({ status: 'expired' })
                .eq('user_id', user.id);
            
            // Optional: Send email notification
        }
    }
}
EOF
echo "   [?] src/app/actions/subscriptionActions.ts created."
echo ""

# Instructions
echo "Next Steps:"
echo "1. Run the SQL in 'subscription_schema.sql' via Supabase Dashboard."
echo "2. Use 'await checkLimit(\"check_resi\")' in your server components/actions."
echo ""

echo "================================================="
echo "Setup Complete!"
