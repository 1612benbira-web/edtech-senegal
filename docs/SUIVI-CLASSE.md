# Suivi de classe — espace enseignant

Page : `/teacher/classes` (onglet « Mes classes » de l'espace enseignant, et lien « Suivi de la classe » sur chaque affectation).

## Ce que voit l'enseignant

Pour chacune de ses affectations (matière + niveau, éventuellement une série) :

- **La classe** : nombre d'élèves, élèves actifs sur 7 jours, progression moyenne dans le programme, moyenne aux quiz de la matière.
- **Notions à retravailler** : jusqu'à cinq compétences du programme dont la maîtrise moyenne de la classe est sous 60 %, la plus faible en premier.
- **Élèves** : leçons terminées, moyenne et nombre de quiz, maîtrise moyenne, dernière connexion, avec un repère « Inactif » après 7 jours sans connexion. Les élèves qui ont le moins avancé sont en premier.

## Qui est dans la classe

Les élèves **actifs de l'école de l'enseignant**, dont le niveau (et la série, si l'affectation en a une) correspond à l'affectation. Un élève rejoint une école avec son code établissement à l'inscription.

Le programme suivi est celui de l'école pour cette matière et ce niveau s'il existe, sinon le programme national publié. Les quiz du jour et de révision mélangent les matières : ils ne comptent pas dans la moyenne de la matière.

## Sécurité

Les règles d'accès de la base (RLS) ne laissent pas un enseignant lire la progression des élèves. `lib/services/teacherDashboardService.ts` lit donc avec le client service_role, **après** avoir vérifié avec la session de l'utilisateur (`requireTeacherAccess`) qu'il est enseignant actif de l'école et que l'affectation demandée est la sienne. Toutes les lectures sont bornées par cette école, ce niveau et cette matière. Aucune migration n'est nécessaire.

Les calculs (progression, inactivité, notions faibles) sont dans `lib/algorithms/classOverview.ts`.

## Limites connues

- Pas encore de devoirs assignés ni d'export.
- Lycée : une affectation « toutes séries » suit un seul programme de référence, même si les séries ont des programmes différents.
- Le programme national est pris en compte même s'il n'est pas activé pour l'école.
