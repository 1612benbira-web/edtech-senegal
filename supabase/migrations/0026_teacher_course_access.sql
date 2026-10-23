-- ============================================================
-- Lecture / modification des COURS par l'enseignant, scopée à l'école
-- ============================================================
--
-- Règles :
--  * Un enseignant lit et modifie (chapitres + leçons) UNIQUEMENT les
--    programmes PROPRES à son école (curriculums.school_id = son école)
--    dont la matière/niveau(/série) lui est affecté (school_subject_teachers).
--  * Il ne crée ni ne supprime jamais un programme (curriculums) : réservé
--    au school_admin / super_admin. Aucune policy d'écriture sur curriculums.
--  * Le programme national (school_id null) reste en lecture seule.
--  * L'affectation ne suffit plus : l'appartenance 'teacher' ACTIVE à l'école
--    est exigée (sinon un enseignant suspendu gardait ses droits).

-- Fonction de portée : l'utilisateur est-il l'enseignant affecté à ce programme d'école ?
create or replace function is_assigned_teacher_for_curriculum(p_curriculum_id uuid)
returns boolean as $$
  select exists (
    select 1
    from curriculums c
    join school_subject_teachers sst
      on sst.school_id = c.school_id
     and sst.subject_id = c.subject_id
     and sst.level_id = c.level_id
     and (c.series_id is null or sst.series_id is null or sst.series_id = c.series_id)
    where c.id = p_curriculum_id
      and c.school_id is not null
      and sst.teacher_profile_id = auth.uid()
      and is_school_teacher(c.school_id)
  );
$$ language sql security definer stable set search_path = public;

-- Correctif 0025 : exiger l'appartenance active (même logique) pour les exercices privés.
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
      and is_school_teacher(p_school_id)
  );
$$ language sql security definer stable set search_path = public;

-- Même correctif pour la messagerie : l'enseignant doit être membre actif.
drop policy if exists "messages_insert_teacher" on messages;
create policy "messages_insert_teacher" on messages
  for insert
  with check (
    sender_id = auth.uid()
    and target_type = 'LEVEL'
    and is_school_teacher(messages.school_id)
    and exists (
      select 1 from school_subject_teachers sst
      where sst.school_id = messages.school_id
        and sst.level_id = messages.target_level_id
        and sst.teacher_profile_id = auth.uid()
    )
  );

-- SELECT (tous statuts, brouillons inclus) sur les programmes de son périmètre
create policy "curriculums_select_teacher" on curriculums
  for select using (is_assigned_teacher_for_curriculum(id));

create policy "chapters_select_teacher" on chapters
  for select using (is_assigned_teacher_for_curriculum(curriculum_id));

create policy "lessons_select_teacher" on lessons
  for select using (
    is_assigned_teacher_for_curriculum((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
  );

-- ÉCRITURE chapitres / leçons (suppression logique = UPDATE deleted_at ;
-- pas de DELETE physique pour l'enseignant : aucune policy FOR DELETE dédiée
-- ne lui est donnée, "for all" ci-dessous est donc restreint aux 3 commandes).
create policy "chapters_teacher_insert" on chapters
  for insert with check (is_assigned_teacher_for_curriculum(curriculum_id));
create policy "chapters_teacher_update" on chapters
  for update using (is_assigned_teacher_for_curriculum(curriculum_id))
  with check (is_assigned_teacher_for_curriculum(curriculum_id));

create policy "lessons_teacher_insert" on lessons
  for insert with check (
    is_assigned_teacher_for_curriculum((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
  );
create policy "lessons_teacher_update" on lessons
  for update using (
    is_assigned_teacher_for_curriculum((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
  )
  with check (
    is_assigned_teacher_for_curriculum((select ch.curriculum_id from chapters ch where ch.id = lessons.chapter_id))
  );
