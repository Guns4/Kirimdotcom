#!/bin/bash

# =============================================================================
# Security: Bank Account Validation
# =============================================================================

echo "Initializing Bank Validation System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: bank_validation.sql"
cat <<EOF > bank_validation.sql
-- Table to store validated bank accounts
CREATE TABLE IF NOT EXISTS public.saved_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    bank_code TEXT NOT NULL,       -- e.g. 'BCA', 'MANDIRI'
    account_number TEXT NOT NULL,
    account_holder_name TEXT NOT NULL, -- The name returned by API
    
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate accounts for same user
    CONSTRAINT unique_user_account UNIQUE (user_id, bank_code, account_number)
);

-- RLS
ALTER TABLE public.saved_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own accounts" ON public.saved_bank_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users delete own accounts" ON public.saved_bank_accounts
FOR DELETE USING (auth.uid() = user_id);

-- Insert strictly controlled via Server Action/API (No direct INSERT policy for now)
EOF

# 2. Validation API Route
echo "2. Creating API: app/api/finance/validate-bank/route.ts"
mkdir -p app/api/finance/validate-bank
cat <<EOF > app/api/finance/validate-bank/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { bank_code, account_number } = await request.json();
    
    if (!bank_code || !account_number) {
        return NextResponse.json({ error: 'Missing bank_code or account_number' }, { status: 400 });
    }

    try {
        // MOCK VALIDATION LOGIC
        // In Prod: Call Xendit / Flip / Midtrans Disbursement API
        // e.g. await xendit.disbursement.getBankAccount({ bank_code, account_number });
        
        let mockName = '';
        
        // Simulate behavior
        if (Object.keys(MOCK_DB).includes(account_number)) {
            mockName = MOCK_DB[account_number];
        } else {
             // Random realistic name if not in mock db
             mockName = 'BUDI SANTOSO'; 
        }

        // Return the name for User Confirmation
        return NextResponse.json({ 
            status: 'success', 
            account_name: mockName,
            bank_code,
            account_number
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

const MOCK_DB: Record<string, string> = {
    '1234567890': 'AHMAD DANI',
    '0987654321': 'SITI AMINAH',
    '1122334455': 'PT SINAR JAYA'
};
EOF

# 3. Server Action to Save
echo "3. Creating Action: app/actions/bank-account.ts"
mkdir -p app/actions
cat <<EOF > app/actions/bank-account.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveBankAccount(bankCode: string, accountNumber: string, accountName: string) {
    const supabase = createClient();
    
    // 1. Double check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 2. Insert
    const { error } = await supabase.from('saved_bank_accounts').insert({
        user_id: user.id,
        bank_code: bankCode,
        account_number: accountNumber,
        account_holder_name: accountName,
        is_verified: true
    });

    if (error) throw new Error(error.message);
    
    revalidatePath('/dashboard/finance');
    return { success: true };
}

export async function getSavedAccounts() {
    const supabase = createClient();
    const { data } = await supabase.from('saved_bank_accounts').select('*');
    return data || [];
}
EOF

# 4. React Component
echo "4. Creating Component: components/finance/BankAccountManager.tsx"
mkdir -p components/finance
cat <<EOF > components/finance/BankAccountManager.tsx
'use client';

import { useState } from 'react';
import { saveBankAccount } from '@/app/actions/bank-account';

export default function BankAccountManager({ existingAccounts }: { existingAccounts: any[] }) {
    const [bank, setBank] = useState('BCA');
    const [number, setNumber] = useState('');
    const [verifiedName, setVerifiedName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/finance/validate-bank', {
                method: 'POST',
                body: JSON.stringify({ bank_code: bank, account_number: number })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setVerifiedName(data.account_name);
            } else {
                alert('Account not found');
            }
        } catch (e) {
            alert('Error validating');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!verifiedName) return;
        try {
            await saveBankAccount(bank, number, verifiedName);
            alert('Bank Saved!');
            window.location.reload(); // Simple refresh to show new data
        } catch (e) {
            alert('Failed to save');
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-bold mb-4">Saved Accounts</h3>
            <div className="space-y-2 mb-6">
                {existingAccounts.map((acc: any) => (
                    <div key={acc.id} className="flex justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <p className="font-semibold">{acc.bank_code} - {acc.account_number}</p>
                            <p className="text-sm text-gray-600">{acc.account_holder_name}</p>
                        </div>
                        <span className="text-green-600 text-xs px-2 py-1 bg-green-100 rounded-full h-fit">Verified</span>
                    </div>
                ))}
            </div>

            <h3 className="text-lg font-bold mb-2">Add New Account</h3>
            <div className="grid gap-4">
                <select value={bank} onChange={e => setBank(e.target.value)} className="p-2 border rounded">
                    <option value="BCA">BCA</option>
                    <option value="MANDIRI">MANDIRI</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Account Number" 
                    value={number} 
                    onChange={e => setNumber(e.target.value)}
                    className="p-2 border rounded"
                />
                
                {!verifiedName ? (
                    <button 
                        onClick={handleCheck} 
                        disabled={loading}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Checking...' : 'Check Account'}
                    </button>
                ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-gray-600 mb-1">Found Account:</p>
                        <p className="text-xl font-bold text-green-800">{verifiedName}</p>
                        <p className="text-xs text-gray-500 mb-4">Is this correct?</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSave} 
                                className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                            >
                                Yes, Save Account
                            </button>
                            <button 
                                onClick={() => setVerifiedName(null)} 
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Bank Validation Setup Complete!"
echo "1. Run 'bank_validation.sql'"
echo "2. Use <BankAccountManager /> in your Finance page."
