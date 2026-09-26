-- ============================================================
-- Affectation enseignant ↔ matière ↔ niveau, par école (Phase 25)
-- ============================================================
--
-- Contexte : le rôle 'teacher' existe déjà dans school_members et dans
-- tout le code (cf. schoolMemberSchema, adminGuard, libellés), mais
-- aucune ligne 'teacher' n'a jamais été créée : rien ne permet à un
-- school_admin de désigner un enseignant, ni de le rattacher à une
-- matière précise. Cette migration ajoute cette affectation.
--
-- Principe de sécurité (repris de 0019) : un enseignant ne modifie
-- JAMAIS le contenu global (curriculums/chapters/lessons). Il ne peut
-- créer/modifier que SES PROPRES exercices "privés" sur une leçon
-- globale — exactement le mécanisme déjà utilisé par
-- /admin/schools/[id]/content/private-exercise (exercises.school_id),
-- mais restreint en plus à la matière et au niveau pour lesquels il
-- est explicitement affecté.

-- ============================================================
-- TABLE
-- ============================================================
create table school_subject_teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  level_id uuid not null references school_levels(id) on delete cascade,
  -- Optionnel : ne sert qu'au lycée, où une même matière+niveau peut
  -- avoir un contenu différent par série (ex: Maths Terminale S2/L2).
  -- Laissé à NULL, l'enseignant couvre toutes les séries de ce niveau.
  series_id uuid references school_series(id) on delete cascade,
  teacher_profile_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Une seule affectation par école + matière + niveau + série
  -- (décision du porteur de projet : un enseignant par combinaison,
  -- pas de partage). Un UNIQUE classique laisse passer plusieurs
  -- lignes series_id NULL pour la même combinaison (deux NULL ne sont
  -- jamais égaux en SQL) : l'index partiel ci-dessous couvre ce cas
  -- pour rester compatible avec toute version de PostgreSQL (NULLS
  -- NOT DISTINCT exige PG15+, non garanti ici).
  unique (school_id, subject_id, level_id, series_id)
);

create unique index idx_school_subject_teachers_no_series
  on school_subject_teachers(school_id, subject_id, level_id)
  where series_id is null;

create index idx_school_subject_teachers_teacher on school_subject_teachers(teacher_profile_id);
create index idx_school_subject_teachers_school on school_subject_teachers(school_id);

alter table school_subject_teachers enable row level security;

-- Le super_admin et le school_admin de CETTE école gèrent les
-- affectations. L'enseignant affecté peut voir sa propre ligne (pour
-- savoir quelle matière/niveau lui est confiée) mais ne peut jamais la
-- créer ni la modifier lui-même.
create policy "school_subject_teachers_admin_manage" on school_subject_teachers
  for all using (is_admin() or is_school_admin(school_id))
  with check (is_admin() or is_school_admin(school_id));

create policy "school_subject_teachers_teacher_select" on school_subject_teachers
  for select using (teacher_profile_id = auth.uid());

-- ============================================================
-- Fonctions helper
-- ============================================================

-- L'utilisateur courant est-il enseignant actif de CETTE école (tout
-- rattachement confondu) ? Utile pour le guard applicatif
-- (requireTeacherAccess), symétrique de is_school_admin (0018).
create or replace function is_school_teacher(p_school_id uuid)
returns boolean as $$
  select exists (
    select 1 from school_members
    where school_id = p_school_id
      and profile_id = auth.uid()
      and role = 'teacher'
      and status = 'active'
  );
$$ language sql security definer stable set search_path = public;

-- L'utilisateur courant est-il l'enseignant affecté à la matière/niveau
-- de la leçon p_lesson_id, pour l'école p_school_id ? La leçon doit
-- appartenir à un curriculum GLOBAL (school_id null) : un enseignant
-- n'ajoute des exercices privés que sur le programme national, jamais
-- sur un programme déjà propre à une autre école.
create or replace function is_assigned_teacher_for_lesson(p_lesson_id uuid, p_school_id uuid)
returns boolean as $$
  select exists (
    select 1
    from lessons l
    join chapters ch on ch.id = l.chapter_id
    join curriculums c on c.id = ch.curriculum_id
    join school_subject_teachers sst
      on sst.subject_id = c.subject_id
      and sst.level_id = c.level_id
      and (c.series_id is null or sst.series_id is null or sst.series_id = c.series_id)
    where l.id = p_lesson_id
      and c.school_id is null
      and sst.school_id = p_school_id
      and sst.teacher_profile_id = auth.uid()
  );
$$ language sql security definer stable set search_path = public;

create or replace function is_assigned_teacher_for_exercise(p_exercise_id uuid)
returns boolean as $$
  select exists (
    select 1 from exercises e
    where e.id = p_exercise_id
      and e.school_id is not null
      and is_assigned_teacher_for_lesson(e.lesson_id, e.school_id)
  );
$$ language sql security definer stable set search_path = public;

create or replace function is_assigned_teacher_for_question(p_question_id uuid)
returns boolean as $$
  select is_assigned_teacher_for_exercise(q.exercise_id) from questions q where q.id = p_question_id;
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- ÉCRITURE — policies additives (elles s'ajoutent à celles de 0009
-- et 0019, elles ne les remplacent pas) : un enseignant affecté peut
-- gérer UNIQUEMENT ses exercices privés sur sa matière/niveau.
-- ============================================================

create policy "exercises_teacher_manage" on exercises
  for all using (school_id is not null and is_assigned_teacher_for_lesson(lesson_id, school_id))
  with check (school_id is not null and is_assigned_teacher_for_lesson(lesson_id, school_id));

create policy "questions_teacher_manage" on questions
  for all using (is_assigned_teacher_for_exercise(exercise_id))
  with check (is_assigned_teacher_for_exercise(exercise_id));

create policy "question_options_teacher_manage" on question_options
  for all using (is_assigned_teacher_for_question(question_id))
  with check (is_assigned_teacher_for_question(question_id));

-- ============================================================
-- MESSAGERIE — un enseignant peut écrire à SON niveau affecté
-- uniquement (jamais un message SCHOOL, réservé au school_admin).
-- ============================================================

create policy "messages_insert_teacher" on messages
  for insert
  with check (
    sender_id = auth.uid()
    and target_type = 'LEVEL'
    and exists (
      select 1 from school_subject_teachers sst
      where sst.school_id = messages.school_id
        and sst.level_id = messages.target_level_id
        and sst.teacher_profile_id = auth.uid()
    )
  );

-- Un enseignant peut supprimer un message qu'il a lui-même envoyé
-- (erreur de saisie), jamais celui d'un autre.
create policy "messages_delete_teacher" on messages
  for delete using (sender_id = auth.uid());
