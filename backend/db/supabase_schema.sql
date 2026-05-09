-- Supabase Schema for DealLens
-- Run this in the Supabase SQL Editor

-- 1. Create the analyses table
create table analyses (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  startup_name  text not null,
  file_name     text not null,
  report        jsonb not null,
  overall_score numeric(3,1)
);

-- 2. Enable Row Level Security (RLS)
alter table analyses enable row level security;

-- 3. Create policies for anonymous access
-- Note: In a production app, you would restrict inserts to authenticated users.
-- For this hackathon, we allow public inserts so the backend can write using the anon key.
create policy "Public read" on analyses for select using (true);
create policy "Public insert" on analyses for insert with check (true);
