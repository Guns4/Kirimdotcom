-- Create a simple key-value store for system settings
create table if not exists public.system_settings (
    key text primary key,
    value text,
    updated_at opacity timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by uuid references auth.users(id)
);
-- Insert default maintenance mode (disabled)
insert into public.system_settings (key, value)
values ('maintenance_mode', 'false') on conflict (key) do nothing;
-- Enable RLS
alter table public.system_settings enable row level security;
-- Policies:
-- Everyone can read stats (for middleware check), but usually we want this restricted? 
-- Actually, middleware runs on server, it can bypass RLS or use Service Role.
-- But for client-side checking (e.g. valid session), let's allow public read for 'maintenance_mode' only.
create policy "Public can read maintenance status" on public.system_settings for
select using (key = 'maintenance_mode');
-- Only admins can update
-- Assuming we have an 'admins' table or role check. For now, allow authenticated users for demo or implement strict RLS later.
create policy "Admins can update settings" on public.system_settings for
update using (auth.role() = 'authenticated');
-- REPLACE with actual Admin check in production!