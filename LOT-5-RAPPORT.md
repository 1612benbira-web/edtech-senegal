# LOT 5 — 5e complète (Maths, SVT, Français, Anglais, Histoire, Géographie)

## Périmètre
- 6 programmes 5e
- 12 chapitres par matière
- 1 leçon structurée par chapitre
- 3 exercices par leçon (facile / application / raisonnement)
- 12 questions par leçon (4 par exercice)
- Total : 72 chapitres, 72 leçons, 216 exercices, 864 questions.

## Sécurité d'import
- Idempotence par curriculum/chapter/lesson/exercise/question.
- Aucun exercice n'est créé sans ses 4 questions correspondantes.
- Statut par défaut : `review`.
- `published` uniquement si `EDTECH_PUBLISH_ENRICHMENT=true`.
- Aucune migration SQL ajoutée.
- Authentification, progression, quiz quotidien et multi-écoles non modifiés.
- Les quiz d'élève sont générés par le système existant à partir des questions; ce lot n'insère pas de tentatives de quiz fictives.

## Références
- Maths/SVT : ressources ADEM Sénégal lorsque disponibles dans le projet.
- Français : ressources ADEM.
- Anglais/Histoire/Géographie : PROMET / MEN pour le cadrage.
- Le contenu est une rédaction originale EdTech Sénégal et ne doit pas être présenté comme une reproduction officielle.

## Commandes
```powershell
npm install
npx tsc --noEmit
npm run db:import:5e-all
```

Après validation pédagogique :
```powershell
$env:EDTECH_PUBLISH_ENRICHMENT="true"
npm run db:import:5e-all
```

## Note qualité
Le pack constitue une base structurée importante, mais doit rester en `review` : une validation humaine matière par matière est recommandée avant publication, en particulier pour la conformité fine aux progressions nationales et pour les questions de raisonnement.

## Vérifications effectuées dans l'environnement de génération
- Archive du projet ouverte et structure inspectée.
- 6 programmes 5e définis.
- 72 chapitres.
- 72 leçons.
- 216 exercices (3 par leçon).
- 864 questions (12 par leçon, 4 par exercice).
- Chaque exercice reçoit explicitement 4 questions lors de l'import.
- Doublons : l'import vérifie `exercise_id + prompt` avant insertion.
- `npm install --ignore-scripts` a dépassé le délai dans cet environnement; le `tsc` local n'est donc pas disponible ici.
- L'import Supabase n'a pas été exécuté, faute de `.env.local`/accès à ta base dans l'archive.
