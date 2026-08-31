import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("\n❌ Configuration Supabase manquante.");
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? "OK" : "MANQUANTE"}`);
  console.error(`   SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SECRET_KEY ? "OK" : "MANQUANTE"}`);
  console.error("   Ajoute ces variables dans .env.local à la racine du projet, puis relance la commande.\n");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const STATUS = process.env.EDTECH_PUBLISH_ENRICHMENT === "true" ? "published" : "review";
const PROMET_URL = "https://apprendre.education.sn/C_ressource/recherche/34";

type RawQuestion = {
  kind: "mc" | "tf";
  prompt: string;
  answer: string | boolean;
  wrongs?: string[];
  explanation: string;
};
type RawLesson = {
  title: string;
  objectives: string[];
  summary: string;
  content: string;
  questions: RawQuestion[];
};
type RawChapter = {
  title: string;
  domain: string;
  competency: string;
  lessons: RawLesson[];
};
type RawProgram = {
  subject: string;
  source: string;
  version: string;
  chapters: RawChapter[];
};

const programs: RawProgram[] = [
  {
    "subject": "Mathématiques",
    "source": "https://ademdakar.wixsite.com/adem/maths",
    "version": "5e-mathematiques-v2",
    "chapters": [
      {
        "title": "Puissances et priorités de calcul",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser puissances et priorités de calcul et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Puissances et priorités de calcul",
            "objectives": [
              "Définir et expliquer « Puissances et priorités de calcul ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs.",
            "content": "# Puissances et priorités de calcul\n\nUne puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs.\n\n## Exemple guidé\n2^3 = 2×2×2 = 8.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Puissances et priorités de calcul » ?",
                "answer": "8",
                "wrongs": [
                  "6",
                  "9",
                  "12"
                ],
                "explanation": "Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs. La réponse correcte est « 8 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Puissances et priorités de calcul », quelle réponse obtient-on ?",
                "answer": "8",
                "wrongs": [
                  "6",
                  "9",
                  "12"
                ],
                "explanation": "L'exemple illustre directement la notion : 2^3 = 2×2×2 = 8."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Puissances et priorités de calcul » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Puissances et priorités de calcul » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Puissances et priorités de calcul » ?",
                "answer": "2^3 = 2×2×2 = 8.",
                "wrongs": [
                  "6",
                  "9",
                  "12"
                ],
                "explanation": "Cette situation réinvestit la notion : 2^3 = 2×2×2 = 8."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Puissances et priorités de calcul » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Puissances et priorités de calcul ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Puissances et priorités de calcul » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 6 ». Quelle réponse doit-il retenir pour « Puissances et priorités de calcul » ?",
                "answer": "8",
                "wrongs": [
                  "9",
                  "12",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Puissances et priorités de calcul » ?",
                "answer": "Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Puissances et priorités de calcul », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Puissances et priorités de calcul » ?",
                "answer": "Une puissance est un produit de facteurs égaux. Les parenthèses et la priorité des opérations déterminent l'ordre des calculs.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Multiples et diviseurs",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser multiples et diviseurs et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Multiples et diviseurs",
            "objectives": [
              "Définir et expliquer « Multiples et diviseurs ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste.",
            "content": "# Multiples et diviseurs\n\nUn multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste.\n\n## Exemple guidé\n24 est un multiple de 6 et 6 est un diviseur de 24.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Multiples et diviseurs » ?",
                "answer": "24",
                "wrongs": [
                  "18",
                  "25",
                  "30"
                ],
                "explanation": "Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste. La réponse correcte est « 24 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Multiples et diviseurs », quelle réponse obtient-on ?",
                "answer": "24",
                "wrongs": [
                  "18",
                  "25",
                  "30"
                ],
                "explanation": "L'exemple illustre directement la notion : 24 est un multiple de 6 et 6 est un diviseur de 24."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Multiples et diviseurs » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Multiples et diviseurs » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Multiples et diviseurs » ?",
                "answer": "24 est un multiple de 6 et 6 est un diviseur de 24.",
                "wrongs": [
                  "18",
                  "25",
                  "30"
                ],
                "explanation": "Cette situation réinvestit la notion : 24 est un multiple de 6 et 6 est un diviseur de 24."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Multiples et diviseurs » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Multiples et diviseurs ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Multiples et diviseurs » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 18 ». Quelle réponse doit-il retenir pour « Multiples et diviseurs » ?",
                "answer": "24",
                "wrongs": [
                  "25",
                  "30",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Multiples et diviseurs » ?",
                "answer": "Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Multiples et diviseurs », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Multiples et diviseurs » ?",
                "answer": "Un multiple de a est obtenu en multipliant a par un entier. Un diviseur partage un nombre sans reste.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Fractions et simplification",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser fractions et simplification et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Fractions et simplification",
            "objectives": [
              "Définir et expliquer « Fractions et simplification ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul.",
            "content": "# Fractions et simplification\n\nUne fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul.\n\n## Exemple guidé\n12/18 se simplifie en 2/3.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Fractions et simplification » ?",
                "answer": "2/3",
                "wrongs": [
                  "3/4",
                  "4/5",
                  "6/9"
                ],
                "explanation": "Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul. La réponse correcte est « 2/3 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Fractions et simplification », quelle réponse obtient-on ?",
                "answer": "2/3",
                "wrongs": [
                  "3/4",
                  "4/5",
                  "6/9"
                ],
                "explanation": "L'exemple illustre directement la notion : 12/18 se simplifie en 2/3."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Fractions et simplification » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Fractions et simplification » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Fractions et simplification » ?",
                "answer": "12/18 se simplifie en 2/3.",
                "wrongs": [
                  "3/4",
                  "4/5",
                  "6/9"
                ],
                "explanation": "Cette situation réinvestit la notion : 12/18 se simplifie en 2/3."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Fractions et simplification » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Fractions et simplification ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Fractions et simplification » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 3/4 ». Quelle réponse doit-il retenir pour « Fractions et simplification » ?",
                "answer": "2/3",
                "wrongs": [
                  "4/5",
                  "6/9",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Fractions et simplification » ?",
                "answer": "Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Fractions et simplification », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Fractions et simplification » ?",
                "answer": "Une fraction représente un quotient. On peut simplifier une fraction en divisant numérateur et dénominateur par un même diviseur non nul.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Proportionnalité",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser proportionnalité et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Proportionnalité",
            "objectives": [
              "Définir et expliquer « Proportionnalité ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant.",
            "content": "# Proportionnalité\n\nDeux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant.\n\n## Exemple guidé\nSi 3 cahiers coûtent 900 F CFA, 1 cahier coûte 300 F CFA.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nDeux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Proportionnalité » ?",
                "answer": "300 F CFA",
                "wrongs": [
                  "200 F CFA",
                  "270 F CFA",
                  "600 F CFA"
                ],
                "explanation": "Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant. La réponse correcte est « 300 F CFA »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Proportionnalité », quelle réponse obtient-on ?",
                "answer": "300 F CFA",
                "wrongs": [
                  "200 F CFA",
                  "270 F CFA",
                  "600 F CFA"
                ],
                "explanation": "L'exemple illustre directement la notion : Si 3 cahiers coûtent 900 F CFA, 1 cahier coûte 300 F CFA."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Proportionnalité » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Proportionnalité » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Proportionnalité » ?",
                "answer": "Si 3 cahiers coûtent 900 F CFA, 1 cahier coûte 300 F CFA.",
                "wrongs": [
                  "200 F CFA",
                  "270 F CFA",
                  "600 F CFA"
                ],
                "explanation": "Cette situation réinvestit la notion : Si 3 cahiers coûtent 900 F CFA, 1 cahier coûte 300 F CFA."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Proportionnalité » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Proportionnalité ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Proportionnalité » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 200 F CFA ». Quelle réponse doit-il retenir pour « Proportionnalité » ?",
                "answer": "300 F CFA",
                "wrongs": [
                  "270 F CFA",
                  "600 F CFA",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Proportionnalité » ?",
                "answer": "Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Proportionnalité », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Proportionnalité » ?",
                "answer": "Deux grandeurs sont proportionnelles lorsque le rapport entre les valeurs correspondantes reste constant.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Nombres décimaux relatifs",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser nombres décimaux relatifs et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Nombres décimaux relatifs",
            "objectives": [
              "Définir et expliquer « Nombres décimaux relatifs ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits.",
            "content": "# Nombres décimaux relatifs\n\nUn nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits.\n\n## Exemple guidé\n-2 est inférieur à +1.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Nombres décimaux relatifs » ?",
                "answer": "-2 < +1",
                "wrongs": [
                  "+1 < -2",
                  "-2 = +1",
                  "+2 < -1"
                ],
                "explanation": "Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits. La réponse correcte est « -2 < +1 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Nombres décimaux relatifs », quelle réponse obtient-on ?",
                "answer": "-2 < +1",
                "wrongs": [
                  "+1 < -2",
                  "-2 = +1",
                  "+2 < -1"
                ],
                "explanation": "L'exemple illustre directement la notion : -2 est inférieur à +1."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Nombres décimaux relatifs » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Nombres décimaux relatifs » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Nombres décimaux relatifs » ?",
                "answer": "-2 est inférieur à +1.",
                "wrongs": [
                  "+1 < -2",
                  "-2 = +1",
                  "+2 < -1"
                ],
                "explanation": "Cette situation réinvestit la notion : -2 est inférieur à +1."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Nombres décimaux relatifs » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Nombres décimaux relatifs ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Nombres décimaux relatifs » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « +1 < -2 ». Quelle réponse doit-il retenir pour « Nombres décimaux relatifs » ?",
                "answer": "-2 < +1",
                "wrongs": [
                  "-2 = +1",
                  "+2 < -1",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Nombres décimaux relatifs » ?",
                "answer": "Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Nombres décimaux relatifs », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Nombres décimaux relatifs » ?",
                "answer": "Un nombre relatif peut être positif, nul ou négatif. Sur une droite graduée, les nombres les plus à gauche sont les plus petits.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Repérage et représentation graphique",
        "domain": "Nombres et calculs",
        "competency": "Maîtriser repérage et représentation graphique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Repérage et représentation graphique",
            "objectives": [
              "Définir et expliquer « Repérage et représentation graphique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un point du plan peut être repéré par deux coordonnées dans un repère.",
            "content": "# Repérage et représentation graphique\n\nUn point du plan peut être repéré par deux coordonnées dans un repère.\n\n## Exemple guidé\nLe point A(3; -2) a pour abscisse 3 et pour ordonnée -2.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn point du plan peut être repéré par deux coordonnées dans un repère.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Repérage et représentation graphique » ?",
                "answer": "3",
                "wrongs": [
                  "-2",
                  "5",
                  "-5"
                ],
                "explanation": "Un point du plan peut être repéré par deux coordonnées dans un repère. La réponse correcte est « 3 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Repérage et représentation graphique », quelle réponse obtient-on ?",
                "answer": "3",
                "wrongs": [
                  "-2",
                  "5",
                  "-5"
                ],
                "explanation": "L'exemple illustre directement la notion : Le point A(3; -2) a pour abscisse 3 et pour ordonnée -2."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Repérage et représentation graphique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un point du plan peut être repéré par deux coordonnées dans un repère."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Repérage et représentation graphique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Repérage et représentation graphique » ?",
                "answer": "Le point A(3; -2) a pour abscisse 3 et pour ordonnée -2.",
                "wrongs": [
                  "-2",
                  "5",
                  "-5"
                ],
                "explanation": "Cette situation réinvestit la notion : Le point A(3; -2) a pour abscisse 3 et pour ordonnée -2."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Repérage et représentation graphique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Repérage et représentation graphique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Repérage et représentation graphique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « -2 ». Quelle réponse doit-il retenir pour « Repérage et représentation graphique » ?",
                "answer": "3",
                "wrongs": [
                  "5",
                  "-5",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un point du plan peut être repéré par deux coordonnées dans un repère."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Repérage et représentation graphique » ?",
                "answer": "Un point du plan peut être repéré par deux coordonnées dans un repère.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Repérage et représentation graphique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Repérage et représentation graphique » ?",
                "answer": "Un point du plan peut être repéré par deux coordonnées dans un repère.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Symétrie centrale",
        "domain": "Géométrie",
        "competency": "Maîtriser symétrie centrale et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Symétrie centrale",
            "objectives": [
              "Définir et expliquer « Symétrie centrale ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie.",
            "content": "# Symétrie centrale\n\nDeux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie.\n\n## Exemple guidé\nDans une symétrie centrale de centre O, O est le milieu de [AA'].\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nDeux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Symétrie centrale » ?",
                "answer": "O est le milieu de [AA']",
                "wrongs": [
                  "A est le milieu de [OA']",
                  "O est l'extrémité de [AA']",
                  "A et A' sont confondus"
                ],
                "explanation": "Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie. La réponse correcte est « O est le milieu de [AA'] »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Symétrie centrale », quelle réponse obtient-on ?",
                "answer": "O est le milieu de [AA']",
                "wrongs": [
                  "A est le milieu de [OA']",
                  "O est l'extrémité de [AA']",
                  "A et A' sont confondus"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans une symétrie centrale de centre O, O est le milieu de [AA']."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Symétrie centrale » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Symétrie centrale » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Symétrie centrale » ?",
                "answer": "Dans une symétrie centrale de centre O, O est le milieu de [AA'].",
                "wrongs": [
                  "A est le milieu de [OA']",
                  "O est l'extrémité de [AA']",
                  "A et A' sont confondus"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans une symétrie centrale de centre O, O est le milieu de [AA']."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Symétrie centrale » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Symétrie centrale ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Symétrie centrale » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « A est le milieu de [OA'] ». Quelle réponse doit-il retenir pour « Symétrie centrale » ?",
                "answer": "O est le milieu de [AA']",
                "wrongs": [
                  "O est l'extrémité de [AA']",
                  "A et A' sont confondus",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Symétrie centrale » ?",
                "answer": "Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Symétrie centrale », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Symétrie centrale » ?",
                "answer": "Deux points sont symétriques par rapport à un centre si ce centre est le milieu du segment qui les relie.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Angles et parallélisme",
        "domain": "Géométrie",
        "competency": "Maîtriser angles et parallélisme et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Angles et parallélisme",
            "objectives": [
              "Définir et expliquer « Angles et parallélisme ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante.",
            "content": "# Angles et parallélisme\n\nLa mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante.\n\n## Exemple guidé\nDeux angles alternes-internes sont égaux lorsque les deux droites sont parallèles.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Angles et parallélisme » ?",
                "answer": "ils ont la même mesure",
                "wrongs": [
                  "ils sont toujours supplémentaires",
                  "ils sont toujours nuls",
                  "ils ont toujours 90°"
                ],
                "explanation": "La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante. La réponse correcte est « ils ont la même mesure »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Angles et parallélisme », quelle réponse obtient-on ?",
                "answer": "ils ont la même mesure",
                "wrongs": [
                  "ils sont toujours supplémentaires",
                  "ils sont toujours nuls",
                  "ils ont toujours 90°"
                ],
                "explanation": "L'exemple illustre directement la notion : Deux angles alternes-internes sont égaux lorsque les deux droites sont parallèles."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Angles et parallélisme » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Angles et parallélisme » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Angles et parallélisme » ?",
                "answer": "Deux angles alternes-internes sont égaux lorsque les deux droites sont parallèles.",
                "wrongs": [
                  "ils sont toujours supplémentaires",
                  "ils sont toujours nuls",
                  "ils ont toujours 90°"
                ],
                "explanation": "Cette situation réinvestit la notion : Deux angles alternes-internes sont égaux lorsque les deux droites sont parallèles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Angles et parallélisme » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Angles et parallélisme ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Angles et parallélisme » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « ils sont toujours supplémentaires ». Quelle réponse doit-il retenir pour « Angles et parallélisme » ?",
                "answer": "ils ont la même mesure",
                "wrongs": [
                  "ils sont toujours nuls",
                  "ils ont toujours 90°",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Angles et parallélisme » ?",
                "answer": "La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Angles et parallélisme », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Angles et parallélisme » ?",
                "answer": "La mesure d'un angle se lit avec un rapporteur. Des angles particuliers apparaissent lorsque des droites sont parallèles et coupées par une sécante.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Parallélogramme",
        "domain": "Géométrie",
        "competency": "Maîtriser parallélogramme et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Parallélogramme",
            "objectives": [
              "Définir et expliquer « Parallélogramme ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu.",
            "content": "# Parallélogramme\n\nUn parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu.\n\n## Exemple guidé\nDans un parallélogramme, les diagonales se coupent en leur milieu.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Parallélogramme » ?",
                "answer": "elles se coupent en leur milieu",
                "wrongs": [
                  "elles sont toujours perpendiculaires",
                  "elles sont toujours égales",
                  "elles sont parallèles"
                ],
                "explanation": "Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu. La réponse correcte est « elles se coupent en leur milieu »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Parallélogramme », quelle réponse obtient-on ?",
                "answer": "elles se coupent en leur milieu",
                "wrongs": [
                  "elles sont toujours perpendiculaires",
                  "elles sont toujours égales",
                  "elles sont parallèles"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans un parallélogramme, les diagonales se coupent en leur milieu."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Parallélogramme » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Parallélogramme » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Parallélogramme » ?",
                "answer": "Dans un parallélogramme, les diagonales se coupent en leur milieu.",
                "wrongs": [
                  "elles sont toujours perpendiculaires",
                  "elles sont toujours égales",
                  "elles sont parallèles"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans un parallélogramme, les diagonales se coupent en leur milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Parallélogramme » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Parallélogramme ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Parallélogramme » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « elles sont toujours perpendiculaires ». Quelle réponse doit-il retenir pour « Parallélogramme » ?",
                "answer": "elles se coupent en leur milieu",
                "wrongs": [
                  "elles sont toujours égales",
                  "elles sont parallèles",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Parallélogramme » ?",
                "answer": "Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Parallélogramme », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Parallélogramme » ?",
                "answer": "Un parallélogramme est un quadrilatère dont les côtés opposés sont parallèles. Ses diagonales se coupent en leur milieu.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Triangles",
        "domain": "Géométrie",
        "competency": "Maîtriser triangles et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Triangles",
            "objectives": [
              "Définir et expliquer « Triangles ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles.",
            "content": "# Triangles\n\nLa somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles.\n\n## Exemple guidé\nUn triangle rectangle possède un angle droit.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Triangles » ?",
                "answer": "90°",
                "wrongs": [
                  "45°",
                  "60°",
                  "180°"
                ],
                "explanation": "La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles. La réponse correcte est « 90° »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Triangles », quelle réponse obtient-on ?",
                "answer": "90°",
                "wrongs": [
                  "45°",
                  "60°",
                  "180°"
                ],
                "explanation": "L'exemple illustre directement la notion : Un triangle rectangle possède un angle droit."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Triangles » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Triangles » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Triangles » ?",
                "answer": "Un triangle rectangle possède un angle droit.",
                "wrongs": [
                  "45°",
                  "60°",
                  "180°"
                ],
                "explanation": "Cette situation réinvestit la notion : Un triangle rectangle possède un angle droit."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Triangles » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Triangles ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Triangles » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 45° ». Quelle réponse doit-il retenir pour « Triangles » ?",
                "answer": "90°",
                "wrongs": [
                  "60°",
                  "180°",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Triangles » ?",
                "answer": "La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Triangles », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Triangles » ?",
                "answer": "La somme des angles d'un triangle est égale à 180°. Des propriétés particulières permettent d'identifier certains triangles.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Quadrilatères particuliers",
        "domain": "Géométrie",
        "competency": "Maîtriser quadrilatères particuliers et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Quadrilatères particuliers",
            "objectives": [
              "Définir et expliquer « Quadrilatères particuliers ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales.",
            "content": "# Quadrilatères particuliers\n\nRectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales.\n\n## Exemple guidé\nUn carré possède quatre côtés de même longueur et quatre angles droits.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nRectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Quadrilatères particuliers » ?",
                "answer": "4",
                "wrongs": [
                  "2",
                  "3",
                  "6"
                ],
                "explanation": "Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales. La réponse correcte est « 4 »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Quadrilatères particuliers », quelle réponse obtient-on ?",
                "answer": "4",
                "wrongs": [
                  "2",
                  "3",
                  "6"
                ],
                "explanation": "L'exemple illustre directement la notion : Un carré possède quatre côtés de même longueur et quatre angles droits."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Quadrilatères particuliers » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Quadrilatères particuliers » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Quadrilatères particuliers » ?",
                "answer": "Un carré possède quatre côtés de même longueur et quatre angles droits.",
                "wrongs": [
                  "2",
                  "3",
                  "6"
                ],
                "explanation": "Cette situation réinvestit la notion : Un carré possède quatre côtés de même longueur et quatre angles droits."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Quadrilatères particuliers » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Quadrilatères particuliers ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Quadrilatères particuliers » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 2 ». Quelle réponse doit-il retenir pour « Quadrilatères particuliers » ?",
                "answer": "4",
                "wrongs": [
                  "3",
                  "6",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Quadrilatères particuliers » ?",
                "answer": "Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Quadrilatères particuliers », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Quadrilatères particuliers » ?",
                "answer": "Rectangle, losange et carré possèdent des propriétés communes et spécifiques sur leurs côtés, angles et diagonales.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Aires, périmètres et espace",
        "domain": "Géométrie",
        "competency": "Maîtriser aires, périmètres et espace et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Aires, périmètres et espace",
            "objectives": [
              "Définir et expliquer « Aires, périmètres et espace ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets.",
            "content": "# Aires, périmètres et espace\n\nLe périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets.\n\n## Exemple guidé\nL'aire d'un rectangle de longueur 8 cm et largeur 3 cm vaut 24 cm².\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Aires, périmètres et espace » ?",
                "answer": "24 cm²",
                "wrongs": [
                  "11 cm²",
                  "22 cm²",
                  "48 cm²"
                ],
                "explanation": "Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets. La réponse correcte est « 24 cm² »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Aires, périmètres et espace », quelle réponse obtient-on ?",
                "answer": "24 cm²",
                "wrongs": [
                  "11 cm²",
                  "22 cm²",
                  "48 cm²"
                ],
                "explanation": "L'exemple illustre directement la notion : L'aire d'un rectangle de longueur 8 cm et largeur 3 cm vaut 24 cm²."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Aires, périmètres et espace » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Aires, périmètres et espace » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Aires, périmètres et espace » ?",
                "answer": "L'aire d'un rectangle de longueur 8 cm et largeur 3 cm vaut 24 cm².",
                "wrongs": [
                  "11 cm²",
                  "22 cm²",
                  "48 cm²"
                ],
                "explanation": "Cette situation réinvestit la notion : L'aire d'un rectangle de longueur 8 cm et largeur 3 cm vaut 24 cm²."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Aires, périmètres et espace » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Aires, périmètres et espace ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Aires, périmètres et espace » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « 11 cm² ». Quelle réponse doit-il retenir pour « Aires, périmètres et espace » ?",
                "answer": "24 cm²",
                "wrongs": [
                  "22 cm²",
                  "48 cm²",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Aires, périmètres et espace » ?",
                "answer": "Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Aires, périmètres et espace », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Aires, périmètres et espace » ?",
                "answer": "Le périmètre mesure une longueur de contour et l'aire mesure une surface. Les solides se décrivent par leurs faces, arêtes et sommets.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "SVT",
    "source": "https://ademdakar.wixsite.com/adem/svt",
    "version": "5e-svt-v2",
    "chapters": [
      {
        "title": "Milieu de vie et interactions",
        "domain": "Environnement",
        "competency": "Maîtriser milieu de vie et interactions et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Milieu de vie et interactions",
            "objectives": [
              "Définir et expliquer « Milieu de vie et interactions ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu.",
            "content": "# Milieu de vie et interactions\n\nUn milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu.\n\n## Exemple guidé\nUn écosystème associe des êtres vivants et leur milieu avec leurs interactions.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Milieu de vie et interactions » ?",
                "answer": "un écosystème",
                "wrongs": [
                  "une seule espèce",
                  "un minéral isolé",
                  "un organe"
                ],
                "explanation": "Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu. La réponse correcte est « un écosystème »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Milieu de vie et interactions », quelle réponse obtient-on ?",
                "answer": "un écosystème",
                "wrongs": [
                  "une seule espèce",
                  "un minéral isolé",
                  "un organe"
                ],
                "explanation": "L'exemple illustre directement la notion : Un écosystème associe des êtres vivants et leur milieu avec leurs interactions."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Milieu de vie et interactions » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Milieu de vie et interactions » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Milieu de vie et interactions » ?",
                "answer": "Un écosystème associe des êtres vivants et leur milieu avec leurs interactions.",
                "wrongs": [
                  "une seule espèce",
                  "un minéral isolé",
                  "un organe"
                ],
                "explanation": "Cette situation réinvestit la notion : Un écosystème associe des êtres vivants et leur milieu avec leurs interactions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Milieu de vie et interactions » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Milieu de vie et interactions ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Milieu de vie et interactions » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une seule espèce ». Quelle réponse doit-il retenir pour « Milieu de vie et interactions » ?",
                "answer": "un écosystème",
                "wrongs": [
                  "un minéral isolé",
                  "un organe",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Milieu de vie et interactions » ?",
                "answer": "Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Milieu de vie et interactions », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Milieu de vie et interactions » ?",
                "answer": "Un milieu de vie comprend des éléments physiques et des êtres vivants qui interagissent. Les relations entre organismes influencent l'équilibre du milieu.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Pollutions et protection",
        "domain": "Environnement",
        "competency": "Maîtriser pollutions et protection et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Pollutions et protection",
            "objectives": [
              "Définir et expliquer « Pollutions et protection ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets.",
            "content": "# Pollutions et protection\n\nUne pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets.\n\n## Exemple guidé\nRéduire les rejets polluants à la source est une mesure de prévention.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Pollutions et protection » ?",
                "answer": "réduire les rejets à la source",
                "wrongs": [
                  "augmenter les déchets",
                  "brûler tous les déchets",
                  "déverser les eaux usées"
                ],
                "explanation": "Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets. La réponse correcte est « réduire les rejets à la source »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Pollutions et protection », quelle réponse obtient-on ?",
                "answer": "réduire les rejets à la source",
                "wrongs": [
                  "augmenter les déchets",
                  "brûler tous les déchets",
                  "déverser les eaux usées"
                ],
                "explanation": "L'exemple illustre directement la notion : Réduire les rejets polluants à la source est une mesure de prévention."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Pollutions et protection » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Pollutions et protection » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Pollutions et protection » ?",
                "answer": "Réduire les rejets polluants à la source est une mesure de prévention.",
                "wrongs": [
                  "augmenter les déchets",
                  "brûler tous les déchets",
                  "déverser les eaux usées"
                ],
                "explanation": "Cette situation réinvestit la notion : Réduire les rejets polluants à la source est une mesure de prévention."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Pollutions et protection » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Pollutions et protection ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Pollutions et protection » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « augmenter les déchets ». Quelle réponse doit-il retenir pour « Pollutions et protection » ?",
                "answer": "réduire les rejets à la source",
                "wrongs": [
                  "brûler tous les déchets",
                  "déverser les eaux usées",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Pollutions et protection » ?",
                "answer": "Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Pollutions et protection », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Pollutions et protection » ?",
                "answer": "Une pollution modifie un milieu et peut avoir des conséquences sur la santé et la biodiversité. La prévention repose notamment sur la réduction et la gestion des déchets.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Alimentation et besoins",
        "domain": "Nutrition",
        "competency": "Maîtriser alimentation et besoins et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Alimentation et besoins",
            "objectives": [
              "Définir et expliquer « Alimentation et besoins ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme.",
            "content": "# Alimentation et besoins\n\nLes aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme.\n\n## Exemple guidé\nUne alimentation variée aide à couvrir différents besoins nutritionnels.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Alimentation et besoins » ?",
                "answer": "elle apporte des nutriments variés",
                "wrongs": [
                  "elle supprime l'eau",
                  "elle évite tous les glucides",
                  "elle doit être identique pour tous"
                ],
                "explanation": "Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme. La réponse correcte est « elle apporte des nutriments variés »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Alimentation et besoins », quelle réponse obtient-on ?",
                "answer": "elle apporte des nutriments variés",
                "wrongs": [
                  "elle supprime l'eau",
                  "elle évite tous les glucides",
                  "elle doit être identique pour tous"
                ],
                "explanation": "L'exemple illustre directement la notion : Une alimentation variée aide à couvrir différents besoins nutritionnels."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Alimentation et besoins » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Alimentation et besoins » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Alimentation et besoins » ?",
                "answer": "Une alimentation variée aide à couvrir différents besoins nutritionnels.",
                "wrongs": [
                  "elle supprime l'eau",
                  "elle évite tous les glucides",
                  "elle doit être identique pour tous"
                ],
                "explanation": "Cette situation réinvestit la notion : Une alimentation variée aide à couvrir différents besoins nutritionnels."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Alimentation et besoins » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Alimentation et besoins ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Alimentation et besoins » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « elle supprime l'eau ». Quelle réponse doit-il retenir pour « Alimentation et besoins » ?",
                "answer": "elle apporte des nutriments variés",
                "wrongs": [
                  "elle évite tous les glucides",
                  "elle doit être identique pour tous",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Alimentation et besoins » ?",
                "answer": "Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Alimentation et besoins », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Alimentation et besoins » ?",
                "answer": "Les aliments apportent notamment des nutriments et de l'énergie. Une alimentation équilibrée varie les aliments et tient compte des besoins de l'organisme.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Digestion et absorption",
        "domain": "Nutrition",
        "competency": "Maîtriser digestion et absorption et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Digestion et absorption",
            "objectives": [
              "Définir et expliquer « Digestion et absorption ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur.",
            "content": "# Digestion et absorption\n\nLa digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur.\n\n## Exemple guidé\nLes nutriments issus de la digestion passent principalement à travers la paroi de l'intestin grêle.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Digestion et absorption » ?",
                "answer": "l'intestin grêle",
                "wrongs": [
                  "l'œsophage",
                  "la bouche seulement",
                  "la trachée"
                ],
                "explanation": "La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur. La réponse correcte est « l'intestin grêle »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Digestion et absorption », quelle réponse obtient-on ?",
                "answer": "l'intestin grêle",
                "wrongs": [
                  "l'œsophage",
                  "la bouche seulement",
                  "la trachée"
                ],
                "explanation": "L'exemple illustre directement la notion : Les nutriments issus de la digestion passent principalement à travers la paroi de l'intestin grêle."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Digestion et absorption » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Digestion et absorption » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Digestion et absorption » ?",
                "answer": "Les nutriments issus de la digestion passent principalement à travers la paroi de l'intestin grêle.",
                "wrongs": [
                  "l'œsophage",
                  "la bouche seulement",
                  "la trachée"
                ],
                "explanation": "Cette situation réinvestit la notion : Les nutriments issus de la digestion passent principalement à travers la paroi de l'intestin grêle."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Digestion et absorption » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Digestion et absorption ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Digestion et absorption » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « l'œsophage ». Quelle réponse doit-il retenir pour « Digestion et absorption » ?",
                "answer": "l'intestin grêle",
                "wrongs": [
                  "la bouche seulement",
                  "la trachée",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Digestion et absorption » ?",
                "answer": "La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Digestion et absorption », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Digestion et absorption » ?",
                "answer": "La digestion transforme les aliments en nutriments utilisables. L'absorption intestinale permet le passage des nutriments vers le milieu intérieur.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Respiration chez les animaux",
        "domain": "Nutrition",
        "competency": "Maîtriser respiration chez les animaux et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Respiration chez les animaux",
            "objectives": [
              "Définir et expliquer « Respiration chez les animaux ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux.",
            "content": "# Respiration chez les animaux\n\nLa respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux.\n\n## Exemple guidé\nLes poissons prélèvent principalement le dioxygène dissous dans l'eau grâce à leurs branchies.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Respiration chez les animaux » ?",
                "answer": "les branchies",
                "wrongs": [
                  "les poumons uniquement",
                  "la peau uniquement",
                  "les racines"
                ],
                "explanation": "La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux. La réponse correcte est « les branchies »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Respiration chez les animaux », quelle réponse obtient-on ?",
                "answer": "les branchies",
                "wrongs": [
                  "les poumons uniquement",
                  "la peau uniquement",
                  "les racines"
                ],
                "explanation": "L'exemple illustre directement la notion : Les poissons prélèvent principalement le dioxygène dissous dans l'eau grâce à leurs branchies."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Respiration chez les animaux » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Respiration chez les animaux » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Respiration chez les animaux » ?",
                "answer": "Les poissons prélèvent principalement le dioxygène dissous dans l'eau grâce à leurs branchies.",
                "wrongs": [
                  "les poumons uniquement",
                  "la peau uniquement",
                  "les racines"
                ],
                "explanation": "Cette situation réinvestit la notion : Les poissons prélèvent principalement le dioxygène dissous dans l'eau grâce à leurs branchies."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Respiration chez les animaux » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Respiration chez les animaux ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Respiration chez les animaux » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « les poumons uniquement ». Quelle réponse doit-il retenir pour « Respiration chez les animaux » ?",
                "answer": "les branchies",
                "wrongs": [
                  "la peau uniquement",
                  "les racines",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Respiration chez les animaux » ?",
                "answer": "La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Respiration chez les animaux », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Respiration chez les animaux » ?",
                "answer": "La respiration permet des échanges gazeux avec le milieu. Les organes respiratoires varient selon les animaux.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Reproduction animale",
        "domain": "Reproduction",
        "competency": "Maîtriser reproduction animale et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Reproduction animale",
            "objectives": [
              "Définir et expliquer « Reproduction animale ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles.",
            "content": "# Reproduction animale\n\nLa reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles.\n\n## Exemple guidé\nLa fécondation correspond à la rencontre des gamètes qui forme une cellule-œuf.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Reproduction animale » ?",
                "answer": "la rencontre des gamètes",
                "wrongs": [
                  "la croissance d'un adulte",
                  "la respiration",
                  "la digestion"
                ],
                "explanation": "La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles. La réponse correcte est « la rencontre des gamètes »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Reproduction animale », quelle réponse obtient-on ?",
                "answer": "la rencontre des gamètes",
                "wrongs": [
                  "la croissance d'un adulte",
                  "la respiration",
                  "la digestion"
                ],
                "explanation": "L'exemple illustre directement la notion : La fécondation correspond à la rencontre des gamètes qui forme une cellule-œuf."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Reproduction animale » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Reproduction animale » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Reproduction animale » ?",
                "answer": "La fécondation correspond à la rencontre des gamètes qui forme une cellule-œuf.",
                "wrongs": [
                  "la croissance d'un adulte",
                  "la respiration",
                  "la digestion"
                ],
                "explanation": "Cette situation réinvestit la notion : La fécondation correspond à la rencontre des gamètes qui forme une cellule-œuf."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Reproduction animale » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Reproduction animale ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Reproduction animale » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la croissance d'un adulte ». Quelle réponse doit-il retenir pour « Reproduction animale » ?",
                "answer": "la rencontre des gamètes",
                "wrongs": [
                  "la respiration",
                  "la digestion",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Reproduction animale » ?",
                "answer": "La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Reproduction animale », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Reproduction animale » ?",
                "answer": "La reproduction assure la naissance de nouveaux individus. Elle peut impliquer des cellules reproductrices mâles et femelles.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Reproduction des plantes à fleurs",
        "domain": "Reproduction",
        "competency": "Maîtriser reproduction des plantes à fleurs et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Reproduction des plantes à fleurs",
            "objectives": [
              "Définir et expliquer « Reproduction des plantes à fleurs ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation.",
            "content": "# Reproduction des plantes à fleurs\n\nChez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation.\n\n## Exemple guidé\nLe pollen doit atteindre le stigmate pour permettre la pollinisation.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nChez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Reproduction des plantes à fleurs » ?",
                "answer": "le stigmate",
                "wrongs": [
                  "la racine",
                  "la feuille",
                  "le pétiole"
                ],
                "explanation": "Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation. La réponse correcte est « le stigmate »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Reproduction des plantes à fleurs », quelle réponse obtient-on ?",
                "answer": "le stigmate",
                "wrongs": [
                  "la racine",
                  "la feuille",
                  "le pétiole"
                ],
                "explanation": "L'exemple illustre directement la notion : Le pollen doit atteindre le stigmate pour permettre la pollinisation."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Reproduction des plantes à fleurs » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Reproduction des plantes à fleurs » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Reproduction des plantes à fleurs » ?",
                "answer": "Le pollen doit atteindre le stigmate pour permettre la pollinisation.",
                "wrongs": [
                  "la racine",
                  "la feuille",
                  "le pétiole"
                ],
                "explanation": "Cette situation réinvestit la notion : Le pollen doit atteindre le stigmate pour permettre la pollinisation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Reproduction des plantes à fleurs » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Reproduction des plantes à fleurs ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Reproduction des plantes à fleurs » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la racine ». Quelle réponse doit-il retenir pour « Reproduction des plantes à fleurs » ?",
                "answer": "le stigmate",
                "wrongs": [
                  "la feuille",
                  "le pétiole",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Reproduction des plantes à fleurs » ?",
                "answer": "Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Reproduction des plantes à fleurs », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Reproduction des plantes à fleurs » ?",
                "answer": "Chez les plantes à fleurs, la pollinisation précède souvent la fécondation. Les graines proviennent des ovules après fécondation.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Plantes sans fleurs et multiplication",
        "domain": "Reproduction",
        "competency": "Maîtriser plantes sans fleurs et multiplication et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Plantes sans fleurs et multiplication",
            "objectives": [
              "Définir et expliquer « Plantes sans fleurs et multiplication ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation.",
            "content": "# Plantes sans fleurs et multiplication\n\nCertaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation.\n\n## Exemple guidé\nLa multiplication végétative peut utiliser des organes comme les stolons ou tubercules.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nCertaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Plantes sans fleurs et multiplication » ?",
                "answer": "des organes végétatifs",
                "wrongs": [
                  "des gamètes uniquement",
                  "des os",
                  "des poumons"
                ],
                "explanation": "Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation. La réponse correcte est « des organes végétatifs »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Plantes sans fleurs et multiplication », quelle réponse obtient-on ?",
                "answer": "des organes végétatifs",
                "wrongs": [
                  "des gamètes uniquement",
                  "des os",
                  "des poumons"
                ],
                "explanation": "L'exemple illustre directement la notion : La multiplication végétative peut utiliser des organes comme les stolons ou tubercules."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Plantes sans fleurs et multiplication » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Plantes sans fleurs et multiplication » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Plantes sans fleurs et multiplication » ?",
                "answer": "La multiplication végétative peut utiliser des organes comme les stolons ou tubercules.",
                "wrongs": [
                  "des gamètes uniquement",
                  "des os",
                  "des poumons"
                ],
                "explanation": "Cette situation réinvestit la notion : La multiplication végétative peut utiliser des organes comme les stolons ou tubercules."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Plantes sans fleurs et multiplication » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Plantes sans fleurs et multiplication ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Plantes sans fleurs et multiplication » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « des gamètes uniquement ». Quelle réponse doit-il retenir pour « Plantes sans fleurs et multiplication » ?",
                "answer": "des organes végétatifs",
                "wrongs": [
                  "des os",
                  "des poumons",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Plantes sans fleurs et multiplication » ?",
                "answer": "Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Plantes sans fleurs et multiplication », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Plantes sans fleurs et multiplication » ?",
                "answer": "Certaines plantes se multiplient par spores ou par multiplication végétative. Ces modes peuvent produire de nouveaux individus sans fécondation.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Diversité et propriétés des sols",
        "domain": "Sols",
        "competency": "Maîtriser diversité et propriétés des sols et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Diversité et propriétés des sols",
            "objectives": [
              "Définir et expliquer « Diversité et propriétés des sols ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité.",
            "content": "# Diversité et propriétés des sols\n\nLes sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité.\n\n## Exemple guidé\nUn sol riche en matière organique peut favoriser la croissance des végétaux.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Diversité et propriétés des sols » ?",
                "answer": "la matière organique",
                "wrongs": [
                  "le plastique",
                  "le verre",
                  "le métal"
                ],
                "explanation": "Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité. La réponse correcte est « la matière organique »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Diversité et propriétés des sols », quelle réponse obtient-on ?",
                "answer": "la matière organique",
                "wrongs": [
                  "le plastique",
                  "le verre",
                  "le métal"
                ],
                "explanation": "L'exemple illustre directement la notion : Un sol riche en matière organique peut favoriser la croissance des végétaux."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Diversité et propriétés des sols » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Diversité et propriétés des sols » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Diversité et propriétés des sols » ?",
                "answer": "Un sol riche en matière organique peut favoriser la croissance des végétaux.",
                "wrongs": [
                  "le plastique",
                  "le verre",
                  "le métal"
                ],
                "explanation": "Cette situation réinvestit la notion : Un sol riche en matière organique peut favoriser la croissance des végétaux."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Diversité et propriétés des sols » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Diversité et propriétés des sols ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Diversité et propriétés des sols » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « le plastique ». Quelle réponse doit-il retenir pour « Diversité et propriétés des sols » ?",
                "answer": "la matière organique",
                "wrongs": [
                  "le verre",
                  "le métal",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Diversité et propriétés des sols » ?",
                "answer": "Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Diversité et propriétés des sols », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Diversité et propriétés des sols » ?",
                "answer": "Les sols diffèrent par leur texture, leur teneur en matière organique, leur eau et leur biodiversité. Ces propriétés influencent leur fertilité.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Formation et évolution des sols",
        "domain": "Sols",
        "competency": "Maîtriser formation et évolution des sols et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Formation et évolution des sols",
            "objectives": [
              "Définir et expliquer « Formation et évolution des sols ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes.",
            "content": "# Formation et évolution des sols\n\nUn sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes.\n\n## Exemple guidé\nLa formation d'un sol est un processus lent.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Formation et évolution des sols » ?",
                "answer": "un processus lent",
                "wrongs": [
                  "un phénomène instantané",
                  "une réaction unique",
                  "une combustion"
                ],
                "explanation": "Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes. La réponse correcte est « un processus lent »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Formation et évolution des sols », quelle réponse obtient-on ?",
                "answer": "un processus lent",
                "wrongs": [
                  "un phénomène instantané",
                  "une réaction unique",
                  "une combustion"
                ],
                "explanation": "L'exemple illustre directement la notion : La formation d'un sol est un processus lent."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Formation et évolution des sols » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Formation et évolution des sols » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Formation et évolution des sols » ?",
                "answer": "La formation d'un sol est un processus lent.",
                "wrongs": [
                  "un phénomène instantané",
                  "une réaction unique",
                  "une combustion"
                ],
                "explanation": "Cette situation réinvestit la notion : La formation d'un sol est un processus lent."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Formation et évolution des sols » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Formation et évolution des sols ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Formation et évolution des sols » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « un phénomène instantané ». Quelle réponse doit-il retenir pour « Formation et évolution des sols » ?",
                "answer": "un processus lent",
                "wrongs": [
                  "une réaction unique",
                  "une combustion",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Formation et évolution des sols » ?",
                "answer": "Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Formation et évolution des sols », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Formation et évolution des sols » ?",
                "answer": "Un sol se forme progressivement à partir de la transformation de la roche et de l'accumulation de matière organique. Il évolue sous l'effet du climat et des organismes.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Origine des roches sédimentaires",
        "domain": "Roches sédimentaires",
        "competency": "Maîtriser origine des roches sédimentaires et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Origine des roches sédimentaires",
            "objectives": [
              "Définir et expliquer « Origine des roches sédimentaires ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires.",
            "content": "# Origine des roches sédimentaires\n\nLes sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires.\n\n## Exemple guidé\nLe dépôt de sédiments précède leur consolidation en roche sédimentaire.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Origine des roches sédimentaires » ?",
                "answer": "le dépôt de sédiments",
                "wrongs": [
                  "la fusion du magma",
                  "la germination",
                  "la photosynthèse"
                ],
                "explanation": "Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires. La réponse correcte est « le dépôt de sédiments »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Origine des roches sédimentaires », quelle réponse obtient-on ?",
                "answer": "le dépôt de sédiments",
                "wrongs": [
                  "la fusion du magma",
                  "la germination",
                  "la photosynthèse"
                ],
                "explanation": "L'exemple illustre directement la notion : Le dépôt de sédiments précède leur consolidation en roche sédimentaire."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Origine des roches sédimentaires » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Origine des roches sédimentaires » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Origine des roches sédimentaires » ?",
                "answer": "Le dépôt de sédiments précède leur consolidation en roche sédimentaire.",
                "wrongs": [
                  "la fusion du magma",
                  "la germination",
                  "la photosynthèse"
                ],
                "explanation": "Cette situation réinvestit la notion : Le dépôt de sédiments précède leur consolidation en roche sédimentaire."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Origine des roches sédimentaires » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Origine des roches sédimentaires ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Origine des roches sédimentaires » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la fusion du magma ». Quelle réponse doit-il retenir pour « Origine des roches sédimentaires » ?",
                "answer": "le dépôt de sédiments",
                "wrongs": [
                  "la germination",
                  "la photosynthèse",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Origine des roches sédimentaires » ?",
                "answer": "Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Origine des roches sédimentaires », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Origine des roches sédimentaires » ?",
                "answer": "Les sédiments peuvent provenir de l'érosion, du transport et du dépôt de matériaux. Leur accumulation et leur consolidation peuvent former des roches sédimentaires.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Utilité et gestion des ressources",
        "domain": "Roches sédimentaires",
        "competency": "Maîtriser utilité et gestion des ressources et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Utilité et gestion des ressources",
            "objectives": [
              "Définir et expliquer « Utilité et gestion des ressources ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts.",
            "content": "# Utilité et gestion des ressources\n\nLes roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts.\n\n## Exemple guidé\nUne ressource géologique doit être exploitée en tenant compte de sa disponibilité et des impacts.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Utilité et gestion des ressources » ?",
                "answer": "une gestion raisonnée",
                "wrongs": [
                  "une exploitation sans limite",
                  "l'abandon de toute exploitation",
                  "la pollution volontaire"
                ],
                "explanation": "Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts. La réponse correcte est « une gestion raisonnée »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Utilité et gestion des ressources », quelle réponse obtient-on ?",
                "answer": "une gestion raisonnée",
                "wrongs": [
                  "une exploitation sans limite",
                  "l'abandon de toute exploitation",
                  "la pollution volontaire"
                ],
                "explanation": "L'exemple illustre directement la notion : Une ressource géologique doit être exploitée en tenant compte de sa disponibilité et des impacts."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Utilité et gestion des ressources » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Utilité et gestion des ressources » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Utilité et gestion des ressources » ?",
                "answer": "Une ressource géologique doit être exploitée en tenant compte de sa disponibilité et des impacts.",
                "wrongs": [
                  "une exploitation sans limite",
                  "l'abandon de toute exploitation",
                  "la pollution volontaire"
                ],
                "explanation": "Cette situation réinvestit la notion : Une ressource géologique doit être exploitée en tenant compte de sa disponibilité et des impacts."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Utilité et gestion des ressources » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Utilité et gestion des ressources ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Utilité et gestion des ressources » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une exploitation sans limite ». Quelle réponse doit-il retenir pour « Utilité et gestion des ressources » ?",
                "answer": "une gestion raisonnée",
                "wrongs": [
                  "l'abandon de toute exploitation",
                  "la pollution volontaire",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Utilité et gestion des ressources » ?",
                "answer": "Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Utilité et gestion des ressources », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Utilité et gestion des ressources » ?",
                "answer": "Les roches sédimentaires peuvent fournir des matériaux, des ressources et des informations sur les milieux anciens. Leur exploitation doit limiter les impacts.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "Français",
    "source": "https://ademdakar.wixsite.com/adem/francais",
    "version": "5e-fran-ais-v2",
    "chapters": [
      {
        "title": "Classes grammaticales",
        "domain": "Langue",
        "competency": "Maîtriser classes grammaticales et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Classes grammaticales",
            "objectives": [
              "Définir et expliquer « Classes grammaticales ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc.",
            "content": "# Classes grammaticales\n\nUne classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc.\n\n## Exemple guidé\nDans « une grande maison », « grande » est un adjectif qualificatif.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Classes grammaticales » ?",
                "answer": "adjectif qualificatif",
                "wrongs": [
                  "verbe",
                  "déterminant",
                  "pronom"
                ],
                "explanation": "Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc. La réponse correcte est « adjectif qualificatif »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Classes grammaticales », quelle réponse obtient-on ?",
                "answer": "adjectif qualificatif",
                "wrongs": [
                  "verbe",
                  "déterminant",
                  "pronom"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans « une grande maison », « grande » est un adjectif qualificatif."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Classes grammaticales » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Classes grammaticales » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Classes grammaticales » ?",
                "answer": "Dans « une grande maison », « grande » est un adjectif qualificatif.",
                "wrongs": [
                  "verbe",
                  "déterminant",
                  "pronom"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans « une grande maison », « grande » est un adjectif qualificatif."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Classes grammaticales » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Classes grammaticales ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Classes grammaticales » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « verbe ». Quelle réponse doit-il retenir pour « Classes grammaticales » ?",
                "answer": "adjectif qualificatif",
                "wrongs": [
                  "déterminant",
                  "pronom",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Classes grammaticales » ?",
                "answer": "Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Classes grammaticales », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Classes grammaticales » ?",
                "answer": "Une classe grammaticale indique la nature d'un mot : nom, verbe, adjectif, déterminant, pronom, adverbe, etc.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Groupes de verbes",
        "domain": "Langue",
        "competency": "Maîtriser groupes de verbes et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Groupes de verbes",
            "objectives": [
              "Définir et expliquer « Groupes de verbes ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif.",
            "content": "# Groupes de verbes\n\nLes verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif.\n\n## Exemple guidé\nLe verbe « chanter » appartient au premier groupe.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Groupes de verbes » ?",
                "answer": "premier groupe",
                "wrongs": [
                  "deuxième groupe",
                  "troisième groupe",
                  "aucun groupe"
                ],
                "explanation": "Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif. La réponse correcte est « premier groupe »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Groupes de verbes », quelle réponse obtient-on ?",
                "answer": "premier groupe",
                "wrongs": [
                  "deuxième groupe",
                  "troisième groupe",
                  "aucun groupe"
                ],
                "explanation": "L'exemple illustre directement la notion : Le verbe « chanter » appartient au premier groupe."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Groupes de verbes » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Groupes de verbes » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Groupes de verbes » ?",
                "answer": "Le verbe « chanter » appartient au premier groupe.",
                "wrongs": [
                  "deuxième groupe",
                  "troisième groupe",
                  "aucun groupe"
                ],
                "explanation": "Cette situation réinvestit la notion : Le verbe « chanter » appartient au premier groupe."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Groupes de verbes » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Groupes de verbes ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Groupes de verbes » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « deuxième groupe ». Quelle réponse doit-il retenir pour « Groupes de verbes » ?",
                "answer": "premier groupe",
                "wrongs": [
                  "troisième groupe",
                  "aucun groupe",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Groupes de verbes » ?",
                "answer": "Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Groupes de verbes », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Groupes de verbes » ?",
                "answer": "Les verbes français se répartissent en groupes selon leurs caractéristiques de conjugaison. Les verbes du premier groupe se terminent généralement par -er à l'infinitif.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Temps de l'indicatif",
        "domain": "Langue",
        "competency": "Maîtriser temps de l'indicatif et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Temps de l'indicatif",
            "objectives": [
              "Définir et expliquer « Temps de l'indicatif ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs.",
            "content": "# Temps de l'indicatif\n\nLes temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs.\n\n## Exemple guidé\nDans « Hier, il est venu », le verbe situe une action passée.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Temps de l'indicatif » ?",
                "answer": "une action passée",
                "wrongs": [
                  "une action future",
                  "un ordre",
                  "une définition"
                ],
                "explanation": "Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs. La réponse correcte est « une action passée »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Temps de l'indicatif », quelle réponse obtient-on ?",
                "answer": "une action passée",
                "wrongs": [
                  "une action future",
                  "un ordre",
                  "une définition"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans « Hier, il est venu », le verbe situe une action passée."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Temps de l'indicatif » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Temps de l'indicatif » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Temps de l'indicatif » ?",
                "answer": "Dans « Hier, il est venu », le verbe situe une action passée.",
                "wrongs": [
                  "une action future",
                  "un ordre",
                  "une définition"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans « Hier, il est venu », le verbe situe une action passée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Temps de l'indicatif » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Temps de l'indicatif ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Temps de l'indicatif » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une action future ». Quelle réponse doit-il retenir pour « Temps de l'indicatif » ?",
                "answer": "une action passée",
                "wrongs": [
                  "un ordre",
                  "une définition",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Temps de l'indicatif » ?",
                "answer": "Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Temps de l'indicatif », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Temps de l'indicatif » ?",
                "answer": "Les temps de l'indicatif situent les actions dans le temps et peuvent exprimer différentes valeurs.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Accords dans le groupe nominal",
        "domain": "Langue",
        "competency": "Maîtriser accords dans le groupe nominal et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Accords dans le groupe nominal",
            "objectives": [
              "Définir et expliquer « Accords dans le groupe nominal ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal.",
            "content": "# Accords dans le groupe nominal\n\nLe déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal.\n\n## Exemple guidé\n« Des grandes maisons » comporte un nom féminin pluriel et un adjectif accordé.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Accords dans le groupe nominal » ?",
                "answer": "grandes",
                "wrongs": [
                  "grande",
                  "grand",
                  "grands"
                ],
                "explanation": "Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal. La réponse correcte est « grandes »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Accords dans le groupe nominal », quelle réponse obtient-on ?",
                "answer": "grandes",
                "wrongs": [
                  "grande",
                  "grand",
                  "grands"
                ],
                "explanation": "L'exemple illustre directement la notion : « Des grandes maisons » comporte un nom féminin pluriel et un adjectif accordé."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Accords dans le groupe nominal » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Accords dans le groupe nominal » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Accords dans le groupe nominal » ?",
                "answer": "« Des grandes maisons » comporte un nom féminin pluriel et un adjectif accordé.",
                "wrongs": [
                  "grande",
                  "grand",
                  "grands"
                ],
                "explanation": "Cette situation réinvestit la notion : « Des grandes maisons » comporte un nom féminin pluriel et un adjectif accordé."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Accords dans le groupe nominal » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Accords dans le groupe nominal ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Accords dans le groupe nominal » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « grande ». Quelle réponse doit-il retenir pour « Accords dans le groupe nominal » ?",
                "answer": "grandes",
                "wrongs": [
                  "grand",
                  "grands",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Accords dans le groupe nominal » ?",
                "answer": "Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Accords dans le groupe nominal », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Accords dans le groupe nominal » ?",
                "answer": "Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre selon les règles du groupe nominal.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Fonctions grammaticales",
        "domain": "Langue",
        "competency": "Maîtriser fonctions grammaticales et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Fonctions grammaticales",
            "objectives": [
              "Définir et expliquer « Fonctions grammaticales ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc.",
            "content": "# Fonctions grammaticales\n\nLa fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc.\n\n## Exemple guidé\nDans « Awa lit un livre », « Awa » est le sujet du verbe lit.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Fonctions grammaticales » ?",
                "answer": "sujet",
                "wrongs": [
                  "COD",
                  "attribut",
                  "complément circonstanciel"
                ],
                "explanation": "La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc. La réponse correcte est « sujet »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Fonctions grammaticales », quelle réponse obtient-on ?",
                "answer": "sujet",
                "wrongs": [
                  "COD",
                  "attribut",
                  "complément circonstanciel"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans « Awa lit un livre », « Awa » est le sujet du verbe lit."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Fonctions grammaticales » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Fonctions grammaticales » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Fonctions grammaticales » ?",
                "answer": "Dans « Awa lit un livre », « Awa » est le sujet du verbe lit.",
                "wrongs": [
                  "COD",
                  "attribut",
                  "complément circonstanciel"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans « Awa lit un livre », « Awa » est le sujet du verbe lit."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Fonctions grammaticales » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Fonctions grammaticales ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Fonctions grammaticales » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « COD ». Quelle réponse doit-il retenir pour « Fonctions grammaticales » ?",
                "answer": "sujet",
                "wrongs": [
                  "attribut",
                  "complément circonstanciel",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Fonctions grammaticales » ?",
                "answer": "La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Fonctions grammaticales », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Fonctions grammaticales » ?",
                "answer": "La fonction d'un groupe dépend de son rôle dans la phrase : sujet, complément d'objet, complément circonstanciel, attribut, etc.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Comprendre un récit",
        "domain": "Lecture",
        "competency": "Maîtriser comprendre un récit et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Comprendre un récit",
            "objectives": [
              "Définir et expliquer « Comprendre un récit ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence.",
            "content": "# Comprendre un récit\n\nPour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence.\n\n## Exemple guidé\nLe cadre spatio-temporel indique notamment où et quand se déroule l'action.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nPour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Comprendre un récit » ?",
                "answer": "où et quand",
                "wrongs": [
                  "la morale seulement",
                  "le nombre de mots",
                  "le titre uniquement"
                ],
                "explanation": "Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence. La réponse correcte est « où et quand »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Comprendre un récit », quelle réponse obtient-on ?",
                "answer": "où et quand",
                "wrongs": [
                  "la morale seulement",
                  "le nombre de mots",
                  "le titre uniquement"
                ],
                "explanation": "L'exemple illustre directement la notion : Le cadre spatio-temporel indique notamment où et quand se déroule l'action."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Comprendre un récit » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Comprendre un récit » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Comprendre un récit » ?",
                "answer": "Le cadre spatio-temporel indique notamment où et quand se déroule l'action.",
                "wrongs": [
                  "la morale seulement",
                  "le nombre de mots",
                  "le titre uniquement"
                ],
                "explanation": "Cette situation réinvestit la notion : Le cadre spatio-temporel indique notamment où et quand se déroule l'action."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Comprendre un récit » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Comprendre un récit ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Comprendre un récit » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la morale seulement ». Quelle réponse doit-il retenir pour « Comprendre un récit » ?",
                "answer": "où et quand",
                "wrongs": [
                  "le nombre de mots",
                  "le titre uniquement",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Comprendre un récit » ?",
                "answer": "Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Comprendre un récit », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Comprendre un récit » ?",
                "answer": "Pour comprendre un récit, on repère les personnages, le cadre, les événements et les relations de cause ou de conséquence.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Décrire et interpréter",
        "domain": "Lecture",
        "competency": "Maîtriser décrire et interpréter et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Décrire et interpréter",
            "objectives": [
              "Définir et expliquer « Décrire et interpréter ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits.",
            "content": "# Décrire et interpréter\n\nUne description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits.\n\n## Exemple guidé\n« Une grande maison blanche » contient deux expansions qui précisent le nom maison.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Décrire et interpréter » ?",
                "answer": "grande et blanche",
                "wrongs": [
                  "une et maison",
                  "maison et blanche",
                  "une et grande"
                ],
                "explanation": "Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits. La réponse correcte est « grande et blanche »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Décrire et interpréter », quelle réponse obtient-on ?",
                "answer": "grande et blanche",
                "wrongs": [
                  "une et maison",
                  "maison et blanche",
                  "une et grande"
                ],
                "explanation": "L'exemple illustre directement la notion : « Une grande maison blanche » contient deux expansions qui précisent le nom maison."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Décrire et interpréter » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Décrire et interpréter » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Décrire et interpréter » ?",
                "answer": "« Une grande maison blanche » contient deux expansions qui précisent le nom maison.",
                "wrongs": [
                  "une et maison",
                  "maison et blanche",
                  "une et grande"
                ],
                "explanation": "Cette situation réinvestit la notion : « Une grande maison blanche » contient deux expansions qui précisent le nom maison."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Décrire et interpréter » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Décrire et interpréter ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Décrire et interpréter » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une et maison ». Quelle réponse doit-il retenir pour « Décrire et interpréter » ?",
                "answer": "grande et blanche",
                "wrongs": [
                  "maison et blanche",
                  "une et grande",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Décrire et interpréter » ?",
                "answer": "Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Décrire et interpréter », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Décrire et interpréter » ?",
                "answer": "Une description organise des informations sur un lieu, une personne ou un objet. Les adjectifs et expansions du nom précisent les éléments décrits.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Rédiger un paragraphe cohérent",
        "domain": "Expression",
        "competency": "Maîtriser rédiger un paragraphe cohérent et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Rédiger un paragraphe cohérent",
            "objectives": [
              "Définir et expliquer « Rédiger un paragraphe cohérent ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs.",
            "content": "# Rédiger un paragraphe cohérent\n\nUn paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs.\n\n## Exemple guidé\nUn connecteur comme « cependant » marque une opposition.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Rédiger un paragraphe cohérent » ?",
                "answer": "une opposition",
                "wrongs": [
                  "une addition",
                  "une cause uniquement",
                  "une conclusion obligatoire"
                ],
                "explanation": "Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs. La réponse correcte est « une opposition »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Rédiger un paragraphe cohérent », quelle réponse obtient-on ?",
                "answer": "une opposition",
                "wrongs": [
                  "une addition",
                  "une cause uniquement",
                  "une conclusion obligatoire"
                ],
                "explanation": "L'exemple illustre directement la notion : Un connecteur comme « cependant » marque une opposition."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Rédiger un paragraphe cohérent » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Rédiger un paragraphe cohérent » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Rédiger un paragraphe cohérent » ?",
                "answer": "Un connecteur comme « cependant » marque une opposition.",
                "wrongs": [
                  "une addition",
                  "une cause uniquement",
                  "une conclusion obligatoire"
                ],
                "explanation": "Cette situation réinvestit la notion : Un connecteur comme « cependant » marque une opposition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Rédiger un paragraphe cohérent » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Rédiger un paragraphe cohérent ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Rédiger un paragraphe cohérent » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une addition ». Quelle réponse doit-il retenir pour « Rédiger un paragraphe cohérent » ?",
                "answer": "une opposition",
                "wrongs": [
                  "une cause uniquement",
                  "une conclusion obligatoire",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Rédiger un paragraphe cohérent » ?",
                "answer": "Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Rédiger un paragraphe cohérent », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Rédiger un paragraphe cohérent » ?",
                "answer": "Un paragraphe cohérent développe une idée et relie les phrases grâce à des reprises et connecteurs.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Dialogue et discours rapporté",
        "domain": "Expression",
        "competency": "Maîtriser dialogue et discours rapporté et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Dialogue et discours rapporté",
            "objectives": [
              "Définir et expliquer « Dialogue et discours rapporté ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase.",
            "content": "# Dialogue et discours rapporté\n\nUn dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase.\n\n## Exemple guidé\nDans un dialogue, les tirets peuvent signaler les changements de locuteur.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUn dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Dialogue et discours rapporté » ?",
                "answer": "les changements de locuteur",
                "wrongs": [
                  "les paragraphes uniquement",
                  "les temps uniquement",
                  "les titres"
                ],
                "explanation": "Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase. La réponse correcte est « les changements de locuteur »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Dialogue et discours rapporté », quelle réponse obtient-on ?",
                "answer": "les changements de locuteur",
                "wrongs": [
                  "les paragraphes uniquement",
                  "les temps uniquement",
                  "les titres"
                ],
                "explanation": "L'exemple illustre directement la notion : Dans un dialogue, les tirets peuvent signaler les changements de locuteur."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Dialogue et discours rapporté » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Dialogue et discours rapporté » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Dialogue et discours rapporté » ?",
                "answer": "Dans un dialogue, les tirets peuvent signaler les changements de locuteur.",
                "wrongs": [
                  "les paragraphes uniquement",
                  "les temps uniquement",
                  "les titres"
                ],
                "explanation": "Cette situation réinvestit la notion : Dans un dialogue, les tirets peuvent signaler les changements de locuteur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Dialogue et discours rapporté » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Dialogue et discours rapporté ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Dialogue et discours rapporté » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « les paragraphes uniquement ». Quelle réponse doit-il retenir pour « Dialogue et discours rapporté » ?",
                "answer": "les changements de locuteur",
                "wrongs": [
                  "les temps uniquement",
                  "les titres",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Dialogue et discours rapporté » ?",
                "answer": "Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Dialogue et discours rapporté », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Dialogue et discours rapporté » ?",
                "answer": "Un dialogue reproduit des paroles échangées. Le discours direct conserve les paroles sous forme de citation, tandis que le discours indirect les intègre à la phrase.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Lettre et communication",
        "domain": "Expression",
        "competency": "Maîtriser lettre et communication et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Lettre et communication",
            "objectives": [
              "Définir et expliquer « Lettre et communication ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire.",
            "content": "# Lettre et communication\n\nUne lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire.\n\n## Exemple guidé\nLe niveau de langue et la formule de politesse dépendent du destinataire.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Lettre et communication » ?",
                "answer": "du destinataire",
                "wrongs": [
                  "du nombre de pages",
                  "du papier uniquement",
                  "de la météo"
                ],
                "explanation": "Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire. La réponse correcte est « du destinataire »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Lettre et communication », quelle réponse obtient-on ?",
                "answer": "du destinataire",
                "wrongs": [
                  "du nombre de pages",
                  "du papier uniquement",
                  "de la météo"
                ],
                "explanation": "L'exemple illustre directement la notion : Le niveau de langue et la formule de politesse dépendent du destinataire."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Lettre et communication » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Lettre et communication » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Lettre et communication » ?",
                "answer": "Le niveau de langue et la formule de politesse dépendent du destinataire.",
                "wrongs": [
                  "du nombre de pages",
                  "du papier uniquement",
                  "de la météo"
                ],
                "explanation": "Cette situation réinvestit la notion : Le niveau de langue et la formule de politesse dépendent du destinataire."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Lettre et communication » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Lettre et communication ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Lettre et communication » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « du nombre de pages ». Quelle réponse doit-il retenir pour « Lettre et communication » ?",
                "answer": "du destinataire",
                "wrongs": [
                  "du papier uniquement",
                  "de la météo",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Lettre et communication » ?",
                "answer": "Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Lettre et communication », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Lettre et communication » ?",
                "answer": "Une lettre comporte généralement une adresse ou formule d'appel, un corps de texte et une formule finale adaptée au destinataire.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Familles de mots et synonymes",
        "domain": "Vocabulaire",
        "competency": "Maîtriser familles de mots et synonymes et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Familles de mots et synonymes",
            "objectives": [
              "Définir et expliquer « Familles de mots et synonymes ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné.",
            "content": "# Familles de mots et synonymes\n\nDes mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné.\n\n## Exemple guidé\n« Chanter » et « chanteur » appartiennent à la même famille de mots.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nDes mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Familles de mots et synonymes » ?",
                "answer": "la même famille",
                "wrongs": [
                  "des sens opposés",
                  "des mots sans lien",
                  "la même fonction"
                ],
                "explanation": "Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné. La réponse correcte est « la même famille »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Familles de mots et synonymes », quelle réponse obtient-on ?",
                "answer": "la même famille",
                "wrongs": [
                  "des sens opposés",
                  "des mots sans lien",
                  "la même fonction"
                ],
                "explanation": "L'exemple illustre directement la notion : « Chanter » et « chanteur » appartiennent à la même famille de mots."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Familles de mots et synonymes » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Familles de mots et synonymes » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Familles de mots et synonymes » ?",
                "answer": "« Chanter » et « chanteur » appartiennent à la même famille de mots.",
                "wrongs": [
                  "des sens opposés",
                  "des mots sans lien",
                  "la même fonction"
                ],
                "explanation": "Cette situation réinvestit la notion : « Chanter » et « chanteur » appartiennent à la même famille de mots."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Familles de mots et synonymes » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Familles de mots et synonymes ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Familles de mots et synonymes » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « des sens opposés ». Quelle réponse doit-il retenir pour « Familles de mots et synonymes » ?",
                "answer": "la même famille",
                "wrongs": [
                  "des mots sans lien",
                  "la même fonction",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Familles de mots et synonymes » ?",
                "answer": "Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Familles de mots et synonymes », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Familles de mots et synonymes » ?",
                "answer": "Des mots de la même famille partagent un radical ou une base commune. Les synonymes ont des sens proches dans un contexte donné.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Sens propre et sens figuré",
        "domain": "Vocabulaire",
        "competency": "Maîtriser sens propre et sens figuré et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Sens propre et sens figuré",
            "objectives": [
              "Définir et expliquer « Sens propre et sens figuré ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens.",
            "content": "# Sens propre et sens figuré\n\nLe sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens.\n\n## Exemple guidé\n« Il a le cœur brisé » emploie « brisé » dans un sens figuré.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Sens propre et sens figuré » ?",
                "answer": "sens figuré",
                "wrongs": [
                  "sens propre",
                  "sens scientifique",
                  "sens littéral uniquement"
                ],
                "explanation": "Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens. La réponse correcte est « sens figuré »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Sens propre et sens figuré », quelle réponse obtient-on ?",
                "answer": "sens figuré",
                "wrongs": [
                  "sens propre",
                  "sens scientifique",
                  "sens littéral uniquement"
                ],
                "explanation": "L'exemple illustre directement la notion : « Il a le cœur brisé » emploie « brisé » dans un sens figuré."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Sens propre et sens figuré » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Sens propre et sens figuré » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Sens propre et sens figuré » ?",
                "answer": "« Il a le cœur brisé » emploie « brisé » dans un sens figuré.",
                "wrongs": [
                  "sens propre",
                  "sens scientifique",
                  "sens littéral uniquement"
                ],
                "explanation": "Cette situation réinvestit la notion : « Il a le cœur brisé » emploie « brisé » dans un sens figuré."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Sens propre et sens figuré » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Sens propre et sens figuré ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Sens propre et sens figuré » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « sens propre ». Quelle réponse doit-il retenir pour « Sens propre et sens figuré » ?",
                "answer": "sens figuré",
                "wrongs": [
                  "sens scientifique",
                  "sens littéral uniquement",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Sens propre et sens figuré » ?",
                "answer": "Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Sens propre et sens figuré », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Sens propre et sens figuré » ?",
                "answer": "Le sens propre correspond au sens courant et concret d'un mot. Le sens figuré repose sur une image ou une extension de sens.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "Anglais",
    "source": "https://apprendre.education.sn/C_ressource/recherche/10",
    "version": "5e-anglais-v2",
    "chapters": [
      {
        "title": "Greetings and introductions",
        "domain": "Communication",
        "competency": "Maîtriser greetings and introductions et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Greetings and introductions",
            "objectives": [
              "Définir et expliquer « Greetings and introductions ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges.",
            "content": "# Greetings and introductions\n\nUse Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges.\n\n## Exemple guidé\nThe expression “My name is Awa” introduces the speaker.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUse Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Greetings and introductions » ?",
                "answer": "My name is Awa",
                "wrongs": [
                  "Where are you?",
                  "Good night?",
                  "How old is it?"
                ],
                "explanation": "Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges. La réponse correcte est « My name is Awa »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Greetings and introductions », quelle réponse obtient-on ?",
                "answer": "My name is Awa",
                "wrongs": [
                  "Where are you?",
                  "Good night?",
                  "How old is it?"
                ],
                "explanation": "L'exemple illustre directement la notion : The expression “My name is Awa” introduces the speaker."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Greetings and introductions » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Greetings and introductions » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Greetings and introductions » ?",
                "answer": "The expression “My name is Awa” introduces the speaker.",
                "wrongs": [
                  "Where are you?",
                  "Good night?",
                  "How old is it?"
                ],
                "explanation": "Cette situation réinvestit la notion : The expression “My name is Awa” introduces the speaker."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Greetings and introductions » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Greetings and introductions ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Greetings and introductions » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « Where are you? ». Quelle réponse doit-il retenir pour « Greetings and introductions » ?",
                "answer": "My name is Awa",
                "wrongs": [
                  "Good night?",
                  "How old is it?",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Greetings and introductions » ?",
                "answer": "Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Greetings and introductions », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Greetings and introductions » ?",
                "answer": "Use Hello, Hi, Good morning and simple expressions to greet and introduce people. Use My name is... and What is your name? in basic exchanges.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Classroom language",
        "domain": "School",
        "competency": "Maîtriser classroom language et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Classroom language",
            "objectives": [
              "Définir et expliquer « Classroom language ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write.",
            "content": "# Classroom language\n\nClassroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write.\n\n## Exemple guidé\nThe imperative uses the base form of the verb.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nClassroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Classroom language » ?",
                "answer": "the base form",
                "wrongs": [
                  "the past participle",
                  "only -ed",
                  "a noun"
                ],
                "explanation": "Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write. La réponse correcte est « the base form »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Classroom language », quelle réponse obtient-on ?",
                "answer": "the base form",
                "wrongs": [
                  "the past participle",
                  "only -ed",
                  "a noun"
                ],
                "explanation": "L'exemple illustre directement la notion : The imperative uses the base form of the verb."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Classroom language » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Classroom language » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Classroom language » ?",
                "answer": "The imperative uses the base form of the verb.",
                "wrongs": [
                  "the past participle",
                  "only -ed",
                  "a noun"
                ],
                "explanation": "Cette situation réinvestit la notion : The imperative uses the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Classroom language » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Classroom language ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Classroom language » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « the past participle ». Quelle réponse doit-il retenir pour « Classroom language » ?",
                "answer": "the base form",
                "wrongs": [
                  "only -ed",
                  "a noun",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Classroom language » ?",
                "answer": "Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Classroom language », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Classroom language » ?",
                "answer": "Classroom English uses concrete vocabulary and imperatives such as Open your book, Listen, Repeat and Write.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Present simple",
        "domain": "Grammar",
        "competency": "Maîtriser present simple et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Present simple",
            "objectives": [
              "Définir et expliquer « Present simple ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements.",
            "content": "# Present simple\n\nThe present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements.\n\n## Exemple guidé\nShe plays football uses plays because the subject is third-person singular.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nThe present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Present simple » ?",
                "answer": "plays",
                "wrongs": [
                  "play",
                  "played",
                  "playing"
                ],
                "explanation": "The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements. La réponse correcte est « plays »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Present simple », quelle réponse obtient-on ?",
                "answer": "plays",
                "wrongs": [
                  "play",
                  "played",
                  "playing"
                ],
                "explanation": "L'exemple illustre directement la notion : She plays football uses plays because the subject is third-person singular."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Present simple » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Present simple » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Present simple » ?",
                "answer": "She plays football uses plays because the subject is third-person singular.",
                "wrongs": [
                  "play",
                  "played",
                  "playing"
                ],
                "explanation": "Cette situation réinvestit la notion : She plays football uses plays because the subject is third-person singular."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Present simple » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Present simple ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Present simple » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « play ». Quelle réponse doit-il retenir pour « Present simple » ?",
                "answer": "plays",
                "wrongs": [
                  "played",
                  "playing",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Present simple » ?",
                "answer": "The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Present simple », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Present simple » ?",
                "answer": "The present simple describes habits and regular facts. With he, she and it, regular verbs generally take -s in affirmative statements.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "There is / There are",
        "domain": "Grammar",
        "competency": "Maîtriser there is / there are et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "There is / There are",
            "objectives": [
              "Définir et expliquer « There is / There are ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?",
            "content": "# There is / There are\n\nThere is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?\n\n## Exemple guidé\nThere are twenty students refers to a plural noun.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nThere is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « There is / There are » ?",
                "answer": "plural",
                "wrongs": [
                  "singular",
                  "past time",
                  "a question only"
                ],
                "explanation": "There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...? La réponse correcte est « plural »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « There is / There are », quelle réponse obtient-on ?",
                "answer": "plural",
                "wrongs": [
                  "singular",
                  "past time",
                  "a question only"
                ],
                "explanation": "L'exemple illustre directement la notion : There are twenty students refers to a plural noun."
              },
              {
                "kind": "tf",
                "prompt": "La notion « There is / There are » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?"
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « There is / There are » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « There is / There are » ?",
                "answer": "There are twenty students refers to a plural noun.",
                "wrongs": [
                  "singular",
                  "past time",
                  "a question only"
                ],
                "explanation": "Cette situation réinvestit la notion : There are twenty students refers to a plural noun."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « There is / There are » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « There is / There are ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « There is / There are » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « singular ». Quelle réponse doit-il retenir pour « There is / There are » ?",
                "answer": "plural",
                "wrongs": [
                  "past time",
                  "a question only",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?"
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « There is / There are » ?",
                "answer": "There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « There is / There are », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « There is / There are » ?",
                "answer": "There is introduces a singular element; there are introduces plural elements. Questions use Is there...? or Are there...?",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Family and possessives",
        "domain": "Vocabulary",
        "competency": "Maîtriser family and possessives et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Family and possessives",
            "objectives": [
              "Définir et expliquer « Family and possessives ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their.",
            "content": "# Family and possessives\n\nFamily vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their.\n\n## Exemple guidé\nIn “her sister”, her is a possessive adjective.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nFamily vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Family and possessives » ?",
                "answer": "her",
                "wrongs": [
                  "sister",
                  "she",
                  "hers"
                ],
                "explanation": "Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their. La réponse correcte est « her »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Family and possessives », quelle réponse obtient-on ?",
                "answer": "her",
                "wrongs": [
                  "sister",
                  "she",
                  "hers"
                ],
                "explanation": "L'exemple illustre directement la notion : In “her sister”, her is a possessive adjective."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Family and possessives » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Family and possessives » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Family and possessives » ?",
                "answer": "In “her sister”, her is a possessive adjective.",
                "wrongs": [
                  "sister",
                  "she",
                  "hers"
                ],
                "explanation": "Cette situation réinvestit la notion : In “her sister”, her is a possessive adjective."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Family and possessives » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Family and possessives ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Family and possessives » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « sister ». Quelle réponse doit-il retenir pour « Family and possessives » ?",
                "answer": "her",
                "wrongs": [
                  "she",
                  "hers",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Family and possessives » ?",
                "answer": "Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Family and possessives », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Family and possessives » ?",
                "answer": "Family vocabulary includes mother, father, brother and sister. Possessive adjectives include my, your, his, her, our and their.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Appearance and personality",
        "domain": "Descriptions",
        "competency": "Maîtriser appearance and personality et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Appearance and personality",
            "objectives": [
              "Définir et expliquer « Appearance and personality ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy.",
            "content": "# Appearance and personality\n\nUse be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy.\n\n## Exemple guidé\n“He has brown eyes” uses have to describe a physical feature.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUse be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Appearance and personality » ?",
                "answer": "have",
                "wrongs": [
                  "be only",
                  "do",
                  "can"
                ],
                "explanation": "Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy. La réponse correcte est « have »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Appearance and personality », quelle réponse obtient-on ?",
                "answer": "have",
                "wrongs": [
                  "be only",
                  "do",
                  "can"
                ],
                "explanation": "L'exemple illustre directement la notion : “He has brown eyes” uses have to describe a physical feature."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Appearance and personality » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Appearance and personality » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Appearance and personality » ?",
                "answer": "“He has brown eyes” uses have to describe a physical feature.",
                "wrongs": [
                  "be only",
                  "do",
                  "can"
                ],
                "explanation": "Cette situation réinvestit la notion : “He has brown eyes” uses have to describe a physical feature."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Appearance and personality » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Appearance and personality ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Appearance and personality » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « be only ». Quelle réponse doit-il retenir pour « Appearance and personality » ?",
                "answer": "have",
                "wrongs": [
                  "do",
                  "can",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Appearance and personality » ?",
                "answer": "Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Appearance and personality », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Appearance and personality » ?",
                "answer": "Use be and have to describe people: She is tall; He has black hair. Personality adjectives include kind, friendly and shy.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Seasons and weather",
        "domain": "Weather",
        "competency": "Maîtriser seasons and weather et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Seasons and weather",
            "objectives": [
              "Définir et expliquer « Seasons and weather ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description.",
            "content": "# Seasons and weather\n\nUse sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description.\n\n## Exemple guidé\n“It is sunny” describes the weather.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUse sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Seasons and weather » ?",
                "answer": "sunny",
                "wrongs": [
                  "hungry",
                  "tall",
                  "early"
                ],
                "explanation": "Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description. La réponse correcte est « sunny »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Seasons and weather », quelle réponse obtient-on ?",
                "answer": "sunny",
                "wrongs": [
                  "hungry",
                  "tall",
                  "early"
                ],
                "explanation": "L'exemple illustre directement la notion : “It is sunny” describes the weather."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Seasons and weather » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Seasons and weather » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Seasons and weather » ?",
                "answer": "“It is sunny” describes the weather.",
                "wrongs": [
                  "hungry",
                  "tall",
                  "early"
                ],
                "explanation": "Cette situation réinvestit la notion : “It is sunny” describes the weather."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Seasons and weather » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Seasons and weather ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Seasons and weather » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « hungry ». Quelle réponse doit-il retenir pour « Seasons and weather » ?",
                "answer": "sunny",
                "wrongs": [
                  "tall",
                  "early",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Seasons and weather » ?",
                "answer": "Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Seasons and weather », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Seasons and weather » ?",
                "answer": "Use sunny, rainy, cloudy, windy, hot and cold. Ask What is the weather like? to request a weather description.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Articles and plurals",
        "domain": "Grammar",
        "competency": "Maîtriser articles and plurals et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Articles and plurals",
            "objectives": [
              "Définir et expliquer « Articles and plurals ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es.",
            "content": "# Articles and plurals\n\nUse a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es.\n\n## Exemple guidé\nThe correct article is “an” before apple because apple begins with a vowel sound.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUse a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Articles and plurals » ?",
                "answer": "an",
                "wrongs": [
                  "a",
                  "the",
                  "some"
                ],
                "explanation": "Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es. La réponse correcte est « an »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Articles and plurals », quelle réponse obtient-on ?",
                "answer": "an",
                "wrongs": [
                  "a",
                  "the",
                  "some"
                ],
                "explanation": "L'exemple illustre directement la notion : The correct article is “an” before apple because apple begins with a vowel sound."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Articles and plurals » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Articles and plurals » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Articles and plurals » ?",
                "answer": "The correct article is “an” before apple because apple begins with a vowel sound.",
                "wrongs": [
                  "a",
                  "the",
                  "some"
                ],
                "explanation": "Cette situation réinvestit la notion : The correct article is “an” before apple because apple begins with a vowel sound."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Articles and plurals » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Articles and plurals ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Articles and plurals » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « a ». Quelle réponse doit-il retenir pour « Articles and plurals » ?",
                "answer": "an",
                "wrongs": [
                  "the",
                  "some",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Articles and plurals » ?",
                "answer": "Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Articles and plurals », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Articles and plurals » ?",
                "answer": "Use a before a consonant sound, an before a vowel sound, and the when the noun is identifiable. Regular plurals often take -s or -es.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Quantifiers",
        "domain": "Grammar",
        "competency": "Maîtriser quantifiers et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Quantifiers",
            "objectives": [
              "Définir et expliquer « Quantifiers ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers.",
            "content": "# Quantifiers\n\nUse many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers.\n\n## Exemple guidé\n“Much water” is correct because water is uncountable.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUse many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Quantifiers » ?",
                "answer": "much",
                "wrongs": [
                  "many",
                  "a few",
                  "two"
                ],
                "explanation": "Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers. La réponse correcte est « much »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Quantifiers », quelle réponse obtient-on ?",
                "answer": "much",
                "wrongs": [
                  "many",
                  "a few",
                  "two"
                ],
                "explanation": "L'exemple illustre directement la notion : “Much water” is correct because water is uncountable."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Quantifiers » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Quantifiers » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Quantifiers » ?",
                "answer": "“Much water” is correct because water is uncountable.",
                "wrongs": [
                  "many",
                  "a few",
                  "two"
                ],
                "explanation": "Cette situation réinvestit la notion : “Much water” is correct because water is uncountable."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Quantifiers » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Quantifiers ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Quantifiers » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « many ». Quelle réponse doit-il retenir pour « Quantifiers » ?",
                "answer": "much",
                "wrongs": [
                  "a few",
                  "two",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Quantifiers » ?",
                "answer": "Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Quantifiers », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Quantifiers » ?",
                "answer": "Use many with countable plural nouns and much with uncountable nouns in basic usage. Some and any are also common quantifiers.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Past simple",
        "domain": "Grammar",
        "competency": "Maîtriser past simple et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Past simple",
            "objectives": [
              "Définir et expliquer « Past simple ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb.",
            "content": "# Past simple\n\nThe past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb.\n\n## Exemple guidé\nIn “Did you visit?”, visit remains in the base form after did.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nThe past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Past simple » ?",
                "answer": "visit",
                "wrongs": [
                  "visited",
                  "visiting",
                  "visits"
                ],
                "explanation": "The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb. La réponse correcte est « visit »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Past simple », quelle réponse obtient-on ?",
                "answer": "visit",
                "wrongs": [
                  "visited",
                  "visiting",
                  "visits"
                ],
                "explanation": "L'exemple illustre directement la notion : In “Did you visit?”, visit remains in the base form after did."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Past simple » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Past simple » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Past simple » ?",
                "answer": "In “Did you visit?”, visit remains in the base form after did.",
                "wrongs": [
                  "visited",
                  "visiting",
                  "visits"
                ],
                "explanation": "Cette situation réinvestit la notion : In “Did you visit?”, visit remains in the base form after did."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Past simple » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Past simple ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Past simple » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « visited ». Quelle réponse doit-il retenir pour « Past simple » ?",
                "answer": "visit",
                "wrongs": [
                  "visiting",
                  "visits",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Past simple » ?",
                "answer": "The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Past simple », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Past simple » ?",
                "answer": "The past simple describes completed actions. Regular verbs often take -ed; questions and negatives use did + base verb.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Short texts and key information",
        "domain": "Reading",
        "competency": "Maîtriser short texts and key information et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Short texts and key information",
            "objectives": [
              "Définir et expliquer « Short texts and key information ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Reading a short text means identifying who, where, when and the main action. Key words help infer meaning.",
            "content": "# Short texts and key information\n\nReading a short text means identifying who, where, when and the main action. Key words help infer meaning.\n\n## Exemple guidé\nA question asking “Where?” requires a place from the text.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nReading a short text means identifying who, where, when and the main action. Key words help infer meaning.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Short texts and key information » ?",
                "answer": "a place",
                "wrongs": [
                  "a time only",
                  "a person always",
                  "a number always"
                ],
                "explanation": "Reading a short text means identifying who, where, when and the main action. Key words help infer meaning. La réponse correcte est « a place »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Short texts and key information », quelle réponse obtient-on ?",
                "answer": "a place",
                "wrongs": [
                  "a time only",
                  "a person always",
                  "a number always"
                ],
                "explanation": "L'exemple illustre directement la notion : A question asking “Where?” requires a place from the text."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Short texts and key information » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Reading a short text means identifying who, where, when and the main action. Key words help infer meaning."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Short texts and key information » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Short texts and key information » ?",
                "answer": "A question asking “Where?” requires a place from the text.",
                "wrongs": [
                  "a time only",
                  "a person always",
                  "a number always"
                ],
                "explanation": "Cette situation réinvestit la notion : A question asking “Where?” requires a place from the text."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Short texts and key information » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Short texts and key information ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Short texts and key information » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « a time only ». Quelle réponse doit-il retenir pour « Short texts and key information » ?",
                "answer": "a place",
                "wrongs": [
                  "a person always",
                  "a number always",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Reading a short text means identifying who, where, when and the main action. Key words help infer meaning."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Short texts and key information » ?",
                "answer": "Reading a short text means identifying who, where, when and the main action. Key words help infer meaning.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Short texts and key information », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Short texts and key information » ?",
                "answer": "Reading a short text means identifying who, where, when and the main action. Key words help infer meaning.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Simple paragraph and daily routine",
        "domain": "Writing",
        "competency": "Maîtriser simple paragraph and daily routine et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Simple paragraph and daily routine",
            "objectives": [
              "Définir et expliquer « Simple paragraph and daily routine ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple.",
            "content": "# Simple paragraph and daily routine\n\nA basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple.\n\n## Exemple guidé\n“First, I wake up. Then I go to school.” uses sequence markers.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nA basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Simple paragraph and daily routine » ?",
                "answer": "sequence markers",
                "wrongs": [
                  "past tense only",
                  "articles only",
                  "questions only"
                ],
                "explanation": "A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple. La réponse correcte est « sequence markers »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Simple paragraph and daily routine », quelle réponse obtient-on ?",
                "answer": "sequence markers",
                "wrongs": [
                  "past tense only",
                  "articles only",
                  "questions only"
                ],
                "explanation": "L'exemple illustre directement la notion : “First, I wake up. Then I go to school.” uses sequence markers."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Simple paragraph and daily routine » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Simple paragraph and daily routine » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Simple paragraph and daily routine » ?",
                "answer": "“First, I wake up. Then I go to school.” uses sequence markers.",
                "wrongs": [
                  "past tense only",
                  "articles only",
                  "questions only"
                ],
                "explanation": "Cette situation réinvestit la notion : “First, I wake up. Then I go to school.” uses sequence markers."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Simple paragraph and daily routine » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Simple paragraph and daily routine ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Simple paragraph and daily routine » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « past tense only ». Quelle réponse doit-il retenir pour « Simple paragraph and daily routine » ?",
                "answer": "sequence markers",
                "wrongs": [
                  "articles only",
                  "questions only",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Simple paragraph and daily routine » ?",
                "answer": "A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Simple paragraph and daily routine », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Simple paragraph and daily routine » ?",
                "answer": "A basic paragraph can link short sentences with first, then, after that and finally. A routine uses present simple.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "Histoire",
    "source": "https://apprendre.education.sn/C_ressource/recherche/34",
    "version": "5e-histoire-v2",
    "chapters": [
      {
        "title": "Sources et méthode historique",
        "domain": "Repères",
        "competency": "Maîtriser sources et méthode historique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Sources et méthode historique",
            "objectives": [
              "Définir et expliquer « Sources et méthode historique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte.",
            "content": "# Sources et méthode historique\n\nL'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte.\n\n## Exemple guidé\nUne source archéologique est une trace matérielle du passé.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Sources et méthode historique » ?",
                "answer": "une trace matérielle",
                "wrongs": [
                  "une opinion actuelle",
                  "une prévision",
                  "une fiction"
                ],
                "explanation": "L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte. La réponse correcte est « une trace matérielle »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Sources et méthode historique », quelle réponse obtient-on ?",
                "answer": "une trace matérielle",
                "wrongs": [
                  "une opinion actuelle",
                  "une prévision",
                  "une fiction"
                ],
                "explanation": "L'exemple illustre directement la notion : Une source archéologique est une trace matérielle du passé."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Sources et méthode historique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Sources et méthode historique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Sources et méthode historique » ?",
                "answer": "Une source archéologique est une trace matérielle du passé.",
                "wrongs": [
                  "une opinion actuelle",
                  "une prévision",
                  "une fiction"
                ],
                "explanation": "Cette situation réinvestit la notion : Une source archéologique est une trace matérielle du passé."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Sources et méthode historique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Sources et méthode historique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Sources et méthode historique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une opinion actuelle ». Quelle réponse doit-il retenir pour « Sources et méthode historique » ?",
                "answer": "une trace matérielle",
                "wrongs": [
                  "une prévision",
                  "une fiction",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Sources et méthode historique » ?",
                "answer": "L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Sources et méthode historique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Sources et méthode historique » ?",
                "answer": "L'historien utilise des sources écrites, orales, matérielles et iconographiques. Il les contextualise et les confronte.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Paléolithique",
        "domain": "Préhistoire",
        "competency": "Maîtriser paléolithique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Paléolithique",
            "objectives": [
              "Définir et expliquer « Paléolithique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée.",
            "content": "# Paléolithique\n\nLe Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée.\n\n## Exemple guidé\nLa chasse et la cueillette caractérisent des modes de subsistance du Paléolithique.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Paléolithique » ?",
                "answer": "des activités de prédation",
                "wrongs": [
                  "l'industrie moderne",
                  "l'agriculture mécanisée",
                  "l'écriture imprimée"
                ],
                "explanation": "Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée. La réponse correcte est « des activités de prédation »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Paléolithique », quelle réponse obtient-on ?",
                "answer": "des activités de prédation",
                "wrongs": [
                  "l'industrie moderne",
                  "l'agriculture mécanisée",
                  "l'écriture imprimée"
                ],
                "explanation": "L'exemple illustre directement la notion : La chasse et la cueillette caractérisent des modes de subsistance du Paléolithique."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Paléolithique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Paléolithique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Paléolithique » ?",
                "answer": "La chasse et la cueillette caractérisent des modes de subsistance du Paléolithique.",
                "wrongs": [
                  "l'industrie moderne",
                  "l'agriculture mécanisée",
                  "l'écriture imprimée"
                ],
                "explanation": "Cette situation réinvestit la notion : La chasse et la cueillette caractérisent des modes de subsistance du Paléolithique."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Paléolithique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Paléolithique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Paléolithique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « l'industrie moderne ». Quelle réponse doit-il retenir pour « Paléolithique » ?",
                "answer": "des activités de prédation",
                "wrongs": [
                  "l'agriculture mécanisée",
                  "l'écriture imprimée",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Paléolithique » ?",
                "answer": "Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Paléolithique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Paléolithique » ?",
                "answer": "Le Paléolithique est associé à la chasse, à la pêche, à la cueillette, à la mobilité et à l'utilisation d'outils en pierre taillée.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Néolithique",
        "domain": "Préhistoire",
        "competency": "Maîtriser néolithique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Néolithique",
            "objectives": [
              "Définir et expliquer « Néolithique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions.",
            "content": "# Néolithique\n\nLe Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions.\n\n## Exemple guidé\nLa sédentarisation signifie l'installation durable dans un lieu.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Néolithique » ?",
                "answer": "une installation durable",
                "wrongs": [
                  "un déplacement permanent",
                  "une absence d'habitat",
                  "une guerre"
                ],
                "explanation": "Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions. La réponse correcte est « une installation durable »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Néolithique », quelle réponse obtient-on ?",
                "answer": "une installation durable",
                "wrongs": [
                  "un déplacement permanent",
                  "une absence d'habitat",
                  "une guerre"
                ],
                "explanation": "L'exemple illustre directement la notion : La sédentarisation signifie l'installation durable dans un lieu."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Néolithique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Néolithique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Néolithique » ?",
                "answer": "La sédentarisation signifie l'installation durable dans un lieu.",
                "wrongs": [
                  "un déplacement permanent",
                  "une absence d'habitat",
                  "une guerre"
                ],
                "explanation": "Cette situation réinvestit la notion : La sédentarisation signifie l'installation durable dans un lieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Néolithique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Néolithique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Néolithique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « un déplacement permanent ». Quelle réponse doit-il retenir pour « Néolithique » ?",
                "answer": "une installation durable",
                "wrongs": [
                  "une absence d'habitat",
                  "une guerre",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Néolithique » ?",
                "answer": "Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Néolithique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Néolithique » ?",
                "answer": "Le Néolithique est marqué par le développement de l'agriculture, de l'élevage et de la sédentarisation dans plusieurs régions.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Origines humaines et archéologie africaine",
        "domain": "Afrique",
        "competency": "Maîtriser origines humaines et archéologie africaine et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Origines humaines et archéologie africaine",
            "objectives": [
              "Définir et expliquer « Origines humaines et archéologie africaine ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles.",
            "content": "# Origines humaines et archéologie africaine\n\nLes découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles.\n\n## Exemple guidé\nLes fossiles sont des vestiges conservés qui renseignent sur des êtres anciens.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Origines humaines et archéologie africaine » ?",
                "answer": "des vestiges conservés",
                "wrongs": [
                  "des récits inventés",
                  "des cartes modernes",
                  "des lois actuelles"
                ],
                "explanation": "Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles. La réponse correcte est « des vestiges conservés »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Origines humaines et archéologie africaine », quelle réponse obtient-on ?",
                "answer": "des vestiges conservés",
                "wrongs": [
                  "des récits inventés",
                  "des cartes modernes",
                  "des lois actuelles"
                ],
                "explanation": "L'exemple illustre directement la notion : Les fossiles sont des vestiges conservés qui renseignent sur des êtres anciens."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Origines humaines et archéologie africaine » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Origines humaines et archéologie africaine » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Origines humaines et archéologie africaine » ?",
                "answer": "Les fossiles sont des vestiges conservés qui renseignent sur des êtres anciens.",
                "wrongs": [
                  "des récits inventés",
                  "des cartes modernes",
                  "des lois actuelles"
                ],
                "explanation": "Cette situation réinvestit la notion : Les fossiles sont des vestiges conservés qui renseignent sur des êtres anciens."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Origines humaines et archéologie africaine » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Origines humaines et archéologie africaine ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Origines humaines et archéologie africaine » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « des récits inventés ». Quelle réponse doit-il retenir pour « Origines humaines et archéologie africaine » ?",
                "answer": "des vestiges conservés",
                "wrongs": [
                  "des cartes modernes",
                  "des lois actuelles",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Origines humaines et archéologie africaine » ?",
                "answer": "Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Origines humaines et archéologie africaine », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Origines humaines et archéologie africaine » ?",
                "answer": "Les découvertes de fossiles et d'outils en Afrique jouent un rôle majeur dans l'étude des origines humaines. Les conclusions reposent sur les preuves disponibles.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Nil et civilisation égyptienne",
        "domain": "Égypte",
        "competency": "Maîtriser nil et civilisation égyptienne et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Nil et civilisation égyptienne",
            "objectives": [
              "Définir et expliquer « Nil et civilisation égyptienne ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta.",
            "content": "# Nil et civilisation égyptienne\n\nLe Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta.\n\n## Exemple guidé\nLes crues du Nil ont contribué à la fertilité de certaines terres agricoles.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Nil et civilisation égyptienne » ?",
                "answer": "à la fertilité des terres",
                "wrongs": [
                  "à la disparition de l'agriculture",
                  "à l'absence de villes",
                  "à la création de montagnes"
                ],
                "explanation": "Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta. La réponse correcte est « à la fertilité des terres »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Nil et civilisation égyptienne », quelle réponse obtient-on ?",
                "answer": "à la fertilité des terres",
                "wrongs": [
                  "à la disparition de l'agriculture",
                  "à l'absence de villes",
                  "à la création de montagnes"
                ],
                "explanation": "L'exemple illustre directement la notion : Les crues du Nil ont contribué à la fertilité de certaines terres agricoles."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Nil et civilisation égyptienne » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Nil et civilisation égyptienne » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Nil et civilisation égyptienne » ?",
                "answer": "Les crues du Nil ont contribué à la fertilité de certaines terres agricoles.",
                "wrongs": [
                  "à la disparition de l'agriculture",
                  "à l'absence de villes",
                  "à la création de montagnes"
                ],
                "explanation": "Cette situation réinvestit la notion : Les crues du Nil ont contribué à la fertilité de certaines terres agricoles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Nil et civilisation égyptienne » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Nil et civilisation égyptienne ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Nil et civilisation égyptienne » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « à la disparition de l'agriculture ». Quelle réponse doit-il retenir pour « Nil et civilisation égyptienne » ?",
                "answer": "à la fertilité des terres",
                "wrongs": [
                  "à l'absence de villes",
                  "à la création de montagnes",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Nil et civilisation égyptienne » ?",
                "answer": "Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Nil et civilisation égyptienne », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Nil et civilisation égyptienne » ?",
                "answer": "Le Nil structure l'espace égyptien ancien. L'agriculture, l'administration et le pouvoir royal s'organisent largement autour de la vallée et du delta.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Premières villes et écritures",
        "domain": "Mésopotamie",
        "competency": "Maîtriser premières villes et écritures et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Premières villes et écritures",
            "objectives": [
              "Définir et expliquer « Premières villes et écritures ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives.",
            "content": "# Premières villes et écritures\n\nEntre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives.\n\n## Exemple guidé\nL'écriture cunéiforme est associée aux tablettes d'argile de Mésopotamie.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nEntre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Premières villes et écritures » ?",
                "answer": "aux tablettes d'argile",
                "wrongs": [
                  "aux pyramides uniquement",
                  "aux monnaies modernes",
                  "aux manuscrits numériques"
                ],
                "explanation": "Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives. La réponse correcte est « aux tablettes d'argile »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Premières villes et écritures », quelle réponse obtient-on ?",
                "answer": "aux tablettes d'argile",
                "wrongs": [
                  "aux pyramides uniquement",
                  "aux monnaies modernes",
                  "aux manuscrits numériques"
                ],
                "explanation": "L'exemple illustre directement la notion : L'écriture cunéiforme est associée aux tablettes d'argile de Mésopotamie."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Premières villes et écritures » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Premières villes et écritures » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Premières villes et écritures » ?",
                "answer": "L'écriture cunéiforme est associée aux tablettes d'argile de Mésopotamie.",
                "wrongs": [
                  "aux pyramides uniquement",
                  "aux monnaies modernes",
                  "aux manuscrits numériques"
                ],
                "explanation": "Cette situation réinvestit la notion : L'écriture cunéiforme est associée aux tablettes d'argile de Mésopotamie."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Premières villes et écritures » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Premières villes et écritures ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Premières villes et écritures » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « aux pyramides uniquement ». Quelle réponse doit-il retenir pour « Premières villes et écritures » ?",
                "answer": "aux tablettes d'argile",
                "wrongs": [
                  "aux monnaies modernes",
                  "aux manuscrits numériques",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Premières villes et écritures » ?",
                "answer": "Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Premières villes et écritures », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Premières villes et écritures » ?",
                "answer": "Entre le Tigre et l'Euphrate, des villes et des États se développent. L'écriture sert notamment à enregistrer des informations administratives.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Cités grecques et démocratie",
        "domain": "Grèce",
        "competency": "Maîtriser cités grecques et démocratie et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Cités grecques et démocratie",
            "objectives": [
              "Définir et expliquer « Cités grecques et démocratie ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée.",
            "content": "# Cités grecques et démocratie\n\nLa cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée.\n\n## Exemple guidé\nLa démocratie athénienne ancienne ne concernait pas toute la population.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Cités grecques et démocratie » ?",
                "answer": "elle était réservée à une partie des habitants",
                "wrongs": [
                  "elle donnait le vote à tous",
                  "elle n'avait aucune institution",
                  "elle était moderne"
                ],
                "explanation": "La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée. La réponse correcte est « elle était réservée à une partie des habitants »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Cités grecques et démocratie », quelle réponse obtient-on ?",
                "answer": "elle était réservée à une partie des habitants",
                "wrongs": [
                  "elle donnait le vote à tous",
                  "elle n'avait aucune institution",
                  "elle était moderne"
                ],
                "explanation": "L'exemple illustre directement la notion : La démocratie athénienne ancienne ne concernait pas toute la population."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Cités grecques et démocratie » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Cités grecques et démocratie » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Cités grecques et démocratie » ?",
                "answer": "La démocratie athénienne ancienne ne concernait pas toute la population.",
                "wrongs": [
                  "elle donnait le vote à tous",
                  "elle n'avait aucune institution",
                  "elle était moderne"
                ],
                "explanation": "Cette situation réinvestit la notion : La démocratie athénienne ancienne ne concernait pas toute la population."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Cités grecques et démocratie » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Cités grecques et démocratie ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Cités grecques et démocratie » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « elle donnait le vote à tous ». Quelle réponse doit-il retenir pour « Cités grecques et démocratie » ?",
                "answer": "elle était réservée à une partie des habitants",
                "wrongs": [
                  "elle n'avait aucune institution",
                  "elle était moderne",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Cités grecques et démocratie » ?",
                "answer": "La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Cités grecques et démocratie », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Cités grecques et démocratie » ?",
                "answer": "La cité grecque est une communauté politique organisée. À Athènes, une partie des citoyens participe directement aux décisions, mais la citoyenneté est limitée.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Expansion et héritages romains",
        "domain": "Rome",
        "competency": "Maîtriser expansion et héritages romains et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Expansion et héritages romains",
            "objectives": [
              "Définir et expliquer « Expansion et héritages romains ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques.",
            "content": "# Expansion et héritages romains\n\nRome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques.\n\n## Exemple guidé\nL'expansion romaine transforme de nombreux territoires méditerranéens.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nRome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Expansion et héritages romains » ?",
                "answer": "de nombreux territoires",
                "wrongs": [
                  "un seul village",
                  "uniquement Rome",
                  "aucun territoire"
                ],
                "explanation": "Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques. La réponse correcte est « de nombreux territoires »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Expansion et héritages romains », quelle réponse obtient-on ?",
                "answer": "de nombreux territoires",
                "wrongs": [
                  "un seul village",
                  "uniquement Rome",
                  "aucun territoire"
                ],
                "explanation": "L'exemple illustre directement la notion : L'expansion romaine transforme de nombreux territoires méditerranéens."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Expansion et héritages romains » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Expansion et héritages romains » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Expansion et héritages romains » ?",
                "answer": "L'expansion romaine transforme de nombreux territoires méditerranéens.",
                "wrongs": [
                  "un seul village",
                  "uniquement Rome",
                  "aucun territoire"
                ],
                "explanation": "Cette situation réinvestit la notion : L'expansion romaine transforme de nombreux territoires méditerranéens."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Expansion et héritages romains » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Expansion et héritages romains ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Expansion et héritages romains » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « un seul village ». Quelle réponse doit-il retenir pour « Expansion et héritages romains » ?",
                "answer": "de nombreux territoires",
                "wrongs": [
                  "uniquement Rome",
                  "aucun territoire",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Expansion et héritages romains » ?",
                "answer": "Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Expansion et héritages romains », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Expansion et héritages romains » ?",
                "answer": "Rome s'étend progressivement dans le monde méditerranéen. Routes, villes, ouvrages et pratiques administratives laissent des traces archéologiques.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Premiers États et échanges",
        "domain": "Afrique de l'Ouest",
        "competency": "Maîtriser premiers états et échanges et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Premiers États et échanges",
            "objectives": [
              "Définir et expliquer « Premiers États et échanges ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux.",
            "content": "# Premiers États et échanges\n\nLes sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux.\n\n## Exemple guidé\nLes échanges transsahariens relient notamment l'Afrique de l'Ouest à l'Afrique du Nord.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Premiers États et échanges » ?",
                "answer": "l'Afrique de l'Ouest et l'Afrique du Nord",
                "wrongs": [
                  "deux continents sans échanges",
                  "seulement les océans",
                  "uniquement l'Europe"
                ],
                "explanation": "Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux. La réponse correcte est « l'Afrique de l'Ouest et l'Afrique du Nord »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Premiers États et échanges », quelle réponse obtient-on ?",
                "answer": "l'Afrique de l'Ouest et l'Afrique du Nord",
                "wrongs": [
                  "deux continents sans échanges",
                  "seulement les océans",
                  "uniquement l'Europe"
                ],
                "explanation": "L'exemple illustre directement la notion : Les échanges transsahariens relient notamment l'Afrique de l'Ouest à l'Afrique du Nord."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Premiers États et échanges » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Premiers États et échanges » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Premiers États et échanges » ?",
                "answer": "Les échanges transsahariens relient notamment l'Afrique de l'Ouest à l'Afrique du Nord.",
                "wrongs": [
                  "deux continents sans échanges",
                  "seulement les océans",
                  "uniquement l'Europe"
                ],
                "explanation": "Cette situation réinvestit la notion : Les échanges transsahariens relient notamment l'Afrique de l'Ouest à l'Afrique du Nord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Premiers États et échanges » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Premiers États et échanges ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Premiers États et échanges » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « deux continents sans échanges ». Quelle réponse doit-il retenir pour « Premiers États et échanges » ?",
                "answer": "l'Afrique de l'Ouest et l'Afrique du Nord",
                "wrongs": [
                  "seulement les océans",
                  "uniquement l'Europe",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Premiers États et échanges » ?",
                "answer": "Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Premiers États et échanges », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Premiers États et échanges » ?",
                "answer": "Les sociétés d'Afrique de l'Ouest développent des réseaux d'échanges et des formes d'organisation politique avant et pendant les grands empires médiévaux.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Empire du Mali",
        "domain": "Mali",
        "competency": "Maîtriser empire du mali et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Empire du Mali",
            "objectives": [
              "Définir et expliquer « Empire du Mali ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique.",
            "content": "# Empire du Mali\n\nL'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique.\n\n## Exemple guidé\nLe commerce de l'or et du sel joue un rôle important dans l'économie de l'Empire du Mali.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Empire du Mali » ?",
                "answer": "l'or et le sel",
                "wrongs": [
                  "le pétrole et le gaz",
                  "le cacao et le café uniquement",
                  "le fer moderne"
                ],
                "explanation": "L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique. La réponse correcte est « l'or et le sel »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Empire du Mali », quelle réponse obtient-on ?",
                "answer": "l'or et le sel",
                "wrongs": [
                  "le pétrole et le gaz",
                  "le cacao et le café uniquement",
                  "le fer moderne"
                ],
                "explanation": "L'exemple illustre directement la notion : Le commerce de l'or et du sel joue un rôle important dans l'économie de l'Empire du Mali."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Empire du Mali » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Empire du Mali » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Empire du Mali » ?",
                "answer": "Le commerce de l'or et du sel joue un rôle important dans l'économie de l'Empire du Mali.",
                "wrongs": [
                  "le pétrole et le gaz",
                  "le cacao et le café uniquement",
                  "le fer moderne"
                ],
                "explanation": "Cette situation réinvestit la notion : Le commerce de l'or et du sel joue un rôle important dans l'économie de l'Empire du Mali."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Empire du Mali » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Empire du Mali ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Empire du Mali » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « le pétrole et le gaz ». Quelle réponse doit-il retenir pour « Empire du Mali » ?",
                "answer": "l'or et le sel",
                "wrongs": [
                  "le cacao et le café uniquement",
                  "le fer moderne",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Empire du Mali » ?",
                "answer": "L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Empire du Mali », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Empire du Mali » ?",
                "answer": "L'Empire du Mali devient une grande puissance d'Afrique de l'Ouest. Son développement est lié aux échanges, aux ressources et à l'organisation politique.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Pouvoirs, cultures et islamisation",
        "domain": "Sociétés",
        "competency": "Maîtriser pouvoirs, cultures et islamisation et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Pouvoirs, cultures et islamisation",
            "objectives": [
              "Définir et expliquer « Pouvoirs, cultures et islamisation ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés.",
            "content": "# Pouvoirs, cultures et islamisation\n\nLes sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés.\n\n## Exemple guidé\nL'islamisation de l'Afrique de l'Ouest est un processus progressif et diversifié.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Pouvoirs, cultures et islamisation » ?",
                "answer": "un processus progressif",
                "wrongs": [
                  "un événement unique",
                  "une disparition immédiate",
                  "une colonisation moderne"
                ],
                "explanation": "Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés. La réponse correcte est « un processus progressif »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Pouvoirs, cultures et islamisation », quelle réponse obtient-on ?",
                "answer": "un processus progressif",
                "wrongs": [
                  "un événement unique",
                  "une disparition immédiate",
                  "une colonisation moderne"
                ],
                "explanation": "L'exemple illustre directement la notion : L'islamisation de l'Afrique de l'Ouest est un processus progressif et diversifié."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Pouvoirs, cultures et islamisation » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Pouvoirs, cultures et islamisation » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Pouvoirs, cultures et islamisation » ?",
                "answer": "L'islamisation de l'Afrique de l'Ouest est un processus progressif et diversifié.",
                "wrongs": [
                  "un événement unique",
                  "une disparition immédiate",
                  "une colonisation moderne"
                ],
                "explanation": "Cette situation réinvestit la notion : L'islamisation de l'Afrique de l'Ouest est un processus progressif et diversifié."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Pouvoirs, cultures et islamisation » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Pouvoirs, cultures et islamisation ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Pouvoirs, cultures et islamisation » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « un événement unique ». Quelle réponse doit-il retenir pour « Pouvoirs, cultures et islamisation » ?",
                "answer": "un processus progressif",
                "wrongs": [
                  "une disparition immédiate",
                  "une colonisation moderne",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Pouvoirs, cultures et islamisation » ?",
                "answer": "Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Pouvoirs, cultures et islamisation », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Pouvoirs, cultures et islamisation » ?",
                "answer": "Les sociétés ouest-africaines médiévales connaissent des échanges culturels et religieux. L'islamisation progresse selon des rythmes et des espaces variés.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Frise chronologique et repères",
        "domain": "Méthode",
        "competency": "Maîtriser frise chronologique et repères et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Frise chronologique et repères",
            "objectives": [
              "Définir et expliquer « Frise chronologique et repères ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente.",
            "content": "# Frise chronologique et repères\n\nUne frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente.\n\n## Exemple guidé\nSur une frise, les événements sont placés selon leur ordre chronologique.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Frise chronologique et repères » ?",
                "answer": "leur ordre chronologique",
                "wrongs": [
                  "leur longueur de texte",
                  "leur importance actuelle",
                  "leur couleur"
                ],
                "explanation": "Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente. La réponse correcte est « leur ordre chronologique »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Frise chronologique et repères », quelle réponse obtient-on ?",
                "answer": "leur ordre chronologique",
                "wrongs": [
                  "leur longueur de texte",
                  "leur importance actuelle",
                  "leur couleur"
                ],
                "explanation": "L'exemple illustre directement la notion : Sur une frise, les événements sont placés selon leur ordre chronologique."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Frise chronologique et repères » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Frise chronologique et repères » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Frise chronologique et repères » ?",
                "answer": "Sur une frise, les événements sont placés selon leur ordre chronologique.",
                "wrongs": [
                  "leur longueur de texte",
                  "leur importance actuelle",
                  "leur couleur"
                ],
                "explanation": "Cette situation réinvestit la notion : Sur une frise, les événements sont placés selon leur ordre chronologique."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Frise chronologique et repères » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Frise chronologique et repères ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Frise chronologique et repères » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « leur longueur de texte ». Quelle réponse doit-il retenir pour « Frise chronologique et repères » ?",
                "answer": "leur ordre chronologique",
                "wrongs": [
                  "leur importance actuelle",
                  "leur couleur",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Frise chronologique et repères » ?",
                "answer": "Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Frise chronologique et repères », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Frise chronologique et repères » ?",
                "answer": "Une frise permet d'ordonner des événements et de comparer leurs dates. Elle doit respecter une échelle cohérente.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "Géographie",
    "source": "https://apprendre.education.sn/C_ressource/recherche/34",
    "version": "5e-geographie-v2",
    "chapters": [
      {
        "title": "Carte, échelle et orientation",
        "domain": "Repères",
        "competency": "Maîtriser carte, échelle et orientation et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Carte, échelle et orientation",
            "objectives": [
              "Définir et expliquer « Carte, échelle et orientation ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter.",
            "content": "# Carte, échelle et orientation\n\nUne carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter.\n\n## Exemple guidé\nSur une carte, une légende explique la signification des figurés.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nUne carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Carte, échelle et orientation » ?",
                "answer": "la signification des figurés",
                "wrongs": [
                  "la météo uniquement",
                  "la date",
                  "le prix"
                ],
                "explanation": "Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter. La réponse correcte est « la signification des figurés »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Carte, échelle et orientation », quelle réponse obtient-on ?",
                "answer": "la signification des figurés",
                "wrongs": [
                  "la météo uniquement",
                  "la date",
                  "le prix"
                ],
                "explanation": "L'exemple illustre directement la notion : Sur une carte, une légende explique la signification des figurés."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Carte, échelle et orientation » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Carte, échelle et orientation » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Carte, échelle et orientation » ?",
                "answer": "Sur une carte, une légende explique la signification des figurés.",
                "wrongs": [
                  "la météo uniquement",
                  "la date",
                  "le prix"
                ],
                "explanation": "Cette situation réinvestit la notion : Sur une carte, une légende explique la signification des figurés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Carte, échelle et orientation » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Carte, échelle et orientation ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Carte, échelle et orientation » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la météo uniquement ». Quelle réponse doit-il retenir pour « Carte, échelle et orientation » ?",
                "answer": "la signification des figurés",
                "wrongs": [
                  "la date",
                  "le prix",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Carte, échelle et orientation » ?",
                "answer": "Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Carte, échelle et orientation », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Carte, échelle et orientation » ?",
                "answer": "Une carte représente un espace à l'aide d'une légende, d'une échelle et de figurés. Les points cardinaux servent à s'orienter.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Localiser l'Afrique",
        "domain": "Afrique",
        "competency": "Maîtriser localiser l'afrique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Localiser l'Afrique",
            "objectives": [
              "Définir et expliquer « Localiser l'Afrique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis.",
            "content": "# Localiser l'Afrique\n\nL'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis.\n\n## Exemple guidé\nL'équateur traverse l'Afrique.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Localiser l'Afrique » ?",
                "answer": "oui",
                "wrongs": [
                  "non",
                  "seulement l'Europe",
                  "seulement l'Asie"
                ],
                "explanation": "L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis. La réponse correcte est « oui »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Localiser l'Afrique », quelle réponse obtient-on ?",
                "answer": "oui",
                "wrongs": [
                  "non",
                  "seulement l'Europe",
                  "seulement l'Asie"
                ],
                "explanation": "L'exemple illustre directement la notion : L'équateur traverse l'Afrique."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Localiser l'Afrique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Localiser l'Afrique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Localiser l'Afrique » ?",
                "answer": "L'équateur traverse l'Afrique.",
                "wrongs": [
                  "non",
                  "seulement l'Europe",
                  "seulement l'Asie"
                ],
                "explanation": "Cette situation réinvestit la notion : L'équateur traverse l'Afrique."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Localiser l'Afrique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Localiser l'Afrique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Localiser l'Afrique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « non ». Quelle réponse doit-il retenir pour « Localiser l'Afrique » ?",
                "answer": "oui",
                "wrongs": [
                  "seulement l'Europe",
                  "seulement l'Asie",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Localiser l'Afrique » ?",
                "answer": "L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Localiser l'Afrique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Localiser l'Afrique » ?",
                "answer": "L'Afrique est un continent traversé par l'équateur et limité par plusieurs mers et océans. La localisation utilise des repères précis.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Climats et milieux africains",
        "domain": "Milieux",
        "competency": "Maîtriser climats et milieux africains et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Climats et milieux africains",
            "objectives": [
              "Définir et expliquer « Climats et milieux africains ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources.",
            "content": "# Climats et milieux africains\n\nLes milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources.\n\n## Exemple guidé\nLa savane est un milieu caractérisé notamment par des herbes et des arbres dispersés.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Climats et milieux africains » ?",
                "answer": "des herbes et des arbres dispersés",
                "wrongs": [
                  "une forêt toujours dense",
                  "un glacier",
                  "une zone sans végétation"
                ],
                "explanation": "Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources. La réponse correcte est « des herbes et des arbres dispersés »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Climats et milieux africains », quelle réponse obtient-on ?",
                "answer": "des herbes et des arbres dispersés",
                "wrongs": [
                  "une forêt toujours dense",
                  "un glacier",
                  "une zone sans végétation"
                ],
                "explanation": "L'exemple illustre directement la notion : La savane est un milieu caractérisé notamment par des herbes et des arbres dispersés."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Climats et milieux africains » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Climats et milieux africains » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Climats et milieux africains » ?",
                "answer": "La savane est un milieu caractérisé notamment par des herbes et des arbres dispersés.",
                "wrongs": [
                  "une forêt toujours dense",
                  "un glacier",
                  "une zone sans végétation"
                ],
                "explanation": "Cette situation réinvestit la notion : La savane est un milieu caractérisé notamment par des herbes et des arbres dispersés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Climats et milieux africains » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Climats et milieux africains ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Climats et milieux africains » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « une forêt toujours dense ». Quelle réponse doit-il retenir pour « Climats et milieux africains » ?",
                "answer": "des herbes et des arbres dispersés",
                "wrongs": [
                  "un glacier",
                  "une zone sans végétation",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Climats et milieux africains » ?",
                "answer": "Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Climats et milieux africains », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Climats et milieux africains » ?",
                "answer": "Les milieux varient selon le climat, le relief, l'eau, les sols et la végétation. Les sociétés s'adaptent à ces contraintes et ressources.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Répartition de la population",
        "domain": "Population",
        "competency": "Maîtriser répartition de la population et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Répartition de la population",
            "objectives": [
              "Définir et expliquer « Répartition de la population ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges.",
            "content": "# Répartition de la population\n\nLa population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges.\n\n## Exemple guidé\nUne forte densité signifie qu'un grand nombre d'habitants vit sur une petite surface.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Répartition de la population » ?",
                "answer": "beaucoup d'habitants par unité de surface",
                "wrongs": [
                  "peu d'habitants partout",
                  "une grande superficie seulement",
                  "un climat précis"
                ],
                "explanation": "La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges. La réponse correcte est « beaucoup d'habitants par unité de surface »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Répartition de la population », quelle réponse obtient-on ?",
                "answer": "beaucoup d'habitants par unité de surface",
                "wrongs": [
                  "peu d'habitants partout",
                  "une grande superficie seulement",
                  "un climat précis"
                ],
                "explanation": "L'exemple illustre directement la notion : Une forte densité signifie qu'un grand nombre d'habitants vit sur une petite surface."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Répartition de la population » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Répartition de la population » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Répartition de la population » ?",
                "answer": "Une forte densité signifie qu'un grand nombre d'habitants vit sur une petite surface.",
                "wrongs": [
                  "peu d'habitants partout",
                  "une grande superficie seulement",
                  "un climat précis"
                ],
                "explanation": "Cette situation réinvestit la notion : Une forte densité signifie qu'un grand nombre d'habitants vit sur une petite surface."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Répartition de la population » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Répartition de la population ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Répartition de la population » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « peu d'habitants partout ». Quelle réponse doit-il retenir pour « Répartition de la population » ?",
                "answer": "beaucoup d'habitants par unité de surface",
                "wrongs": [
                  "une grande superficie seulement",
                  "un climat précis",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Répartition de la population » ?",
                "answer": "La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Répartition de la population », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Répartition de la population » ?",
                "answer": "La population est inégalement répartie. Les densités sont souvent plus fortes dans les espaces favorables aux activités et aux échanges.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Territoires et régions du Sénégal",
        "domain": "Sénégal",
        "competency": "Maîtriser territoires et régions du sénégal et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Territoires et régions du Sénégal",
            "objectives": [
              "Définir et expliquer « Territoires et régions du Sénégal ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte.",
            "content": "# Territoires et régions du Sénégal\n\nLe Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte.\n\n## Exemple guidé\nDakar appartient à la région la plus urbanisée du pays et constitue un pôle majeur.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLe Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Territoires et régions du Sénégal » ?",
                "answer": "un pôle urbain majeur",
                "wrongs": [
                  "un espace sans population",
                  "une région étrangère",
                  "une capitale d'un autre pays"
                ],
                "explanation": "Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte. La réponse correcte est « un pôle urbain majeur »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Territoires et régions du Sénégal », quelle réponse obtient-on ?",
                "answer": "un pôle urbain majeur",
                "wrongs": [
                  "un espace sans population",
                  "une région étrangère",
                  "une capitale d'un autre pays"
                ],
                "explanation": "L'exemple illustre directement la notion : Dakar appartient à la région la plus urbanisée du pays et constitue un pôle majeur."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Territoires et régions du Sénégal » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Territoires et régions du Sénégal » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Territoires et régions du Sénégal » ?",
                "answer": "Dakar appartient à la région la plus urbanisée du pays et constitue un pôle majeur.",
                "wrongs": [
                  "un espace sans population",
                  "une région étrangère",
                  "une capitale d'un autre pays"
                ],
                "explanation": "Cette situation réinvestit la notion : Dakar appartient à la région la plus urbanisée du pays et constitue un pôle majeur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Territoires et régions du Sénégal » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Territoires et régions du Sénégal ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Territoires et régions du Sénégal » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « un espace sans population ». Quelle réponse doit-il retenir pour « Territoires et régions du Sénégal » ?",
                "answer": "un pôle urbain majeur",
                "wrongs": [
                  "une région étrangère",
                  "une capitale d'un autre pays",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Territoires et régions du Sénégal » ?",
                "answer": "Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Territoires et régions du Sénégal », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Territoires et régions du Sénégal » ?",
                "answer": "Le Sénégal possède des espaces différenciés par leurs milieux, leurs activités et leur peuplement. La connaissance du territoire s'appuie sur la carte.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Agriculture et ressources",
        "domain": "Agriculture",
        "competency": "Maîtriser agriculture et ressources et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Agriculture et ressources",
            "objectives": [
              "Définir et expliquer « Agriculture et ressources ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions.",
            "content": "# Agriculture et ressources\n\nL'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions.\n\n## Exemple guidé\nL'irrigation permet d'apporter de l'eau aux cultures lorsque les précipitations sont insuffisantes.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Agriculture et ressources » ?",
                "answer": "apporter de l'eau aux cultures",
                "wrongs": [
                  "retirer les sols",
                  "arrêter la photosynthèse",
                  "créer une frontière"
                ],
                "explanation": "L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions. La réponse correcte est « apporter de l'eau aux cultures »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Agriculture et ressources », quelle réponse obtient-on ?",
                "answer": "apporter de l'eau aux cultures",
                "wrongs": [
                  "retirer les sols",
                  "arrêter la photosynthèse",
                  "créer une frontière"
                ],
                "explanation": "L'exemple illustre directement la notion : L'irrigation permet d'apporter de l'eau aux cultures lorsque les précipitations sont insuffisantes."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Agriculture et ressources » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Agriculture et ressources » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Agriculture et ressources » ?",
                "answer": "L'irrigation permet d'apporter de l'eau aux cultures lorsque les précipitations sont insuffisantes.",
                "wrongs": [
                  "retirer les sols",
                  "arrêter la photosynthèse",
                  "créer une frontière"
                ],
                "explanation": "Cette situation réinvestit la notion : L'irrigation permet d'apporter de l'eau aux cultures lorsque les précipitations sont insuffisantes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Agriculture et ressources » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Agriculture et ressources ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Agriculture et ressources » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « retirer les sols ». Quelle réponse doit-il retenir pour « Agriculture et ressources » ?",
                "answer": "apporter de l'eau aux cultures",
                "wrongs": [
                  "arrêter la photosynthèse",
                  "créer une frontière",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Agriculture et ressources » ?",
                "answer": "L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Agriculture et ressources », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Agriculture et ressources » ?",
                "answer": "L'agriculture dépend des sols, de l'eau, du climat, des techniques et des marchés. Les productions varient selon les régions.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Aménagements et irrigation",
        "domain": "Vallée du Sénégal",
        "competency": "Maîtriser aménagements et irrigation et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Aménagements et irrigation",
            "objectives": [
              "Définir et expliquer « Aménagements et irrigation ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres.",
            "content": "# Aménagements et irrigation\n\nLa vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres.\n\n## Exemple guidé\nLes aménagements hydrauliques peuvent soutenir l'agriculture irriguée.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLa vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Aménagements et irrigation » ?",
                "answer": "soutenir l'agriculture irriguée",
                "wrongs": [
                  "supprimer l'eau",
                  "empêcher toute culture",
                  "créer des montagnes"
                ],
                "explanation": "La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres. La réponse correcte est « soutenir l'agriculture irriguée »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Aménagements et irrigation », quelle réponse obtient-on ?",
                "answer": "soutenir l'agriculture irriguée",
                "wrongs": [
                  "supprimer l'eau",
                  "empêcher toute culture",
                  "créer des montagnes"
                ],
                "explanation": "L'exemple illustre directement la notion : Les aménagements hydrauliques peuvent soutenir l'agriculture irriguée."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Aménagements et irrigation » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Aménagements et irrigation » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Aménagements et irrigation » ?",
                "answer": "Les aménagements hydrauliques peuvent soutenir l'agriculture irriguée.",
                "wrongs": [
                  "supprimer l'eau",
                  "empêcher toute culture",
                  "créer des montagnes"
                ],
                "explanation": "Cette situation réinvestit la notion : Les aménagements hydrauliques peuvent soutenir l'agriculture irriguée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Aménagements et irrigation » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Aménagements et irrigation ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Aménagements et irrigation » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « supprimer l'eau ». Quelle réponse doit-il retenir pour « Aménagements et irrigation » ?",
                "answer": "soutenir l'agriculture irriguée",
                "wrongs": [
                  "empêcher toute culture",
                  "créer des montagnes",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Aménagements et irrigation » ?",
                "answer": "La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Aménagements et irrigation », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Aménagements et irrigation » ?",
                "answer": "La vallée du fleuve Sénégal concentre des activités agricoles et des aménagements hydrauliques. L'eau joue un rôle majeur dans la mise en valeur des terres.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Littoraux et activités",
        "domain": "Littoral",
        "competency": "Maîtriser littoraux et activités et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Littoraux et activités",
            "objectives": [
              "Définir et expliquer « Littoraux et activités ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques.",
            "content": "# Littoraux et activités\n\nLes littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques.\n\n## Exemple guidé\nUn port est un aménagement permettant notamment les échanges maritimes.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Littoraux et activités » ?",
                "answer": "les échanges maritimes",
                "wrongs": [
                  "l'agriculture de montagne",
                  "la mesure du temps",
                  "la formation des sols"
                ],
                "explanation": "Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques. La réponse correcte est « les échanges maritimes »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Littoraux et activités », quelle réponse obtient-on ?",
                "answer": "les échanges maritimes",
                "wrongs": [
                  "l'agriculture de montagne",
                  "la mesure du temps",
                  "la formation des sols"
                ],
                "explanation": "L'exemple illustre directement la notion : Un port est un aménagement permettant notamment les échanges maritimes."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Littoraux et activités » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Littoraux et activités » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Littoraux et activités » ?",
                "answer": "Un port est un aménagement permettant notamment les échanges maritimes.",
                "wrongs": [
                  "l'agriculture de montagne",
                  "la mesure du temps",
                  "la formation des sols"
                ],
                "explanation": "Cette situation réinvestit la notion : Un port est un aménagement permettant notamment les échanges maritimes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Littoraux et activités » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Littoraux et activités ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Littoraux et activités » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « l'agriculture de montagne ». Quelle réponse doit-il retenir pour « Littoraux et activités » ?",
                "answer": "les échanges maritimes",
                "wrongs": [
                  "la mesure du temps",
                  "la formation des sols",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Littoraux et activités » ?",
                "answer": "Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Littoraux et activités », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Littoraux et activités » ?",
                "answer": "Les littoraux concentrent des populations et des activités comme la pêche, les ports, le commerce et le tourisme. Ils sont aussi exposés à des risques.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Urbanisation et mobilités",
        "domain": "Villes",
        "competency": "Maîtriser urbanisation et mobilités et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Urbanisation et mobilités",
            "objectives": [
              "Définir et expliquer « Urbanisation et mobilités ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains.",
            "content": "# Urbanisation et mobilités\n\nL'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains.\n\n## Exemple guidé\nL'urbanisation désigne le développement des villes et de la population urbaine.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Urbanisation et mobilités » ?",
                "answer": "le développement des villes",
                "wrongs": [
                  "la désertification seulement",
                  "la baisse des échanges",
                  "la formation d'un océan"
                ],
                "explanation": "L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains. La réponse correcte est « le développement des villes »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Urbanisation et mobilités », quelle réponse obtient-on ?",
                "answer": "le développement des villes",
                "wrongs": [
                  "la désertification seulement",
                  "la baisse des échanges",
                  "la formation d'un océan"
                ],
                "explanation": "L'exemple illustre directement la notion : L'urbanisation désigne le développement des villes et de la population urbaine."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Urbanisation et mobilités » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Urbanisation et mobilités » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Urbanisation et mobilités » ?",
                "answer": "L'urbanisation désigne le développement des villes et de la population urbaine.",
                "wrongs": [
                  "la désertification seulement",
                  "la baisse des échanges",
                  "la formation d'un océan"
                ],
                "explanation": "Cette situation réinvestit la notion : L'urbanisation désigne le développement des villes et de la population urbaine."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Urbanisation et mobilités » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Urbanisation et mobilités ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Urbanisation et mobilités » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « la désertification seulement ». Quelle réponse doit-il retenir pour « Urbanisation et mobilités » ?",
                "answer": "le développement des villes",
                "wrongs": [
                  "la baisse des échanges",
                  "la formation d'un océan",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Urbanisation et mobilités » ?",
                "answer": "L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Urbanisation et mobilités », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Urbanisation et mobilités » ?",
                "answer": "L'urbanisation augmente la part de la population vivant dans les villes. Les mobilités relient les espaces urbains, ruraux et périurbains.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Eau et gestion durable",
        "domain": "Ressources",
        "competency": "Maîtriser eau et gestion durable et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Eau et gestion durable",
            "objectives": [
              "Définir et expliquer « Eau et gestion durable ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux.",
            "content": "# Eau et gestion durable\n\nL'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux.\n\n## Exemple guidé\nLa gestion durable cherche à répondre aux besoins actuels sans dégrader durablement la ressource.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nL'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Eau et gestion durable » ?",
                "answer": "répondre aux besoins sans épuiser la ressource",
                "wrongs": [
                  "consommer sans limite",
                  "polluer les nappes",
                  "interdire toute utilisation"
                ],
                "explanation": "L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux. La réponse correcte est « répondre aux besoins sans épuiser la ressource »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Eau et gestion durable », quelle réponse obtient-on ?",
                "answer": "répondre aux besoins sans épuiser la ressource",
                "wrongs": [
                  "consommer sans limite",
                  "polluer les nappes",
                  "interdire toute utilisation"
                ],
                "explanation": "L'exemple illustre directement la notion : La gestion durable cherche à répondre aux besoins actuels sans dégrader durablement la ressource."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Eau et gestion durable » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Eau et gestion durable » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Eau et gestion durable » ?",
                "answer": "La gestion durable cherche à répondre aux besoins actuels sans dégrader durablement la ressource.",
                "wrongs": [
                  "consommer sans limite",
                  "polluer les nappes",
                  "interdire toute utilisation"
                ],
                "explanation": "Cette situation réinvestit la notion : La gestion durable cherche à répondre aux besoins actuels sans dégrader durablement la ressource."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Eau et gestion durable » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Eau et gestion durable ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Eau et gestion durable » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « consommer sans limite ». Quelle réponse doit-il retenir pour « Eau et gestion durable » ?",
                "answer": "répondre aux besoins sans épuiser la ressource",
                "wrongs": [
                  "polluer les nappes",
                  "interdire toute utilisation",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Eau et gestion durable » ?",
                "answer": "L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Eau et gestion durable », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Eau et gestion durable » ?",
                "answer": "L'eau est une ressource essentielle mais inégalement disponible. Sa gestion doit concilier besoins des populations, agriculture, activités économiques et protection des milieux.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Échanges et activités économiques",
        "domain": "Économie",
        "competency": "Maîtriser échanges et activités économiques et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Échanges et activités économiques",
            "objectives": [
              "Définir et expliquer « Échanges et activités économiques ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces.",
            "content": "# Échanges et activités économiques\n\nLes activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces.\n\n## Exemple guidé\nUn marché met en relation des vendeurs et des acheteurs.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nLes activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Échanges et activités économiques » ?",
                "answer": "des vendeurs et des acheteurs",
                "wrongs": [
                  "des climats uniquement",
                  "des reliefs",
                  "des frontières naturelles"
                ],
                "explanation": "Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces. La réponse correcte est « des vendeurs et des acheteurs »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Échanges et activités économiques », quelle réponse obtient-on ?",
                "answer": "des vendeurs et des acheteurs",
                "wrongs": [
                  "des climats uniquement",
                  "des reliefs",
                  "des frontières naturelles"
                ],
                "explanation": "L'exemple illustre directement la notion : Un marché met en relation des vendeurs et des acheteurs."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Échanges et activités économiques » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Échanges et activités économiques » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Échanges et activités économiques » ?",
                "answer": "Un marché met en relation des vendeurs et des acheteurs.",
                "wrongs": [
                  "des climats uniquement",
                  "des reliefs",
                  "des frontières naturelles"
                ],
                "explanation": "Cette situation réinvestit la notion : Un marché met en relation des vendeurs et des acheteurs."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Échanges et activités économiques » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Échanges et activités économiques ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Échanges et activités économiques » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « des climats uniquement ». Quelle réponse doit-il retenir pour « Échanges et activités économiques » ?",
                "answer": "des vendeurs et des acheteurs",
                "wrongs": [
                  "des reliefs",
                  "des frontières naturelles",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Échanges et activités économiques » ?",
                "answer": "Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Échanges et activités économiques », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Échanges et activités économiques » ?",
                "answer": "Les activités économiques structurent les territoires : agriculture, pêche, industrie, commerce et services. Les échanges relient les espaces.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      },
      {
        "title": "Lire et interpréter un document géographique",
        "domain": "Synthèse",
        "competency": "Maîtriser lire et interpréter un document géographique et l'utiliser dans des situations variées.",
        "lessons": [
          {
            "title": "Lire et interpréter un document géographique",
            "objectives": [
              "Définir et expliquer « Lire et interpréter un document géographique ».",
              "Identifier les éléments essentiels.",
              "Appliquer la notion à une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer.",
            "content": "# Lire et interpréter un document géographique\n\nInterpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer.\n\n## Exemple guidé\nUne bonne lecture de carte commence par identifier le titre, l'espace et la légende.\n\n## Démarche\n1. Lis l'énoncé et repère les informations utiles.\n2. Identifie la notion ou la règle mobilisée.\n3. Applique-la précisément aux données.\n4. Justifie la réponse avec le vocabulaire de la matière.\n5. Vérifie la cohérence du résultat.\n\n## Erreurs fréquentes\n- Confondre la définition avec un exemple particulier.\n- Répondre sans utiliser les données de l'énoncé.\n- Oublier de vérifier la cohérence de la réponse.\n\n## À retenir\nInterpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer.\n",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle proposition décrit correctement « Lire et interpréter un document géographique » ?",
                "answer": "titre, espace et légende",
                "wrongs": [
                  "les couleurs seulement",
                  "la conclusion uniquement",
                  "un chiffre isolé"
                ],
                "explanation": "Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer. La réponse correcte est « titre, espace et légende »."
              },
              {
                "kind": "mc",
                "prompt": "Dans l'exemple guidé de « Lire et interpréter un document géographique », quelle réponse obtient-on ?",
                "answer": "titre, espace et légende",
                "wrongs": [
                  "les couleurs seulement",
                  "la conclusion uniquement",
                  "un chiffre isolé"
                ],
                "explanation": "L'exemple illustre directement la notion : Une bonne lecture de carte commence par identifier le titre, l'espace et la légende."
              },
              {
                "kind": "tf",
                "prompt": "La notion « Lire et interpréter un document géographique » doit être utilisée en respectant sa définition et ses propriétés.",
                "answer": true,
                "explanation": "Vrai : Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer."
              },
              {
                "kind": "mc",
                "prompt": "Quel élément permet de vérifier une réponse sur « Lire et interpréter un document géographique » ?",
                "answer": "La règle ou propriété étudiée",
                "wrongs": [
                  "Une intuition sans justification",
                  "Une réponse choisie au hasard",
                  "Le nombre de mots de l'énoncé"
                ],
                "explanation": "La vérification doit s'appuyer sur la règle ou propriété pertinente."
              },
              {
                "kind": "mc",
                "prompt": "Quelle situation correspond directement à « Lire et interpréter un document géographique » ?",
                "answer": "Une bonne lecture de carte commence par identifier le titre, l'espace et la légende.",
                "wrongs": [
                  "les couleurs seulement",
                  "la conclusion uniquement",
                  "un chiffre isolé"
                ],
                "explanation": "Cette situation réinvestit la notion : Une bonne lecture de carte commence par identifier le titre, l'espace et la légende."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est correcte pour résoudre une situation sur « Lire et interpréter un document géographique » ?",
                "answer": "Identifier la règle puis l'appliquer aux données",
                "wrongs": [
                  "Choisir une réponse avant de lire",
                  "Ignorer les données",
                  "Mémoriser uniquement le titre"
                ],
                "explanation": "La résolution doit partir des données et de la règle pertinente."
              },
              {
                "kind": "tf",
                "prompt": "Une réponse qui semble plausible est forcément correcte pour « Lire et interpréter un document géographique ».",
                "answer": false,
                "explanation": "Faux : une réponse doit être justifiée et vérifiée."
              },
              {
                "kind": "mc",
                "prompt": "Que faire si une réponse contredit la propriété fondamentale de « Lire et interpréter un document géographique » ?",
                "answer": "La corriger et justifier la correction",
                "wrongs": [
                  "La conserver",
                  "Ignorer la propriété",
                  "Supprimer la question"
                ],
                "explanation": "Une contradiction avec une propriété étudiée signale une erreur."
              },
              {
                "kind": "mc",
                "prompt": "Un élève propose « les couleurs seulement ». Quelle réponse doit-il retenir pour « Lire et interpréter un document géographique » ?",
                "answer": "titre, espace et légende",
                "wrongs": [
                  "la conclusion uniquement",
                  "un chiffre isolé",
                  "Aucune réponse n'est nécessaire"
                ],
                "explanation": "Il faut revenir à la notion : Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle justification est la plus solide pour « Lire et interpréter un document géographique » ?",
                "answer": "Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer.",
                "wrongs": [
                  "Parce que la réponse paraît correcte",
                  "Parce qu'un camarade l'a choisie",
                  "Parce qu'elle est la plus courte"
                ],
                "explanation": "Une justification solide mobilise la définition ou la propriété étudiée."
              },
              {
                "kind": "tf",
                "prompt": "Après avoir appliqué la méthode de « Lire et interpréter un document géographique », il faut vérifier la cohérence du résultat.",
                "answer": true,
                "explanation": "Vrai : la vérification permet de détecter une erreur de calcul ou de raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel énoncé résume le mieux « Lire et interpréter un document géographique » ?",
                "answer": "Interpréter une carte, un tableau ou un graphique consiste à identifier le document, lire sa légende, relever les informations et les expliquer.",
                "wrongs": [
                  "Une opinion personnelle",
                  "Une information sans lien avec la leçon",
                  "Une règle sans possibilité d'application"
                ],
                "explanation": "Le résumé doit conserver l'idée essentielle de la notion."
              }
            ]
          }
        ]
      }
    ]
  }
];

function toQuestion(q: RawQuestion, index: number) {
  if (q.kind === "tf") {
    const answer = Boolean(q.answer);
    return {
      type: "true_false" as const,
      prompt: q.prompt,
      explanation: q.explanation,
      points: 10,
      difficulty_score: index < 4 ? 30 : index < 8 ? 55 : 75,
      options: [
        { label: "Vrai", is_correct: answer, order: 1 },
        { label: "Faux", is_correct: !answer, order: 2 }
      ]
    };
  }
  const wrongs = q.wrongs ?? [];
  return {
    type: "single_choice" as const,
    prompt: q.prompt,
    explanation: q.explanation,
    points: 10,
    difficulty_score: index < 4 ? 30 : index < 8 ? 55 : 75,
    options: [String(q.answer), ...wrongs].map((label, i) => ({
      label,
      is_correct: i === 0,
      order: i + 1
    }))
  };
}

async function getCycle() {
  const { data, error } = await supabase.from("school_cycles").select("*").eq("code", "moyen").maybeSingle();
  if (error) throw error;
  if (data) return data;
  const r = await supabase.from("school_cycles").insert({ code: "moyen", name: "Moyen", order: 2 }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function getLevel(cycleId: string) {
  const { data, error } = await supabase.from("school_levels").select("*").eq("cycle_id", cycleId).in("code", ["5e", "5eme", "5ème"]).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const r = await supabase.from("school_levels").insert({ cycle_id: cycleId, code: "5e", name: "5e", order: 2 }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function getSubject(name: string) {
  const aliases: Record<string,string[]> = {
    "Mathématiques": ["maths", "mathematiques", "mathématiques"],
    "SVT": ["svt"],
    "Français": ["francais", "français"],
    "Anglais": ["anglais", "english"],
    "Histoire": ["histoire"],
    "Géographie": ["geographie", "géographie"]
  };
  const codes = aliases[name] ?? [name.toLowerCase()];
  const { data, error } = await supabase.from("subjects").select("*").in("code", codes).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const code = codes[0];
  const r = await supabase.from("subjects").insert({ code, name, icon: name === "Mathématiques" ? "Calculator" : name === "SVT" ? "Leaf" : "BookOpen" }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function ensureLevelSubject(levelId: string, subjectId: string) {
  const { data, error } = await supabase.from("level_subjects").select("id").eq("level_id", levelId).eq("subject_id", subjectId).is("series_id", null).maybeSingle();
  if (error) throw error;
  if (!data) {
    const r = await supabase.from("level_subjects").insert({ level_id: levelId, subject_id: subjectId, series_id: null, is_optional: false });
    if (r.error) throw r.error;
  }
}

async function getCurriculum(levelId: string, subjectId: string, p: RawProgram) {
  const title = `${p.subject} 5e – Programme sénégalais`;
  const { data, error } = await supabase.from("curriculums").select("*")
    .eq("level_id", levelId).eq("subject_id", subjectId).eq("title", title).eq("version", p.version).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const r = await supabase.from("curriculums").insert({
    level_id: levelId,
    series_id: null,
    subject_id: subjectId,
    title,
    description: `Progression 5e de ${p.subject}, structurée à partir de ressources pédagogiques sénégalaises. Contenu original EdTech Sénégal.`,
    version: p.version,
    status: STATUS,
    source: "Ressources pédagogiques sénégalaises — cadrage institutionnel; rédaction originale EdTech Sénégal.",
    source_url: p.source || PROMET_URL,
    source_document: "Ressources sénégalaises consultées pour le cadrage; ne pas présenter comme reproduction d'un référentiel officiel.",
    is_demo: false,
    validated: false,
    published_at: STATUS === "published" ? new Date().toISOString() : null
  }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function getDomain(curriculumId: string, name: string, order: number) {
  const { data, error } = await supabase.from("domains").select("*").eq("curriculum_id", curriculumId).eq("name", name).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const r = await supabase.from("domains").insert({ curriculum_id: curriculumId, name, order }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function getCompetency(domainId: string, name: string, order: number) {
  const { data, error } = await supabase.from("competencies").select("*").eq("domain_id", domainId).eq("name", name).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const r = await supabase.from("competencies").insert({ domain_id: domainId, name, description: name, order }).select().single();
  if (r.error) throw r.error;
  return r.data;
}

async function getChapter(curriculumId: string, domainId: string, c: RawChapter, order: number) {
  const { data, error } = await supabase.from("chapters").select("*")
    .eq("curriculum_id", curriculumId).eq("title", c.title).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const r = await supabase.from("chapters").insert({
    curriculum_id: curriculumId,
    domain_id: domainId,
    title: c.title,
    order,
    status: STATUS,
    source: "Ressources sénégalaises; structuration originale EdTech Sénégal.",
    source_url: PROMET_URL
  }).select().single();
  if (r.error) throw r.error;
  return { data: r.data, created: true };
}

async function getLesson(chapterId: string, competencyId: string, l: RawLesson, order: number, sourceUrl: string) {
  const { data, error } = await supabase.from("lessons").select("*")
    .eq("chapter_id", chapterId).eq("title", l.title).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const r = await supabase.from("lessons").insert({
    chapter_id: chapterId,
    competency_id: competencyId,
    title: l.title,
    content_md: l.content,
    objectives: l.objectives,
    summary: l.summary,
    order,
    status: STATUS,
    source: "Contenu original EdTech Sénégal, structuré à partir de ressources pédagogiques sénégalaises.",
    source_url: sourceUrl
  }).select().single();
  if (r.error) throw r.error;
  return { data: r.data, created: true };
}

async function getExercise(lessonId: string, competencyId: string, title: string, instructions: string, difficulty: "easy"|"medium"|"hard", score: number) {
  const { data, error } = await supabase.from("exercises").select("*")
    .eq("lesson_id", lessonId).eq("title", title).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const r = await supabase.from("exercises").insert({
    lesson_id: lessonId,
    competency_id: competencyId,
    title,
    instructions,
    difficulty,
    difficulty_score: score,
    status: STATUS
  }).select().single();
  if (r.error) throw r.error;
  return { data: r.data, created: true };
}

async function addQuestion(exerciseId: string, competencyId: string, chapterId: string, q: ReturnType<typeof toQuestion>) {
  const { data, error } = await supabase.from("questions").select("id")
    .eq("exercise_id", exerciseId).eq("prompt", q.prompt).is("deleted_at", null).maybeSingle();
  if (error) throw error;

  let questionId: string;
  let created = false;

  if (data?.id) {
    questionId = data.id;
  } else {
    const r = await supabase.from("questions").insert({
      exercise_id: exerciseId,
      competency_id: competencyId,
      chapter_id: chapterId,
      type: q.type,
      prompt: q.prompt,
      explanation: q.explanation,
      points: q.points,
      difficulty_score: q.difficulty_score,
      status: STATUS
    }).select("id").single();
    if (r.error) throw r.error;
    questionId = r.data.id;
    created = true;
  }

  // Répare les questions créées lors d'un import interrompu :
  // si leurs options sont absentes/incomplètes, on les reconstruit à partir
  // de la source du Lot 5. Cela évite qu'une question existante soit simplement
  // ignorée alors qu'elle est structurellement invalide.
  const { data: existingOptions, error: optionReadError } = await supabase
    .from("question_options")
    .select("id,label,is_correct,order")
    .eq("question_id", questionId);
  if (optionReadError) throw optionReadError;

  const expectedCount = q.options.length;
  const expectedCorrect = q.options.filter(option => option.is_correct).length;
  const actualCorrect = (existingOptions ?? []).filter(option => option.is_correct).length;
  const needsRepair = (existingOptions ?? []).length !== expectedCount || actualCorrect !== expectedCorrect;

  if (needsRepair) {
    if ((existingOptions ?? []).length) {
      const { error: deleteError } = await supabase.from("question_options").delete().eq("question_id", questionId);
      if (deleteError) throw deleteError;
    }
    const options = await supabase.from("question_options").insert(
      q.options.map((option) => ({ ...option, question_id: questionId }))
    );
    if (options.error) throw options.error;
  }

  return created;
}

async function runProgram(levelId: string, p: RawProgram) {
  const subject = await getSubject(p.subject);
  await ensureLevelSubject(levelId, subject.id);
  const curriculum = await getCurriculum(levelId, subject.id, p);
  const stats = { chapters: 0, lessons: 0, exercises: 0, questions: 0, duplicates: 0 };

  for (let ci = 0; ci < p.chapters.length; ci++) {
    const c = p.chapters[ci];
    if (!c) throw new Error(`[${p.subject}] Chapitre ${ci + 1} introuvable.`);
    const domain = await getDomain(curriculum.id, c.domain, ci + 1);
    const comp = await getCompetency(domain.id, c.competency, 1);
    const chapter = await getChapter(curriculum.id, domain.id, c, ci + 1);

    for (let li = 0; li < c.lessons.length; li++) {
      const l = c.lessons[li];
      if (!l) throw new Error(`[${p.subject}] Leçon ${ci + 1}.${li + 1} introuvable.`);
      if (l.questions.length < 12) {
        throw new Error(`[${p.subject}] ${l.title}: ${l.questions.length} questions trouvées, 12 attendues.`);
      }
      const lesson = await getLesson(chapter.data.id, comp.id, l, (ci + 1) * 10 + li + 1, p.source);
      if (lesson.created) stats.lessons++;

      const groups = [
        { title: `${l.title} — notions essentielles`, difficulty: "easy" as const, score: 30, start: 0, end: 4, instructions: "Maîtrise les définitions, repères et propriétés essentielles." },
        { title: `${l.title} — application`, difficulty: "medium" as const, score: 55, start: 4, end: 8, instructions: "Applique la notion à une situation nouvelle et justifie ton choix." },
        { title: `${l.title} — raisonnement`, difficulty: "hard" as const, score: 75, start: 8, end: 12, instructions: "Analyse la situation, corrige les erreurs et justifie le raisonnement." }
      ];

      for (const g of groups) {
        const exercise = await getExercise(lesson.data.id, comp.id, g.title, g.instructions, g.difficulty, g.score);
        if (exercise.created) stats.exercises++;
        for (let qi = g.start; qi < g.end; qi++) {
          const rawQuestion = l.questions[qi];
          if (!rawQuestion) throw new Error(`[${p.subject}] ${l.title}: question ${qi + 1} manquante.`);
          const q = toQuestion(rawQuestion, qi);
          if (await addQuestion(exercise.data.id, comp.id, chapter.data.id, q)) stats.questions++;
          else stats.duplicates++;
        }
      }
    }
  }
  stats.chapters = p.chapters.length;
  return stats;
}

async function main() {
  console.log("==============================================");
  console.log("  IMPORT 5e — 6 MATIÈRES — EDTECH SÉNÉGAL");
  console.log("==============================================");
  console.log(`Statut : ${STATUS}`);
  const cycle = await getCycle();
  const level = await getLevel(cycle.id);
  console.log(`Niveau : ${level.name}`);

  const totals = { chapters:0, lessons:0, exercises:0, questions:0, duplicates:0 };
  for (const p of programs) {
    const st = await runProgram(level.id, p);
    for (const k of Object.keys(totals) as (keyof typeof totals)[]) totals[k] += st[k];
    console.log(`\n=== ${p.subject.toUpperCase()} 5e ===`);
    console.log(st);
  }

  console.log("\n==============================================");
  console.log("IMPORT 5e TERMINÉ");
  console.log("==============================================");
  console.log(totals);
  console.log("Les nouveaux contenus sont en review par défaut; utiliser EDTECH_PUBLISH_ENRICHMENT=true après validation.");
}

main().catch((error) => {
  console.error("❌ Import 5e échoué");
  console.error(error);
  process.exit(1);
});
