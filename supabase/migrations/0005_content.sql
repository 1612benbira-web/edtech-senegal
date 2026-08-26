create table chapters (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid references curriculums(id) not null,
  domain_id uuid references domains(id),
  title text not null,
  "order" int not null,
  status text not null default 'draft'
    check (status in ('draft','review','validated','published','archived')),
  source text,
  source_url text,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_chapters_updated_at before update on chapters
  for each row execute function set_updated_at();

create table lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) not null,
  competency_id uuid references competencies(id),
  title text not null,
  content_md text not null,
  objectives text[],
  summary text,
  "order" int not null,
  status text not null default 'draft'
    check (status in ('draft','review','validated','published','archived')),
  source text,
  source_url text,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_lessons_updated_at before update on lessons
  for each row execute function set_updated_at();

create table exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) not null,
  competency_id uuid references competencies(id),
  title text not null,
  instructions text,
  difficulty text not null default 'medium'
    check (difficulty in ('easy','medium','hard','expert')),
  difficulty_score int default 50 check (difficulty_score between 0 and 100),
  status text not null default 'draft'
    check (status in ('draft','review','validated','published','archived')),
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) not null,
  competency_id uuid references competencies(id),
  chapter_id uuid references chapters(id),
  type text not null
    check (type in ('single_choice','multiple_choice','true_false','numeric','short_answer','matching','ordering')),
  prompt text not null,
  explanation text,
  points int default 10,
  difficulty_score int default 50 check (difficulty_score between 0 and 100),
  status text not null default 'draft'
    check (status in ('draft','review','validated','published','archived')),
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) not null,
  label text not null,
  is_correct boolean not null default false,
  match_key text,
  "order" int
);

create index idx_chapters_curriculum on chapters(curriculum_id) where deleted_at is null;
create index idx_lessons_chapter on lessons(chapter_id) where deleted_at is null;
create index idx_lessons_status on lessons(status);
create index idx_exercises_lesson on exercises(lesson_id) where deleted_at is null;
create index idx_questions_exercise on questions(exercise_id) where deleted_at is null;
create index idx_questions_status on questions(status);
create index idx_questions_competency on questions(competency_id);
create index idx_question_options_question on question_options(question_id);
