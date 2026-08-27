import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "❌ NEXT_PUBLIC_SUPABASE_URL est absente de .env.local"
  );
}

if (!SUPABASE_SECRET_KEY) {
  throw new Error(
    "❌ SUPABASE_SECRET_KEY est absente de .env.local"
  );
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Référentiel utilisé pour structurer ce pack.
 * Fascicule Mathématiques 6e – ADEM Dakar / Ministère de l'Éducation nationale.
 */
const SOURCE_URL =
  "https://senprof.education.sn/ADEM/Math%C3%A9matiques%206e/res/math_6e.pdf";

const CURRICULUM_TITLE = "Mathématiques 6e – Programme sénégalais";
const CURRICULUM_VERSION = "6e-maths-v1";

type QuestionSeed = {
  type: "single_choice" | "true_false";
  prompt: string;
  explanation: string;
  points: number;
  difficulty_score: number;
  options: {
    label: string;
    is_correct: boolean;
    order: number;
  }[];
};

type LessonSeed = {
  title: string;
  objectives: string[];
  summary: string;
  content: string;
  exercise: {
    title: string;
    instructions: string;
    difficulty: "easy" | "medium" | "hard" | "expert";
    difficulty_score: number;
    questions: QuestionSeed[];
  };
};

type ChapterSeed = {
  title: string;
  competency: string;
  competencyDescription: string;
  lessons: LessonSeed[];
};

/* ============================================================
   CONTENU PÉDAGOGIQUE 6e
   ============================================================ */

const chapters: ChapterSeed[] = [
  {
    title: "Nombres décimaux arithmétiques",
    competency: "Lire, écrire et représenter les nombres décimaux",
    competencyDescription:
      "Identifier la valeur de position des chiffres, distinguer partie entière et partie décimale et représenter un nombre décimal.",
    lessons: [
      {
        title: "Comprendre les nombres décimaux",
        objectives: [
          "Lire et écrire un nombre décimal.",
          "Identifier la partie entière et la partie décimale.",
          "Identifier les dixièmes, centièmes et millièmes.",
          "Décomposer un nombre décimal.",
        ],
        summary:
          "Un nombre décimal possède une partie entière et une partie décimale séparées par une virgule.",
        content: `
# Les nombres décimaux

Les nombres décimaux permettent d'exprimer des quantités qui ne sont pas nécessairement entières.

Exemple :

**27,35**

- 27 est la partie entière.
- 35 est la partie décimale.
- 3 représente 3 dixièmes.
- 5 représente 5 centièmes.

On peut écrire :

**27,35 = 27 + 3/10 + 5/100**

## Valeur de position

Dans 458,327 :

- 4 représente les centaines ;
- 5 représente les dizaines ;
- 8 représente les unités ;
- 3 représente les dixièmes ;
- 2 représente les centièmes ;
- 7 représente les millièmes.

## Décomposition

Un nombre peut être décomposé selon la valeur de ses chiffres.

Exemple :

**305,214 = 300 + 5 + 0,2 + 0,01 + 0,004**

Cette méthode permet de mieux comprendre la valeur de chaque chiffre.

## À retenir

La position d'un chiffre détermine sa valeur. Deux chiffres identiques placés à des positions différentes peuvent donc représenter des valeurs différentes.
`,
        exercise: {
          title: "Maîtriser les nombres décimaux",
          instructions:
            "Réponds aux questions en utilisant la valeur de position des chiffres.",
          difficulty: "easy",
          difficulty_score: 25,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Dans le nombre 45,728, quel chiffre représente les centièmes ?",
              explanation:
                "Après la virgule, le premier chiffre représente les dixièmes et le deuxième représente les centièmes. Ici, le chiffre des centièmes est 2.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "7", is_correct: false, order: 1 },
                { label: "2", is_correct: true, order: 2 },
                { label: "8", is_correct: false, order: 3 },
                { label: "5", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt: "Quelle est la partie entière de 307,45 ?",
              explanation:
                "La partie située avant la virgule est la partie entière. Elle vaut 307.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "45", is_correct: false, order: 1 },
                { label: "307", is_correct: true, order: 2 },
                { label: "30", is_correct: false, order: 3 },
                { label: "7,45", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt: "Quelle décomposition correspond à 12,34 ?",
              explanation:
                "12,34 contient 12 unités, 3 dixièmes et 4 centièmes.",
              points: 10,
              difficulty_score: 30,
              options: [
                {
                  label: "10 + 2 + 0,3 + 0,04",
                  is_correct: true,
                  order: 1,
                },
                {
                  label: "10 + 2 + 0,03 + 0,4",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "12 + 0,34",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "1 + 2 + 3 + 4",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Addition de deux nombres décimaux arithmétiques",
    competency: "Effectuer correctement une addition de nombres décimaux",
    competencyDescription:
      "Poser et effectuer une addition de nombres décimaux en respectant l'alignement des unités de même rang.",
    lessons: [
      {
        title: "Additionner des nombres décimaux",
        objectives: [
          "Aligner correctement les nombres.",
          "Effectuer une addition décimale.",
          "Utiliser les propriétés de l'addition.",
          "Estimer un résultat.",
        ],
        summary:
          "Pour additionner des nombres décimaux, on aligne les virgules puis on additionne chiffre par chiffre.",
        content: `
# Addition de nombres décimaux

Pour effectuer une addition de nombres décimaux, il faut aligner les virgules.

Exemple :

**23,45 + 7,8**

On écrit :

23,45  
+ 7,80  
= 31,25

Ajouter un zéro après la partie décimale ne change pas la valeur du nombre :

**7,8 = 7,80**

## Propriétés utiles

L'addition est :

- commutative : **a + b = b + a**
- associative : **(a + b) + c = a + (b + c)**

Elle possède également un élément neutre :

**a + 0 = a**

## Estimation

Avant ou après le calcul exact, une estimation permet de vérifier si le résultat est cohérent.
`,
        exercise: {
          title: "Addition et contrôle du résultat",
          instructions:
            "Effectue les calculs puis vérifie mentalement l'ordre de grandeur.",
          difficulty: "easy",
          difficulty_score: 30,
          questions: [
            {
              type: "single_choice",
              prompt: "Calcule 12,5 + 3,75.",
              explanation: "12,50 + 3,75 = 16,25.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "15,25", is_correct: false, order: 1 },
                { label: "16,25", is_correct: true, order: 2 },
                { label: "16,75", is_correct: false, order: 3 },
                { label: "17,25", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quelle propriété justifie 8,5 + 2,5 = 2,5 + 8,5 ?",
              explanation:
                "L'ordre des termes peut être inversé sans changer la somme : c'est la commutativité.",
              points: 10,
              difficulty_score: 25,
              options: [
                {
                  label: "Associativité",
                  is_correct: false,
                  order: 1,
                },
                {
                  label: "Commutativité",
                  is_correct: true,
                  order: 2,
                },
                {
                  label: "Distributivité",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "Opposition",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "single_choice",
              prompt: "Quelle égalité est vraie ?",
              explanation:
                "Ajouter zéro à un nombre ne modifie pas ce nombre.",
              points: 10,
              difficulty_score: 20,
              options: [
                {
                  label: "17,2 + 0 = 17,2",
                  is_correct: true,
                  order: 1,
                },
                {
                  label: "17,2 + 0 = 0",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "17,2 + 0 = 18,2",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "17,2 + 0 = 1,72",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Soustraction de deux nombres décimaux arithmétiques",
    competency: "Calculer et interpréter une différence",
    competencyDescription:
      "Effectuer une soustraction de nombres décimaux et résoudre des problèmes faisant intervenir une différence.",
    lessons: [
      {
        title: "Soustraire des nombres décimaux",
        objectives: [
          "Aligner les virgules.",
          "Calculer une différence.",
          "Contrôler un résultat.",
          "Résoudre un problème de comparaison.",
        ],
        summary:
          "La soustraction permet notamment de déterminer une différence, un reste ou une quantité manquante.",
        content: `
# Soustraction de nombres décimaux

Pour soustraire deux nombres décimaux, on aligne leurs virgules.

Exemple :

**18,5 - 7,25 = 11,25**

On peut écrire :

18,50  
− 7,25  
= 11,25

## Vérification

Une soustraction peut être vérifiée par une addition :

**11,25 + 7,25 = 18,50**

Cette relation permet de contrôler le résultat.

## Problèmes

La soustraction intervient notamment lorsqu'on cherche :

- un reste ;
- une différence ;
- une quantité manquante ;
- une diminution.
`,
        exercise: {
          title: "Soustraction et problèmes",
          instructions:
            "Effectue les calculs et choisis le résultat correct.",
          difficulty: "easy",
          difficulty_score: 30,
          questions: [
            {
              type: "single_choice",
              prompt: "Calcule 25,4 − 7,85.",
              explanation: "25,40 − 7,85 = 17,55.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "17,55", is_correct: true, order: 1 },
                { label: "18,55", is_correct: false, order: 2 },
                { label: "16,45", is_correct: false, order: 3 },
                { label: "19,25", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Un élève possède 5000 F et dépense 3250 F. Combien lui reste-t-il ?",
              explanation: "5000 − 3250 = 1750 F.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "1500 F", is_correct: false, order: 1 },
                { label: "1750 F", is_correct: true, order: 2 },
                { label: "1850 F", is_correct: false, order: 3 },
                { label: "2250 F", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Pour vérifier 32,5 − 8,5 = 24, on peut calculer 24 + 8,5.",
              explanation:
                "24 + 8,5 = 32,5, donc l'égalité permet bien de vérifier la soustraction.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Rangement des nombres décimaux arithmétiques",
    competency: "Comparer et ordonner des nombres décimaux",
    competencyDescription:
      "Comparer deux nombres décimaux et ranger une liste de nombres dans l'ordre croissant ou décroissant.",
    lessons: [
      {
        title: "Comparer et ranger",
        objectives: [
          "Comparer deux nombres décimaux.",
          "Utiliser les symboles <, > et =.",
          "Ranger une liste de nombres.",
          "Placer des nombres sur une droite graduée.",
        ],
        summary:
          "Pour comparer des nombres décimaux, on compare d'abord les parties entières puis les chiffres décimaux de gauche à droite.",
        content: `
# Comparer des nombres décimaux

Pour comparer deux nombres décimaux :

1. on compare les parties entières ;
2. si elles sont égales, on compare les dixièmes ;
3. puis les centièmes ;
4. puis les millièmes si nécessaire.

Exemple :

**4,37 < 4,5**

car :

**4,50 > 4,37**

Attention :

**5,4 = 5,40**

Ajouter des zéros à droite de la partie décimale ne change pas le nombre.

## Droite graduée

Sur une droite graduée, le nombre situé le plus à droite est le plus grand.
`,
        exercise: {
          title: "Comparer et ranger",
          instructions:
            "Compare les nombres puis identifie le bon classement.",
          difficulty: "easy",
          difficulty_score: 25,
          questions: [
            {
              type: "single_choice",
              prompt: "Lequel est le plus grand : 7,08 ou 7,8 ?",
              explanation: "7,8 = 7,80 et 7,80 > 7,08.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "7,08", is_correct: false, order: 1 },
                { label: "7,8", is_correct: true, order: 2 },
                { label: "Ils sont égaux", is_correct: false, order: 3 },
                {
                  label: "Impossible à comparer",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quel rangement croissant est correct pour 3,2 ; 3,02 ; 3,12 ?",
              explanation:
                "On écrit 3,2 = 3,20. Donc 3,02 < 3,12 < 3,20.",
              points: 10,
              difficulty_score: 30,
              options: [
                {
                  label: "3,02 < 3,12 < 3,2",
                  is_correct: true,
                  order: 1,
                },
                {
                  label: "3,2 < 3,12 < 3,02",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "3,12 < 3,02 < 3,2",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "3,02 < 3,2 < 3,12",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "true_false",
              prompt: "5,40 et 5,4 représentent le même nombre.",
              explanation:
                "Les zéros placés à droite de la partie décimale ne changent pas la valeur du nombre.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Multiplication de nombres décimaux arithmétiques",
    competency: "Multiplier des nombres entiers et décimaux",
    competencyDescription:
      "Effectuer une multiplication et déterminer correctement la position de la virgule dans le produit.",
    lessons: [
      {
        title: "Multiplier des nombres décimaux",
        objectives: [
          "Effectuer une multiplication.",
          "Multiplier un nombre décimal par un entier.",
          "Multiplier deux nombres décimaux simples.",
          "Contrôler l'ordre de grandeur du produit.",
        ],
        summary:
          "On peut effectuer la multiplication sans tenir compte temporairement des virgules puis replacer la virgule selon le nombre total de chiffres décimaux.",
        content: `
# Multiplication des nombres décimaux

Exemple :

**2,5 × 4 = 10**

Pour multiplier par un entier, on peut utiliser une multiplication posée.

Autre exemple :

**1,2 × 0,3 = 0,36**

Il y a au total deux chiffres après les virgules dans les facteurs, donc le résultat possède deux chiffres après la virgule.

## Contrôle

L'ordre de grandeur permet de détecter une erreur.

Par exemple :

**2,5 × 4** doit être proche de **10**.
`,
        exercise: {
          title: "Calculs multiplicatifs",
          instructions:
            "Calcule les produits en faisant attention à la position de la virgule.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt: "Calcule 3,5 × 4.",
              explanation: "3,5 × 4 = 14.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "7", is_correct: false, order: 1 },
                { label: "14", is_correct: true, order: 2 },
                { label: "14,5", is_correct: false, order: 3 },
                { label: "1,4", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt: "Calcule 1,2 × 0,5.",
              explanation: "1,2 × 0,5 = 0,6.",
              points: 10,
              difficulty_score: 35,
              options: [
                { label: "0,06", is_correct: false, order: 1 },
                { label: "0,6", is_correct: true, order: 2 },
                { label: "6", is_correct: false, order: 3 },
                { label: "60", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quel produit est cohérent avec un calcul de 2,8 × 10 ?",
              explanation:
                "Multiplier par 10 décale la virgule d'un rang vers la droite : 2,8 devient 28.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "0,28", is_correct: false, order: 1 },
                { label: "2,08", is_correct: false, order: 2 },
                { label: "28", is_correct: true, order: 3 },
                { label: "280", is_correct: false, order: 4 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Division de nombres décimaux arithmétiques",
    competency: "Effectuer une division et interpréter un quotient",
    competencyDescription:
      "Calculer un quotient simple et résoudre des problèmes de partage ou de mesure.",
    lessons: [
      {
        title: "Comprendre la division",
        objectives: [
          "Identifier dividende, diviseur et quotient.",
          "Effectuer une division simple.",
          "Interpréter un quotient.",
          "Résoudre un problème de partage.",
        ],
        summary:
          "La division permet notamment de partager une quantité en parts égales ou de déterminer combien de fois une quantité est contenue dans une autre.",
        content: `
# Division

Dans :

**24 ÷ 6 = 4**

- 24 est le dividende ;
- 6 est le diviseur ;
- 4 est le quotient.

La division est liée à la multiplication :

**6 × 4 = 24**

## Exemple concret

Si 24 cahiers sont répartis équitablement entre 6 élèves :

**24 ÷ 6 = 4**

Chaque élève reçoit 4 cahiers.

## Attention

Le diviseur ne peut pas être zéro.
`,
        exercise: {
          title: "Division et partage",
          instructions:
            "Résous les calculs et les situations de partage.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt: "Calcule 36 ÷ 6.",
              explanation:
                "6 × 6 = 36, donc 36 ÷ 6 = 6.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "5", is_correct: false, order: 1 },
                { label: "6", is_correct: true, order: 2 },
                { label: "7", is_correct: false, order: 3 },
                { label: "8", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "48 mangues sont réparties également entre 8 personnes. Combien chaque personne reçoit-elle ?",
              explanation:
                "48 ÷ 8 = 6 mangues par personne.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "5", is_correct: false, order: 1 },
                { label: "6", is_correct: true, order: 2 },
                { label: "7", is_correct: false, order: 3 },
                { label: "8", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt: "On peut diviser un nombre par zéro.",
              explanation: "La division par zéro n'est pas définie.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "Vrai", is_correct: false, order: 1 },
                { label: "Faux", is_correct: true, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Organisation d'un calcul",
    competency: "Respecter les priorités de calcul",
    competencyDescription:
      "Organiser un calcul comportant plusieurs opérations et utiliser correctement les parenthèses.",
    lessons: [
      {
        title: "Priorités opératoires",
        objectives: [
          "Identifier les opérations prioritaires.",
          "Utiliser les parenthèses.",
          "Calculer une expression dans le bon ordre.",
          "Éviter les erreurs de calcul.",
        ],
        summary:
          "Dans une expression, l'ordre des opérations doit être respecté pour obtenir le résultat correct.",
        content: `
# Organisation d'un calcul

Lorsque plusieurs opérations apparaissent dans une expression, on respecte un ordre.

Les parenthèses indiquent une partie à calculer en priorité.

Exemple :

**8 + (3 × 4)**

On calcule d'abord :

**3 × 4 = 12**

puis :

**8 + 12 = 20**

Les parenthèses permettent donc de rendre l'organisation du calcul explicite.

## Méthode

1. repérer les parenthèses ;
2. calculer ce qui est prioritaire ;
3. poursuivre le calcul ;
4. vérifier la cohérence du résultat.
`,
        exercise: {
          title: "Organiser une expression",
          instructions:
            "Respecte l'ordre des opérations.",
          difficulty: "medium",
          difficulty_score: 45,
          questions: [
            {
              type: "single_choice",
              prompt: "Calcule 8 + (3 × 4).",
              explanation:
                "On calcule d'abord 3 × 4 = 12, puis 8 + 12 = 20.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "20", is_correct: true, order: 1 },
                { label: "44", is_correct: false, order: 2 },
                { label: "32", is_correct: false, order: 3 },
                { label: "15", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt: "Calcule (10 + 5) × 2.",
              explanation:
                "La parenthèse donne 10 + 5 = 15, puis 15 × 2 = 30.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "20", is_correct: false, order: 1 },
                { label: "25", is_correct: false, order: 2 },
                { label: "30", is_correct: true, order: 3 },
                { label: "35", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Dans 7 + (2 × 5), il faut calculer 2 × 5 avant d'ajouter 7.",
              explanation:
                "La multiplication placée dans les parenthèses est effectuée avant l'addition.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Proportionnalité",
    competency: "Reconnaître et utiliser une situation de proportionnalité",
    competencyDescription:
      "Identifier une relation proportionnelle et utiliser un coefficient de proportionnalité dans des situations concrètes.",
    lessons: [
      {
        title: "Comprendre la proportionnalité",
        objectives: [
          "Reconnaître une situation proportionnelle.",
          "Trouver un coefficient.",
          "Compléter un tableau.",
          "Résoudre un problème concret.",
        ],
        summary:
          "Dans une situation de proportionnalité, on passe d'une grandeur à l'autre en multipliant toujours par le même nombre.",
        content: `
# Proportionnalité

Une situation est proportionnelle lorsque les rapports entre les grandeurs restent constants.

Exemple :

Si un cahier coûte 500 F :

- 1 cahier → 500 F
- 2 cahiers → 1000 F
- 3 cahiers → 1500 F

Le prix est obtenu en multipliant le nombre de cahiers par 500.

Le nombre 500 est le coefficient de proportionnalité.

## Méthode

Pour résoudre un problème :

1. identifier les deux grandeurs ;
2. chercher le coefficient ;
3. multiplier ou diviser selon la situation ;
4. vérifier que les unités sont cohérentes.
`,
        exercise: {
          title: "Situations proportionnelles",
          instructions:
            "Utilise le coefficient de proportionnalité.",
          difficulty: "medium",
          difficulty_score: 45,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Si 1 cahier coûte 500 F, combien coûtent 4 cahiers ?",
              explanation: "4 × 500 = 2000 F.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "1000 F", is_correct: false, order: 1 },
                { label: "1500 F", is_correct: false, order: 2 },
                { label: "2000 F", is_correct: true, order: 3 },
                { label: "2500 F", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Une voiture parcourt 60 km en 1 heure à vitesse constante. Quelle distance parcourt-elle en 3 heures ?",
              explanation: "60 × 3 = 180 km.",
              points: 10,
              difficulty_score: 40,
              options: [
                { label: "120 km", is_correct: false, order: 1 },
                { label: "180 km", is_correct: true, order: 2 },
                { label: "200 km", is_correct: false, order: 3 },
                { label: "240 km", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Dans une situation de proportionnalité, le coefficient de proportionnalité reste constant.",
              explanation:
                "C'est précisément la caractéristique d'une relation de proportionnalité.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Nombres décimaux relatifs",
    competency: "Comprendre les nombres relatifs",
    competencyDescription:
      "Identifier les nombres positifs et négatifs et les représenter sur une droite graduée.",
    lessons: [
      {
        title: "Nombres positifs et négatifs",
        objectives: [
          "Reconnaître le signe d'un nombre.",
          "Repérer un nombre relatif.",
          "Comparer des nombres relatifs simples.",
          "Interpréter une situation avec des températures.",
        ],
        summary:
          "Les nombres relatifs permettent notamment de représenter des positions au-dessus et au-dessous d'une référence.",
        content: `
# Nombres relatifs

Un nombre relatif peut être :

- positif : **+5**
- négatif : **−5**
- nul : **0**

Sur une droite graduée :

- les nombres positifs sont à droite de zéro ;
- les nombres négatifs sont à gauche de zéro.

Exemple :

**−3 < 2**

car −3 est situé à gauche de 2.

## Exemple concret

Une température de −4 °C est inférieure à une température de +2 °C.

Les nombres relatifs sont donc utiles pour représenter des températures, des altitudes ou des positions.
`,
        exercise: {
          title: "Repérer les nombres relatifs",
          instructions:
            "Utilise la position des nombres par rapport à zéro.",
          difficulty: "medium",
          difficulty_score: 45,
          questions: [
            {
              type: "single_choice",
              prompt: "Lequel est le plus grand : −2 ou +3 ?",
              explanation:
                "Sur une droite graduée, +3 est à droite de −2. Donc +3 est plus grand.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "−2", is_correct: false, order: 1 },
                { label: "+3", is_correct: true, order: 2 },
                { label: "Ils sont égaux", is_correct: false, order: 3 },
                { label: "0", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quelle température est la plus froide : −5 °C ou −2 °C ?",
              explanation:
                "−5 est inférieur à −2, donc −5 °C correspond à la température la plus froide.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "−5 °C", is_correct: true, order: 1 },
                { label: "−2 °C", is_correct: false, order: 2 },
                { label: "Les deux", is_correct: false, order: 3 },
                { label: "0 °C", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt: "−7 est inférieur à −3.",
              explanation:
                "−7 est situé plus à gauche de −3 sur la droite graduée.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Repérage sur la droite et le plan",
    competency: "Repérer un point dans une représentation",
    competencyDescription:
      "Lire et utiliser des coordonnées sur une droite graduée et dans un repère du plan.",
    lessons: [
      {
        title: "Coordonnées et repères",
        objectives: [
          "Lire une abscisse.",
          "Repérer un point.",
          "Utiliser deux coordonnées.",
          "Lire un déplacement sur un plan.",
        ],
        summary:
          "Un repère permet de localiser précisément un point à partir de coordonnées.",
        content: `
# Repérage

Sur une droite graduée, un point est repéré par une abscisse.

Par exemple :

**A(4)** signifie que l'abscisse de A est 4.

Dans un plan, un point peut être repéré par deux coordonnées.

On note généralement :

**A(x ; y)**

La première coordonnée correspond à l'axe horizontal et la deuxième à l'axe vertical.

## Exemple

Pour A(3 ; 2) :

- on se déplace de 3 unités horizontalement ;
- puis de 2 unités verticalement.
`,
        exercise: {
          title: "Lire des coordonnées",
          instructions:
            "Interprète correctement les coordonnées.",
          difficulty: "medium",
          difficulty_score: 45,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Quelle est l'abscisse du point A(5) sur une droite graduée ?",
              explanation:
                "Le nombre placé entre parenthèses est l'abscisse du point.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "0", is_correct: false, order: 1 },
                { label: "5", is_correct: true, order: 2 },
                { label: "−5", is_correct: false, order: 3 },
                { label: "10", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Dans le point B(4 ; 7), quelle est la deuxième coordonnée ?",
              explanation:
                "Dans (x ; y), la deuxième coordonnée est y. Ici y = 7.",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "4", is_correct: false, order: 1 },
                { label: "7", is_correct: true, order: 2 },
                { label: "11", is_correct: false, order: 3 },
                { label: "3", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Dans un repère, les deux coordonnées d'un point permettent de le localiser.",
              explanation:
                "Les deux coordonnées déterminent la position du point dans le plan.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Introduction à la géométrie",
    competency: "Utiliser le vocabulaire et les instruments de géométrie",
    competencyDescription:
      "Identifier les objets géométriques fondamentaux et réaliser des constructions simples.",
    lessons: [
      {
        title: "Points, droites, segments et demi-droites",
        objectives: [
          "Reconnaître un point.",
          "Reconnaître une droite.",
          "Reconnaître un segment.",
          "Utiliser une règle et une équerre.",
        ],
        summary:
          "La géométrie utilise des objets fondamentaux comme les points, droites, segments et demi-droites.",
        content: `
# Introduction à la géométrie

Un **point** est généralement représenté par une petite marque et désigné par une lettre majuscule.

Une **droite** se prolonge dans les deux directions.

Un **segment** possède deux extrémités.

Une **demi-droite** possède une origine et se prolonge dans une seule direction.

## Instruments

La règle permet notamment :

- de tracer une droite ;
- de mesurer une longueur.

L'équerre permet notamment :

- de vérifier un angle droit ;
- de construire des droites perpendiculaires.
`,
        exercise: {
          title: "Vocabulaire géométrique",
          instructions:
            "Choisis le terme correspondant à chaque situation.",
          difficulty: "easy",
          difficulty_score: 25,
          questions: [
            {
              type: "single_choice",
              prompt: "Quel objet possède deux extrémités ?",
              explanation:
                "Un segment possède exactement deux extrémités.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Une droite", is_correct: false, order: 1 },
                { label: "Un segment", is_correct: true, order: 2 },
                { label: "Une demi-droite", is_correct: false, order: 3 },
                { label: "Un plan", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quel instrument permet de vérifier un angle droit ?",
              explanation:
                "L'équerre possède un angle droit et permet de vérifier ou construire des perpendicularités.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Une équerre", is_correct: true, order: 1 },
                { label: "Une gomme", is_correct: false, order: 2 },
                { label: "Un compas seul", is_correct: false, order: 3 },
                { label: "Une calculatrice", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt: "Une droite possède deux extrémités.",
              explanation:
                "Une droite se prolonge dans les deux directions et ne possède pas d'extrémités.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: false, order: 1 },
                { label: "Faux", is_correct: true, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Le cercle",
    competency: "Construire et décrire un cercle",
    competencyDescription:
      "Identifier le centre et le rayon d'un cercle et utiliser le compas pour effectuer des constructions.",
    lessons: [
      {
        title: "Centre, rayon et diamètre",
        objectives: [
          "Identifier le centre d'un cercle.",
          "Comprendre le rayon.",
          "Comprendre le diamètre.",
          "Utiliser un compas.",
        ],
        summary:
          "Tous les points d'un cercle sont à la même distance de son centre.",
        content: `
# Le cercle

Un cercle est constitué de points situés à une même distance d'un point fixe appelé **centre**.

Cette distance est le **rayon**.

Le **diamètre** est un segment qui passe par le centre et dont les extrémités appartiennent au cercle.

On a :

**diamètre = 2 × rayon**

et donc :

**rayon = diamètre ÷ 2**

Le compas permet de tracer un cercle de rayon donné.
`,
        exercise: {
          title: "Cercle et mesures",
          instructions:
            "Utilise les relations entre rayon et diamètre.",
          difficulty: "easy",
          difficulty_score: 30,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Un cercle a un rayon de 4 cm. Quel est son diamètre ?",
              explanation:
                "Le diamètre vaut deux fois le rayon : 2 × 4 = 8 cm.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "2 cm", is_correct: false, order: 1 },
                { label: "4 cm", is_correct: false, order: 2 },
                { label: "8 cm", is_correct: true, order: 3 },
                { label: "16 cm", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quelle distance est la même pour tous les points d'un cercle par rapport à son centre ?",
              explanation:
                "Cette distance constante est le rayon du cercle.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Le rayon", is_correct: true, order: 1 },
                { label: "Le périmètre", is_correct: false, order: 2 },
                { label: "L'aire", is_correct: false, order: 3 },
                { label: "La hauteur", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Le diamètre d'un cercle est égal à deux fois son rayon.",
              explanation:
                "Par définition, le diamètre traverse le centre et correspond à deux rayons alignés.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Droites perpendiculaires et droites parallèles",
    competency: "Reconnaître et construire des parallèles et des perpendiculaires",
    competencyDescription:
      "Identifier les relations de parallélisme et de perpendicularité et utiliser les instruments adaptés.",
    lessons: [
      {
        title: "Parallélisme et perpendicularité",
        objectives: [
          "Reconnaître deux droites parallèles.",
          "Reconnaître deux droites perpendiculaires.",
          "Utiliser une équerre.",
          "Construire une parallèle.",
        ],
        summary:
          "Deux droites parallèles ne se coupent pas tandis que deux droites perpendiculaires se coupent en formant un angle droit.",
        content: `
# Droites parallèles et perpendiculaires

Deux droites sont **parallèles** lorsqu'elles ne se coupent pas.

Deux droites sont **perpendiculaires** lorsqu'elles se coupent en formant un angle droit.

L'équerre permet de vérifier un angle droit.

Pour construire une parallèle, on peut utiliser une règle et une équerre en maintenant l'orientation voulue.
`,
        exercise: {
          title: "Identifier les relations entre droites",
          instructions:
            "Distingue parallélisme et perpendicularité.",
          difficulty: "easy",
          difficulty_score: 30,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Deux droites qui se coupent en formant un angle droit sont :",
              explanation:
                "Des droites perpendiculaires forment quatre angles droits lorsqu'elles se coupent.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Parallèles", is_correct: false, order: 1 },
                {
                  label: "Perpendiculaires",
                  is_correct: true,
                  order: 2,
                },
                { label: "Confondues", is_correct: false, order: 3 },
                { label: "Courbes", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quel instrument est particulièrement adapté pour vérifier un angle droit ?",
              explanation:
                "L'équerre possède un angle droit de référence.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "L'équerre", is_correct: true, order: 1 },
                {
                  label: "Le compas uniquement",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "La règle seule",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "Le rapporteur seul",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Deux droites parallèles se coupent en un point.",
              explanation:
                "Deux droites parallèles restent à distance constante et ne se coupent pas dans le plan.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: false, order: 1 },
                { label: "Faux", is_correct: true, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Symétrie orthogonale par rapport à une droite donnée",
    competency: "Construire et reconnaître une symétrie axiale",
    competencyDescription:
      "Construire l'image d'un point ou d'une figure par rapport à une droite donnée.",
    lessons: [
      {
        title: "Découvrir la symétrie axiale",
        objectives: [
          "Identifier un axe de symétrie.",
          "Construire le symétrique d'un point.",
          "Comprendre l'égalité des distances.",
          "Reconnaître une figure symétrique.",
        ],
        summary:
          "Dans une symétrie axiale, l'axe est la médiatrice du segment reliant un point à son image.",
        content: `
# Symétrie orthogonale

Une symétrie axiale transforme une figure en une figure miroir par rapport à une droite appelée **axe de symétrie**.

Pour construire le symétrique d'un point A :

1. tracer la perpendiculaire à l'axe passant par A ;
2. mesurer la distance entre A et l'axe ;
3. reporter la même distance de l'autre côté ;
4. obtenir A'.

Le point A et son image A' sont à la même distance de l'axe.
`,
        exercise: {
          title: "Symétrie axiale",
          instructions:
            "Identifie les propriétés fondamentales de la symétrie.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Dans une symétrie axiale, comment sont situés A et son image A' par rapport à l'axe ?",
              explanation:
                "L'axe de symétrie est la médiatrice du segment AA'.",
              points: 10,
              difficulty_score: 30,
              options: [
                {
                  label: "Ils sont à égale distance de l'axe",
                  is_correct: true,
                  order: 1,
                },
                {
                  label: "A est toujours sur l'axe",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "A' est toujours plus proche",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "Ils sont du même côté uniquement",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Pour construire le symétrique d'un point par rapport à une droite, quelle droite doit-on tracer par le point ?",
              explanation:
                "On trace la perpendiculaire à l'axe passant par le point.",
              points: 10,
              difficulty_score: 35,
              options: [
                {
                  label: "Une parallèle à l'axe",
                  is_correct: false,
                  order: 1,
                },
                {
                  label: "Une perpendiculaire à l'axe",
                  is_correct: true,
                  order: 2,
                },
                {
                  label: "Un cercle quelconque",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "Une droite horizontale uniquement",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "true_false",
              prompt:
                "L'axe de symétrie est la médiatrice du segment reliant un point à son image.",
              explanation:
                "C'est une propriété fondamentale de la symétrie axiale.",
              points: 10,
              difficulty_score: 30,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Angles",
    competency: "Identifier, mesurer et comparer des angles",
    competencyDescription:
      "Reconnaître les principaux types d'angles et utiliser un rapporteur pour les mesurer.",
    lessons: [
      {
        title: "Mesurer les angles",
        objectives: [
          "Identifier un angle.",
          "Utiliser un rapporteur.",
          "Reconnaître un angle droit.",
          "Comparer des mesures d'angles.",
        ],
        summary:
          "Un angle mesure l'ouverture entre deux demi-droites de même origine.",
        content: `
# Les angles

Un angle est formé par deux demi-droites ayant une même origine.

On mesure généralement les angles en degrés.

Quelques repères :

- angle nul : 0° ;
- angle droit : 90° ;
- angle plat : 180°.

Le rapporteur permet de mesurer un angle.

## Méthode

1. placer le centre du rapporteur sur le sommet ;
2. aligner un côté de l'angle avec la ligne de référence ;
3. lire la graduation correspondant à l'autre côté.
`,
        exercise: {
          title: "Mesurer et reconnaître les angles",
          instructions:
            "Utilise les références 0°, 90° et 180°.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt: "Quelle est la mesure d'un angle droit ?",
              explanation:
                "Par définition, un angle droit mesure 90°.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "45°", is_correct: false, order: 1 },
                { label: "90°", is_correct: true, order: 2 },
                { label: "120°", is_correct: false, order: 3 },
                { label: "180°", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quel instrument permet de mesurer directement un angle en degrés ?",
              explanation:
                "Le rapporteur est gradué en degrés et permet de mesurer les angles.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Le rapporteur", is_correct: true, order: 1 },
                { label: "La règle", is_correct: false, order: 2 },
                {
                  label: "Le compas uniquement",
                  is_correct: false,
                  order: 3,
                },
                { label: "La gomme", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt: "Un angle plat mesure 180°.",
              explanation:
                "Un angle plat correspond à une ligne droite et mesure 180°.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Polygones",
    competency: "Reconnaître et décrire les polygones",
    competencyDescription:
      "Identifier les côtés, sommets et propriétés de polygones usuels.",
    lessons: [
      {
        title: "Triangles, quadrilatères et autres polygones",
        objectives: [
          "Identifier un polygone.",
          "Compter les côtés.",
          "Reconnaître triangle et quadrilatère.",
          "Décrire une figure.",
        ],
        summary:
          "Un polygone est une figure plane fermée composée de segments.",
        content: `
# Les polygones

Un polygone est une figure plane fermée composée uniquement de segments.

Exemples :

- triangle : 3 côtés ;
- quadrilatère : 4 côtés ;
- pentagone : 5 côtés ;
- hexagone : 6 côtés.

Un polygone possède autant de sommets que de côtés.

## Triangle

Un triangle possède :

- 3 côtés ;
- 3 sommets ;
- 3 angles.

## Quadrilatère

Un quadrilatère possède :

- 4 côtés ;
- 4 sommets ;
- 4 angles.
`,
        exercise: {
          title: "Identifier les polygones",
          instructions:
            "Utilise le nombre de côtés pour identifier chaque figure.",
          difficulty: "easy",
          difficulty_score: 25,
          questions: [
            {
              type: "single_choice",
              prompt: "Combien de côtés possède un triangle ?",
              explanation:
                "Le préfixe tri- indique trois côtés.",
              points: 10,
              difficulty_score: 15,
              options: [
                { label: "2", is_correct: false, order: 1 },
                { label: "3", is_correct: true, order: 2 },
                { label: "4", is_correct: false, order: 3 },
                { label: "5", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Comment appelle-t-on un polygone à 5 côtés ?",
              explanation:
                "Un polygone à cinq côtés est un pentagone.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Triangle", is_correct: false, order: 1 },
                {
                  label: "Quadrilatère",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "Pentagone",
                  is_correct: true,
                  order: 3,
                },
                {
                  label: "Hexagone",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "true_false",
              prompt: "Un quadrilatère possède quatre côtés.",
              explanation:
                "Un quadrilatère est un polygone à quatre côtés.",
              points: 10,
              difficulty_score: 15,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Aires",
    competency: "Calculer et comparer des aires",
    competencyDescription:
      "Calculer l'aire de figures usuelles et utiliser les unités d'aire.",
    lessons: [
      {
        title: "Aire du carré et du rectangle",
        objectives: [
          "Comprendre la notion d'aire.",
          "Calculer l'aire d'un rectangle.",
          "Calculer l'aire d'un carré.",
          "Utiliser les unités d'aire.",
        ],
        summary:
          "L'aire mesure la surface occupée par une figure.",
        content: `
# Les aires

L'aire mesure la surface d'une figure.

## Rectangle

Pour un rectangle :

**Aire = longueur × largeur**

Exemple :

Un rectangle de longueur 8 cm et de largeur 3 cm possède une aire :

**8 × 3 = 24 cm²**

## Carré

Pour un carré de côté c :

**Aire = c × c**

Exemple :

Un carré de côté 5 cm a une aire :

**5 × 5 = 25 cm²**

L'unité dépend des longueurs utilisées.
`,
        exercise: {
          title: "Calculer des aires",
          instructions:
            "Applique les formules d'aire adaptées.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Quelle est l'aire d'un rectangle de 8 cm sur 3 cm ?",
              explanation:
                "Aire = longueur × largeur = 8 × 3 = 24 cm².",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "11 cm²", is_correct: false, order: 1 },
                { label: "24 cm²", is_correct: true, order: 2 },
                { label: "22 cm²", is_correct: false, order: 3 },
                { label: "48 cm²", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Quelle est l'aire d'un carré de côté 6 cm ?",
              explanation: "6 × 6 = 36 cm².",
              points: 10,
              difficulty_score: 25,
              options: [
                { label: "12 cm²", is_correct: false, order: 1 },
                { label: "24 cm²", is_correct: false, order: 2 },
                { label: "36 cm²", is_correct: true, order: 3 },
                { label: "42 cm²", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt:
                "L'aire d'un rectangle se calcule en multipliant sa longueur par sa largeur.",
              explanation:
                "C'est la formule de l'aire du rectangle.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Géométrie dans l'espace",
    competency: "Reconnaître et décrire les solides",
    competencyDescription:
      "Identifier les principaux solides et décrire leurs faces, arêtes et sommets.",
    lessons: [
      {
        title: "Découvrir les solides",
        objectives: [
          "Reconnaître un cube.",
          "Reconnaître un pavé droit.",
          "Identifier faces, arêtes et sommets.",
          "Associer un objet réel à un solide.",
        ],
        summary:
          "La géométrie dans l'espace étudie des objets à trois dimensions.",
        content: `
# Géométrie dans l'espace

Contrairement aux figures planes, les solides possèdent trois dimensions.

Un cube possède :

- 6 faces carrées ;
- 12 arêtes ;
- 8 sommets.

Un pavé droit possède également :

- 6 faces ;
- 12 arêtes ;
- 8 sommets.

Les solides permettent de modéliser de nombreux objets du quotidien : boîtes, briques, dés, cartons, etc.
`,
        exercise: {
          title: "Reconnaître les solides",
          instructions:
            "Identifie les propriétés fondamentales des solides.",
          difficulty: "easy",
          difficulty_score: 30,
          questions: [
            {
              type: "single_choice",
              prompt: "Combien de faces possède un cube ?",
              explanation:
                "Un cube possède six faces carrées.",
              points: 10,
              difficulty_score: 15,
              options: [
                { label: "4", is_correct: false, order: 1 },
                { label: "6", is_correct: true, order: 2 },
                { label: "8", is_correct: false, order: 3 },
                { label: "12", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt: "Combien d'arêtes possède un cube ?",
              explanation:
                "Un cube possède 12 arêtes.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "6", is_correct: false, order: 1 },
                { label: "8", is_correct: false, order: 2 },
                { label: "12", is_correct: true, order: 3 },
                { label: "16", is_correct: false, order: 4 },
              ],
            },
            {
              type: "true_false",
              prompt: "Un cube possède 8 sommets.",
              explanation:
                "Les huit coins du cube sont ses huit sommets.",
              points: 10,
              difficulty_score: 20,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },

  {
    title: "Repérage sur la sphère",
    competency: "Comprendre le repérage sur une surface sphérique",
    competencyDescription:
      "Identifier les éléments fondamentaux utilisés pour localiser un point sur une sphère.",
    lessons: [
      {
        title: "Se repérer sur une sphère",
        objectives: [
          "Reconnaître une sphère.",
          "Comprendre l'idée de lignes de repérage.",
          "Relier le repérage à des situations réelles.",
          "Utiliser un vocabulaire spatial précis.",
        ],
        summary:
          "Le repérage sur une sphère permet de localiser des positions sur une surface courbe, notamment sur le globe terrestre.",
        content: `
# Repérage sur la sphère

La Terre peut être modélisée approximativement par une sphère.

Pour localiser une position à sa surface, on utilise notamment des lignes imaginaires permettant de se repérer.

Le globe terrestre permet de visualiser ces lignes et de comprendre que le repérage ne se limite pas à un plan.

Cette notion prépare notamment au repérage géographique et à l'étude des coordonnées terrestres.
`,
        exercise: {
          title: "Repérage spatial",
          instructions:
            "Choisis les affirmations qui correspondent au repérage sur une sphère.",
          difficulty: "medium",
          difficulty_score: 40,
          questions: [
            {
              type: "single_choice",
              prompt:
                "Quel objet permet de représenter approximativement la Terre sous forme sphérique ?",
              explanation:
                "Le globe terrestre est une représentation sphérique de la Terre.",
              points: 10,
              difficulty_score: 15,
              options: [
                { label: "Un globe", is_correct: true, order: 1 },
                { label: "Une règle", is_correct: false, order: 2 },
                { label: "Un rapporteur", is_correct: false, order: 3 },
                { label: "Une équerre", is_correct: false, order: 4 },
              ],
            },
            {
              type: "single_choice",
              prompt:
                "Pourquoi le repérage sur une sphère est-il différent du repérage sur une feuille ?",
              explanation:
                "Une sphère est une surface courbe alors qu'une feuille représente une surface plane.",
              points: 10,
              difficulty_score: 35,
              options: [
                {
                  label: "Parce que la sphère est une surface courbe",
                  is_correct: true,
                  order: 1,
                },
                {
                  label: "Parce qu'une sphère n'a aucun point",
                  is_correct: false,
                  order: 2,
                },
                {
                  label: "Parce qu'une feuille est toujours ronde",
                  is_correct: false,
                  order: 3,
                },
                {
                  label: "Parce qu'on ne peut jamais mesurer",
                  is_correct: false,
                  order: 4,
                },
              ],
            },
            {
              type: "true_false",
              prompt:
                "Le globe terrestre peut servir à étudier le repérage sur une sphère.",
              explanation:
                "Le globe est une représentation sphérique adaptée à l'étude du repérage terrestre.",
              points: 10,
              difficulty_score: 15,
              options: [
                { label: "Vrai", is_correct: true, order: 1 },
                { label: "Faux", is_correct: false, order: 2 },
              ],
            },
          ],
        },
      },
    ],
  },
];

/* ============================================================
   OUTILS SUPABASE
   ============================================================ */

async function getOrCreateCycle(
  client: SupabaseClient,
  code: string,
  name: string,
  order: number
) {
  const { data, error } = await client
    .from("school_cycles")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("school_cycles")
    .insert({
      code,
      name,
      order,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateLevel(
  client: SupabaseClient,
  cycleId: string
) {
  const possibleCodes = ["6e", "6eme", "6ème", "SIXIEME"];
  const possibleNames = ["6e", "6ème", "Sixième", "Sixieme"];

  const { data: byCode, error: codeError } = await client
    .from("school_levels")
    .select("*")
    .eq("cycle_id", cycleId)
    .in("code", possibleCodes)
    .limit(1)
    .maybeSingle();

  if (codeError) throw codeError;
  if (byCode) return byCode;

  const { data: byName, error: nameError } = await client
    .from("school_levels")
    .select("*")
    .eq("cycle_id", cycleId)
    .in("name", possibleNames)
    .limit(1)
    .maybeSingle();

  if (nameError) throw nameError;
  if (byName) return byName;

  const { data: created, error: insertError } = await client
    .from("school_levels")
    .insert({
      cycle_id: cycleId,
      code: "6e",
      name: "6e",
      order: 1,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateSubject(
  client: SupabaseClient
) {
  const possibleCodes = [
    "maths",
    "mathematiques",
    "mathematics",
    "MATH",
  ];

  const { data: byCode, error: codeError } = await client
    .from("subjects")
    .select("*")
    .in("code", possibleCodes)
    .limit(1)
    .maybeSingle();

  if (codeError) throw codeError;
  if (byCode) return byCode;

  const { data: byName, error: nameError } = await client
    .from("subjects")
    .select("*")
    .ilike("name", "Mathématiques")
    .limit(1)
    .maybeSingle();

  if (nameError) throw nameError;
  if (byName) return byName;

  const { data: created, error: insertError } = await client
    .from("subjects")
    .insert({
      code: "maths",
      name: "Mathématiques",
      icon: "Calculator",
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function ensureLevelSubject(
  client: SupabaseClient,
  levelId: string,
  subjectId: string
) {
  const { data, error } = await client
    .from("level_subjects")
    .select("id")
    .eq("level_id", levelId)
    .eq("subject_id", subjectId)
    .is("series_id", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { error: insertError } = await client
      .from("level_subjects")
      .insert({
        level_id: levelId,
        subject_id: subjectId,
        series_id: null,
        is_optional: false,
      });

    if (insertError) throw insertError;
  }
}

async function getOrCreateCurriculum(
  client: SupabaseClient,
  levelId: string,
  subjectId: string
) {
  const { data, error } = await client
    .from("curriculums")
    .select("*")
    .eq("level_id", levelId)
    .eq("subject_id", subjectId)
    .eq("title", CURRICULUM_TITLE)
    .eq("version", CURRICULUM_VERSION)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("curriculums")
    .insert({
      level_id: levelId,
      series_id: null,
      subject_id: subjectId,
      title: CURRICULUM_TITLE,
      description:
        "Pack pédagogique de Mathématiques 6e structuré autour du référentiel sénégalais du cycle moyen.",
      version: CURRICULUM_VERSION,
      status: "published",
      source:
        "Fascicule Mathématiques 6e – ADEM Dakar / Ministère de l'Éducation nationale",
      source_url: SOURCE_URL,
      source_document: "Fascicule Mathématiques 6e ADEM Dakar",
      is_demo: false,
      validated: false,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateDomain(
  client: SupabaseClient,
  curriculumId: string,
  name: string,
  order: number
) {
  const { data, error } = await client
    .from("domains")
    .select("*")
    .eq("curriculum_id", curriculumId)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("domains")
    .insert({
      curriculum_id: curriculumId,
      name,
      order,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateCompetency(
  client: SupabaseClient,
  domainId: string,
  name: string,
  description: string,
  order: number
) {
  const { data, error } = await client
    .from("competencies")
    .select("*")
    .eq("domain_id", domainId)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("competencies")
    .insert({
      domain_id: domainId,
      name,
      description,
      order,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateChapter(
  client: SupabaseClient,
  curriculumId: string,
  domainId: string,
  title: string,
  order: number
) {
  const { data, error } = await client
    .from("chapters")
    .select("*")
    .eq("curriculum_id", curriculumId)
    .eq("title", title)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("chapters")
    .insert({
      curriculum_id: curriculumId,
      domain_id: domainId,
      title,
      order,
      status: "published",
      source:
        "Pack pédagogique original structuré à partir du référentiel Mathématiques 6e ADEM Dakar.",
      source_url: SOURCE_URL,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateLesson(
  client: SupabaseClient,
  chapterId: string,
  competencyId: string,
  lesson: LessonSeed,
  order: number
) {
  const { data, error } = await client
    .from("lessons")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("title", lesson.title)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("lessons")
    .insert({
      chapter_id: chapterId,
      competency_id: competencyId,
      title: lesson.title,
      content_md: lesson.content.trim(),
      objectives: lesson.objectives,
      summary: lesson.summary,
      order,
      status: "published",
      source:
        "Pack pédagogique original structuré à partir du référentiel Mathématiques 6e ADEM Dakar.",
      source_url: SOURCE_URL,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateExercise(
  client: SupabaseClient,
  lessonId: string,
  competencyId: string,
  exercise: LessonSeed["exercise"]
) {
  const { data, error } = await client
    .from("exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("title", exercise.title)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: created, error: insertError } = await client
    .from("exercises")
    .insert({
      lesson_id: lessonId,
      competency_id: competencyId,
      title: exercise.title,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty,
      difficulty_score: exercise.difficulty_score,
      status: "published",
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function getOrCreateQuestion(
  client: SupabaseClient,
  exerciseId: string,
  competencyId: string,
  chapterId: string,
  question: QuestionSeed
) {
  const { data, error } = await client
    .from("questions")
    .select("*")
    .eq("exercise_id", exerciseId)
    .eq("prompt", question.prompt)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return data;
  }

  const { data: created, error: insertError } = await client
    .from("questions")
    .insert({
      exercise_id: exerciseId,
      competency_id: competencyId,
      chapter_id: chapterId,
      type: question.type,
      prompt: question.prompt,
      explanation: question.explanation,
      points: question.points,
      difficulty_score: question.difficulty_score,
      status: "published",
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return created;
}

async function ensureQuestionOptions(
  client: SupabaseClient,
  questionId: string,
  options: QuestionSeed["options"]
) {
  const { data: existing, error } = await client
    .from("question_options")
    .select("id, label")
    .eq("question_id", questionId);

  if (error) throw error;

  const existingLabels = new Set(
    (existing ?? []).map((option) => option.label)
  );

  const missing = options.filter(
    (option) => !existingLabels.has(option.label)
  );

  if (missing.length === 0) return;

  const { error: insertError } = await client
    .from("question_options")
    .insert(
      missing.map((option) => ({
        question_id: questionId,
        label: option.label,
        is_correct: option.is_correct,
        order: option.order,
      }))
    );

  if (insertError) throw insertError;
}

/* ============================================================
   IMPORT
   ============================================================ */

async function main() {
  console.log("");
  console.log("==============================================");
  console.log(" 🇸🇳 EDTECH SENEGAL");
  console.log(" 📚 IMPORT 6e MATHÉMATIQUES");
  console.log("==============================================");
  console.log("");

  console.log("🔌 Connexion à Supabase...");

  const cycle = await getOrCreateCycle(
    supabase,
    "moyen",
    "Enseignement moyen",
    3
  );

  console.log(`✅ Cycle : ${cycle.name}`);

  const level = await getOrCreateLevel(
    supabase,
    cycle.id
  );

  console.log(`✅ Niveau : ${level.name}`);

  const subject = await getOrCreateSubject(
    supabase
  );

  console.log(`✅ Matière : ${subject.name}`);

  await ensureLevelSubject(
    supabase,
    level.id,
    subject.id
  );

  console.log("✅ Matière associée au niveau 6e");

  const curriculum = await getOrCreateCurriculum(
    supabase,
    level.id,
    subject.id
  );

  console.log(`✅ Curriculum : ${curriculum.title}`);

  const numericDomain = await getOrCreateDomain(
    supabase,
    curriculum.id,
    "Activités numériques",
    1
  );

  const geometryDomain = await getOrCreateDomain(
    supabase,
    curriculum.id,
    "Activités géométriques",
    2
  );

  console.log("✅ Domaines créés");

  let totalChapters = 0;
  let totalLessons = 0;
  let totalExercises = 0;
  let totalQuestions = 0;
  let totalOptions = 0;

  for (
    let chapterIndex = 0;
    chapterIndex < chapters.length;
    chapterIndex++
  ) {
    const chapterSeed = chapters[chapterIndex];

    if (!chapterSeed) {
      throw new Error(
        `Chapitre introuvable à l'index ${chapterIndex}.`
      );
    }

    const isNumeric = chapterIndex < 10;

    const domain = isNumeric
      ? numericDomain
      : geometryDomain;

    console.log("");

    console.log(
      `📘 Chapitre ${chapterIndex + 1}/${chapters.length} : ${chapterSeed.title}`
    );

    const competency = await getOrCreateCompetency(
      supabase,
      domain.id,
      chapterSeed.competency,
      chapterSeed.competencyDescription,
      chapterIndex + 1
    );

    const chapter = await getOrCreateChapter(
      supabase,
      curriculum.id,
      domain.id,
      chapterSeed.title,
      chapterIndex + 1
    );

    totalChapters++;

    for (
      let lessonIndex = 0;
      lessonIndex < chapterSeed.lessons.length;
      lessonIndex++
    ) {
      const lessonSeed = chapterSeed.lessons[lessonIndex];

      if (!lessonSeed) {
        throw new Error(
          `Leçon introuvable dans le chapitre "${chapterSeed.title}" à l'index ${lessonIndex}.`
        );
      }

      const lesson = await getOrCreateLesson(
        supabase,
        chapter.id,
        competency.id,
        lessonSeed,
        lessonIndex + 1
      );

      totalLessons++;

      const exercise = await getOrCreateExercise(
        supabase,
        lesson.id,
        competency.id,
        lessonSeed.exercise
      );

      totalExercises++;

      for (
        let questionIndex = 0;
        questionIndex < lessonSeed.exercise.questions.length;
        questionIndex++
      ) {
        const questionSeed =
          lessonSeed.exercise.questions[questionIndex];

        if (!questionSeed) {
          throw new Error(
            `Question introuvable dans la leçon "${lessonSeed.title}" à l'index ${questionIndex}.`
          );
        }

        const question = await getOrCreateQuestion(
          supabase,
          exercise.id,
          competency.id,
          chapter.id,
          questionSeed
        );

        totalQuestions++;

        const beforeCount = await supabase
          .from("question_options")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("question_id", question.id);

        if (beforeCount.error) {
          throw beforeCount.error;
        }

        await ensureQuestionOptions(
          supabase,
          question.id,
          questionSeed.options
        );

        const afterCount = await supabase
          .from("question_options")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("question_id", question.id);

        if (afterCount.error) {
          throw afterCount.error;
        }

        const before = beforeCount.count ?? 0;
        const after = afterCount.count ?? 0;

        totalOptions += Math.max(
          0,
          after - before
        );
      }
    }

    console.log(
      `   ✅ ${chapterSeed.title}`
    );

    console.log(
      `   🎯 Compétence : ${chapterSeed.competency}`
    );
  }

  console.log("");
  console.log("==============================================");
  console.log("🎉 IMPORT TERMINÉ");
  console.log("==============================================");
  console.log(`📚 Curriculum : ${curriculum.title}`);
  console.log(`📖 Chapitres : ${totalChapters}`);
  console.log(`📝 Leçons : ${totalLessons}`);
  console.log(`✏️ Exercices : ${totalExercises}`);
  console.log(`❓ Questions : ${totalQuestions}`);
  console.log(`🔘 Options ajoutées : ${totalOptions}`);
  console.log("==============================================");
  console.log("");
  console.log("👉 Vérifie maintenant /admin/curriculums");
  console.log("👉 Puis /admin/chapters");
  console.log("👉 Puis /admin/lessons");
  console.log("👉 Puis /admin/questions");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("❌ ERREUR PENDANT L'IMPORT");
  console.error("");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});