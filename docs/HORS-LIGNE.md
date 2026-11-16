# Lecture hors connexion

## Ce que fait l'élève

1. Connecté, il ouvre un chapitre de « Mon programme » et choisit **Télécharger pour lire sans connexion**. Les leçons publiées du chapitre sont gardées sur son appareil.
2. Sans connexion, toute page qu'il n'a pas déjà visitée affiche à la place la page **Leçons téléchargées** (`/hors-ligne`) : ses chapitres, leurs leçons, avec les formules, les objectifs et le résumé.
3. La page est aussi accessible à tout moment : lien « Téléchargements » du menu, ou « Voir mes téléchargements » sur un chapitre téléchargé. Il peut y supprimer un chapitre, et le mettre à jour depuis la page du chapitre.

## Ce qui reste en ligne

Les exercices, les quiz et le mode BFEM demandent une connexion : ils sont corrigés par le serveur, et les bonnes réponses ne sont jamais envoyées à l'appareil. Une leçon lue hors connexion n'est pas marquée « terminée ».

## Comment c'est construit

- `app/api/offline/chapter/[chapterId]/route.ts` renvoie les leçons publiées d'un chapitre, avec la session de l'élève (mêmes règles que la page du chapitre : connecté, chapitre publié, de son niveau).
- `lib/offline/chapterStore.ts` garde les chapitres dans le stockage « Cache » du navigateur, dans un espace séparé de celui du service worker.
- `app/hors-ligne/` est une page statique et publique : elle ne lit rien sur le serveur. Le service worker la met en cache à son installation (`additionalPrecacheEntries` dans `next.config.js`) et l'affiche quand une page ne peut pas être chargée (`fallbacks` dans `app/sw.ts`).
- Les pages déjà visitées restent servies depuis le cache comme avant.

## Limites connues

- Les téléchargements sont liés à l'appareil et au navigateur, pas au compte : sur un appareil partagé, un autre élève voit les chapitres téléchargés. Ce ne sont que des cours.
- Le navigateur peut vider ce stockage si l'appareil manque de place.
- Un chapitre téléchargé n'est pas mis à jour tout seul quand le cours change : bouton « Mettre à jour » sur la page du chapitre.
