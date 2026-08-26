create table xp_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  amount int not null,
  reason text not null,
  reference_id uuid,
  created_at timestamptz default now()
);

-- Maintient profiles.xp_total en phase avec les transactions
create or replace function apply_xp_transaction()
returns trigger as $$
begin
  update profiles set xp_total = xp_total + new.amount where id = new.profile_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_apply_xp_transaction
  after insert on xp_transactions
  for each row execute function apply_xp_transaction();

create table streaks (
  profile_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_date date,
  updated_at timestamptz default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  icon text,
  criteria jsonb not null
);

create table user_badges (
  profile_id uuid references profiles(id) on delete cascade not null,
  badge_id uuid references badges(id) not null,
  earned_at timestamptz default now(),
  primary key (profile_id, badge_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index idx_xp_transactions_profile on xp_transactions(profile_id, created_at desc);
create index idx_notifications_profile on notifications(profile_id, read_at);
