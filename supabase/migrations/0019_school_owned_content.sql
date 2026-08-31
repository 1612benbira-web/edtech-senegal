-- ============================================================
-- Contenu pédagogique propre à une école (Phase 19)
-- ============================================================
--
-- Deux usages couverts (cf. échange avec le porteur de projet) :
--
-- 1. Une école crée un PROGRAMME ENTIER qui n'appartient qu'à elle
--    (curriculums.school_id renseigné). Les chapitres/leçons/exercices
--    qui en dépendent héritent automatiquement de cette confidentialité
--    via la chaîne curriculum_id -> chapter_id -> lesson_id : AUCUNE
--    colonne school_id supplémentaire n'est nécessaire sur chapters
--    ni sur lessons.
--
-- 2. Une école ajoute SON PROPRE exercice/quiz sur une leçon GLOBALE
--    existante, sans dupliquer ni modifier la leçon elle-même
--    (exercises.school_id renseigné, lesson_id pointe vers une leçon
--    globale partagée). Ses questions/options héritent via exercise_id.
--
-- Un curriculum/exercice avec school_id = NULL reste un contenu GLOBAL
-- exactement comme avant cette migration (comportement par défaut
-- inchangé, compatible avec tout le contenu existant).

alter table curriculums add column school_id uuid references schools(id) on delete cascade;
create index idx_curriculums_school on curriculums(school_id);

alter table exercises add column school_id uuid references schools(id) on delete cascade;
create index idx_exercises_school on exercises(school_id);

-- ============================================================
-- Fonctions helper
-- ============================================================

-- Un curriculum est visible pour un ÉLÈVE si : global (school_id null,
-- filtré par ailleurs via school_curriculums côté application), OU
-- propre à une école dont l'utilisateur est membre actif.
create or replace function curriculum_visible_to_current_user(p_curriculum_id uuid)
returns boolean as $$
  select exists (
    select 1 from curriculums c
    where c.id = p_curriculum_id
      and (c.school_id is null or is_school_member(c.school_id))
  );
$$ language sql security definer stable set search_path = public;

-- Un curriculum est MODIFIABLE par l'utilisateur courant si c'est un
-- programme propre à une école dont il est school_admin (jamais pour
-- un curriculum global : ceux-ci restent réservés au super_admin).
create or replace function curriculum_manageable_by_current_user(p_curriculum_id uuid)
returns boolean as $$
  select exists (
    select 1 from curriculums c
    where c.id = p_curriculum_id
      and c.school_id is not null
      and is_school_admin(c.school_id)
  );
$$ language sql security definer stable set search_path = public;

-- École "propriétaire" effective d'un exercice : soit l'exercice lui-même
-- porte un school_id (exercice privé sur leçon globale), soit il hérite
-- du curriculum de sa leçon (exercice appartenant à un programme propre
-- à une école). NULL = exercice pleinement global.
create or replace function exercise_school_id(p_exercise_id uuid)
returns uuid as $$
  select coalesce(e.school_id, c.school_id)
  from exercises e
  join lessons l on l.id = e.lesson_id
  join chapters ch on ch.id = l.chapter_id
  join curriculums c on c.id = ch.curriculum_id
  where e.id = p_exercise_id;
$$ language sql security definer stable set search_path = public;

create or replace function question_school_id(p_question_id uuid)
returns uuid as $$
  select exercise_school_id(q.exercise_id) from questions q where q.id = p_question_id;
$$ language sql security definer stable set search_path = public;

-- ============================================================
-- SELECT — on resserre les policies "published = visible par tous"
-- posées en 0009 : un contenu publié appartenant à une école reste
-- réservé aux membres de CETTE école (le contenu global, school_id
-- null, garde exactement son comportement d'origine).
-- ============================================================

drop policy if exists "curriculums_select_published" on curriculums;
create policy "curriculums_select_published" on curriculums
  for select using (
    is_admin()
    or (status = 'published' and curriculum_visible_to_current_user(id))
    or curriculum_manageable_by_current_user(id)
  );

drop policy if exists "chapters_select_published" on chapters;
create policy "chapters_select_published" on chapters
  for select using (
    is_admin()
    or (status = 'published' and deleted_at is null and curriculum_visible_to_current_user(curriculum_id))
    or curriculum_manageable_by_current_user(curriculum_id)
  );

drop policy if exists "lessons_select_published" on lessons;
create policy "lessons_select_published" on lessons
  for select using (
    is_admin()
    or (
      status = 'published' and deleted_at is null
      and curriculum_visible_to_current_user((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
    )
    or curriculum_manageable_by_current_user((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
  );

drop policy if exists "exercises_select_published" on exercises;
create policy "exercises_select_published" on exercises
  for select using (
    is_admin()
    or (
      status = 'published' and deleted_at is null
      and (school_id is null or is_school_member(school_id))
      and curriculum_visible_to_current_user((select ch.curriculum_id from lessons l join chapters ch on ch.id = l.chapter_id where l.id = exercises.lesson_id))
    )
    or (school_id is not null and is_school_admin(school_id))
    or curriculum_manageable_by_current_user((select ch.curriculum_id from lessons l join chapters ch on ch.id = l.chapter_id where l.id = exercises.lesson_id))
  );

drop policy if exists "questions_select_published" on questions;
create policy "questions_select_published" on questions
  for select using (
    is_admin()
    or (
      status = 'published' and deleted_at is null
      and (exercise_school_id(exercise_id) is null or is_school_member(exercise_school_id(exercise_id)))
    )
    or is_school_admin(exercise_school_id(exercise_id))
  );

drop policy if exists "question_options_select" on question_options;
create policy "question_options_select" on question_options
  for select using (
    is_admin()
    or exists (
      select 1 from questions q
      where q.id = question_options.question_id
        and q.status = 'published'
        and (question_school_id(q.id) is null or is_school_member(question_school_id(q.id)))
    )
    or is_school_admin(question_school_id(question_id))
  );

-- ============================================================
-- ÉCRITURE — nouvelles policies additives : un school_admin peut créer/
-- modifier/supprimer UNIQUEMENT le contenu propre à sa propre école
-- (jamais le contenu global, jamais celui d'une autre école). Ces
-- policies s'ajoutent aux "*_admin_all" existantes (0009), elles ne
-- les remplacent pas.
-- ============================================================

create policy "curriculums_school_admin_manage" on curriculums
  for all using (school_id is not null and is_school_admin(school_id))
  with check (school_id is not null and is_school_admin(school_id));

create policy "chapters_school_admin_manage" on chapters
  for all using (curriculum_manageable_by_current_user(curriculum_id))
  with check (curriculum_manageable_by_current_user(curriculum_id));

create policy "lessons_school_admin_manage" on lessons
  for all using (curriculum_manageable_by_current_user((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id)))
  with check (curriculum_manageable_by_current_user((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id)));

create policy "exercises_school_admin_manage" on exercises
  for all using (
    (school_id is not null and is_school_admin(school_id))
    or curriculum_manageable_by_current_user((select ch.curriculum_id from lessons l join chapters ch on ch.id = l.chapter_id where l.id = exercises.lesson_id))
  )
  with check (
    (school_id is not null and is_school_admin(school_id))
    or curriculum_manageable_by_current_user((select ch.curriculum_id from lessons l join chapters ch on ch.id = l.chapter_id where l.id = lesson_id))
  );

create policy "questions_school_admin_manage" on questions
  for all using (is_school_admin(exercise_school_id(exercise_id)))
  with check (is_school_admin(exercise_school_id(exercise_id)));

create policy "question_options_school_admin_manage" on question_options
  for all using (is_school_admin(question_school_id(question_id)))
  with check (is_school_admin(question_school_id(question_id)));
