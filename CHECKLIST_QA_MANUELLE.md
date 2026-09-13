# Checklist QA manuelle — edtech-senegal

Ce document couvre tout ce qui ne peut pas être vérifié par des tests
automatisés (rendu réel, navigation, RLS en conditions réelles, emails,
etc.). Utilise des vrais comptes de test, jamais de comptes élèves réels.

Coche au fur et à mesure. Note tout comportement inattendu avec l'URL et
les étapes exactes pour reproduire.

## 0. Comptes de test à préparer
- [ ] 1 compte élève 6e (sans série)
- [ ] 1 compte élève Seconde S2
- [ ] 1 compte élève Seconde L2
- [ ] 1 compte élève Terminale S2 (contenu tout récent, priorité de vérif)
- [ ] 1 compte school_admin
- [ ] 1 compte super_admin
- [ ] Si multi-écoles activé : 2 écoles distinctes avec un élève dans chacune

## 1. Authentification
- [ ] Inscription élève (email + mot de passe) → arrive bien sur l'onboarding
- [ ] Connexion avec identifiants valides
- [ ] Connexion avec mauvais mot de passe → message d'erreur clair, pas de fuite d'info
- [ ] Déconnexion → session bien coupée (retour à une page protégée = redirigé vers /login)
- [ ] Mot de passe oublié (si implémenté) → email reçu, lien fonctionnel
- [ ] Accès direct à une URL protégée sans être connecté → redirection vers /login
- [ ] Rafraîchir la page sur une route protégée reste connecté (session persistée)

## 2. Onboarding
- [ ] 6e (pas de série) : liste des matières correspond bien à 6e uniquement
- [ ] Seconde : le choix de série (S2/L2) change bien la liste de matières affichées
- [ ] Français apparaît pour LES DEUX séries en Seconde (matière commune) — comportement attendu, pas un bug
- [ ] Impossible de valider sans prénom, sans niveau, sans au moins une matière
- [ ] Terminer l'onboarding puis le refaire (changement de niveau/série en cours d'année) : les anciennes matières sont bien remplacées, pas cumulées
- [ ] Après onboarding, arrivée sur le dashboard avec le bon niveau/série affiché

## 3. Dashboard
- [ ] Salutation avec le bon prénom
- [ ] Matières affichées correspondent exactement à celles choisies à l'onboarding
- [ ] **Vérif spécifique post-correction du bug de série** : un élève Seconde S2 et un élève Seconde L2 sur "Mathématiques" voient des programmes différents (chapitres différents) — capture d'écran des deux à comparer
- [ ] Bouton "Continuer" pointe vers la bonne leçon (dernière en cours, ou première si rien commencé)
- [ ] Streak (série de jours) affiché correctement
- [ ] XP total affiché correctement

## 4. Programme / Chapitres / Leçons
- [ ] Cliquer sur une matière → liste des chapitres dans le bon ordre
- [ ] Chapitre avec 0 leçon publiée → message clair, pas d'écran blanc
- [ ] Ouvrir une leçon → contenu s'affiche, pas d'erreur console
- [ ] Navigation "leçon suivante" à l'intérieur d'un chapitre fonctionne
- [ ] Navigation vers le chapitre suivant une fois le dernier terminé fonctionne
- [ ] Marquer une leçon comme terminée → progression mise à jour visible sur le dashboard/programme
- [ ] Tenter d'accéder à une leçon d'un niveau différent du sien via URL directe (ex. copier l'URL d'une leçon Terminale en étant connecté en 6e) → doit être bloqué (notFound), pas juste caché visuellement

## 5. Exercices — tester CHAQUE type de question au moins une fois
- [ ] Choix unique (single_choice) : bonne réponse → correct ; mauvaise → incorrect
- [ ] Vrai/Faux (true_false)
- [ ] Choix multiple (multiple_choice) : cocher exactement les bonnes cases → correct ; en cocher une de trop ou une de moins → incorrect
- [ ] Numérique : tester avec virgule ET point décimal (ex. "3,5" et "3.5") → les deux doivent être acceptés si la bonne réponse est 3.5
- [ ] Réponse courte (short_answer) : tester avec des espaces avant/après et une casse différente → doit quand même être accepté
- [ ] **Correspondance (matching) — priorité haute, bug corrigé récemment** : associer chaque item de gauche à la bonne réponse de droite → doit être marqué correct ; inverser deux associations → doit être marqué incorrect. Refaire ce test sur 2-3 exercices "matching" différents pour être sûr.
- [ ] **Ordonnancement (ordering)** : remettre dans le bon ordre → correct ; inverser deux éléments → incorrect
- [ ] Refaire un exercice déjà réussi → pas de nouvel XP gagné sur les questions déjà correctes une première fois (garde-fou anti-farming)
- [ ] Après correction, les bonnes réponses sont bien révélées (correctLabels affichés)
- [ ] Navigation "leçon/chapitre suivant" proposée après un exercice fonctionne

## 6. Quiz (chapitre / matière / révision / évaluation / quotidien)
- [ ] Quiz de chapitre : questions bien issues du chapitre concerné
- [ ] Quiz de matière : questions couvrent plusieurs chapitres
- [ ] Quiz de révision (spaced repetition) : proposé quand il y a des compétences à réviser
- [ ] Quiz d'évaluation
- [ ] Quiz quotidien : un seul par jour, revient identique si on le rouvre le même jour, nouveau quiz le lendemain
- [ ] Terminer un quiz à 100% → XP bonus "quiz_perfect" attribué en plus du XP normal
- [ ] Tenter de soumettre deux fois le même quiz (rejouer la même URL/requête) → erreur "déjà corrigé", pas de double XP
- [ ] Ouvrir le même quiz dans deux onglets et valider en même temps (test de la course conditionnelle) → un seul des deux doit réussir à corriger, l'autre reçoit l'erreur "déjà corrigé"

## 7. Gamification
- [ ] Badge obtenu après une action qui le déclenche (ex. premier quiz, streak de N jours) → notification/affichage visible
- [ ] Streak : faire une activité 2 jours de suite → streak = 2 ; sauter un jour → streak revient à 1 (ou 0) le jour suivant
- [ ] Classement / leaderboard par niveau (si visible par l'élève) affiche les bons élèves du bon niveau uniquement

## 8. Recherche
- [ ] Recherche globale renvoie des résultats pertinents (matières, chapitres, leçons visibles par l'élève connecté)
- [ ] Recherche ne renvoie PAS de contenu d'un niveau/d'une série auquel l'élève n'a pas accès
- [ ] Recherche avec requête vide / caractères spéciaux ne plante pas

## 9. Messagerie (si activée)
- [ ] Envoyer un message élève → école / école → élève
- [ ] Élève ne voit que ses propres conversations, pas celles des autres élèves

## 10. Réglages / Profil
- [ ] Modifier le prénom/nom → sauvegardé et reflété partout (dashboard, profil)
- [ ] Changer le mot de passe
- [ ] Page profil affiche niveau, série, matières, progression, streak correctement

## 11. Différenciation des rôles (Bug 3 du rapport initial)
- [ ] Compte élève : URL `/admin` directement dans la barre d'adresse → redirigé/bloqué, pas d'accès
- [ ] Compte élève : tenter une action serveur admin (ex. rejouer une requête réseau d'une action admin capturée dans les devtools) → rejetée côté serveur, pas seulement cachée côté UI
- [ ] Compte school_admin : accès à `/admin` limité à SON école (ne voit pas les élèves/contenus d'une autre école)
- [ ] Compte super_admin : accès complet, gestion multi-écoles visible

## 12. Admin — Utilisateurs
- [ ] Créer / modifier / supprimer un utilisateur
- [ ] Changer le rôle d'un utilisateur
- [ ] Forcer une déconnexion (si fonctionnalité présente) → l'utilisateur est bien déconnecté à sa prochaine requête

## 13. Admin — Contenu pédagogique
- [ ] Créer un nouveau curriculum → reste en `draft` par défaut, invisible des élèves
- [ ] Tenter de publier un curriculum SANS source_url ni source_document → bloqué par le garde-fou (message d'erreur clair)
- [ ] Publier un curriculum avec une source renseignée → devient visible côté élève immédiatement
- [ ] Ajouter/modifier/supprimer un chapitre, une leçon, un exercice, une question
- [ ] Suppression en cascade d'un curriculum non vide (chapitres + leçons + exercices dedans) → tout est bien supprimé sans erreur orpheline
- [ ] Créer une question de type "matching" avec plusieurs paires, la publier, puis la faire côté élève → vérifier que l'ordre gauche/droite affiché correspond bien à ce qui a été saisi côté admin

## 14. Admin — Écoles (multi-écoles)
- [ ] Créer une école
- [ ] Rattacher un élève à une école
- [ ] Contenu propre à une école (school_id renseigné) visible uniquement par les élèves de cette école
- [ ] Un élève sans école rattachée (ancien compte) continue de voir le contenu national normalement

## 15. Cas limites / robustesse
- [ ] Profil incomplet (niveau non renseigné) sur n'importe quelle page élève → redirection propre vers l'onboarding, pas d'écran blanc ni d'erreur
- [ ] Matière choisie sans aucun curriculum publié pour ce niveau → message "Aucun contenu disponible", pas d'écran vide silencieux
- [ ] Navigation au clavier / lecteur d'écran sur au moins une page clé (accessibilité de base)
- [ ] Affichage mobile (portrait, petit écran) sur dashboard, leçon, exercice, quiz
- [ ] Mode sombre (si présent) sur les mêmes pages
- [ ] Perte de connexion réseau pendant un exercice/quiz → pas de perte de progression silencieuse, message d'erreur si la sauvegarde échoue

## 16. Régressions à revérifier après CE chantier de corrections
- [ ] Élève Seconde S2 et élève Seconde L2 sur la même matière → contenus bien différenciés (voir section 3)
- [ ] Élève 6e SVT → élève 5e SVT (progression d'une année à l'autre) : pas de perte de données suite à la fusion du doublon SVT
- [ ] Exercices de type "matching" créés AVANT ce correctif : les rouvrir et vérifier qu'ils se corrigent toujours correctement (l'ordre en base n'a pas changé, seule la requête est maintenant explicite)
- [ ] Inscription onboarding avec une tentative de matière hors-niveau (test technique, via devtools/Postman en modifiant le formData) → doit être rejetée avec le nouveau message d'erreur
