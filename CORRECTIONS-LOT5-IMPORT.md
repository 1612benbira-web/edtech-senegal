# Corrections Lot 5 — import 5e

## Corrections appliquées

- Vérification explicite des variables Supabase avant démarrage.
- Chargement de `.env.local` puis `.env`.
- Suppression des accès TypeScript potentiellement `undefined` dans l'import 5e.
- Validation : chaque leçon 5e doit avoir au moins 12 questions avant insertion.
- Validation : une question manquante provoque une erreur explicite.
- Correction de la répartition des questions du script 6e Anglais/Histoire/Géographie : aucune des 3 activités ne reste vide lorsque le nombre de questions est supérieur ou égal à 3 ; avec 8 questions, répartition 3/3/2.
- Ajout de `npm run db:check-env` pour vérifier la configuration sans afficher les secrets.

## Commandes

```powershell
npm install
npx tsc --noEmit
npm run db:check-env
npm run db:import:5e-all
```

Les contenus restent en `review` par défaut. Ne publier qu'après validation pédagogique.

## Sécurité

Ne jamais transmettre ou committer `.env.local`, `SUPABASE_SERVICE_ROLE_KEY` ou `SUPABASE_SECRET_KEY`.
