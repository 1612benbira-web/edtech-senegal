-- ============================================================
-- SEED DE DÉMONSTRATION — À NE JAMAIS UTILISER EN PRODUCTION
-- Toutes les données ci-dessous sont fictives (préfixe "DEMO").
-- Aucune ne doit être présentée comme un programme officiel.
-- ============================================================

insert into school_cycles (code, name, "order") values
  ('elementaire', 'Enseignement élémentaire', 2),
  ('moyen', 'Enseignement moyen', 3),
  ('secondaire', 'Enseignement secondaire', 4);

insert into school_levels (cycle_id, code, name, "order")
select id, 'demo_6e', '[DEMO] 6e', 1 from school_cycles where code = 'moyen';

insert into subjects (code, name, icon) values
  ('demo_maths', '[DEMO] Mathématiques', 'calculator'),
  ('demo_francais', '[DEMO] Français', 'book-open');

insert into level_subjects (level_id, subject_id)
select l.id, s.id
from school_levels l, subjects s
where l.code = 'demo_6e' and s.code in ('demo_maths', 'demo_francais');

insert into curriculums (level_id, subject_id, title, description, version, status, source, source_url, is_demo, internal_notes)
select l.id, s.id,
  '[DEMO] Programme de mathématiques 6e',
  'Jeu de données de démonstration — À VALIDER par rapport aux sources officielles avant tout usage réel.',
  'DEMO-2026',
  'published',
  'Données de démonstration (fictives)',
  'https://example.org/demo',
  true,
  'À VALIDER — ne pas utiliser en production'
from school_levels l, subjects s
where l.code = 'demo_6e' and s.code = 'demo_maths';

insert into domains (curriculum_id, name, "order")
select c.id, '[DEMO] Nombres et calculs', 1
from curriculums c where c.title = '[DEMO] Programme de mathématiques 6e';

insert into competencies (domain_id, name, description, "order")
select d.id, '[DEMO] Fractions simples', 'Comprendre et manipuler des fractions simples.', 1
from domains d where d.name = '[DEMO] Nombres et calculs';

insert into chapters (curriculum_id, domain_id, title, "order", status, source, source_url)
select c.id, d.id, '[DEMO] Chapitre — Les fractions', 1, 'published', 'Données de démonstration', 'https://example.org/demo'
from curriculums c
join domains d on d.curriculum_id = c.id
where c.title = '[DEMO] Programme de mathématiques 6e';

insert into lessons (chapter_id, competency_id, title, content_md, objectives, summary, "order", status, source, source_url)
select ch.id, comp.id,
  '[DEMO] Qu''est-ce qu''une fraction ?',
  '## [DEMO] Introduction

Une fraction représente une partie d''un tout. Exemple : $\frac{1}{2}$ représente une moitié.

> Contenu de démonstration — à remplacer par un contenu validé.',
  array['[DEMO] Comprendre la notion de fraction', '[DEMO] Lire une fraction'],
  '[DEMO] Résumé de démonstration.',
  1, 'published', 'Données de démonstration', 'https://example.org/demo'
from chapters ch
join competencies comp on comp.name = '[DEMO] Fractions simples'
where ch.title = '[DEMO] Chapitre — Les fractions';

insert into exercises (lesson_id, competency_id, title, instructions, difficulty, difficulty_score, status)
select le.id, comp.id, '[DEMO] Exercice — Reconnaître une fraction', 'Choisis la bonne réponse.', 'easy', 20, 'published'
from lessons le
join competencies comp on comp.name = '[DEMO] Fractions simples'
where le.title = '[DEMO] Qu''est-ce qu''une fraction ?';

insert into questions (exercise_id, competency_id, chapter_id, type, prompt, explanation, points, difficulty_score, status)
select ex.id, comp.id, ch.id, 'single_choice',
  '[DEMO] Que représente $\frac{1}{2}$ ?',
  '[DEMO] $\frac{1}{2}$ représente une moitié d''un tout.',
  10, 20, 'published'
from exercises ex
join competencies comp on comp.name = '[DEMO] Fractions simples'
join chapters ch on ch.title = '[DEMO] Chapitre — Les fractions'
where ex.title = '[DEMO] Exercice — Reconnaître une fraction';

insert into question_options (question_id, label, is_correct, "order")
select q.id, opt.label, opt.is_correct, opt.ord
from questions q,
  (values
    ('[DEMO] Une moitié', true, 1),
    ('[DEMO] Un tiers', false, 2),
    ('[DEMO] Un quart', false, 3)
  ) as opt(label, is_correct, ord)
where q.prompt = '[DEMO] Que représente $\frac{1}{2}$ ?';

insert into badges (code, name, description, icon, criteria) values
  ('demo_first_lesson', '[DEMO] Premier cours', 'Terminer un premier cours', 'award',
    '{"type":"lesson_completed_count","value":1}'),
  ('demo_first_quiz', '[DEMO] Premier quiz', 'Terminer un premier quiz', 'award',
    '{"type":"quiz_completed_count","value":1}');
