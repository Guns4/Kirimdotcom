'use server';

import { createClient } from '@/utils/supabase/server';
// import { compare, hash } from 'bcrypt'; 

// NOTE: You need to install bcrypt: npm install bcrypt && npm i --save-dev @types/bcrypt
// If bcrypt is problematic in Edge, use a pure JS alternative or Supabase Auth logic.
// For this script, we assume a compatible hashing library is available or standard bcrypt.

export async function verifyPin(plainPin: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Fetch Security Profile
    const { data: security } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!security) throw new Error('PIN not set');

    // 2. Check Lockout
    if (security.pin_locked_until && new Date(security.pin_locked_until) > new Date()) {
        const waitMin = Math.ceil((new Date(security.pin_locked_until).getTime() - new Date().getTime()) / 60000);
        throw new Error(`PIN Locked. Try again in ${waitMin} minutes.`);
    }

    // 3. Verify Hash (Using simple equality for demo if bcrypt missing, BUT PLS USE BCRYPT)
    // In real implementation: const valid = await compare(plainPin, security.transaction_pin_hash);

    // MOCK HASH CHECK (Replace with real bcrypt.compare)
    const valid = security.transaction_pin_hash === plainPin; // DANGEROUS! Replace with hash compare.

    if (!valid) {
        // Increment Attempts
        const newAttempts = (security.pin_attempts || 0) + 1;
        let updateData: any = { pin_attempts: newAttempts };

        // Lockout at 3rd failed attempt
        if (newAttempts >= 3) {
            const lockTime = new Date();
            lockTime.setHours(lockTime.getHours() + 1); // 1 Hour Lock
            updateData.pin_locked_until = lockTime.toISOString();
        }

        await supabase.from('user_security').update(updateData).eq('user_id', user.id);

        if (newAttempts >= 3) throw new Error('PIN Locked for 1 Hour due to too many failed attempts.');
        throw new Error(`Invalid PIN. ${3 - newAttempts} attempts remaining.`);
    }

    // 4. Reset Attempts on Success
    await supabase.from('user_security').update({
        pin_attempts: 0,
        pin_locked_until: null
    }).eq('user_id', user.id);

    return true;
}

export async function setPin(newPin: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Hash the PIN (Replace with await hash(newPin, 10))
    const hashed = newPin;

    await supabase.from('user_security').upsert({
        user_id: user.id,
        transaction_pin_hash: hashed,
        pin_attempts: 0,
        pin_locked_until: null
    });

    return { success: true };
}
