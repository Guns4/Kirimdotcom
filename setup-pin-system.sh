#!/bin/bash

# =============================================================================
# Security: Transaction PIN System
# =============================================================================

echo "Initializing PIN Security System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: pin_schema.sql"
cat <<EOF > pin_schema.sql
-- Table for Security Settings (PIN, Lockout)
CREATE TABLE IF NOT EXISTS public.user_security (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    transaction_pin_hash TEXT, -- Hashed PIN
    
    pin_attempts INTEGER DEFAULT 0,
    pin_locked_until TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own security" ON public.user_security
FOR SELECT USING (auth.uid() = user_id);

-- Only Server Actions update this table to enforce Lockout Logic
EOF

# 2. Server Action (Logic)
echo "2. Creating Action: src/app/actions/security-pin.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/security-pin.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { compare, hash } from 'bcryptjs'; 

export async function verifyPin(plainPin: string) {
    const supabase = await createClient();
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
        throw new Error(\`PIN Locked. Try again in \${waitMin} minutes.\`);
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
        throw new Error(\`Invalid PIN. \${3 - newAttempts} attempts remaining.\`);
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
EOF

# 3. UI Component
echo "3. Creating Component: src/components/security/PinKeypad.tsx"
mkdir -p src/components/security
cat <<EOF > src/components/security/PinKeypad.tsx
'use client';

import { useState } from 'react';
import { verifyPin } from '@/app/actions/security-pin';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface PinKeypadProps {
    onSuccess: () => void;
    title?: string;
}

export default function PinKeypad({ onSuccess, title = "Enter Transaction PIN" }: PinKeypadProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNum = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleBackspace = () => setPin(prev => prev.slice(0, -1));

    const handleSubmit = async () => {
        if (pin.length !== 6) return;
        setLoading(true);
        try {
            await verifyPin(pin);
            onSuccess();
        } catch (e: any) {
            setError(e.message);
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xs mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-center font-bold text-lg mb-6 text-zinc-800 dark:text-zinc-100">{title}</h3>
            
            <div className="flex justify-center gap-3 mb-8">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className={\`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 \${
                            i < pin.length 
                            ? 'bg-primary border-primary scale-110 shadow-[0_0_10px_rgba(var(--primary),0.5)]' 
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                        }\`} 
                    />
                ))}
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium mb-4 animate-shake">{error}</p>}

            <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button 
                        key={n} 
                        onClick={() => handleNum(n.toString())} 
                        className="h-14 w-full flex items-center justify-center text-xl font-bold rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-800 dark:text-zinc-200"
                    >
                        {n}
                    </button>
                ))}
                <div />
                <button 
                    onClick={() => handleNum('0')} 
                    className="h-14 w-full flex items-center justify-center text-xl font-bold rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-zinc-800 dark:text-zinc-200"
                >
                    0
                </button>
                <button 
                    onClick={handleBackspace} 
                    className="h-14 w-full flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all text-red-500"
                >
                    <Delete size={20} />
                </button>
            </div>

            <Button 
                onClick={handleSubmit} 
                className="w-full h-12 mt-8 font-bold text-base rounded-xl cursor-not-allowed sm:cursor-pointer"
                disabled={pin.length !== 6 || loading}
            >
                {loading ? 'Verifying...' : 'Confirm PIN'}
            </Button>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "PIN System Created!"
echo "1. Run 'pin_schema.sql' in Supabase."
echo "2. Installing dependency: bcryptjs..."
npm install bcryptjs
npm install -D @types/bcryptjs
