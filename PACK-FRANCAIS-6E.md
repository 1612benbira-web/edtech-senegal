# Pack Français 6e — EdTech Sénégal

## Contenu

Le pack ajoute un curriculum **Français 6e – Programme sénégalais** avec :

- 15 chapitres ;
- 45 leçons ;
- 45 exercices ;
- 180 questions corrigées ;
- explication pour chaque réponse ;
- contenu de cours en Markdown ;
- objectifs et résumés pour chaque leçon ;
- contenu publié pour alimenter les quiz de chapitre, de matière, de révision et d'évaluation.

Les quiz ne sont pas stockés comme des « quiz fixes » : le projet les génère dynamiquement à partir des questions publiées. Le service de quiz existant peut donc utiliser immédiatement ce pack.

## Référentiel

Le cadrage s'appuie sur les ressources ADEM Dakar / Ministère de l'Éducation nationale. Les textes pédagogiques et questions du pack sont des formulations originales pour EdTech Sénégal.

Source de cadrage : https://ademdakar.wixsite.com/adem/eleves-parents

## Import Supabase

Le fichier `.env.local` doit contenir au minimum :

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
```

Ne partage jamais la clé secrète.

Puis exécuter :

```powershell
npm install
npm run db:import:6e-francais
```

L'import est conçu pour être relancé : les éléments déjà présents sont réutilisés au lieu d'être dupliqués.

## Vérification

Après l'import, vérifier dans l'administration :

- `/admin/curriculums`
- `/admin/chapters`
- `/admin/lessons`
- `/admin/questions`

Puis côté élève :

- `/programme`
- `/quiz`
- un chapitre Français 6e ;
- le bouton de quiz de chapitre.
