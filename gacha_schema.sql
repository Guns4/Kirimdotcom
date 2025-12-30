-- Table: gacha_history
create table if not exists public.gacha_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reward_type text not null, -- 'zonk', 'points', 'pulsa', 'jackpot'
  reward_value integer default 0, -- points amount
  reward_label text, -- e.g. "Voucher Pulsa 50rb"
  cost integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.gacha_history enable row level security;

drop policy if exists "Users can view own gacha history" on public.gacha_history;
create policy "Users can view own gacha history"
  on public.gacha_history for select
  using (auth.uid() = user_id);
