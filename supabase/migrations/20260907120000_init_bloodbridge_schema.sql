-- BloodBridge initial schema
-- Run this in Lovable's Cloud SQL Editor once the Supabase/Lovable Cloud
-- project for BloodBridge exists (not needed while running on local mock data).

create extension if not exists "pgcrypto";

create table if not exists donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  blood_type text not null check (blood_type in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  phone text not null,
  location text not null,
  last_donation_date date,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_type text not null check (requester_type in ('hospital','patient','individual')),
  blood_type_needed text not null check (blood_type_needed in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  units_needed integer not null default 1 check (units_needed > 0),
  urgency text not null default 'medium' check (urgency in ('low','medium','high','critical')),
  location text not null,
  status text not null default 'open' check (status in ('open','matched','fulfilled','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists blood_stock (
  id uuid primary key default gen_random_uuid(),
  blood_bank_name text not null,
  blood_type text not null check (blood_type in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  units_available integer not null default 0 check (units_available >= 0),
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now(),
  unique (blood_bank_name, blood_type)
);

create table if not exists stock_transactions (
  id uuid primary key default gen_random_uuid(),
  stock_id uuid references blood_stock(id) on delete cascade,
  change_type text not null check (change_type in ('donation_in','usage_out','adjustment')),
  units integer not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists donor_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references blood_requests(id) on delete cascade,
  donor_id uuid references donors(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  matched_at timestamptz not null default now()
);

-- Seed a starting stock row per blood type for the default blood bank.
insert into blood_stock (blood_bank_name, blood_type, units_available, low_stock_threshold)
select 'Kigali Central Blood Bank', bt, 10, 5
from unnest(array['O+','O-','A+','A-','B+','B-','AB+','AB-']) as bt
on conflict (blood_bank_name, blood_type) do nothing;

-- RLS: enable, and open up read access for now (tighten once auth/roles exist).
alter table donors enable row level security;
alter table blood_requests enable row level security;
alter table blood_stock enable row level security;
alter table stock_transactions enable row level security;
alter table donor_matches enable row level security;

create policy "public read donors" on donors for select using (true);
create policy "public insert donors" on donors for insert with check (true);
create policy "public update donors" on donors for update using (true);

create policy "public read requests" on blood_requests for select using (true);
create policy "public insert requests" on blood_requests for insert with check (true);
create policy "public update requests" on blood_requests for update using (true);

create policy "public read stock" on blood_stock for select using (true);
create policy "public update stock" on blood_stock for update using (true);

create policy "public read stock_transactions" on stock_transactions for select using (true);
create policy "public insert stock_transactions" on stock_transactions for insert with check (true);

create policy "public read donor_matches" on donor_matches for select using (true);
create policy "public insert donor_matches" on donor_matches for insert with check (true);
create policy "public update donor_matches" on donor_matches for update using (true);
