-- Badges standards de l'application (pas des données DEMO — configuration
-- applicative réelle, au même titre que daily_quiz_config).
insert into badges (code, name, description, icon, criteria) values
  ('first_lesson', 'Premier cours', 'Terminer un premier cours', 'book-open',
    '{"type":"lesson_completed_count","value":1}'),
  ('first_quiz', 'Premier quiz', 'Terminer un premier quiz', 'clipboard-check',
    '{"type":"quiz_completed_count","value":1}'),
  ('ten_quizzes', '10 quiz', 'Terminer 10 quiz', 'award',
    '{"type":"quiz_completed_count","value":10}'),
  ('hundred_questions', '100 questions', 'Répondre à 100 questions au total', 'target',
    '{"type":"question_count","value":100}'),
  ('streak_7', '7 jours', 'Maintenir une série de 7 jours', 'flame',
    '{"type":"streak_days","value":7}'),
  ('streak_30', '30 jours', 'Maintenir une série de 30 jours', 'flame',
    '{"type":"streak_days","value":30}'),
  ('quiz_perfect', 'Quiz parfait', 'Obtenir 100% à un quiz', 'star',
    '{"type":"quiz_perfect_count","value":1}')
on conflict (code) do nothing;
