create table if not exists public.affiliate_keywords (
  id uuid default gen_random_uuid() primary key,
  keyword text not null unique, -- e.g. "sepatu"
  target_url text not null,     -- e.g. "https://shopee.co.id/..."
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Data (Example)
insert into public.affiliate_keywords (keyword, target_url, category)
values 
  ('sepatu', 'https://shope.ee/example-shoe', 'fashion'),
  ('baju', 'https://shope.ee/example-shirt', 'fashion'),
  ('hp', 'https://tokopedia.com/example-phone', 'electronics'),
  ('laptop', 'https://tokopedia.com/example-laptop', 'electronics'),
  ('tas', 'https://shope.ee/example-bag', 'fashion')
on conflict (keyword) do nothing;

alter table public.affiliate_keywords enable row level security;
drop policy if exists "Public read active keywords" on public.affiliate_keywords;
create policy "Public read active keywords" on public.affiliate_keywords for select using (is_active = true);
