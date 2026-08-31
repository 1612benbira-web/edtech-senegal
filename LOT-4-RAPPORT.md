# LOT 4 — 6e Anglais + Histoire + Géographie

## Périmètre

Ce lot ajoute trois matières de 6e qui n'étaient pas présentes dans les imports pédagogiques du projet :
- Anglais
- Histoire
- Géographie

Les structures SQL existantes sont conservées. Aucun changement d'authentification, RLS, progression, quiz quotidien ou multi-écoles n'est introduit.

## Références pédagogiques

- PROMET — Ministère de l'Éducation nationale du Sénégal : https://apprendre.education.sn/C_ressource/recherche/34
- Les ressources PROMET consultées pour l'anglais 6e comprennent notamment Greetings/introductions, school/classroom, seasons and weather, articles, plurals, quantifiers et past simple.
- Pour Histoire-Géographie, la structuration s'appuie sur les progressions sénégalaises 6e consultées et sur les ressources PROMET, avec une distinction explicite entre source institutionnelle et structuration originale EdTech Sénégal.

## Contenu cible

### Anglais 6e
8 chapitres / 16 leçons / 48 exercices / 128 questions

### Histoire 6e
8 chapitres / 16 leçons / 48 exercices / 128 questions

### Géographie 6e
8 chapitres / 16 leçons / 48 exercices / 128 questions

## Statut

Par défaut : `review`.

Pour publier après validation pédagogique :
`EDTECH_PUBLISH_ENRICHMENT=true`

## Import

`npm install`

`npm run db:import:6e-anglais-hg`

## Important

L'environnement de génération ne disposait pas d'un `node_modules/.bin/tsc` complet au moment du contrôle final. Le script n'a donc pas été exécuté contre Supabase ici. L'import réel doit être effectué localement après `npm install`, puis contrôlé dans l'interface et dans la base.
