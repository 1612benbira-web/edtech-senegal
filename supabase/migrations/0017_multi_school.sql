-- ============================================================
-- Multi-écoles (Phase 17) : établissements + rattachement
-- ============================================================
--
-- IMPORTANT — ce que cette migration NE fait PAS :
-- elle n'ajoute AUCUNE colonne school_id sur les tables pédagogiques
-- (curriculums, chapters, lessons, exercises, questions). Le contenu
-- pédagogique reste global et partagé entre écoles (cf. audit :
-- 0002_school_reference.sql est le RÉFÉRENTIEL SCOLAIRE — cycles/
-- niveaux/séries/matières — pas une notion d'établissement ; aucune
-- structure d'établissement n'existait avant cette migration).
--
-- Architecture :
--   schools               (un établissement)
--   school_members        (rattachement profil <-> école, avec rôle local)
--   school_curriculums    (quels programmes globaux une école active)

-- ------------------------------------------------------------
-- Rôle "school_admin"
-- ------------------------------------------------------------
-- 'admin' (rôle existant) devient de facto le super_admin global
-- (déjà utilisé par is_admin()/requireAdmin() dans tout le code —
-- on ne renomme pas ce rôle pour ne rien casser). On ajoute
-- uniquement 'school_admin' comme nouveau rôle scopé à une école.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('student', 'teacher', 'school_admin', 'admin'));

-- ------------------------------------------------------------
-- SCHOOLS
-- ------------------------------------------------------------
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  code text unique not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_schools_updated_at
  before update on schools
  for each row execute function set_updated_at();

create index idx_schools_status on schools(status);

-- ------------------------------------------------------------
-- SCHOOL_MEMBERS
-- ------------------------------------------------------------
create table school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher', 'school_admin')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (school_id, profile_id)
);

create index idx_school_members_school on school_members(school_id);
create index idx_school_members_profile on school_members(profile_id);

-- ------------------------------------------------------------
-- SCHOOL_CURRICULUMS
-- ------------------------------------------------------------
create table school_curriculums (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  curriculum_id uuid not null references curriculums(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, curriculum_id)
);

create index idx_school_curriculums_school on school_curriculums(school_id);
create index idx_school_curriculums_curriculum on school_curriculums(curriculum_id);
