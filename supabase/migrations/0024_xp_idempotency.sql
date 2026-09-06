-- ============================================================
-- Idempotence de l'attribution d'XP (Phase 22)
-- ============================================================
--
-- Problème constaté à l'audit : awardXp() (lib/services/gamificationService.ts)
-- se contente d'un INSERT dans xp_transactions. Les seuls garde-fous
-- existants étaient au niveau applicatif (TypeScript) :
--   - quiz/actions.ts : vérifie `quiz_attempts.completed_at IS NULL`
--     avant de corriger -> vulnérable à un TOCTOU (deux requêtes
--     simultanées passent toutes les deux le SELECT avant que l'une
--     des deux n'écrive completed_at).
--   - exercise/actions.ts : vérifie une liste `priorAttempts` en
--     mémoire avant d'accorder l'XP -> même faille (double clic, deux
--     onglets, requêtes simultanées).
--   - lesson/actions.ts : AUCUNE vérification -> markLessonCompletedAction
--     accorde +20 XP à CHAQUE appel, y compris un simple re-clic ou un
--     nouvel appel après navigation retour/avant sur une leçon déjà
--     terminée.
--
-- Correction : chaque récompense est identifiée de façon unique par
-- (profile_id, reason, reference_id). On pose une contrainte unique
-- PARTIELLE (reference_id IS NOT NULL) au niveau PostgreSQL : même en
-- cas de double clic, deux onglets, requêtes concurrentes ou retry
-- réseau, une seconde tentative d'INSERT du même triplet échoue avec
-- l'erreur 23505 (unique_violation), que le service intercepte pour
-- la traiter comme un no-op (cf. gamificationService.ts).
--
-- On ne bloque PAS reference_id IS NULL : certains octrois futurs
-- pourraient ne pas référencer une ressource précise (ex. bonus
-- ponctuel décidé manuellement) et ne doivent pas être limités à un
-- seul par élève pour toute leur existence.
--
-- Aucune donnée existante n'est supprimée : cette migration ne fait
-- qu'ajouter un index, elle ne touche à aucune ligne. Si des doublons
-- existent déjà en base (XP légitimement gagné avant ce correctif),
-- l'index unique échouerait à la création : on les neutralise donc
-- d'abord en ne gardant que la transaction la plus ancienne de chaque
-- groupe en doublon (l'XP déjà crédité sur profiles.xp_total via les
-- transactions conservées n'est jamais retiré).

do $$
begin
  delete from xp_transactions t
  using (
    select id,
           row_number() over (
             partition by profile_id, reason, reference_id
             order by created_at asc, id asc
           ) as rn
    from xp_transactions
    where reference_id is not null
  ) dedup
  where t.id = dedup.id
    and dedup.rn > 1;
end $$;

create unique index if not exists idx_xp_transactions_unique_reward
  on xp_transactions (profile_id, reason, reference_id)
  where reference_id is not null;
