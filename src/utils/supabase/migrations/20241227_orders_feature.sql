-- Create orders table
create table if not exists orders (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    -- Customer & Product Info
    customer_name text not null,
    customer_phone text,
    -- Optional for WhatsApp notification later
    product_name text not null,
    price numeric default 0,
    -- Logistics
    resi_number text,
    courier text,
    -- Statuses
    status text check (
        status in (
            'Unpaid',
            'Paid',
            'Shipped',
            'Done',
            'Cancelled',
            'Returned'
        )
    ) default 'Unpaid',
    tracking_status text default 'PENDING',
    -- From logistics API (DELIVERED, ON_PROCESS, etc)
    -- Timestamps
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_tracking_check timestamp with time zone
);
-- Indexes
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_resi on orders(resi_number);
-- RLS Policies
alter table orders enable row level security;
create policy "Users can manage own orders" on orders for all using (auth.uid() = user_id);
-- Trigger to update updated_at
create or replace function update_updated_at_column() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
create trigger update_orders_modtime before
update on orders for each row execute function update_updated_at_column();