create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique not null,
  level_id uuid references school_levels(id),
  series_id uuid references school_series(id),
  daily_goal int default 8,
  timezone text default 'Africa/Dakar',
  role text not null default 'student' check (role in ('student','admin','teacher')),
  xp_total int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create table profile_subjects (
  profile_id uuid references profiles(id) on delete cascade not null,
  subject_id uuid references subjects(id) not null,
  primary key (profile_id, subject_id)
);

-- Création automatique du profil à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
