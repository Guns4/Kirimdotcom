-- Create cached_resi table for Smart Tracking Engine
create table if not exists cached_resi (
    id uuid default gen_random_uuid() primary key,
    waybill text not null,
    courier text not null,
    status_code text,
    is_delivered boolean default false,
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
    raw_data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Ensure unique combination of waybill and courier
    unique(waybill, courier)
);
-- Index for fast lookup
create index if not exists idx_cached_resi_lookup on cached_resi(waybill, courier);
-- RLS Policies
alter table cached_resi enable row level security;
-- Allow public read (anyone can check cache if they have the resi)
create policy "Public can read cached_resi" on cached_resi for
select using (true);
-- Allow service role to insert/update (Server Actions will use service role or authenticated user)
-- For now, allow authenticated users to insert/update via server actions
create policy "Authenticated users can insert cached_resi" on cached_resi for
insert with check (
        auth.role() = 'authenticated'
        or auth.role() = 'service_role'
    );
create policy "Authenticated users can update cached_resi" on cached_resi for
update using (
        auth.role() = 'authenticated'
        or auth.role() = 'service_role'
    );