create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  lesson_id uuid references lessons(id) not null,
  status text not null default 'in_progress'
    check (status in ('not_started','in_progress','completed')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique(profile_id, lesson_id)
);

create table competency_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  competency_id uuid references competencies(id) not null,
  mastery_score numeric not null default 0 check (mastery_score between 0 and 100),
  attempts_count int not null default 0,
  correct_count int not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz default now(),
  unique(profile_id, competency_id)
);

create table exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  question_id uuid references questions(id) not null,
  is_correct boolean not null,
  answer_payload jsonb,
  time_spent_seconds int,
  created_at timestamptz default now()
);

create index idx_lesson_progress_profile on lesson_progress(profile_id);
create index idx_competency_progress_profile on competency_progress(profile_id);
create index idx_competency_progress_review on competency_progress(profile_id, next_review_at);
create index idx_exercise_attempts_profile on exercise_attempts(profile_id, created_at desc);
create index idx_exercise_attempts_question on exercise_attempts(question_id);
