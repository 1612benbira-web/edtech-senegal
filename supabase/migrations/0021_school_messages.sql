-- ============================================================
-- Notifications quiz du jour + messagerie école (Phase 21)
-- ============================================================
--
-- Réutilise la table `notifications` existante (migration 0008) au
-- lieu d'en créer une deuxième : elle sert à la fois pour les
-- rappels de quiz du jour ET pour le suivi lu/non-lu des messages
-- envoyés par un admin/school_admin (voir section 3 plus bas — c'est
-- délibérément la MÊME ligne qui joue le rôle de "droit d'accès au
-- message" et de "statut de lecture", pour éviter de dupliquer un
-- `message_recipients` avec une ligne par élève en plus des
-- notifications, ce qui doublerait l'écriture pour rien à grande
-- échelle).

-- ============================================================
-- 1. NOTIFICATIONS — colonnes manquantes + idempotence
-- ============================================================

alter table notifications add column if not exists link text;
alter table notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Empêche la création de plusieurs notifications identiques pour un
-- même élève + un même quiz du jour + un même type (AC-03 : même
-- après 10 exécutions du job, une seule notification par type).
-- Index partiel sur une expression jsonb, utilisable comme cible
-- d'un `on conflict (...) where ...` côté application.
create unique index if not exists uq_notifications_daily_quiz
  on notifications (profile_id, type, (metadata->>'daily_quiz_id'))
  where type in ('QUIZ_DAILY_AVAILABLE', 'QUIZ_DAILY_REMINDER')
    and metadata->>'daily_quiz_id' is not null;

-- Empêche également un double envoi de la notification "nouveau
-- message" au même élève pour le même message (le fan-out ci-dessous
-- est déjà un INSERT unique par élève, mais cette contrainte protège
-- aussi contre un ré-appel accidentel de la fonction).
create unique index if not exists uq_notifications_message
  on notifications (profile_id, (metadata->>'message_id'))
  where type = 'MESSAGE_RECEIVED' and metadata->>'message_id' is not null;

-- ============================================================
-- 2. MESSAGES — un admin global ou school_admin publie un message
--    (texte + pièces jointes) à destination de son école, ou d'un
--    niveau précis de son école.
-- ============================================================

create table messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  title text not null,
  content text not null,
  target_type text not null check (target_type in ('SCHOOL', 'LEVEL')),
  target_level_id uuid references school_levels(id),
  created_at timestamptz not null default now(),
  constraint messages_target_level_consistency check (
    (target_type = 'SCHOOL' and target_level_id is null)
    or (target_type = 'LEVEL' and target_level_id is not null)
  )
);

create index idx_messages_school on messages(school_id, created_at desc);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_target_level on messages(target_level_id);

create table message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create index idx_message_attachments_message on message_attachments(message_id);

-- ============================================================
-- RLS — MESSAGES
-- ============================================================
alter table messages enable row level security;

-- Un élève voit un message uniquement s'il a reçu la notification
-- correspondante (donc s'il faisait bien partie du public ciblé AU
-- MOMENT de l'envoi — la cible n'est jamais recalculée après coup :
-- un élève qui change de niveau ou rejoint l'école plus tard ne voit
-- pas rétroactivement d'anciens messages qui ne lui étaient pas
-- destinés à l'époque).
create policy "messages_select" on messages
  for select using (
    is_admin()
    or is_school_admin(school_id)
    or exists (
      select 1 from notifications n
      where n.profile_id = auth.uid()
        and n.type = 'MESSAGE_RECEIVED'
        and (n.metadata->>'message_id')::uuid = messages.id
    )
  );

-- school_id n'est JAMAIS pris tel quel depuis le client : la Server
-- Action doit toujours passer le school_id résolu depuis
-- requireSchoolAccess()/requireAnyAdminAccess(), et cette policy
-- revérifie de toute façon que l'auteur administre bien CETTE école.
create policy "messages_insert" on messages
  for insert
  with check (
    (is_admin() or is_school_admin(school_id))
    and sender_id = auth.uid()
  );

-- Un school_admin peut supprimer un message de SA propre école
-- (erreur de saisie, etc.) ; le super admin peut tout supprimer.
create policy "messages_delete" on messages
  for delete using (is_admin() or is_school_admin(school_id));

-- ============================================================
-- RLS — MESSAGE_ATTACHMENTS (suit la visibilité du message parent)
-- ============================================================
alter table message_attachments enable row level security;

create policy "message_attachments_select" on message_attachments
  for select using (
    exists (
      select 1 from messages m
      where m.id = message_attachments.message_id
        and (
          is_admin()
          or is_school_admin(m.school_id)
          or exists (
            select 1 from notifications n
            where n.profile_id = auth.uid()
              and n.type = 'MESSAGE_RECEIVED'
              and (n.metadata->>'message_id')::uuid = m.id
          )
        )
    )
  );

create policy "message_attachments_insert" on message_attachments
  for insert
  with check (
    exists (
      select 1 from messages m
      where m.id = message_attachments.message_id
        and (is_admin() or is_school_admin(m.school_id))
    )
  );

create policy "message_attachments_delete" on message_attachments
  for delete using (
    exists (
      select 1 from messages m
      where m.id = message_attachments.message_id
        and (is_admin() or is_school_admin(m.school_id))
    )
  );

-- ============================================================
-- 3. FAN-OUT — crée une ligne `notifications` (type MESSAGE_RECEIVED)
--    pour chaque élève actif ciblé par le message. SECURITY DEFINER
--    car un school_admin n'a normalement pas le droit d'écrire dans
--    la ligne `notifications` d'un autre profil (policy
--    `notifications_own`, 0009) — cette fonction est le SEUL chemin
--    autorisé pour le faire, et revérifie elle-même les permissions
--    (jamais confiance dans un paramètre côté client : elle relit le
--    message déjà enregistré, elle ne prend pas school_id/target en
--    argument).
--
--    Un seul INSERT ... SELECT (pas de boucle élève par élève) :
--    reste performant même pour une école de plusieurs milliers
--    d'élèves.
-- ============================================================

create or replace function fan_out_message_notifications(p_message_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message messages%rowtype;
  v_count integer;
begin
  select * into v_message from messages where id = p_message_id;
  if not found then
    raise exception 'Message introuvable.';
  end if;

  if not (is_admin() or is_school_admin(v_message.school_id)) then
    raise exception 'Action réservée à l''administrateur de cette école.' using errcode = '42501';
  end if;

  insert into notifications (profile_id, type, title, body, link, metadata)
  select
    sm.profile_id,
    'MESSAGE_RECEIVED',
    v_message.title,
    left(v_message.content, 280),
    '/messages/' || v_message.id,
    jsonb_build_object('message_id', v_message.id, 'school_id', v_message.school_id)
  from school_members sm
  join profiles p on p.id = sm.profile_id
  where sm.school_id = v_message.school_id
    and sm.role = 'student'
    and sm.status = 'active'
    and (v_message.target_type = 'SCHOOL' or p.level_id = v_message.target_level_id)
  on conflict (profile_id, (metadata->>'message_id')) where type = 'MESSAGE_RECEIVED' and metadata->>'message_id' is not null
  do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ============================================================
-- 4. STOCKAGE — bucket privé pour les pièces jointes des messages.
--    Convention de chemin : school-messages/{school_id}/{message_id}/{fichier}
--    (school_id en tête de chemin = base du cloisonnement par
--    policy storage.objects ci-dessous).
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-messages',
  'school-messages',
  false,
  52428800, -- 50 Mo max par fichier (raisonnable pour une vidéo courte/un PDF)
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Le premier segment du chemin est le school_id : (storage.foldername(name))[1]
create policy "school_messages_write_admin" on storage.objects
  for insert
  with check (
    bucket_id = 'school-messages'
    and (
      is_admin()
      or is_school_admin(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "school_messages_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'school-messages'
    and (
      is_admin()
      or is_school_admin(((storage.foldername(name))[1])::uuid)
    )
  );

-- Lecture : admin/school_admin de l'école, OU élève ayant reçu la
-- notification du message correspondant (2e segment du chemin =
-- message_id).
create policy "school_messages_read" on storage.objects
  for select using (
    bucket_id = 'school-messages'
    and (
      is_admin()
      or is_school_admin(((storage.foldername(name))[1])::uuid)
      or exists (
        select 1 from notifications n
        where n.profile_id = auth.uid()
          and n.type = 'MESSAGE_RECEIVED'
          and n.metadata->>'message_id' = (storage.foldername(name))[2]
      )
    )
  );
