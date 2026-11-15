# Mode BFEM — épreuve blanche chronométrée

Réservé aux élèves de 3e. Page : `/bfem` (lien dans la barre latérale et en haut de la page Quiz).

## Ce que fait l'élève

1. Il choisit une matière et commence l'épreuve : 20 questions tirées de tous les chapitres publiés de la matière, 30 minutes (90 secondes par question).
2. Il répond une question à la fois, peut revenir en arrière, et rend sa copie quand il veut. À la fin du temps, la copie est rendue automatiquement.
3. Il obtient sa note sur 20, ses résultats par chapitre (du moins réussi au mieux réussi) et le corrigé de chaque question.
4. La page `/bfem` garde l'historique des épreuves et affiche la moyenne de la dernière note de chaque matière.

Les questions viennent de la banque de questions de la plateforme : ce ne sont pas les sujets officiels du BFEM, et la moyenne affichée n'applique pas les coefficients de l'examen.

## Mise en service

Appliquer la migration `supabase/migrations/0031_exam_quiz_type.sql` (staging d'abord). Elle autorise le type de quiz `exam` et ajoute un index ; aucune colonne ni table nouvelle.

Tant qu'elle n'est pas appliquée, le reste de l'application fonctionne comme avant et le bouton « Commencer l'épreuve » affiche « Le mode BFEM n'est pas encore activé ».

Il faut aussi du contenu 3e **publié** : une matière sans question publiée affiche un message au lieu de lancer une épreuve.

## Comment c'est construit

- Une épreuve est une ligne `quiz_attempts` de type `exam` avec ses `quiz_questions` : mêmes règles d'accès (RLS) et même correction (`gradeQuizAction`) que les autres quiz, donc XP, série de jours, badges et maîtrise par compétence sont mis à jour comme d'habitude.
- Règles (tirage équilibré par chapitre, durée, note, appréciation) : `lib/algorithms/mockExam.ts`, testées dans `mockExam.test.ts`.
- Accès aux données : `lib/services/examService.ts`. Les bonnes réponses ne sont lues (client service_role) qu'une fois l'épreuve terminée et après vérification qu'elle appartient à l'élève.
- Écrans : `app/(app)/bfem/`.

## Limites connues

- Le chronomètre est appliqué dans le navigateur. Le serveur ne refuse pas une copie rendue en retard : c'est un entraînement, et un élève dont le réseau coupe à la fin du temps ne doit pas perdre sa copie.
- Pendant l'épreuve, les réponses sont gardées sur l'appareil (localStorage) et retrouvées après un rechargement de page. Elles ne suivent pas l'élève sur un autre appareil.
- Les questions d'association et de classement ne sont pas proposées en épreuve.
