'use server';

import { createClient } from '@/utils/supabase/server';
import { sha256 } from '@/lib/hash'; // Reuse existing hash lib? No, it's client side. We need server side hash or trust client hash?
// Better to trust client hash for privacy if we don't want raw phone on server.
// But for OTP, we need raw phone to send SMS (mocked).
// So flow:
// 1. Client sends Raw Phone for OTP.
// 2. Server sends OTP (Mock).
// 3. Client verifies OTP.
// 4. Client submits Dispute with Phone Hash (generated client side) + Verification Token.

// Simulation Store (In-Memory for demo, use Redis/DB in prod)
const otpStore = new Map<string, string>();

export interface RequestOtpResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function requestDisputeOtp(
  rawPhone: string
): Promise<RequestOtpResult> {
  // 1. Validate phone
  if (!rawPhone || rawPhone.length < 10) {
    return { success: false, error: 'Nomor HP tidak valid' };
  }

  // 2. Generate Mock OTP
  const otp = '123456'; // Fixed for demo/testing
  otpStore.set(rawPhone, otp);

  // 3. Log (Simulate SMS sending)
  console.log(`[MOCK SMS] OTP for ${rawPhone}: ${otp}`);

  return {
    success: true,
    message: 'OTP telah dikirim via WhatsApp/SMS (Cek Console: 123456)',
  };
}

export interface VerifyOtpResult {
  success: boolean;
  token?: string; // Simple token to prove verification
  error?: string;
}

export async function verifyDisputeOtp(
  rawPhone: string,
  otp: string
): Promise<VerifyOtpResult> {
  const storedOtp = otpStore.get(rawPhone);

  if (storedOtp === otp) {
    otpStore.delete(rawPhone); // Clear used OTP
    return {
      success: true,
      token: `verified_${Date.now()}_${rawPhone.slice(-4)}`,
    };
  }

  return { success: false, error: 'Kode OTP salah' };
}

export interface SubmitDisputeResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitDispute(
  phoneHash: string,
  reason: string,
  contactInfo: string,
  proofUrl?: string
): Promise<SubmitDisputeResult> {
  const supabase = (await createClient()) as any;

  try {
    const { error } = await supabase.from('cod_disputes').insert({
      phone_hash: phoneHash,
      reason: reason,
      contact_info: contactInfo,
      proof_url: proofUrl,
      otp_verified: true, // Assumed true if they reached this step in UI (protected by state)
      status: 'Pending',
    });

    if (error) throw error;

    return {
      success: true,
      message:
        'Permintaan pemutihan berhasil dikirim. Kami akan meninjau dalam 1x24 jam.',
    };
  } catch (error) {
    console.error('Submit dispute error:', error);
    return { success: false, error: 'Gagal mengirim permintaan.' };
  }
}

// --- Admin Actions ---

export async function getDisputes() {
  const supabase = (await createClient()) as any;

  // In real app, check if user is admin here
  // const { data: { user } } = await supabase.auth.getUser()
  // if (user?.role !== 'admin') throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('cod_disputes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function updateDisputeStatus(
  id: string,
  status: 'Approved' | 'Rejected',
  phoneHash: string
) {
  const supabase = (await createClient()) as any;

  try {
    // 1. Update dispute status
    const { error } = await supabase
      .from('cod_disputes')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    // 2. If approved, clear the report count in reported_buyers
    if (status === 'Approved') {
      await supabase
        .from('reported_buyers')
        .delete()
        .eq('phone_hash', phoneHash);

      // Or alternatively, set report_count to 0 if we want to keep the record but clean it
      // .update({ report_count: 0 })
    }

    return { success: true };
  } catch (error) {
    console.error('Update dispute error:', error);
    return { success: false, error: 'Gagal mengupdate status' };
  }
}
