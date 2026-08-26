create table curriculums (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references school_levels(id) not null,
  series_id uuid references school_series(id),
  subject_id uuid references subjects(id) not null,
  title text not null,
  description text,
  version text not null,
  status text not null default 'draft'
    check (status in ('draft','review','validated','published','archived')),
  source text,
  source_url text,
  source_document text,
  is_demo boolean not null default false,
  internal_notes text,
  published_at timestamptz,
  validated boolean default false,
  validated_by uuid references profiles(id),
  validated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_curriculums_updated_at
  before update on curriculums
  for each row execute function set_updated_at();

-- Un contenu ne peut être publié sans source (garde-fou pédagogique)
create or replace function check_curriculum_publishable()
returns trigger as $$
begin
  if new.status = 'published' and (new.source_url is null and new.source_document is null) then
    raise exception 'Un programme ne peut être publié sans source_url ni source_document';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_curriculum_publish_guard
  before insert or update on curriculums
  for each row execute function check_curriculum_publishable();

create table domains (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid references curriculums(id) not null,
  name text not null,
  "order" int not null,
  created_at timestamptz default now()
);

create table competencies (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references domains(id) not null,
  name text not null,
  description text,
  "order" int not null,
  created_at timestamptz default now()
);

create index idx_curriculums_level on curriculums(level_id);
create index idx_curriculums_subject on curriculums(subject_id);
create index idx_curriculums_status on curriculums(status);
create index idx_domains_curriculum on domains(curriculum_id);
create index idx_competencies_domain on competencies(domain_id);
