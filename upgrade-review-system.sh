#!/bin/bash

# =============================================================================
# Upgrade Review System (Phase 136)
# Review Integrity & Verified Badges
# =============================================================================

echo "Upgrading Review System..."
echo "================================================="
echo ""

# 1. Server Actions (Verification Logic)
echo "1. Creating Action: src/app/actions/reviewActions.ts"
mkdir -p src/app/actions

cat <<EOF > src/app/actions/reviewActions.ts
'use server';

import { createClient } from '@/utils/supabase/server';

export interface VerificationResult {
    isVerified: boolean;
    lastTrackingDate?: string;
}

export async function verifyReviewEligibility(courierCode: string): Promise<VerificationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { isVerified: false };

    // Check tracking history for this courier in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('tracking_history')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('courier_code', courierCode) // Ensure courier_code column exists in tracking_history
        .gte('created_at', thirtyDaysAgo)
        .limit(1)
        .single();

    if (error || !data) {
        return { isVerified: false };
    }

    return { 
        isVerified: true, 
        lastTrackingDate: data.created_at 
    };
}
EOF
echo "   [✓] reviewActions.ts created."
echo ""

# 2. Verified Badge Component
echo "2. Creating Component: src/components/reviews/VerifiedBadge.tsx"
mkdir -p src/components/reviews

cat <<EOF > src/components/reviews/VerifiedBadge.tsx
'use client';

import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
    className?: string;
}

export function VerifiedBadge({ className = '' }: VerifiedBadgeProps) {
    return (
        <div className={\`flex items-center gap-1 text-blue-400 \${className}\`} title="Verified Customer">
            <BadgeCheck className="w-4 h-4 fill-blue-400/10" />
            <span className="text-xs font-semibold">Verified Customer</span>
        </div>
    );
}
EOF
echo "   [✓] VerifiedBadge component created."
echo ""

# 3. Database Schema
echo "3. Generating SQL Schema..."
cat <<EOF > review_integrity_schema.sql
-- Add is_verified column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Index for filtering verified reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified 
ON public.reviews(is_verified) 
WHERE is_verified = true;
EOF
echo "   [✓] review_integrity_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run review_integrity_schema.sql in Supabase."
echo "2. Use verifyReviewEligibility() in your ReviewForm component."
echo "3. Pass 'isVerified: true' when inserting the review if valid."
