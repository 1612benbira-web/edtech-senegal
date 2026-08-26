create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  type text not null
    check (type in ('chapter','subject','review','evaluation','daily')),
  subject_id uuid references subjects(id),
  chapter_id uuid references chapters(id),
  score numeric,
  total_questions int,
  correct_answers int,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create table quiz_questions (
  quiz_attempt_id uuid references quiz_attempts(id) on delete cascade not null,
  question_id uuid references questions(id) not null,
  "order" int,
  is_correct boolean,
  answer_payload jsonb,
  primary key (quiz_attempt_id, question_id)
);

create table daily_quiz_config (
  id int primary key default 1,
  questions_count int not null default 8,
  ratio_recent int not null default 5,
  ratio_review int not null default 2,
  ratio_challenge int not null default 1,
  exclude_recent_days int not null default 3,
  constraint single_row check (id = 1)
);
insert into daily_quiz_config (id) values (1) on conflict do nothing;

create table daily_quizzes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  quiz_attempt_id uuid references quiz_attempts(id),
  date date not null,
  generated_at timestamptz default now(),
  unique(profile_id, date)
);

create table daily_quiz_questions (
  daily_quiz_id uuid references daily_quizzes(id) on delete cascade not null,
  question_id uuid references questions(id) not null,
  reason text
    check (reason in ('recent_lesson','weak_mastery','past_incorrect','due_review','harder_challenge','new_notion')),
  primary key (daily_quiz_id, question_id)
);

create index idx_quiz_attempts_profile on quiz_attempts(profile_id, started_at desc);
create index idx_quiz_questions_attempt on quiz_questions(quiz_attempt_id);
create index idx_daily_quizzes_profile_date on daily_quizzes(profile_id, date desc);
