'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface InsuranceResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Purchase insurance for a package
 */
export async function purchaseInsurance(
    trackingNumber: string,
    declaredValue: number,
    courier: string,
    destination: string,
    orderId?: string
): Promise<InsuranceResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Get default policy
        const { data: policy } = await supabase
            .from('insurance_policies')
            .select('*')
            .eq('policy_code', 'ALL_RISK_BASIC')
            .eq('is_active', true)
            .single();

        if (!policy) {
            return {
                success: false,
                message: 'No active policy found',
                error: 'NO_POLICY',
            };
        }

        // Calculate premium (1.5% of declared value)
        const premiumAmount = Math.round((declaredValue * policy.premium_rate / 100) * 100) / 100;
        const coverageAmount = Math.min(declaredValue, policy.max_coverage_amount);

        // Create insurance record
        const { data: insurance, error: createError } = await supabase
            .from('package_insurance')
            .insert({
                tracking_number: trackingNumber,
                order_id: orderId,
                user_id: user.id,
                policy_id: policy.id,
                declared_value: declaredValue,
                premium_paid: premiumAmount,
                coverage_amount: coverageAmount,
                courier: courier,
                destination: destination,
                status: 'active',
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            })
            .select()
            .single();

        if (createError) {
            console.error('Insurance creation error:', createError);
            return {
                success: false,
                message: 'Failed to purchase insurance',
                error: 'PURCHASE_FAILED',
            };
        }

        revalidatePath('/dashboard/insurance');

        return {
            success: true,
            message: 'Asuransi berhasil dibeli!',
            data: insurance,
        };
    } catch (error) {
        console.error('Error in purchaseInsurance:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * File a claim manually
 */
export async function fileInsuranceClaim(
    packageInsuranceId: string,
    claimType: 'lost' | 'damaged' | 'delayed',
    description: string,
    evidenceUrls: string[] = []
): Promise<InsuranceResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Get insurance details
        const { data: insurance } = await supabase
            .from('package_insurance')
            .select('*')
            .eq('id', packageInsuranceId)
            .eq('user_id', user.id)
            .single();

        if (!insurance) {
            return {
                success: false,
                message: 'Insurance not found',
                error: 'NOT_FOUND',
            };
        }

        if (insurance.status !== 'active') {
            return {
                success: false,
                message: 'Insurance is not active',
                error: 'NOT_ACTIVE',
            };
        }

        // Create claim
        const { data: claim, error: claimError } = await supabase
            .from('insurance_claims')
            .insert({
                package_insurance_id: packageInsuranceId,
                tracking_number: insurance.tracking_number,
                user_id: user.id,
                claim_type: claimType,
                claim_amount: insurance.coverage_amount,
                description: description,
                evidence_urls: evidenceUrls,
                auto_detected: false,
                status: 'pending',
            })
            .select()
            .single();

        if (claimError) {
            console.error('Claim creation error:', claimError);
            return {
                success: false,
                message: 'Failed to file claim',
                error: 'CLAIM_FAILED',
            };
        }

        // Update insurance status
        await supabase
            .from('package_insurance')
            .update({ status: 'claimed', claim_id: claim.id })
            .eq('id', packageInsuranceId);

        revalidatePath('/dashboard/insurance');

        return {
            success: true,
            message: 'Klaim berhasil diajukan!',
            data: claim,
        };
    } catch (error) {
        console.error('Error in fileInsuranceClaim:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Check tracking data for auto-claim conditions
 */
export async function checkAutoClaimConditions(
    trackingNumber: string,
    trackingData: any
): Promise<InsuranceResult> {
    try {
        const supabase = await createClient();

        // Get insurance for this tracking number
        const { data: insurance } = await supabase
            .from('package_insurance')
            .select('*')
            .eq('tracking_number', trackingNumber)
            .eq('status', 'active')
            .single();

        if (!insurance) {
            return {
                success: false,
                message: 'No active insurance for this package',
                error: 'NO_INSURANCE',
            };
        }

        // Check auto-claim conditions
        const { data: claimCheck } = await supabase
            .rpc('check_auto_claim_conditions', {
                p_tracking_number: trackingNumber,
                p_tracking_data: trackingData,
            });

        if (!claimCheck || !claimCheck[0]?.should_claim) {
            return {
                success: false,
                message: 'No claimable conditions detected',
                error: 'NO_CONDITIONS',
            };
        }

        const condition = claimCheck[0];

        // Auto-create claim
        const { data: claimId } = await supabase
            .rpc('auto_create_claim', {
                p_package_insurance_id: insurance.id,
                p_claim_type: condition.claim_type,
                p_reason: condition.reason,
                p_tracking_data: trackingData,
            });

        revalidatePath('/dashboard/insurance');

        return {
            success: true,
            message: 'Auto-claim created successfully',
            data: { claimId, reason: condition.reason },
        };
    } catch (error) {
        console.error('Error in checkAutoClaimConditions:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get user's insurance policies
 */
export async function getUserInsurancePolicies() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('package_insurance')
            .select('*, insurance_policies(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching policies:', error);
        return { data: null, error: 'Failed to fetch policies' };
    }
}

/**
 * Get user's claims
 */
export async function getUserClaims() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('insurance_claims')
            .select('*, package_insurance(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching claims:', error);
        return { data: null, error: 'Failed to fetch claims' };
    }
}

/**
 * Get available insurance policies
 */
export async function getAvailablePolicies() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('insurance_policies')
            .select('*')
            .eq('is_active', true)
            .order('premium_rate', { ascending: true });

        return { data, error };
    } catch (error) {
        console.error('Error fetching available policies:', error);
        return { data: null, error: 'Failed to fetch policies' };
    }
}

/**
 * Format currency
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
