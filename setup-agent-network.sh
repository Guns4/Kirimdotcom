#!/bin/bash

# =============================================================================
# Offline to Online (O2O): Agent Network
# =============================================================================

echo "Initializing Agent Network..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: agent_network_schema.sql"
cat <<EOF > agent_network_schema.sql
-- Agent Profiles
create table if not exists public.agent_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  status text default 'pending', -- pending, active, suspended
  
  -- Financials
  operating_balance decimal(12, 2) default 0.00, -- Modal Agen
  commission_total decimal(12, 2) default 0.00, -- Pendapatan
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Agent Transactions (Log)
create table if not exists public.agent_transactions (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references public.agent_profiles(id),
  target_user_id uuid references auth.users(id),
  transaction_type text, -- 'topup_user', 'withdraw_commission', 'deposit_modal'
  amount decimal(12, 2) not null,
  fee_earned decimal(12, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_agent_loc on public.agent_profiles(latitude, longitude);
create index idx_agent_user on public.agent_profiles(user_id);

-- RLS
alter table public.agent_profiles enable row level security;
create policy "Public can view active agents" on public.agent_profiles for select using (status = 'active');
create policy "Agents manage own profile" on public.agent_profiles for all using (auth.uid() = user_id);

-- Function: Process Topup (Agent sells balance to User)
create or replace function process_agent_topup(
  p_agent_user_id uuid,
  p_target_email text,
  p_amount decimal
) returns jsonb as \$\$
declare
  v_agent_id uuid;
  v_target_id uuid;
  v_agent_balance decimal;
  v_commission decimal := p_amount * 0.02; -- 2% Fee
begin
  -- Note: This requires 'wallets' table from previous setups.
  -- We assume public.wallets(user_id, balance) exists.
  
  -- 1. Get Agent Info
  select id, operating_balance into v_agent_id, v_agent_balance 
  from public.agent_profiles where user_id = p_agent_user_id;
  
  if v_agent_id is null then 
    return jsonb_build_object('success', false, 'message', 'Agent profile not found');
  end if;

  if v_agent_balance < p_amount then
    return jsonb_build_object('success', false, 'message', 'Saldo modal agen tidak cukup');
  end if;

  -- 2. Get Target User
  select id into v_target_id from auth.users where email = p_target_email;
  if v_target_id is null then
    return jsonb_build_object('success', false, 'message', 'User tujuan tidak ditemukan');
  end if;

  -- 3. Execute Transaction (Atomic)
  -- Deduct Agent Modal
  update public.agent_profiles 
  set operating_balance = operating_balance - p_amount,
      commission_total = commission_total + v_commission
  where id = v_agent_id;

  -- Credit User Wallet (Assuming generic update or insert)
  -- Using simple update assumption:
  update public.wallets 
  set balance = balance + p_amount 
  where user_id = v_target_id;
  
  -- Log
  insert into public.agent_transactions (agent_id, target_user_id, transaction_type, amount, fee_earned)
  values (v_agent_id, v_target_id, 'topup_user', p_amount, v_commission);

  return jsonb_build_object('success', true, 'commission', v_commission);
end;
\$\$ language plpgsql;
EOF

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/agent.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/agent.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registerAgent(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('businessName') as string;
  const address = formData.get('address') as string;
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));

  const { error } = await supabase.from('agent_profiles').insert({
    user_id: user.id,
    business_name: name,
    address: address,
    latitude: lat,
    longitude: lng,
    status: 'pending', // Waiting admin approval
    operating_balance: 0
  });

  if (error) return { error: 'Gagal daftar agen.' };
  revalidatePath('/agent');
  return { success: true };
}

export async function performTopup(targetEmail: string, amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase.rpc('process_agent_topup', {
    p_agent_user_id: user.id,
    p_target_email: targetEmail,
    p_amount: amount
  });

  if (error) return { error: error.message };
  if (!data.success) return { error: data.message };

  revalidatePath('/agent/dashboard');
  return { success: true, commission: data.commission };
}

export async function getAgents() {
  const supabase = createClient();
  const { data } = await supabase.from('agent_profiles').select('*').eq('status', 'active');
  return data || [];
}
EOF

# 3. UI Components
echo "3. Creating UI Components: src/components/agent..."
mkdir -p src/components/agent

# Agent Topup Form
cat <<EOF > src/components/agent/TopupForm.tsx
'use client';

import { useState } from 'react';
import { performTopup } from '@/app/actions/agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { HandCoins } from 'lucide-react';

export function AgentTopupForm() {
  const [loading, setLoading] = useState(false);

  const handleTopup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const amount = Number(formData.get('amount'));

    const res = await performTopup(email, amount);
    setLoading(false);

    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success(\`Topup Berhasil! Komisi: Rp \${res.commission}\`);
    }
  };

  return (
    <div className="bg-card border p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-primary">
         <HandCoins className="w-6 h-6" />
         <h3 className="font-bold text-lg">Topup User (Jual Saldo)</h3>
      </div>
      <form onSubmit={handleTopup} className="space-y-4">
         <Input name="email" type="email" placeholder="Email User Pelanggan" required />
         <Input name="amount" type="number" placeholder="Nominal (Rp)" min="1000" required />
         <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Proses Topup'}
         </Button>
      </form>
    </div>
  );
}
EOF

# Agent Map Placeholder
cat <<EOF > src/components/agent/AgentMap.tsx
// Placeholder for Agent Map
// In production, integrate with Leaflet or Google Maps
import { getAgents } from '@/app/actions/agent';
import { MapPin } from 'lucide-react';

export async function AgentLocator() {
  const agents = await getAgents();

  return (
    <div className="space-y-4">
       <h2 className="font-bold text-xl">Lokasi Agen Terdekat</h2>
       <div className="bg-muted h-64 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pattern-grid-lg" />
          <p className="text-muted-foreground z-10">Peta Interaktif (Leaflet.js Integration)</p>
       </div>
       <div className="grid gap-2 sm:grid-cols-2">
          {agents.map((agent: any) => (
             <div key={agent.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                 <MapPin className="w-5 h-5 text-red-500 mt-1" />
                 <div>
                    <p className="font-bold">{agent.business_name}</p>
                    <p className="text-sm text-muted-foreground">{agent.address}</p>
                 </div>
             </div>
          ))}
          {agents.length === 0 && <p className="text-muted-foreground">Belum ada agen aktif.</p>}
       </div>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Agent Network Setup Complete!"
echo "1. Run 'agent_network_schema.sql' in Supabase."
echo "2. Import <AgentTopupForm /> in your Agent Dashboard."
echo "3. Import <AgentLocator /> in your Find Agent page."
