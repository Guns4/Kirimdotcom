-- Table: withdrawal_requests
create table if not exists public.withdrawal_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  amount decimal(12, 2) not null check (amount >= 10000), -- Min withdraw 10k
  
  -- Bank Details
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  
  -- Status
  status text default 'PENDING', -- PENDING, PROCESSED, REJECTED
  admin_note text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.withdrawal_requests enable row level security;
create policy "Users can view own requests" on public.withdrawal_requests 
  for select using (auth.uid() = user_id);
create policy "Users can insert own requests" on public.withdrawal_requests 
  for insert with check (auth.uid() = user_id);

-- Only Admins/Service Role can update status
