-- Create api_keys table
create table if not exists api_keys (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    secret_key text unique not null,
    status text check (status in ('active', 'revoked')) default 'active',
    monthly_quota int default 1000,
    current_usage int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_used_at timestamp with time zone
);
-- Index for fast lookup via Middleware
create index if not exists idx_api_keys_secret on api_keys(secret_key);
create index if not exists idx_api_keys_user on api_keys(user_id);
-- RLS Policies
alter table api_keys enable row level security;
-- Users can view their own keys
create policy "Users can view own api keys" on api_keys for
select using (auth.uid() = user_id);
-- Users can delete/revoke their own keys (conceptually)
create policy "Users can update own api keys" on api_keys for
update using (auth.uid() = user_id);
-- Only Service Role can insert (generated via server action) or we allow users if carefully restricted
-- Let's allow users to insert their own keys via Server Action which will use service role anyway if needed, 
-- but for standard RLS:
create policy "Users can insert own api keys" on api_keys for
insert with check (auth.uid() = user_id);