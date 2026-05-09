-- Supabase Schema for DealLens v2 (Investor CRM)
-- Run this in the Supabase SQL Editor

-- 1. Create the analyses table (with CRM columns)
create table if not exists analyses (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  startup_name      text not null,
  file_name         text not null,
  report            jsonb not null,
  overall_score     numeric(3,1),
  status            text not null default 'pending',
  category          text,
  short_description text,
  founder_email     text,
  raw_text          text
);

-- 2. Create the investor_preferences table
create table if not exists investor_preferences (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz default now(),
  interested_categories    text[] default '{}',
  disqualified_categories  text[] default '{}'
);

-- 3. Enable Row Level Security (RLS)
alter table analyses enable row level security;
alter table investor_preferences enable row level security;

-- 4. Create policies for anonymous access
-- Note: In a production app, you would restrict inserts to authenticated users.
-- For this hackathon, we allow public access so the backend can read/write using the anon key.
create policy "Public read analyses" on analyses for select using (true);
create policy "Public insert analyses" on analyses for insert with check (true);
create policy "Public update analyses" on analyses for update using (true);

create policy "Public read preferences" on investor_preferences for select using (true);
create policy "Public insert preferences" on investor_preferences for insert with check (true);
create policy "Public update preferences" on investor_preferences for update using (true);

-- 5. Insert a default preferences row (the app reads/updates this single row)
insert into investor_preferences (interested_categories, disqualified_categories)
values ('{}', '{}');
