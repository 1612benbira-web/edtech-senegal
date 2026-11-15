-- ============================================================
-- Mode BFEM : épreuve blanche chronométrée (type de quiz "exam")
-- ============================================================
--
-- Une épreuve blanche est une tentative de quiz comme les autres
-- (quiz_attempts + quiz_questions) : mêmes tables, mêmes règles d'accès
-- (RLS 0009 : un élève ne voit que ses propres tentatives), même
-- correction (gradeQuizAction). Seul le type change, pour distinguer
-- l'épreuve des quiz d'entraînement et afficher la note sur 20.
--
-- Aucune colonne ajoutée : la durée se déduit du nombre de questions
-- (voir lib/algorithms/mockExam.ts) et l'heure de début est déjà dans
-- quiz_attempts.started_at.

alter table quiz_attempts drop constraint if exists quiz_attempts_type_check;
alter table quiz_attempts add constraint quiz_attempts_type_check
  check (type in ('chapter','subject','review','evaluation','daily','exam'));

-- Historique des épreuves d'un élève, par matière (page /bfem).
create index if not exists idx_quiz_attempts_exam
  on quiz_attempts(profile_id, subject_id, started_at desc)
  where type = 'exam';
