import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const PUBLISH = process.env.EDTECH_PUBLISH_ENRICHMENT === "true";

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont requis dans .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SOURCE_URL = "https://senprof.education.sn/ADEM/Math%C3%A9matiques%206e/res/math_6e.pdf";
const CURRICULUM_TITLE = "Mathématiques 6e – Programme sénégalais";
const CURRICULUM_VERSION = "6e-maths-v1";
const STATUS = PUBLISH ? "published" : "review";
const SOURCE = "Enrichissement pédagogique original contrôlé à partir du référentiel Mathématiques 6e ADEM Dakar.";

type Question = {
  type: "single_choice" | "true_false";
  prompt: string;
  explanation: string;
  points: number;
  difficulty_score: number;
  options: { label: string; is_correct: boolean; order: number }[];
};
type Exercise = { title: string; instructions: string; difficulty: "easy" | "medium" | "hard" | "expert"; difficulty_score: number; questions: Question[] };
type Pack = { chapter: string; lessonTitle: string; objectives: string[]; summary: string; content: string; exercises: Exercise[] };

const q = (prompt: string, answer: string, distractors: string[], explanation: string, difficulty = 40): Question => ({
  type: "single_choice", prompt, explanation, points: 10, difficulty_score: difficulty,
  options: [answer, ...distractors].map((label, i) => ({ label, is_correct: i === 0, order: i + 1 })),
});
const tf = (prompt: string, correct: boolean, explanation: string, difficulty = 35): Question => ({
  type: "true_false", prompt, explanation, points: 10, difficulty_score: difficulty,
  options: [{ label: "Vrai", is_correct: correct, order: 1 }, { label: "Faux", is_correct: !correct, order: 2 }],
});

const packs: Pack[] = [
  {
    chapter: "Nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : décomposer, encadrer et représenter un décimal",
    objectives: ["Décomposer un décimal selon ses rangs.", "Encadrer un nombre entre deux entiers consécutifs.", "Passer d'une écriture décimale à une écriture fractionnaire simple."],
    summary: "La valeur d'un chiffre dépend de son rang. Décomposer et encadrer un décimal permet de vérifier sa lecture et sa représentation.",
    content: `# Décomposer et encadrer un nombre décimal\n\nUn nombre décimal peut être lu chiffre par chiffre selon sa position. Dans **14,307**, 3 est le chiffre des dixièmes, 0 celui des centièmes et 7 celui des millièmes.\n\n## Décomposition\n\n14,307 = 14 + 3/10 + 0/100 + 7/1000. On peut aussi écrire 14,307 = 14 + 0,307.\n\n## Encadrement\n\nPour encadrer 8,42 par deux entiers consécutifs, on cherche les entiers immédiatement inférieur et supérieur : **8 < 8,42 < 9**.\n\n## Fraction décimale\n\n8,42 = 842/100. Le dénominateur 100 correspond à deux chiffres après la virgule.\n\n## Méthode\n\n1. Repérer la position de chaque chiffre.\n2. Décomposer sans modifier la valeur.\n3. Pour encadrer par des entiers, observer la partie entière.\n4. Vérifier que le nombre est bien compris entre les deux bornes.`,
    exercises: [
      { title: "Entraînement : valeurs de position", instructions: "Réponds puis justifie mentalement le rang de chaque chiffre.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Dans 52,406, quel chiffre est celui des millièmes ?", "6", ["4", "0", "2"], "Le troisième chiffre après la virgule représente les millièmes.", 25),
        q("Quelle écriture fractionnaire correspond à 3,25 ?", "325/100", ["325/10", "32/5", "325/1000"], "Deux chiffres après la virgule correspondent à des centièmes.", 35),
        tf("Dans 7,09, le chiffre 9 représente 9 centièmes.", true, "Le zéro est aux dixièmes et le 9 aux centièmes.", 30),
      ]},
      { title: "Problème : mesures décimales", instructions: "Utilise les écritures décimales pour comparer et encadrer des mesures.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Une corde mesure 12,75 m. Entre quels entiers consécutifs sa longueur est-elle comprise ?", "12 m et 13 m", ["11 m et 12 m", "12 m et 14 m", "13 m et 14 m"], "La partie entière est 12 et la partie décimale est positive.", 45),
        q("Quel nombre est égal à 6 + 4/10 + 8/100 ?", "6,48", ["6,408", "64,8", "6,84"], "4 dixièmes donnent 0,4 et 8 centièmes donnent 0,08.", 50),
        q("Parmi 9,35 ; 9,305 ; 9,03 et 9,3050, quel nombre est le plus grand ?", "9,35", ["9,305", "9,03", "9,3050"], "9,35 = 9,350 et 9,350 > 9,305. Attention : 9,305 et 9,3050 sont égaux.", 60),
      ]},
    ],
  },
  {
    chapter: "Addition de deux nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : additionner, estimer et vérifier",
    objectives: ["Aligner les rangs avant une addition.", "Estimer une somme.", "Contrôler un résultat par une seconde méthode."],
    summary: "L'alignement des virgules garantit que les unités de même rang sont additionnées ensemble.",
    content: `# Additionner et contrôler une somme\n\nPour additionner des décimaux, on aligne les virgules. On peut compléter avec des zéros : 7,8 = 7,80.\n\nExemple : **18,75 + 6,4 = 18,75 + 6,40 = 25,15**.\n\n## Estimer\n\n18,75 est proche de 19 et 6,4 de 6, donc la somme est proche de 25. Le résultat 25,15 est cohérent.\n\n## Vérifier\n\nOn peut refaire le calcul, utiliser la commutativité ou comparer avec une estimation. Une erreur de virgule produit souvent un résultat manifestement trop grand ou trop petit.`,
    exercises: [
      { title: "Calculs et estimations", instructions: "Effectue les additions puis contrôle l'ordre de grandeur.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Calcule 14,6 + 3,75.", "18,35", ["17,35", "18,25", "19,35"], "14,60 + 3,75 = 18,35.", 30),
        q("Quelle estimation est la plus pertinente pour 39,8 + 12,2 ?", "Environ 52", ["Environ 42", "Environ 62", "Environ 102"], "39,8 est proche de 40 et 12,2 de 12 : la somme est proche de 52.", 35),
        tf("Pour additionner 5,2 et 1,37, on peut écrire 5,20 + 1,37.", true, "Ajouter un zéro final ne change pas la valeur d'un nombre décimal.", 25),
      ]},
      { title: "Problème : dépenses et recettes", instructions: "Modélise la situation par une addition puis vérifie ton résultat.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Awa achète un cahier à 1 250 F et un livre à 2 750 F. Quel est le total ?", "4 000 F", ["3 000 F", "3 500 F", "4 500 F"], "1 250 + 2 750 = 4 000 F.", 40),
        q("Un commerçant reçoit 18,5 kg puis 7,75 kg de riz. Quelle masse reçoit-il au total ?", "26,25 kg", ["25,25 kg", "26,15 kg", "27,25 kg"], "18,50 + 7,75 = 26,25 kg.", 55),
        q("Quel résultat est impossible pour 23,7 + 5,4 ?", "18,3", ["29,1", "29,10", "28,9"], "Une somme de deux nombres positifs doit être supérieure à chacun des deux nombres.", 55),
      ]},
    ],
  },
  {
    chapter: "Soustraction de deux nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : écart, différence et vérification",
    objectives: ["Calculer une différence décimale.", "Interpréter une soustraction comme recherche d'un écart.", "Vérifier une soustraction par l'addition."],
    summary: "La différence mesure notamment un écart entre deux valeurs. Pour vérifier a − b = c, on peut contrôler b + c = a.",
    content: `# Soustraction et écart\n\nPour soustraire des décimaux, on aligne les virgules. Exemple : **15,2 − 7,85 = 15,20 − 7,85 = 7,35**.\n\n## Interpréter\n\nSi un trajet mesure 15,2 km et qu'une première partie mesure 7,85 km, la distance restante est une différence.\n\n## Vérifier\n\nPour contrôler 15,2 − 7,85 = 7,35, on additionne 7,85 + 7,35 : on retrouve 15,20.`,
    exercises: [
      { title: "Différences décimales", instructions: "Pose les nombres en alignant les virgules.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Calcule 20,5 − 8,75.", "11,75", ["12,25", "11,85", "10,75"], "20,50 − 8,75 = 11,75.", 35),
        q("Quel calcul permet de vérifier 9,4 − 2,6 = 6,8 ?", "2,6 + 6,8 = 9,4", ["9,4 + 6,8 = 2,6", "9,4 − 6,8 = 2,6", "6,8 − 2,6 = 9,4"], "Dans une soustraction, différence + terme soustrait = terme de départ.", 40),
        tf("Dans 12,00 − 4,75, on peut écrire 12,00 − 4,75 sans changer la valeur de 12.", true, "Écrire les zéros permet seulement d'aligner les rangs.", 25),
      ]},
      { title: "Problèmes d'écart", instructions: "Traduis chaque situation par une soustraction.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Un réservoir contient 45,5 L. On utilise 18,75 L. Combien reste-t-il ?", "26,75 L", ["27,25 L", "26,85 L", "25,75 L"], "45,50 − 18,75 = 26,75 L.", 50),
        q("Fatou marche 6,8 km le matin et veut atteindre 10 km dans la journée. Quelle distance lui reste-t-il ?", "3,2 km", ["3,8 km", "4,2 km", "16,8 km"], "10 − 6,8 = 3,2 km.", 45),
        q("Un sac pèse 12,4 kg et un autre 8,65 kg. Quel est leur écart de masse ?", "3,75 kg", ["4,25 kg", "3,85 kg", "20,05 kg"], "12,40 − 8,65 = 3,75 kg.", 55),
      ]},
    ],
  },
  {
    chapter: "Rangement des nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : comparer sans se tromper",
    objectives: ["Comparer des décimaux de même partie entière.", "Utiliser des zéros pour comparer.", "Ranger une série dans l'ordre demandé."],
    summary: "Pour comparer deux décimaux, on compare d'abord les parties entières puis les chiffres décimaux de gauche à droite.",
    content: `# Comparer et ranger des décimaux\n\nPour comparer 7,4 et 7,35, on écrit 7,40 et 7,35. On compare alors les centièmes : 40 > 35, donc 7,4 > 7,35.\n\n## Méthode\n\n1. Comparer les parties entières.\n2. Si elles sont égales, comparer les dixièmes.\n3. Continuer avec les centièmes puis les millièmes.\n4. Ajouter des zéros si cela facilite la comparaison.`,
    exercises: [
      { title: "Comparaisons rapides", instructions: "Choisis le bon nombre ou la bonne relation.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quel nombre est le plus grand : 6,8 ou 6,75 ?", "6,8", ["6,75", "Ils sont égaux", "6,58"], "6,8 = 6,80 et 6,80 > 6,75.", 30),
        q("Quel est l'ordre croissant correct ?", "2,09 < 2,1 < 2,15", ["2,1 < 2,09 < 2,15", "2,15 < 2,1 < 2,09", "2,09 < 2,15 < 2,1"], "2,1 = 2,10.", 40),
        tf("4,50 et 4,5 représentent le même nombre.", true, "Un zéro final après la partie décimale ne change pas la valeur.", 25),
      ]},
      { title: "Ranger des mesures", instructions: "Compare les mesures comme si tu devais les classer du plus court au plus long.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Quelle mesure est la plus courte ?", "3,405 m", ["3,45 m", "3,5 m", "3,406 m"], "3,405 < 3,406 < 3,45 < 3,5. On évite ainsi de proposer deux écritures équivalentes comme réponses distinctes.", 55),
        q("Quel classement décroissant est correct ?", "8,7 > 8,65 > 8,06", ["8,65 > 8,7 > 8,06", "8,06 > 8,65 > 8,7", "8,7 > 8,06 > 8,65"], "8,70 > 8,65 > 8,06.", 45),
        q("Entre 12,099 et 12,1, lequel est le plus grand ?", "12,1", ["12,099", "Ils sont égaux", "12,019"], "12,1 = 12,100, donc 12,100 > 12,099.", 60),
      ]},
    ],
  },
  {
    chapter: "Multiplication de nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : produit, ordre de grandeur et contexte",
    objectives: ["Calculer un produit décimal.", "Placer correctement la virgule.", "Contrôler un résultat par estimation."],
    summary: "On peut multiplier comme des entiers puis replacer la virgule en tenant compte du nombre total de chiffres décimaux.",
    content: `# Multiplier des nombres décimaux\n\nExemple : **2,4 × 3,5**. On calcule 24 × 35 = 840. Il y a deux chiffres après les virgules au total, donc 8,40 = **8,4**.\n\n## Estimation\n\n2,4 × 3,5 est proche de 2 × 4 = 8. Un résultat comme 84 ou 0,84 doit donc être suspect.\n\n## Contexte\n\nUne multiplication peut représenter plusieurs quantités identiques, une longueur répétée ou un prix multiplié par une quantité.`,
    exercises: [
      { title: "Produits décimaux", instructions: "Calcule et contrôle l'ordre de grandeur.", difficulty: "easy", difficulty_score: 40, questions: [
        q("Calcule 1,5 × 4.", "6", ["5,5", "6,5", "0,6"], "15 × 4 = 60 puis une décimale : 6,0.", 30),
        q("Calcule 2,4 × 3,5.", "8,4", ["84", "0,84", "7,4"], "24 × 35 = 840 et deux chiffres décimaux donnent 8,40.", 45),
        tf("Pour estimer 4,8 × 2,1, un résultat proche de 10 est cohérent.", true, "4,8 est proche de 5 et 2,1 proche de 2, donc le produit est proche de 10.", 35),
      ]},
      { title: "Problèmes multiplicatifs", instructions: "Identifie la quantité répétée puis effectue le produit.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Un cahier coûte 750 F. Combien coûtent 4 cahiers ?", "3 000 F", ["2 250 F", "3 750 F", "4 000 F"], "750 × 4 = 3 000 F.", 40),
        q("Une planche mesure 1,25 m. Quelle longueur représentent 6 planches identiques alignées ?", "7,5 m", ["6,25 m", "7,25 m", "8,5 m"], "1,25 × 6 = 7,50 m.", 50),
        q("Quel résultat est impossible pour 3,2 × 2,5 ?", "80", ["8", "8,0", "7,99"], "3,2 × 2,5 = 8 ; 80 est dix fois trop grand.", 50),
      ]},
    ],
  },
  {
    chapter: "Division de nombres décimaux arithmétiques",
    lessonTitle: "Approfondissement : partage, quotient et contrôle",
    objectives: ["Interpréter une division comme partage ou recherche de groupements.", "Calculer un quotient simple.", "Vérifier une division par la multiplication."],
    summary: "La division permet de partager une quantité ou de déterminer combien de groupes identiques on peut former.",
    content: `# Division et partage\n\nSi 24,6 L sont répartis équitablement entre 3 récipients, chaque récipient reçoit **24,6 ÷ 3 = 8,2 L**.\n\n## Vérification\n\nOn contrôle avec la multiplication : 8,2 × 3 = 24,6.\n\n## Attention au sens\n\nDans un partage, le quotient indique la quantité par groupe. Dans une recherche de groupements, il peut indiquer le nombre de groupes.`,
    exercises: [
      { title: "Quotients simples", instructions: "Effectue les divisions puis choisis la vérification correcte.", difficulty: "easy", difficulty_score: 40, questions: [
        q("Calcule 18,6 ÷ 3.", "6,2", ["6,8", "5,2", "62"], "3 × 6,2 = 18,6.", 40),
        q("Quel produit vérifie 7,5 ÷ 5 = 1,5 ?", "1,5 × 5 = 7,5", ["7,5 × 5 = 1,5", "1,5 + 5 = 7,5", "7,5 − 5 = 1,5"], "Dividende = quotient × diviseur.", 35),
        tf("24 ÷ 6 et 6 ÷ 24 donnent le même résultat.", false, "24 ÷ 6 = 4 alors que 6 ÷ 24 = 0,25.", 35),
      ]},
      { title: "Partages en situation", instructions: "Interprète correctement le quotient obtenu.", difficulty: "medium", difficulty_score: 55, questions: [
        q("36,4 kg de riz sont répartis dans 4 sacs identiques. Quelle masse par sac ?", "9,1 kg", ["8,1 kg", "9,6 kg", "10,1 kg"], "36,4 ÷ 4 = 9,1 kg.", 50),
        q("Une famille parcourt 42 km en 6 étapes de même longueur. Quelle longueur moyenne par étape ?", "7 km", ["6 km", "8 km", "9 km"], "42 ÷ 6 = 7 km.", 40),
        q("Un quotient vaut 5,4 et le diviseur vaut 3. Quel est le dividende ?", "16,2", ["8,4", "15,4", "18,2"], "Dividende = quotient × diviseur = 5,4 × 3 = 16,2.", 55),
      ]},
    ],
  },
  {
    chapter: "Organisation d'un calcul",
    lessonTitle: "Approfondissement : priorités et calculs en chaîne",
    objectives: ["Reconnaître les priorités opératoires étudiées en 6e.", "Effectuer un calcul étape par étape.", "Éviter les calculs dans un ordre arbitraire."],
    summary: "Dans une expression, les parenthèses organisent le calcul et les multiplications/divisions sont effectuées avant les additions/soustractions lorsqu'il n'y a pas de parenthèses.",
    content: `# Organiser une expression\n\nPour calculer **7 + 3 × 4**, on effectue d'abord 3 × 4, puis 7 + 12 : le résultat est 19.\n\nAvec des parenthèses, celles-ci sont prioritaires : **(7 + 3) × 4 = 40**.\n\n## Méthode\n\n1. Parenthèses.\n2. Multiplications et divisions.\n3. Additions et soustractions.\n4. Lire l'expression une seconde fois pour contrôler le résultat.`,
    exercises: [
      { title: "Priorités opératoires", instructions: "Calcule sans changer l'ordre imposé par l'expression.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Calcule 8 + 2 × 5.", "18", ["50", "20", "10"], "2 × 5 = 10 puis 8 + 10 = 18.", 45),
        q("Calcule (8 + 2) × 5.", "50", ["18", "20", "40"], "La parenthèse donne 10, puis 10 × 5 = 50.", 40),
        tf("Dans 12 − 4 × 2, on peut calculer 12 − 4 avant la multiplication sans parenthèses.", false, "La multiplication est prioritaire : 4 × 2 puis 12 − 8.", 45),
      ]},
      { title: "Calculs à plusieurs étapes", instructions: "Détaille mentalement les étapes avant de choisir le résultat.", difficulty: "hard", difficulty_score: 65, questions: [
        q("Calcule 20 − 3 × 4 + 2.", "10", ["70", "18", "6"], "3 × 4 = 12 ; 20 − 12 + 2 = 10.", 60),
        q("Calcule 30 ÷ 5 + 4 × 2.", "14", ["20", "16", "10"], "30 ÷ 5 = 6 et 4 × 2 = 8 ; 6 + 8 = 14.", 60),
        q("Quelle expression vaut 36 ?", "(10 + 2) × 3", ["10 + 2 × 3", "10 × 2 + 3", "10 + 3 × 2"], "(10 + 2) × 3 = 12 × 3 = 36.", 65),
      ]},
    ],
  },
  {
    chapter: "Proportionnalité",
    lessonTitle: "Approfondissement : tableaux et coefficient de proportionnalité",
    objectives: ["Reconnaître une situation proportionnelle simple.", "Compléter un tableau.", "Utiliser un coefficient de proportionnalité dans un contexte."],
    summary: "Dans une situation proportionnelle, on passe d'une ligne à l'autre en multipliant toujours par le même coefficient.",
    content: `# Situations proportionnelles\n\nSi 1 cahier coûte 500 F, alors 2 cahiers coûtent 1 000 F et 5 cahiers 2 500 F. Le prix est proportionnel au nombre de cahiers.\n\n## Coefficient\n\nDe la quantité au prix, le coefficient est 500. On peut aussi utiliser une ligne de tableau.\n\n## Attention\n\nToutes les situations ne sont pas proportionnelles. Un tarif fixe ajouté à chaque commande peut casser la proportionnalité.`,
    exercises: [
      { title: "Tableaux de proportionnalité", instructions: "Complète mentalement la relation entre les deux grandeurs.", difficulty: "easy", difficulty_score: 40, questions: [
        q("Si 3 bouteilles coûtent 900 F, combien coûtent 6 bouteilles au même tarif unitaire ?", "1 800 F", ["1 200 F", "1 500 F", "2 700 F"], "6 est le double de 3, donc le prix est doublé.", 35),
        q("Quel coefficient relie 4 kg à 2 000 F dans une situation proportionnelle ?", "500 F/kg", ["250 F/kg", "2 004 F/kg", "2 000 F/kg"], "2 000 ÷ 4 = 500.", 45),
        tf("Si 2 cahiers coûtent 1 000 F, 5 cahiers coûtent nécessairement 2 500 F si le prix unitaire reste constant.", true, "Le prix unitaire est alors 500 F par cahier.", 35),
      ]},
      { title: "Problèmes de proportionnalité", instructions: "Repère la relation entre les grandeurs avant de calculer.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Une voiture consomme 6 L pour 100 km. Combien de litres pour 200 km au même rythme ?", "12 L", ["8 L", "10 L", "14 L"], "200 km est le double de 100 km.", 45),
        q("4 kg de mangues coûtent 2 400 F. Quel est le prix de 7 kg au même tarif ?", "4 200 F", ["3 600 F", "4 000 F", "4 800 F"], "Prix au kg = 600 F, donc 7 × 600 = 4 200 F.", 55),
        q("Quelle situation n'est pas proportionnelle ?", "Une course avec 1 000 F de prise en charge fixe + prix au km", ["Prix de 1 kg de riz au même tarif au kg", "Prix de 3 cahiers identiques", "Masse totale de sachets identiques"], "Le forfait fixe fait intervenir une partie constante en plus de la partie variable.", 65),
      ]},
    ],
  },
  {
    chapter: "Nombres décimaux relatifs",
    lessonTitle: "Approfondissement : comparer et repérer les relatifs",
    objectives: ["Distinguer positifs et négatifs.", "Comparer des nombres relatifs simples.", "Lire une position sur une droite graduée."],
    summary: "Sur une droite graduée, le nombre situé le plus à droite est le plus grand.",
    content: `# Comparer des nombres relatifs\n\nLes nombres positifs sont à droite de zéro et les nombres négatifs à gauche. Ainsi **−2 < 1**.\n\nEntre deux nombres négatifs, celui qui est le plus proche de zéro est le plus grand : **−3 < −1**.\n\n## Contexte\n\nUne température de −2 °C est plus froide qu'une température de 3 °C. Une altitude de −20 m est plus basse qu'une altitude de +5 m.`,
    exercises: [
      { title: "Repérage des relatifs", instructions: "Compare les nombres comme des positions sur une droite graduée.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quel nombre est le plus grand ?", "−1", ["−4", "−6", "−10"], "−1 est le plus proche de zéro parmi ces nombres négatifs.", 30),
        q("Quel ordre croissant est correct ?", "−5 < −2 < 0 < 3", ["−2 < −5 < 0 < 3", "3 < 0 < −2 < −5", "−5 < 0 < −2 < 3"], "Sur la droite, on va de gauche à droite.", 40),
        tf("−7 est inférieur à −3.", true, "−7 est situé plus à gauche que −3.", 25),
      ]},
      { title: "Températures et altitudes", instructions: "Interprète les nombres relatifs dans une situation concrète.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Entre −3 °C et +2 °C, quelle température est la plus élevée ?", "+2 °C", ["−3 °C", "0 °C", "Elles sont égales"], "+2 est situé à droite de −3.", 30),
        q("Un plongeur est à −8 m et un autre à −3 m. Qui est le plus haut ?", "Le plongeur à −3 m", ["Celui à −8 m", "Ils sont à la même hauteur", "Impossible à savoir"], "−3 est supérieur à −8.", 40),
        q("Quelle distance entre −2 et +4 sur une droite graduée d'unité 1 ?", "6 unités", ["2 unités", "4 unités", "8 unités"], "On compte de −2 à 0 puis de 0 à 4 : 2 + 4 = 6.", 55),
      ]},
    ],
  },
  {
    chapter: "Repérage sur la droite et le plan",
    lessonTitle: "Approfondissement : coordonnées et lecture d'un repère",
    objectives: ["Lire une abscisse.", "Lire un couple de coordonnées.", "Distinguer l'ordre des coordonnées."],
    summary: "Dans un repère du plan, un point est repéré par deux coordonnées : l'abscisse puis l'ordonnée.",
    content: `# Lire un repère\n\nDans un repère, on lit d'abord l'abscisse sur l'axe horizontal, puis l'ordonnée sur l'axe vertical. Le point A(3 ; 2) se trouve 3 unités à droite de l'origine puis 2 unités vers le haut.\n\n## Attention à l'ordre\n\nA(3 ; 2) et B(2 ; 3) sont deux points différents.\n\n## Méthode\n\nTracer mentalement les parallèles aux axes permet de lire chaque coordonnée sans les inverser.`,
    exercises: [
      { title: "Coordonnées de points", instructions: "Lis les coordonnées en respectant l'ordre abscisse puis ordonnée.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Dans le point A(4 ; 2), quelle est l'abscisse ?", "4", ["2", "6", "−4"], "La première coordonnée est l'abscisse.", 25),
        q("Dans le point B(−3 ; 5), quelle est l'ordonnée ?", "5", ["−3", "2", "−5"], "La deuxième coordonnée est l'ordonnée.", 25),
        tf("Les points (2 ; 5) et (5 ; 2) sont toujours le même point.", false, "L'ordre des coordonnées est essentiel.", 35),
      ]},
      { title: "Lire un déplacement", instructions: "Utilise les coordonnées pour décrire la position d'un point.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Un point C a pour coordonnées (−2 ; 3). Où se trouve son abscisse ?", "2 unités à gauche de 0", ["3 unités à gauche de 0", "2 unités à droite de 0", "3 unités à droite de 0"], "Une abscisse négative place le point à gauche de l'origine.", 40),
        q("Quel point est sur l'axe horizontal ?", "D(4 ; 0)", ["E(0 ; 4)", "F(4 ; 2)", "G(−2 ; 3)"], "Sur l'axe horizontal, l'ordonnée est 0.", 45),
        q("Quel point a la même abscisse que H(−3 ; 5) ?", "K(−3 ; −2)", ["K(5 ; −3)", "K(3 ; 5)", "K(−2 ; −3)"], "La même abscisse signifie la même première coordonnée.", 45),
      ]},
    ],
  },
  {
    chapter: "Introduction à la géométrie",
    lessonTitle: "Approfondissement : construire et décrire des objets géométriques",
    objectives: ["Employer le vocabulaire point, segment, droite et demi-droite.", "Identifier les extrémités d'un segment.", "Décrire une figure avec précision."],
    summary: "Le vocabulaire géométrique permet de décrire exactement une figure et d'éviter les ambiguïtés.",
    content: `# Vocabulaire et constructions\n\nUne **droite** se prolonge dans les deux directions. Un **segment** possède deux extrémités. Une **demi-droite** possède une origine et se prolonge dans une seule direction.\n\nOn note le segment [AB], la droite (AB) et la demi-droite [AB).\n\n## Pourquoi être précis ?\n\nDire « la ligne AB » ne suffit pas toujours : il faut préciser s'il s'agit d'un segment, d'une droite ou d'une demi-droite.`,
    exercises: [
      { title: "Vocabulaire essentiel", instructions: "Associe chaque description au bon objet géométrique.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quel objet possède deux extrémités ?", "Un segment", ["Une droite", "Une demi-droite", "Un axe sans origine"], "Un segment est limité par deux extrémités.", 25),
        q("Quel objet se prolonge dans les deux directions ?", "Une droite", ["Un segment", "Une demi-droite", "Un point"], "Une droite n'a pas d'extrémité.", 25),
        tf("La notation [AB] désigne une droite entière.", false, "[AB] désigne le segment d'extrémités A et B.", 25),
      ]},
      { title: "Décrire une construction", instructions: "Choisis la formulation géométrique la plus précise.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Comment noter la droite passant par A et B ?", "(AB)", ["[AB]", "[AB)", "AB["], "Les parenthèses désignent la droite déterminée par A et B.", 35),
        q("Comment noter la demi-droite d'origine A passant par B ?", "[AB)", ["(AB)", "[AB]", "(BA)"], "La première lettre indique l'origine de la demi-droite.", 45),
        q("Deux points distincts A et B déterminent une seule...", "droite", ["demi-droite dans les deux sens simultanément", "surface", "courbe quelconque"], "Par deux points distincts passe une unique droite.", 45),
      ]},
    ],
  },
  {
    chapter: "Le cercle",
    lessonTitle: "Approfondissement : rayon, diamètre et construction",
    objectives: ["Relier rayon et diamètre.", "Identifier le centre d'un cercle.", "Utiliser une mesure de rayon pour construire un cercle."],
    summary: "Dans un même cercle, tous les rayons ont la même longueur et le diamètre vaut deux fois le rayon.",
    content: `# Propriétés du cercle\n\nUn cercle est défini par un centre et un rayon. Un **rayon** relie le centre à un point du cercle. Un **diamètre** passe par le centre et relie deux points du cercle.\n\nLa relation fondamentale est : **diamètre = 2 × rayon**.\n\nAinsi, un cercle de rayon 4 cm a un diamètre de 8 cm.`,
    exercises: [
      { title: "Rayon et diamètre", instructions: "Utilise la relation diamètre = 2 × rayon.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Un cercle a un rayon de 5 cm. Quel est son diamètre ?", "10 cm", ["2,5 cm", "5 cm", "15 cm"], "Le diamètre vaut deux rayons : 2 × 5 = 10 cm.", 25),
        q("Un diamètre mesure 14 cm. Quel est le rayon ?", "7 cm", ["28 cm", "12 cm", "6 cm"], "Le rayon est la moitié du diamètre.", 30),
        tf("Tous les rayons d'un même cercle ont la même longueur.", true, "Chaque rayon relie le même centre au cercle.", 25),
      ]},
      { title: "Construire et raisonner", instructions: "Interprète les mesures données avant de choisir.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Pour construire un cercle de diamètre 12 cm au compas, quelle ouverture utilise-t-on ?", "6 cm", ["12 cm", "24 cm", "3 cm"], "L'ouverture du compas correspond au rayon.", 45),
        q("Si A et B sont deux points du cercle et que AB passe par le centre, AB est un...", "diamètre", ["rayon", "côté", "arc sans mesure"], "Une corde passant par le centre est un diamètre.", 40),
        q("Un cercle a un rayon de 3,5 cm. Son diamètre vaut...", "7 cm", ["6,5 cm", "3,5 cm", "10,5 cm"], "2 × 3,5 = 7 cm.", 35),
      ]},
    ],
  },
  {
    chapter: "Droites perpendiculaires et droites parallèles",
    lessonTitle: "Approfondissement : reconnaître et construire des droites",
    objectives: ["Reconnaître des droites parallèles.", "Reconnaître des droites perpendiculaires.", "Choisir l'outil adapté à une construction."],
    summary: "Des droites parallèles ne se coupent pas. Des droites perpendiculaires se coupent en formant un angle droit.",
    content: `# Parallélisme et perpendicularité\n\nDeux droites sont **parallèles** si elles ne se coupent pas. Deux droites sont **perpendiculaires** si elles se coupent en formant un angle droit.\n\n## Construction\n\nL'équerre est l'outil de référence pour construire ou vérifier un angle droit. La règle aide à tracer une droite et peut être utilisée avec l'équerre pour construire une parallèle.`,
    exercises: [
      { title: "Reconnaître les relations", instructions: "Choisis la propriété qui correspond à la situation.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Deux droites qui se coupent à 90° sont...", "perpendiculaires", ["parallèles", "confondues", "sécantes quelconques"], "Un angle droit mesure 90°.", 25),
        q("Quel instrument permet de vérifier un angle droit ?", "Une équerre", ["Un compas seul", "Une gomme", "Un rapporteur uniquement"], "L'équerre possède un angle droit.", 20),
        tf("Deux droites parallèles se coupent toujours en un point.", false, "Dans le plan, des droites parallèles ne se rencontrent pas.", 25),
      ]},
      { title: "Constructions géométriques", instructions: "Choisis l'outil et la propriété adaptés.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Pour tracer par un point une droite perpendiculaire à une droite donnée, l'outil principal est...", "l'équerre", ["la règle seule", "le compas seul", "le rapporteur seul"], "L'équerre permet de construire l'angle droit.", 40),
        q("Si d1 et d2 sont parallèles et d2 est perpendiculaire à d3, alors d1 est...", "perpendiculaire à d3", ["parallèle à d3", "identique à d3", "sans relation avec d3"], "Deux droites parallèles ont la même direction ; une droite perpendiculaire à l'une l'est aussi à l'autre.", 65),
        tf("Une droite peut être à la fois parallèle et perpendiculaire à une autre droite dans le plan.", false, "Dans le plan, ces deux relations sont incompatibles pour deux droites distinctes.", 55),
      ]},
    ],
  },
  {
    chapter: "Symétrie orthogonale par rapport à une droite donnée",
    lessonTitle: "Approfondissement : construire une image par symétrie",
    objectives: ["Identifier l'axe de symétrie.", "Construire l'image d'un point.", "Utiliser l'égalité des distances à l'axe."],
    summary: "Dans une symétrie axiale, l'axe est la médiatrice du segment reliant un point à son image.",
    content: `# Symétrie axiale\n\nPour construire l'image A' d'un point A par rapport à une droite d, on trace la perpendiculaire à d passant par A puis on reporte la même distance de l'autre côté de d.\n\nL'axe d est la médiatrice de [AA']. Les points situés sur l'axe restent fixes.\n\n## Contrôle\n\nOn vérifie que AA' est perpendiculaire à l'axe et que les distances de A et A' à l'axe sont égales.`,
    exercises: [
      { title: "Propriétés de la symétrie", instructions: "Utilise les propriétés de l'axe de symétrie.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Dans une symétrie axiale, l'axe est...", "la médiatrice du segment reliant un point à son image", ["parallèle à ce segment", "toujours horizontal", "le centre du cercle"], "L'axe coupe le segment [AA'] en son milieu et lui est perpendiculaire.", 40),
        q("Un point situé sur l'axe de symétrie...", "reste à la même place", ["change toujours de côté", "disparaît", "double de distance"], "Les points de l'axe sont invariants.", 30),
        tf("La distance d'un point à l'axe est égale à celle de son image à l'axe.", true, "C'est une propriété fondamentale de la symétrie axiale.", 30),
      ]},
      { title: "Construire une image", instructions: "Choisis l'étape correcte de construction.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Quelle première construction permet de trouver l'image A' d'un point A ?", "Tracer la perpendiculaire à l'axe passant par A", ["Tracer une parallèle quelconque", "Tracer un cercle de centre A sans rayon", "Relier A à l'origine du repère"], "Le segment [AA'] doit être perpendiculaire à l'axe.", 45),
        q("Si A est à 3 cm de l'axe, A' est à...", "3 cm de l'axe", ["1,5 cm", "6 cm", "0 cm"], "Les distances à l'axe sont conservées.", 35),
        q("Quelle figure possède une symétrie axiale par rapport à une de ses diagonales ?", "Un carré", ["Un triangle quelconque", "Un parallélogramme quelconque", "Un cercle sans axe"], "Les diagonales d'un carré sont des axes de symétrie.", 55),
      ]},
    ],
  },
  {
    chapter: "Angles",
    lessonTitle: "Approfondissement : mesurer, classer et construire des angles",
    objectives: ["Mesurer un angle au rapporteur.", "Classer un angle simple.", "Construire un angle de mesure donnée."],
    summary: "Le rapporteur sert à mesurer et construire les angles. Un angle droit mesure 90°.",
    content: `# Mesurer et construire des angles\n\nUn angle se mesure en degrés. L'angle droit mesure 90°. Un angle inférieur à 90° est aigu et un angle supérieur à 90° mais inférieur à 180° est obtus.\n\n## Mesurer\n\nOn place le centre du rapporteur sur le sommet et on aligne un côté avec la ligne 0°. Il faut choisir la bonne graduation en fonction du côté de départ.\n\n## Construire\n\nPour construire 60°, on trace un premier côté, place le centre du rapporteur au sommet, repère 60° puis trace le second côté.`,
    exercises: [
      { title: "Classer des angles", instructions: "Utilise les mesures pour identifier la nature des angles.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Un angle de 35° est...", "aigu", ["droit", "obtus", "plat"], "35° < 90°, donc l'angle est aigu.", 20),
        q("Un angle de 90° est...", "droit", ["aigu", "obtus", "plat"], "Par définition, un angle droit mesure 90°.", 15),
        tf("Un angle de 120° est obtus.", true, "120° est supérieur à 90° et inférieur à 180°.", 25),
      ]},
      { title: "Mesurer et construire", instructions: "Choisis la lecture ou la construction correcte.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Quel angle est le plus grand ?", "115°", ["85°", "90°", "45°"], "115° est supérieur aux trois autres mesures.", 25),
        q("Pour construire un angle de 70°, quel outil est adapté ?", "un rapporteur", ["une gomme", "une règle sans graduation", "un compas seul"], "Le rapporteur permet de reporter une mesure en degrés.", 25),
        q("Un angle mesure 180°. Comment le nomme-t-on ?", "angle plat", ["angle droit", "angle aigu", "angle nul"], "Un angle plat mesure 180°.", 25),
      ]},
    ],
  },
  {
    chapter: "Polygones",
    lessonTitle: "Approfondissement : reconnaître et décrire les polygones",
    objectives: ["Compter les côtés et les sommets.", "Reconnaître triangles et quadrilatères.", "Décrire un polygone à partir de ses propriétés."],
    summary: "Un polygone est une figure plane fermée composée uniquement de segments.",
    content: `# Décrire un polygone\n\nUn polygone possède autant de côtés que de sommets. Un triangle a 3 côtés, un quadrilatère 4 côtés, un pentagone 5 côtés.\n\n## Attention\n\nUne figure fermée comportant une partie courbe n'est pas un polygone.\n\n## Décrire\n\nPour identifier un polygone, on compte ses côtés et on observe les propriétés particulières de ses côtés et angles lorsque celles-ci sont connues.`,
    exercises: [
      { title: "Identifier les polygones", instructions: "Compte les côtés et utilise le vocabulaire adapté.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Comment appelle-t-on un polygone à 5 côtés ?", "pentagone", ["quadrilatère", "hexagone", "triangle"], "Penta- signifie cinq.", 20),
        q("Combien de sommets possède un quadrilatère ?", "4", ["3", "5", "6"], "Un quadrilatère possède quatre côtés et quatre sommets.", 15),
        tf("Un cercle est un polygone.", false, "Un cercle possède une ligne courbe, pas des segments.", 20),
      ]},
      { title: "Propriétés et classification", instructions: "Utilise les propriétés connues des figures usuelles.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Quelle figure possède quatre côtés égaux et quatre angles droits ?", "carré", ["rectangle quelconque", "triangle équilatéral", "trapèze quelconque"], "C'est la définition usuelle du carré.", 35),
        q("Un triangle possède combien de côtés ?", "3", ["2", "4", "5"], "Le préfixe tri- indique trois.", 15),
        q("Quel polygone possède 6 côtés ?", "hexagone", ["pentagone", "heptagone", "octogone"], "Hexagone correspond à six côtés.", 25),
      ]},
    ],
  },
  {
    chapter: "Aires",
    lessonTitle: "Approfondissement : choisir une unité et calculer une aire",
    objectives: ["Distinguer longueur et aire.", "Utiliser les formules du carré et du rectangle.", "Exprimer correctement une aire en unités carrées."],
    summary: "L'aire mesure une surface et s'exprime en unités carrées. Pour un rectangle, aire = longueur × largeur.",
    content: `# Calculer des aires\n\nL'aire d'un rectangle de longueur L et de largeur l est **A = L × l**. Pour un carré de côté c, **A = c × c**.\n\nSi les longueurs sont en mètres, l'aire est en mètres carrés (m²).\n\n## Contrôle\n\nUne aire doit être exprimée avec une unité au carré. Un résultat en mètres seulement est une longueur, pas une aire.`,
    exercises: [
      { title: "Aires usuelles", instructions: "Choisis la formule puis calcule.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quelle est l'aire d'un rectangle de 8 cm sur 3 cm ?", "24 cm²", ["11 cm²", "24 cm", "48 cm²"], "8 × 3 = 24 et l'unité d'aire est cm².", 25),
        q("Quelle est l'aire d'un carré de côté 5 m ?", "25 m²", ["10 m²", "20 m²", "25 m"], "5 × 5 = 25 m².", 25),
        tf("Une aire peut s'exprimer en cm².", true, "Le cm² est une unité d'aire.", 15),
      ]},
      { title: "Aires en contexte", instructions: "Interprète les dimensions puis donne une aire avec la bonne unité.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Une salle mesure 6 m sur 4 m. Quelle est son aire ?", "24 m²", ["20 m²", "10 m²", "24 m"], "6 × 4 = 24 m².", 25),
        q("Un terrain rectangulaire a une aire de 60 m² et une largeur de 5 m. Quelle est sa longueur ?", "12 m", ["10 m", "15 m", "300 m"], "60 ÷ 5 = 12 m.", 55),
        q("Quelle unité convient pour l'aire d'une feuille de cahier ?", "cm²", ["cm", "kg", "L"], "La feuille est une surface ; cm² convient pour une petite surface.", 25),
      ]},
    ],
  },
  {
    chapter: "Géométrie dans l'espace",
    lessonTitle: "Approfondissement : faces, arêtes et sommets",
    objectives: ["Identifier les éléments d'un solide.", "Distinguer cube et pavé droit.", "Associer des objets courants à des solides usuels."],
    summary: "Un solide possède des faces, des arêtes et des sommets. Le cube et le pavé droit sont des solides usuels.",
    content: `# Décrire un solide\n\nUn solide peut être décrit par ses **faces**, ses **arêtes** et ses **sommets**. Un cube possède 6 faces carrées, 12 arêtes et 8 sommets.\n\nUn pavé droit possède 6 faces rectangulaires, avec des faces opposées de mêmes dimensions.\n\n## Vocabulaire\n\nUne face est une surface plane du solide, une arête est un segment où deux faces se rencontrent et un sommet est un point où plusieurs arêtes se rencontrent.`,
    exercises: [
      { title: "Reconnaître les solides", instructions: "Utilise le nombre de faces, arêtes et sommets.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Combien de sommets possède un cube ?", "8", ["6", "10", "12"], "Un cube possède 8 sommets.", 25),
        q("Combien de faces possède un cube ?", "6", ["4", "8", "12"], "Un cube possède 6 faces carrées.", 20),
        tf("Une arête est une surface plane entière du solide.", false, "Une arête est le segment commun à deux faces.", 30),
      ]},
      { title: "Solides et objets", instructions: "Associe la description au solide le plus pertinent.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Quel solide ressemble à une boîte à chaussures ?", "un pavé droit", ["une sphère", "un cône", "un cylindre"], "Une boîte à chaussures est généralement un pavé droit.", 20),
        q("Quel solide possède 12 arêtes et 8 sommets ?", "un cube", ["une sphère", "un cylindre", "un cône"], "Le cube possède 12 arêtes et 8 sommets.", 30),
        q("Deux faces d'un pavé droit sont toujours...", "des rectangles ou des carrés", ["des cercles", "des triangles obligatoirement", "des courbes"], "Les faces d'un pavé droit sont rectangulaires, un carré étant un cas particulier.", 45),
      ]},
    ],
  },
  {
    chapter: "Repérage sur la sphère",
    lessonTitle: "Approfondissement : repérer un point sur une sphère",
    objectives: ["Identifier des repères sur une sphère.", "Distinguer les directions de repérage.", "Comprendre l'idée de latitude et longitude sans confondre leurs rôles."],
    summary: "Sur une sphère terrestre, latitude et longitude servent à localiser un point ; elles ne désignent pas la même direction.",
    content: `# Se repérer sur une sphère\n\nPour repérer un lieu sur la Terre, on utilise notamment la **latitude** et la **longitude**. L'équateur sépare les latitudes nord et sud. Le méridien d'origine sert de référence pour les longitudes est et ouest.\n\n## Ne pas confondre\n\nLa latitude indique la position au nord ou au sud de l'équateur. La longitude indique la position à l'est ou à l'ouest du méridien d'origine.\n\nCes repères permettent de localiser précisément un point sur une représentation sphérique.`,
    exercises: [
      { title: "Repères sur la Terre", instructions: "Identifie correctement les références géographiques.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quelle ligne de référence sépare les latitudes Nord et Sud ?", "l'équateur", ["le tropique du Cancer", "le méridien de Greenwich", "le cercle polaire"], "L'équateur correspond à la latitude 0°.", 25),
        q("La longitude se mesure par rapport à...", "un méridien d'origine", ["l'équateur uniquement", "un parallèle quelconque", "un sommet du globe"], "Les longitudes sont définies par rapport au méridien d'origine.", 35),
        tf("La latitude indique si un point est au nord ou au sud de l'équateur.", true, "C'est précisément le rôle de la latitude.", 20),
      ]},
      { title: "Localisation et lecture", instructions: "Distingue latitude et longitude dans des descriptions simples.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Un lieu situé à 14° N est situé...", "au nord de l'équateur", ["au sud de l'équateur", "sur l'équateur", "forcément à l'ouest"], "Le signe ou la lettre N indique le nord.", 30),
        q("Une longitude 17° O indique une position...", "à l'ouest du méridien d'origine", ["à l'est de l'équateur", "au nord de l'équateur", "sur l'équateur"], "O signifie ouest pour la longitude.", 35),
        q("Pourquoi utilise-t-on deux coordonnées pour localiser un point sur une sphère terrestre ?", "Pour préciser sa position dans deux directions complémentaires", ["Pour mesurer uniquement sa hauteur", "Pour calculer son poids", "Pour connaître son diamètre"], "Latitude et longitude complètent le repérage nord-sud et est-ouest.", 55),
      ]},
    ],
  },
];

async function getCurriculum(client: SupabaseClient) {
  const { data, error } = await client.from("curriculums").select("id,title,version").eq("title", CURRICULUM_TITLE).eq("version", CURRICULUM_VERSION).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Curriculum introuvable : ${CURRICULUM_TITLE} / ${CURRICULUM_VERSION}`);
  return data;
}

async function getChapter(client: SupabaseClient, curriculumId: string, title: string) {
  const { data, error } = await client.from("chapters").select("id,title,domain_id,order").eq("curriculum_id", curriculumId).eq("title", title).is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Chapitre introuvable : ${title}`);
  return data;
}

async function getCompetency(client: SupabaseClient, chapterId: string) {
  const { data: chapter, error: chapterError } = await client.from("chapters").select("domain_id").eq("id", chapterId).single();
  if (chapterError) throw chapterError;
  const { data, error } = await client.from("competencies").select("id,name").eq("domain_id", chapter.domain_id).order("order", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

async function ensureLesson(client: SupabaseClient, chapter: any, competency: any, pack: Pack) {
  const { data: existing, error } = await client.from("lessons").select("id,title").eq("chapter_id", chapter.id).eq("title", pack.lessonTitle).is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  if (existing) return { lesson: existing, created: false };
  const { data, error: insertError } = await client.from("lessons").insert({
    chapter_id: chapter.id, competency_id: competency?.id ?? null, title: pack.lessonTitle,
    content_md: pack.content.trim(), objectives: pack.objectives, summary: pack.summary,
    order: chapter.order * 10 + 3, status: STATUS, source: SOURCE, source_url: SOURCE_URL,
  }).select("id,title").single();
  if (insertError) throw insertError;
  return { lesson: data, created: true };
}

async function ensureExercise(client: SupabaseClient, lessonId: string, competencyId: string | null, exercise: Exercise) {
  const { data: existing, error } = await client.from("exercises").select("id,title").eq("lesson_id", lessonId).eq("title", exercise.title).is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  if (existing) return { exercise: existing, created: false };
  const { data, error: insertError } = await client.from("exercises").insert({
    lesson_id: lessonId, competency_id: competencyId, title: exercise.title, instructions: exercise.instructions,
    difficulty: exercise.difficulty, difficulty_score: exercise.difficulty_score, status: STATUS,
  }).select("id,title").single();
  if (insertError) throw insertError;
  return { exercise: data, created: true };
}

async function ensureQuestion(client: SupabaseClient, exerciseId: string, competencyId: string | null, chapterId: string, question: Question) {
  const { data: existing, error } = await client.from("questions").select("id,prompt").eq("exercise_id", exerciseId).eq("prompt", question.prompt).is("deleted_at", null).limit(1).maybeSingle();
  if (error) throw error;
  if (existing) return { question: existing, created: false };
  const { data, error: insertError } = await client.from("questions").insert({
    exercise_id: exerciseId, competency_id: competencyId, chapter_id: chapterId, type: question.type,
    prompt: question.prompt, explanation: question.explanation, points: question.points,
    difficulty_score: question.difficulty_score, status: STATUS,
  }).select("id,prompt").single();
  if (insertError) throw insertError;
  const { error: optionError } = await client.from("question_options").insert(question.options.map((o) => ({ question_id: data.id, label: o.label, is_correct: o.is_correct, order: o.order })));
  if (optionError) throw optionError;
  return { question: data, created: true };
}

async function main() {
  console.log(`\n🇸🇳 Lot 1 — Enrichissement Mathématiques 6e (${STATUS})\n`);
  const curriculum = await getCurriculum(supabase);
  const stats = { chapters: 0, lessonsCreated: 0, exercisesCreated: 0, questionsCreated: 0, duplicates: 0 };

  for (const pack of packs) {
    const chapter = await getChapter(supabase, curriculum.id, pack.chapter);
    const competency = await getCompetency(supabase, chapter.id);
    const { lesson, created: lessonCreated } = await ensureLesson(supabase, chapter, competency, pack);
    stats.chapters++;
    if (lessonCreated) stats.lessonsCreated++;
    for (const exerciseSeed of pack.exercises) {
      const { exercise, created: exerciseCreated } = await ensureExercise(supabase, lesson.id, competency?.id ?? null, exerciseSeed);
      if (exerciseCreated) stats.exercisesCreated++;
      for (const question of exerciseSeed.questions) {
        const result = await ensureQuestion(supabase, exercise.id, competency?.id ?? null, chapter.id, question);
        if (result.created) stats.questionsCreated++; else stats.duplicates++;
      }
    }
    console.log(`✅ ${pack.chapter} — ${lessonCreated ? "nouvelle leçon" : "leçon déjà présente"}`);
  }

  console.log("\n==============================================");
  console.log("IMPORT D'ENRICHISSEMENT TERMINÉ");
  console.log("==============================================");
  console.log(`Chapitres traités       : ${stats.chapters}`);
  console.log(`Nouvelles leçons        : ${stats.lessonsCreated}`);
  console.log(`Nouveaux exercices      : ${stats.exercisesCreated}`);
  console.log(`Nouvelles questions     : ${stats.questionsCreated}`);
  console.log(`Questions déjà présentes: ${stats.duplicates}`);
  console.log(`Statut des ajouts       : ${STATUS}`);
  console.log("==============================================\n");
  if (!PUBLISH) console.log("ℹ️ Pour publier après validation : EDTECH_PUBLISH_ENRICHMENT=true npx tsx scripts/enrich-6e-maths.ts");
}

main().catch((error) => {
  console.error("\n❌ Échec de l'enrichissement");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
