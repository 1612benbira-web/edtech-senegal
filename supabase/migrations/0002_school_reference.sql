create table school_cycles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  "order" int not null,
  created_at timestamptz default now()
);

create table school_levels (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references school_cycles(id) not null,
  code text unique not null,
  name text not null,
  "order" int not null,
  created_at timestamptz default now()
);

create table school_series (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references school_levels(id) not null,
  code text not null,
  name text not null,
  created_at timestamptz default now(),
  unique(level_id, code)
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  icon text,
  created_at timestamptz default now()
);

create table level_subjects (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references school_levels(id) not null,
  series_id uuid references school_series(id),
  subject_id uuid references subjects(id) not null,
  is_optional boolean default false,
  weekly_hours numeric,
  created_at timestamptz default now(),
  unique(level_id, series_id, subject_id)
);

create index idx_school_levels_cycle on school_levels(cycle_id);
create index idx_school_series_level on school_series(level_id);
create index idx_level_subjects_level on level_subjects(level_id);
create index idx_level_subjects_subject on level_subjects(subject_id);
