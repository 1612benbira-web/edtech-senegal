# LOT 1 — Enrichissement 6e Mathématiques

## Statut

Lot préparé et contrôlé au niveau du code et du contenu.

Les nouveaux contenus sont volontairement insérés avec le statut `review` par défaut. Aucun nouveau contenu n'est présenté comme pédagogiquement validé automatiquement.

Référentiel de cadrage :
- Fascicule Mathématiques 6e — ADEM Dakar / Ministère de l'Éducation nationale
- https://senprof.education.sn/ADEM/Math%C3%A9matiques%206e/res/math_6e.pdf

## Périmètre

Les 19 chapitres existants sont conservés. Aucun chapitre existant n'est remplacé.

Pour chaque chapitre :
- 1 nouvelle leçon d'approfondissement ;
- 2 nouveaux exercices ;
- 3 questions par exercice ;
- explications pédagogiques ;
- progression facile → moyen ;
- contextualisation lorsque pertinente.

## Volume prévu

- Chapitres traités : 19
- Nouvelles leçons : 19
- Nouveaux exercices : 38
- Nouvelles questions : 114
- Types : QCM à réponse unique + vrai/faux
- Doublons : détection par chapitre/leçon/exercice/question lors de l'import

## Architecture respectée

Aucune modification de schéma SQL.

Le script utilise les tables existantes :
`curriculums → chapters → competencies → lessons → exercises → questions → question_options`

La séparation multi-écoles n'est pas modifiée.

## Fichier ajouté

`scripts/enrich-6e-maths.ts`

## Script package ajouté

`npm run db:enrich:6e-maths`

## Import

Par défaut :

```powershell
npm run db:enrich:6e-maths
```

Les ajouts sont créés en `review`.

Après contrôle pédagogique :

```powershell
$env:EDTECH_PUBLISH_ENRICHMENT="true"
npm run db:enrich:6e-maths
```

## Vérification

Le typecheck global du projet ne peut pas être considéré comme propre dans l'état fourni tant que les dépendances/types du projet ne sont pas complètement installés. Le dépôt présente déjà des erreurs TypeScript indépendantes du nouveau script.

L'exécution distante de l'import contre Supabase n'a pas pu être confirmée dans cet environnement : la connexion a dépassé le délai disponible. Il faut donc considérer l'import comme **à exécuter/valider localement**, et non comme confirmé dans la base distante.

## Point qualité important

Une question qui proposait deux écritures équivalentes comme réponses distinctes a été corrigée avant livraison. Le pack évite également les doublons de questions au sein d'un même exercice et utilise des explications explicites.

## Suite recommandée

1. Exécuter l'import en `review`.
2. Contrôler `/admin/curriculums`, `/admin/chapters`, `/admin/lessons` et `/admin/questions`.
3. Tester la génération de quiz sur quelques chapitres.
4. Publier après validation.
5. Passer au Lot 2 : 6e SVT.
