'use server';

import { createClient } from '@/utils/supabase/server';
import { compare, hash } from 'bcryptjs';

export async function verifyPin(plainPin: string) {
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 1. Fetch Security Profile
    const { data: security } = await supabase
        .from('user_security')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!security || !security.transaction_pin_hash) throw new Error('PIN not set');

    // 2. Check Lockout
    if (security.pin_locked_until && new Date(security.pin_locked_until) > new Date()) {
        const waitMin = Math.ceil((new Date(security.pin_locked_until).getTime() - Date.now()) / 60000);
        throw new Error(`PIN Locked. Try again in ${waitMin} minutes.`);
    }

    // 3. Verify Hash
    const valid = await compare(plainPin, security.transaction_pin_hash);

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
        throw new Error('PIN must be 6 digits.');
    }

    const hashed = await hash(newPin, 10);

    await supabase.from('user_security').upsert({
        user_id: user.id,
        transaction_pin_hash: hashed,
        pin_attempts: 0,
        pin_locked_until: null,
        updated_at: new Date().toISOString()
    });

    return { success: true };
}
