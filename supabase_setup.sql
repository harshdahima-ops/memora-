-- Run this in Supabase SQL Editor

create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  tag text default 'general',
  created_at timestamp with time zone default now()
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date default current_date,
  count integer default 0,
  unique(user_id, date)
);

alter table notes enable row level security;
alter table messages enable row level security;
alter table usage enable row level security;

create policy "own notes" on notes for all using (auth.uid() = user_id);
create policy "own messages" on messages for all using (auth.uid() = user_id);
create policy "own usage" on usage for all using (auth.uid() = user_id);
