-- ============================================================
-- Durcissement sécurité (Phase 15 — audit) : empêche l'auto-élévation
-- de privilège via profiles.role / profiles.xp_total.
-- ============================================================
--
-- La policy RLS "profiles_update_own" (migration 0009) autorise un
-- utilisateur à modifier SA PROPRE ligne dans `profiles`, mais RLS ne
-- distingue pas les colonnes : elle protège quelles LIGNES sont
-- modifiables, pas quels CHAMPS. Rien n'empêchait donc un élève
-- d'appeler directement l'API REST Supabase (en dehors de l'app
-- Next.js, qui elle ne propose pas ce champ dans ses formulaires) et
-- d'exécuter un PATCH /profiles?id=eq.<son-id> avec { "role": "admin" }.
--
-- Comme is_admin() (migration 0009) et requireAdmin() (adminGuard.ts)
-- se basent tous les deux sur `profiles.role`, ceci équivalait à une
-- élévation de privilège complète (accès admin à tout le contenu, aux
-- élèves, etc.). Ce trigger bloque toute modification de `role` ou
-- `xp_total` qui ne provient pas du rôle `service_role` (utilisé par
-- les server actions de confiance, ex. attribution d'XP, promotion
-- d'un compte enseignant/admin par un administrateur).

create or replace function protect_profile_privileged_columns()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if new.role is distinct from old.role then
      raise exception 'Modification du champ role non autorisée depuis le client.';
    end if;
    if new.xp_total is distinct from old.xp_total then
      raise exception 'Modification du champ xp_total non autorisée depuis le client.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_protect_profile_privileged_columns
  before update on profiles
  for each row execute function protect_profile_privileged_columns();

-- Remarque : la promotion d'un élève au rôle 'admin'/'teacher' doit donc
-- désormais passer par une opération service_role (ex. script d'admin
-- ou future page "gestion des rôles" utilisant createServiceRoleClient()),
-- jamais par un update direct via le client de session, même côté admin.
