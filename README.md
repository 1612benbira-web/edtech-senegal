# Plateforme éducative sénégalaise — MVP

## Suivi des phases

- [x] **Phase 1 — Architecture du projet** : arborescence Next.js/lib/supabase, clients Supabase (browser/server/service_role), middleware d'auth, config Tailwind/TS.
- [x] **Phase 2 — Base PostgreSQL + Supabase** : 9 migrations SQL (référentiel scolaire → profils → programmes → contenu → progression → quiz → gamification → RLS), seed `DEMO` clairement marqué, garde-fou empêchant la publication d'un programme sans source.
- [ ] Phase 3 — Authentification
- [ ] Phase 4 — Référentiel scolaire sénégalais (interface admin)
- [ ] Phase 5 — Programme + matières + chapitres
- [ ] Phase 6 — Cours
- [ ] Phase 7 — Exercices
- [ ] Phase 8 — Quiz
- [ ] Phase 9 — Quiz quotidien
- [ ] Phase 10 — Progression
- [ ] Phase 11 — XP + badges + séries
- [ ] Phase 12 — Administration
- [ ] Phase 13 — Sécurité RLS (tests approfondis)
- [ ] Phase 14 — Tests
- [ ] Phase 15 — Optimisation
- [ ] Phase 16 — Déploiement Vercel

## Démarrer (une fois un projet Supabase créé)

```bash
npm install
cp .env.example .env.local   # renseigner les clés Supabase
npx supabase link --project-ref <PROJECT_ID>
npx supabase db push          # applique les migrations dans supabase/migrations
npm run db:types              # génère lib/types/database.ts
npm run dev
```

Pour charger les données de démonstration (développement uniquement, jamais en production) :
```bash
psql "$DATABASE_URL" -f supabase/seed/demo/seed.sql
```

## Rappel important

Aucun contenu du seed `DEMO` n'est un programme officiel sénégalais. Tout contenu réel doit
passer par le workflow `draft → review → validated → published`, avec `source_url` ou
`source_document` renseigné (contrainte imposée en base par un trigger).
