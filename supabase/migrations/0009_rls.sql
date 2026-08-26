-- ============================================================
-- Helper : l'utilisateur courant est-il admin ?
-- ============================================================
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- PROFILES
-- ============================================================
alter table profiles enable row level security;

create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- Remarque : le champ 'role' et 'xp_total' sont protégés en pratique par le fait
-- qu'ils ne doivent JAMAIS être exposés dans les formulaires client ; un contrôle
-- applicatif (server action) revalide en plus qu'ils ne sont pas modifiés.

create policy "profiles_admin_all" on profiles
  for all using (is_admin()) with check (is_admin());

alter table profile_subjects enable row level security;
create policy "profile_subjects_own" on profile_subjects
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ============================================================
-- CONTENU PÉDAGOGIQUE — lecture publique si published, écriture admin only
-- ============================================================
alter table curriculums enable row level security;
alter table domains enable row level security;
alter table competencies enable row level security;
alter table chapters enable row level security;
alter table lessons enable row level security;
alter table exercises enable row level security;
alter table questions enable row level security;
alter table question_options enable row level security;

create policy "curriculums_select_published" on curriculums
  for select using (status = 'published' or is_admin());
create policy "curriculums_admin_all" on curriculums
  for all using (is_admin()) with check (is_admin());

create policy "domains_select" on domains for select using (true);
create policy "domains_admin_all" on domains for all using (is_admin()) with check (is_admin());

create policy "competencies_select" on competencies for select using (true);
create policy "competencies_admin_all" on competencies for all using (is_admin()) with check (is_admin());

create policy "chapters_select_published" on chapters
  for select using ((status = 'published' and deleted_at is null) or is_admin());
create policy "chapters_admin_all" on chapters
  for all using (is_admin()) with check (is_admin());

create policy "lessons_select_published" on lessons
  for select using ((status = 'published' and deleted_at is null) or is_admin());
create policy "lessons_admin_all" on lessons
  for all using (is_admin()) with check (is_admin());

create policy "exercises_select_published" on exercises
  for select using ((status = 'published' and deleted_at is null) or is_admin());
create policy "exercises_admin_all" on exercises
  for all using (is_admin()) with check (is_admin());

create policy "questions_select_published" on questions
  for select using ((status = 'published' and deleted_at is null) or is_admin());
create policy "questions_admin_all" on questions
  for all using (is_admin()) with check (is_admin());

create policy "question_options_select" on question_options
  for select using (
    exists (select 1 from questions q where q.id = question_id and q.status = 'published')
    or is_admin()
  );
create policy "question_options_admin_all" on question_options
  for all using (is_admin()) with check (is_admin());

-- ============================================================
-- PROGRESSION — élève lit/écrit ses propres données uniquement
-- ============================================================
alter table lesson_progress enable row level security;
create policy "lesson_progress_own" on lesson_progress
  for all using (auth.uid() = profile_id or is_admin())
  with check (auth.uid() = profile_id or is_admin());

alter table competency_progress enable row level security;
create policy "competency_progress_select_own" on competency_progress
  for select using (auth.uid() = profile_id or is_admin());
-- Pas de policy insert/update pour 'authenticated' : mastery_score est recalculé
-- uniquement via une fonction serveur (service_role), jamais par le client.

alter table exercise_attempts enable row level security;
create policy "exercise_attempts_select_own" on exercise_attempts
  for select using (auth.uid() = profile_id or is_admin());
create policy "exercise_attempts_insert_own" on exercise_attempts
  for insert with check (auth.uid() = profile_id);

-- ============================================================
-- QUIZ
-- ============================================================
alter table quiz_attempts enable row level security;
create policy "quiz_attempts_own" on quiz_attempts
  for all using (auth.uid() = profile_id or is_admin())
  with check (auth.uid() = profile_id or is_admin());

alter table quiz_questions enable row level security;
create policy "quiz_questions_own" on quiz_questions
  for all using (
    exists (select 1 from quiz_attempts qa where qa.id = quiz_attempt_id and qa.profile_id = auth.uid())
    or is_admin()
  )
  with check (
    exists (select 1 from quiz_attempts qa where qa.id = quiz_attempt_id and qa.profile_id = auth.uid())
    or is_admin()
  );

alter table daily_quizzes enable row level security;
create policy "daily_quizzes_own" on daily_quizzes
  for all using (auth.uid() = profile_id or is_admin())
  with check (auth.uid() = profile_id or is_admin());

alter table daily_quiz_questions enable row level security;
create policy "daily_quiz_questions_own" on daily_quiz_questions
  for select using (
    exists (select 1 from daily_quizzes dq where dq.id = daily_quiz_id and dq.profile_id = auth.uid())
    or is_admin()
  );

alter table daily_quiz_config enable row level security;
create policy "daily_quiz_config_select" on daily_quiz_config for select using (true);
create policy "daily_quiz_config_admin" on daily_quiz_config for all using (is_admin()) with check (is_admin());

-- ============================================================
-- GAMIFICATION — lecture seule côté client, écriture via service_role uniquement
-- ============================================================
alter table xp_transactions enable row level security;
create policy "xp_transactions_select_own" on xp_transactions
  for select using (auth.uid() = profile_id or is_admin());
-- Aucune policy insert pour 'authenticated' : awardXp() passe par service_role.

alter table streaks enable row level security;
create policy "streaks_select_own" on streaks
  for select using (auth.uid() = profile_id or is_admin());

alter table badges enable row level security;
create policy "badges_select" on badges for select using (true);
create policy "badges_admin_all" on badges for all using (is_admin()) with check (is_admin());

alter table user_badges enable row level security;
create policy "user_badges_select_own" on user_badges
  for select using (auth.uid() = profile_id or is_admin());

alter table notifications enable row level security;
create policy "notifications_own" on notifications
  for all using (auth.uid() = profile_id or is_admin())
  with check (auth.uid() = profile_id or is_admin());

-- ============================================================
-- RÉFÉRENTIEL SCOLAIRE — lecture publique, écriture admin only
-- ============================================================
alter table school_cycles enable row level security;
create policy "school_cycles_select" on school_cycles for select using (true);
create policy "school_cycles_admin_all" on school_cycles for all using (is_admin()) with check (is_admin());

alter table school_levels enable row level security;
create policy "school_levels_select" on school_levels for select using (true);
create policy "school_levels_admin_all" on school_levels for all using (is_admin()) with check (is_admin());

alter table school_series enable row level security;
create policy "school_series_select" on school_series for select using (true);
create policy "school_series_admin_all" on school_series for all using (is_admin()) with check (is_admin());

alter table subjects enable row level security;
create policy "subjects_select" on subjects for select using (true);
create policy "subjects_admin_all" on subjects for all using (is_admin()) with check (is_admin());

alter table level_subjects enable row level security;
create policy "level_subjects_select" on level_subjects for select using (true);
create policy "level_subjects_admin_all" on level_subjects for all using (is_admin()) with check (is_admin());
