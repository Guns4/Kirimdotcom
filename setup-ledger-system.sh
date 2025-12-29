#!/bin/bash

# =============================================================================
# Fintech Architect: Ledger System
# =============================================================================

echo "Initializing Banking-Grade Ledger System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: ledger_schema.sql"
cat <<EOF > ledger_schema.sql
-- ============================================================================
-- 1. WALLETS (The State)
-- ============================================================================
create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Balance must be non-negative (Banking Standard)
  -- Use decimal(19, 4) for high precision currency
  balance decimal(19, 4) default 0.0000 not null,
  
  -- Constraints
  constraint balance_non_negative check (balance >= 0),
  constraint unique_user_wallet unique (user_id),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 2. LEDGER ENTRIES (The History/Source of Truth)
-- ============================================================================
-- All money movement must be recorded here. No direct updates to wallets.balance!
create table if not exists public.ledger_entries (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references public.wallets(id) on delete no action not null,
  
  amount decimal(19, 4) not null check (amount > 0), -- Amount is always positive
  entry_type text not null check (entry_type in ('CREDIT', 'DEBIT')), -- CREDIT (+), DEBIT (-)
  
  description text not null,
  reference_id text, -- e.g. TRX-123, JASTIP-001
  metadata jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_ledger_wallet on public.ledger_entries(wallet_id);
create index idx_ledger_ref on public.ledger_entries(reference_id);
create index idx_ledger_created on public.ledger_entries(created_at desc);


-- ============================================================================
-- 3. TRIGGER FUNCTION (The Accountant)
-- ============================================================================
-- Automatically updates wallet balance based on ledger entry
create or replace function fn_update_wallet_balance() returns trigger as \$\$
begin
  if NEW.entry_type = 'CREDIT' then
    update public.wallets
    set balance = balance + NEW.amount,
        updated_at = now()
    where id = NEW.wallet_id;
  elsif NEW.entry_type = 'DEBIT' then
    update public.wallets
    set balance = balance - NEW.amount,
        updated_at = now()
    where id = NEW.wallet_id;
  end if;
  
  -- Note: The check constraint 'balance_non_negative' on table 'wallets' 
  -- will automatically throw an error if this update causes negative balance.
  -- This ensures ACID integrity via the database engine itself.
  
  return NEW;
end;
\$\$ language plpgsql;

-- Bind Trigger
drop trigger if exists tr_ledger_update_balance on public.ledger_entries;
create trigger tr_ledger_update_balance
after insert on public.ledger_entries
for each row execute function fn_update_wallet_balance();


-- ============================================================================
-- 4. RLS Policies
-- ============================================================================
alter table public.wallets enable row level security;
alter table public.ledger_entries enable row level security;

create policy "Users can view own wallet" on public.wallets 
for select using (auth.uid() = user_id);

create policy "Users can view own ledger" on public.ledger_entries
for select using (
  wallet_id in (select id from public.wallets where user_id = auth.uid())
);

-- Note: Only server-side (Service Role) should Insert ledger entries usually.
-- But if we allow users to triggering actions via RPC, that's fine.
-- Direct insert allowed if they own the wallet (e.g. mock topup for dev), 
-- but usually locked down in prod.
create policy "Dev insert" on public.ledger_entries
for insert with check (
   wallet_id in (select id from public.wallets where user_id = auth.uid())
);

-- ============================================================================
-- 5. Helper Function: Get or Create Wallet
-- ============================================================================
create or replace function get_or_create_wallet(p_user_id uuid) returns uuid as \$\$
declare
  v_id uuid;
begin
  select id into v_id from public.wallets where user_id = p_user_id;
  
  if v_id is null then
    insert into public.wallets (user_id) values (p_user_id) returning id into v_id;
  end if;
  
  return v_id;
end;
\$\$ language plpgsql;

EOF

echo ""
echo "================================================="
echo "Ledger System Ready!"
echo "1. Run 'ledger_schema.sql' in Supabase to apply the strict architecture."
echo "2. From now on, DO NOT update 'wallets.balance' directly."
echo "3. Use: INSERT INTO ledger_entries (wallet_id, entry_type, amount, ...) to move money."
