# LOT 3 — Français 6e

## Audit / cadrage
- 15 chapitres existants conservés.
- Aucun nouveau chapitre créé.
- Enrichissement fondé sur les ressources ADEM-Dakar / Ministère de l'Éducation nationale.
- Les formulations ajoutées sont originales et ne recopient pas les exercices du fascicule.

## Ajouts
- 15 nouvelles leçons d'approfondissement.
- 30 exercices.
- 120 questions : 60 QCM + 60 vrai/faux.
- Difficultés easy/medium avec explications pour chaque question.
- Statut par défaut : `review`.

## Doublons
Le script vérifie les leçons et exercices par titre et les questions par prompt avant insertion.
Un contrôle statique du pack ne relève aucun prompt dupliqué et les 15 chapitres ciblés correspondent aux chapitres déjà présents dans `scripts/import-6e-francais.ts`.

## Référentiel
Source de cadrage : ADEM-Dakar, ressource Français du cycle 6e–3e.
Le site ADEM est présenté comme une ressource du Ministère de l'Éducation nationale du Sénégal et indique que ses fascicules sont destinés aux élèves de la 6e à la 3e.

## Fichier
`scripts/enrich-6e-francais.ts`

## Import
```powershell
npm run db:enrich:6e-francais
```

Les contenus sont insérés en `review` par défaut.

Pour publier après validation pédagogique :
```powershell
$env:EDTECH_PUBLISH_ENRICHMENT="true"
npm run db:enrich:6e-francais
```

## Tests
- Contrôle statique : 15 chapitres ciblés, 30 exercices, 120 questions.
- Aucun doublon de prompt détecté dans le nouveau pack.
- Aucun test Supabase distant exécuté depuis cet environnement : les identifiants de la base locale/projet ne sont pas disponibles ici.
- Le schéma SQL existant n'est pas modifié.
- Authentification, rôles, progression et multi-écoles ne sont pas modifiés.
