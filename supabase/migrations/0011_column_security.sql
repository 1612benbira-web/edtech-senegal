-- ============================================================
-- Durcissement de sécurité (Phase 13) : is_correct sur question_options
-- ============================================================
--
-- La RLS (migration 0009) protège au niveau LIGNE (quelles lignes sont
-- visibles), pas au niveau COLONNE. Un utilisateur authentifié pouvait
-- donc, en théorie, interroger l'API Supabase directement (en dehors de
-- l'application) et récupérer la colonne `is_correct` d'une question
-- publiée, révélant la bonne réponse avant correction.
--
-- Cette migration retire le droit de lecture de `is_correct` pour les
-- rôles `authenticated` et `anon` au niveau PostgreSQL (pas seulement
-- RLS), et ne le laisse accessible qu'au rôle `service_role` (qui
-- contourne de toute façon RLS et les GRANTs). Les server actions de
-- correction (gradeExerciseAction, gradeQuizAction) et les pages admin
-- listant les bonnes réponses doivent donc utiliser le client
-- `service_role` pour lire cette colonne — voir le code applicatif.

revoke select on question_options from authenticated, anon;
grant select (id, question_id, label, match_key, "order") on question_options to authenticated, anon;
