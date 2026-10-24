-- ============================================================
-- Limitation de débit (login, inscription, récupération, recherche)
-- ============================================================
-- Compteurs en fenêtre fixe, stockés dans Postgres (aucun service externe).
-- Les clés sont des empreintes SHA-256 calculées côté serveur : aucun email,
-- téléphone ou IP en clair dans cette table.
-- Accès réservé à service_role : ni anon ni authenticated ne peuvent lire,
-- écrire ni appeler les fonctions (sinon un attaquant pourrait remettre ses
-- propres compteurs à zéro).

create table if not exists rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);

alter table rate_limits enable row level security;  -- aucune policy : refus par défaut
revoke all on rate_limits from anon, authenticated;

create or replace function check_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 200
     or p_max < 1 or p_window_seconds < 1 then
    raise exception 'paramètres invalides';
  end if;

  insert into rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                        then now() else r.window_start end,
    count        = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                        then 1 else r.count + 1 end
  returning r.count, r.window_start into v_count, v_start;

  -- Nettoyage opportuniste (~1 appel sur 100) des fenêtres de plus d'un jour.
  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;

  return jsonb_build_object(
    'allowed', v_count <= p_max,
    'retry_after',
      greatest(0, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - now()))))::integer
  );
end;
$$;

create or replace function reset_rate_limit(p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from rate_limits where key = p_key;
$$;

-- Postgres accorde EXECUTE à PUBLIC par défaut, et Supabase l'accorde aussi
-- explicitement à anon/authenticated : on retire les deux.
revoke execute on function check_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke execute on function reset_rate_limit(text) from public, anon, authenticated;
grant  execute on function check_rate_limit(text, integer, integer) to service_role;
grant  execute on function reset_rate_limit(text) to service_role;
