# Corrections — 26/08/2026

## Fonctionnalités
- Correction du rafraîchissement après validation d'une leçon.
- Amélioration de la reprise des cours et affichage des programmes déjà terminés.
- Navigation précédente/suivante améliorée : les chapitres vides sont ignorés.
- Après la validation d'un exercice qui termine réellement un chapitre, passage automatique vers le chapitre suivant lorsqu'il existe.
- Vérification de la progression réelle avant de considérer un chapitre comme terminé.

## Design / lisibilité
- Texte des leçons agrandi et mieux espacé.
- Titres et sous-titres pédagogiques plus visibles.
- Questions et options des quiz/exercices agrandies avec zones de clic plus confortables.
- Champs de réponse plus lisibles sur mobile.
- Contraste renforcé en mode sombre pour les textes et bordures utilisant les anciennes classes Tailwind.

## Vérification
- Transpilation TypeScript/TSX des fichiers modifiés : OK.
- `npm run typecheck` n'a pas pu être exécuté complètement dans l'environnement de travail car l'installation des dépendances npm a expiré et les définitions de types locales étaient incomplètes.
