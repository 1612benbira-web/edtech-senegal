-- ============================================================
-- Phase "Dashboard élève + administration" :
--   1) suivi de la dernière activité (statut en ligne / hors ligne réel)
--   2) déconnexion forcée d'un élève par un administrateur
-- ============================================================

-- ------------------------------------------------------------
-- 1) last_seen_at — mis à jour par l'élève lui-même (sa propre ligne),
--    déjà couvert par la policy "profiles_update_own" (migration 0009)
--    et non concerné par le garde-fou de la migration 0012 (qui ne
--    protège que role/xp_total). Aucun changement RLS nécessaire ici.
-- ------------------------------------------------------------
alter table profiles add column if not exists last_seen_at timestamptz;
create index if not exists idx_profiles_last_seen on profiles(last_seen_at);

-- ------------------------------------------------------------
-- 2) Déconnexion forcée — invalide réellement la session de l'élève.
--
-- Supabase Auth (GoTrue) gère les sessions actives dans la table
-- `auth.sessions` : chaque JWT porte un `session_id` qui doit
-- correspondre à une ligne existante pour rester valide. Supprimer les
-- lignes de `auth.sessions` d'un utilisateur invalide donc immédiatement
-- tous ses access/refresh tokens (cascade sur `auth.refresh_tokens`),
-- sans attendre l'expiration du JWT.
--
-- Cette fonction est `security definer` afin de pouvoir écrire dans le
-- schéma `auth` (normalement inaccessible), mais son exécution est
-- restreinte au rôle `service_role` uniquement : ni `authenticated` ni
-- `anon` ne peuvent l'appeler, même en connaissant son nom. La vérification
-- "l'appelant est bien un administrateur" est faite en amont, côté
-- application, par requireAdmin() avant d'utiliser le client service_role.
-- ------------------------------------------------------------
create or replace function admin_force_logout_user(target_user_id uuid)
returns void as $$
begin
  delete from auth.sessions where user_id = target_user_id;
end;
$$ language plpgsql security definer set search_path = public, auth;

revoke all on function admin_force_logout_user(uuid) from public, authenticated, anon;
grant execute on function admin_force_logout_user(uuid) to service_role;
