-- Table: jastip_trips
create table if not exists public.jastip_trips (
  id uuid default gen_random_uuid() primary key,
  traveler_id uuid references auth.users(id) on delete cascade not null,
  
  -- Route
  origin_city text not null,
  destination_city text not null,
  
  -- Schedule
  departure_date date not null,
  return_date date, -- Optional if one way
  
  -- Capacity
  capacity_kg integer default 5,
  price_per_kg integer default 0, -- 0 = Negotiable
  
  -- Details
  notes text,
  whatsapp_number text not null, -- For direct booking
  
  -- Status
  status text default 'open', -- 'open', 'full', 'completed'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for search
create index if not exists idx_jastip_route on public.jastip_trips(origin_city, destination_city);
create index if not exists idx_jastip_date on public.jastip_trips(departure_date);

-- RLS
alter table public.jastip_trips enable row level security;

drop policy if exists "Public can view open trips" on public.jastip_trips;
create policy "Public can view open trips"
  on public.jastip_trips for select
  using (status = 'open');

drop policy if exists "Users can post trips" on public.jastip_trips;
create policy "Users can post trips"
  on public.jastip_trips for insert
  with check (auth.uid() = traveler_id);

drop policy if exists "Travelers can manage own trips" on public.jastip_trips;
create policy "Travelers can manage own trips"
  on public.jastip_trips for update
  using (auth.uid() = traveler_id);
