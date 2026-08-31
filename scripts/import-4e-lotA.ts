import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY=process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!SUPABASE_URL||!SUPABASE_SECRET_KEY){console.error("❌ Configuration Supabase manquante.");process.exit(1);}
const supabase=createClient(SUPABASE_URL,SUPABASE_SECRET_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
const STATUS=process.env.EDTECH_PUBLISH_ENRICHMENT === "true" ? "published" : "review";
const PROMET_URL="https://apprendre.education.sn/C_ressource/recherche/34";
type RawQuestion={kind:"mc"|"tf";prompt:string;answer:string|boolean;wrongs?:string[];explanation:string};
type RawLesson={title:string;objectives:string[];summary:string;content:string;questions:RawQuestion[]};
type RawChapter={title:string;domain:string;competency:string;lessons:RawLesson[]};
type RawProgram={subject:string;source:string;version:string;chapters:RawChapter[]};
const programs: RawProgram[] = [
  {
    "subject": "Mathématiques",
    "source": "https://senprof.education.sn/ADEM/Math%C3%A9matiques%204e/res/ADEM_FASCICULE_MATHS_4eme_v10_17_.pdf",
    "version": "4e-mathematiques-adem-v1",
    "chapters": [
      {
        "title": "Nombres rationnels",
        "domain": "Activités numériques",
        "competency": "Maîtriser Nombres rationnels et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Nombres rationnels",
            "objectives": [
              "Définir et expliquer Nombres rationnels.",
              "Identifier les propriétés et méthodes essentielles de Nombres rationnels.",
              "Résoudre ou interpréter une situation liée à Nombres rationnels.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un rationnel peut s’écrire a/b avec a entier et b entier non nul; on sait comparer, additionner, multiplier et simplifier des rationnels.",
            "content": "# Nombres rationnels\n\nUn nombre rationnel est un nombre qui peut s’écrire a/b avec a et b entiers et b ≠ 0. Deux écritures équivalentes représentent le même nombre. Pour comparer ou calculer, on utilise notamment des dénominateurs communs et les règles de signe.\n\n### Exemple\n-3/5 = -6/10. Pour comparer 2/3 et 3/4, on peut utiliser le dénominateur commun 12.\n\n### À retenir\nUn quotient n’est défini que si son dénominateur est non nul.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la définition d’un nombre rationnel » ?",
                "answer": "un nombre qui peut s’écrire a/b avec a et b entiers et b ≠ 0",
                "wrongs": [
                  "un nombre dont le dénominateur est toujours 0",
                  "un nombre forcément entier",
                  "un nombre forcément positif"
                ],
                "explanation": "La forme a/b avec a,b entiers et b non nul caractérise les nombres rationnels."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un nombre qui peut s’écrire a/b avec a et b entiers et b ≠ 0 » est correcte pour « la définition d’un nombre rationnel ».",
                "answer": true,
                "explanation": "Vrai. La forme a/b avec a,b entiers et b non nul caractérise les nombres rationnels."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la définition d’un nombre rationnel » dans une situation d'application ?",
                "answer": "un nombre qui peut s’écrire a/b avec a et b entiers et b ≠ 0",
                "wrongs": [
                  "un nombre dont le dénominateur est toujours 0",
                  "un nombre forcément entier",
                  "un nombre forcément positif"
                ],
                "explanation": "La forme a/b avec a,b entiers et b non nul caractérise les nombres rationnels."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’équivalence de fractions » ?",
                "answer": "-3/5 = -6/10",
                "wrongs": [
                  "-3/5 = -6/15",
                  "-3/5 = 3/10",
                  "-3/5 = -10/6"
                ],
                "explanation": "Multiplier numérateur et dénominateur par un même entier non nul conserve la valeur."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « -3/5 = -6/10 » est correcte pour « l’équivalence de fractions ».",
                "answer": true,
                "explanation": "Vrai. Multiplier numérateur et dénominateur par un même entier non nul conserve la valeur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’équivalence de fractions » dans une situation d'application ?",
                "answer": "-3/5 = -6/10",
                "wrongs": [
                  "-3/5 = -6/15",
                  "-3/5 = 3/10",
                  "-3/5 = -10/6"
                ],
                "explanation": "Multiplier numérateur et dénominateur par un même entier non nul conserve la valeur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la comparaison de 2/3 et 3/4 » ?",
                "answer": "2/3 < 3/4",
                "wrongs": [
                  "2/3 > 3/4",
                  "2/3 = 3/4",
                  "on ne peut pas les comparer"
                ],
                "explanation": "Avec le dénominateur 12, 2/3=8/12 et 3/4=9/12."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 2/3 < 3/4 » est correcte pour « la comparaison de 2/3 et 3/4 ».",
                "answer": true,
                "explanation": "Vrai. Avec le dénominateur 12, 2/3=8/12 et 3/4=9/12."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la comparaison de 2/3 et 3/4 » dans une situation d'application ?",
                "answer": "2/3 < 3/4",
                "wrongs": [
                  "2/3 > 3/4",
                  "2/3 = 3/4",
                  "on ne peut pas les comparer"
                ],
                "explanation": "Avec le dénominateur 12, 2/3=8/12 et 3/4=9/12."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la condition d’existence d’un quotient a/b » ?",
                "answer": "b ≠ 0",
                "wrongs": [
                  "a = 0 obligatoirement",
                  "a = b",
                  "b = 0"
                ],
                "explanation": "La division par zéro n’est pas définie."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « b ≠ 0 » est correcte pour « la condition d’existence d’un quotient a/b ».",
                "answer": true,
                "explanation": "Vrai. La division par zéro n’est pas définie."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la condition d’existence d’un quotient a/b » dans une situation d'application ?",
                "answer": "b ≠ 0",
                "wrongs": [
                  "a = 0 obligatoirement",
                  "a = b",
                  "b = 0"
                ],
                "explanation": "La division par zéro n’est pas définie."
              }
            ]
          }
        ]
      },
      {
        "title": "Calcul algébrique",
        "domain": "Activités numériques",
        "competency": "Maîtriser Calcul algébrique et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Calcul algébrique",
            "objectives": [
              "Définir et expliquer Calcul algébrique.",
              "Identifier les propriétés et méthodes essentielles de Calcul algébrique.",
              "Résoudre ou interpréter une situation liée à Calcul algébrique.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le calcul littéral permet de développer, réduire et factoriser des expressions en utilisant la distributivité et les identités remarquables.",
            "content": "# Calcul algébrique\n\nUne expression littérale utilise des nombres et des lettres. Réduire consiste à regrouper les termes semblables; développer utilise la distributivité; factoriser consiste à mettre en évidence un facteur commun.\n\n### Exemples\n3(x+2)=3x+6.\n2x+5x=7x.\n\n### À retenir\nUne transformation algébrique doit conserver la valeur de l’expression.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la distributivité » ?",
                "answer": "3(x+2)=3x+6",
                "wrongs": [
                  "3(x+2)=3x+2",
                  "3(x+2)=3x+5",
                  "3(x+2)=x+6"
                ],
                "explanation": "On multiplie 3 par chacun des termes de la parenthèse."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 3(x+2)=3x+6 » est correcte pour « la distributivité ».",
                "answer": true,
                "explanation": "Vrai. On multiplie 3 par chacun des termes de la parenthèse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la distributivité » dans une situation d'application ?",
                "answer": "3(x+2)=3x+6",
                "wrongs": [
                  "3(x+2)=3x+2",
                  "3(x+2)=3x+5",
                  "3(x+2)=x+6"
                ],
                "explanation": "On multiplie 3 par chacun des termes de la parenthèse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la réduction de 2x+5x » ?",
                "answer": "7x",
                "wrongs": [
                  "10x",
                  "7x²",
                  "x+5"
                ],
                "explanation": "Les termes semblables s’additionnent par leurs coefficients."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 7x » est correcte pour « la réduction de 2x+5x ».",
                "answer": true,
                "explanation": "Vrai. Les termes semblables s’additionnent par leurs coefficients."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la réduction de 2x+5x » dans une situation d'application ?",
                "answer": "7x",
                "wrongs": [
                  "10x",
                  "7x²",
                  "x+5"
                ],
                "explanation": "Les termes semblables s’additionnent par leurs coefficients."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la factorisation de 6x+12 » ?",
                "answer": "6(x+2)",
                "wrongs": [
                  "6(x+12)",
                  "x(6+12)",
                  "12(x+6)"
                ],
                "explanation": "6 est un facteur commun à 6x et 12."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 6(x+2) » est correcte pour « la factorisation de 6x+12 ».",
                "answer": true,
                "explanation": "Vrai. 6 est un facteur commun à 6x et 12."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la factorisation de 6x+12 » dans une situation d'application ?",
                "answer": "6(x+2)",
                "wrongs": [
                  "6(x+12)",
                  "x(6+12)",
                  "12(x+6)"
                ],
                "explanation": "6 est un facteur commun à 6x et 12."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une identité remarquable » ?",
                "answer": "(a+b)²=a²+2ab+b²",
                "wrongs": [
                  "(a+b)²=a²+b²",
                  "(a+b)²=a²-2ab+b²",
                  "(a+b)²=2a+2b"
                ],
                "explanation": "C’est l’identité du carré d’une somme."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « (a+b)²=a²+2ab+b² » est correcte pour « une identité remarquable ».",
                "answer": true,
                "explanation": "Vrai. C’est l’identité du carré d’une somme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une identité remarquable » dans une situation d'application ?",
                "answer": "(a+b)²=a²+2ab+b²",
                "wrongs": [
                  "(a+b)²=a²+b²",
                  "(a+b)²=a²-2ab+b²",
                  "(a+b)²=2a+2b"
                ],
                "explanation": "C’est l’identité du carré d’une somme."
              }
            ]
          }
        ]
      },
      {
        "title": "Équations à une inconnue",
        "domain": "Activités numériques",
        "competency": "Maîtriser Équations à une inconnue et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Équations à une inconnue",
            "objectives": [
              "Définir et expliquer Équations à une inconnue.",
              "Identifier les propriétés et méthodes essentielles de Équations à une inconnue.",
              "Résoudre ou interpréter une situation liée à Équations à une inconnue.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une équation traduit une égalité contenant une inconnue; on transforme l’égalité par des opérations équivalentes pour isoler l’inconnue.",
            "content": "# Équations à une inconnue\n\nRésoudre une équation consiste à trouver toutes les valeurs de l’inconnue qui rendent l’égalité vraie. On peut ajouter, soustraire, multiplier ou diviser les deux membres par un même nombre non nul.\n\n### Exemple\n2x+3=11 donne 2x=8 puis x=4.\n\n### Vérification\nOn remplace x par 4 dans l’équation initiale.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la solution de 2x+3=11 » ?",
                "answer": "x=4",
                "wrongs": [
                  "x=3",
                  "x=5",
                  "x=7"
                ],
                "explanation": "2x=8 puis x=4."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « x=4 » est correcte pour « la solution de 2x+3=11 ».",
                "answer": true,
                "explanation": "Vrai. 2x=8 puis x=4."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la solution de 2x+3=11 » dans une situation d'application ?",
                "answer": "x=4",
                "wrongs": [
                  "x=3",
                  "x=5",
                  "x=7"
                ],
                "explanation": "2x=8 puis x=4."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une opération autorisée sur une équation » ?",
                "answer": "ajouter le même nombre aux deux membres",
                "wrongs": [
                  "modifier un seul membre",
                  "diviser un seul membre par 2",
                  "supprimer un terme sans justification"
                ],
                "explanation": "Une opération identique sur les deux membres conserve l’équivalence."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « ajouter le même nombre aux deux membres » est correcte pour « une opération autorisée sur une équation ».",
                "answer": true,
                "explanation": "Vrai. Une opération identique sur les deux membres conserve l’équivalence."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une opération autorisée sur une équation » dans une situation d'application ?",
                "answer": "ajouter le même nombre aux deux membres",
                "wrongs": [
                  "modifier un seul membre",
                  "diviser un seul membre par 2",
                  "supprimer un terme sans justification"
                ],
                "explanation": "Une opération identique sur les deux membres conserve l’équivalence."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la vérification d’une solution » ?",
                "answer": "remplacer l’inconnue dans l’équation de départ",
                "wrongs": [
                  "changer l’équation",
                  "regarder seulement le membre de gauche",
                  "arrondir sans raison"
                ],
                "explanation": "La substitution dans l’équation initiale permet de vérifier l’égalité."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « remplacer l’inconnue dans l’équation de départ » est correcte pour « la vérification d’une solution ».",
                "answer": true,
                "explanation": "Vrai. La substitution dans l’équation initiale permet de vérifier l’égalité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la vérification d’une solution » dans une situation d'application ?",
                "answer": "remplacer l’inconnue dans l’équation de départ",
                "wrongs": [
                  "changer l’équation",
                  "regarder seulement le membre de gauche",
                  "arrondir sans raison"
                ],
                "explanation": "La substitution dans l’équation initiale permet de vérifier l’égalité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’équation x+5=2 » ?",
                "answer": "x=-3",
                "wrongs": [
                  "x=3",
                  "x=7",
                  "x=-7"
                ],
                "explanation": "On soustrait 5 aux deux membres: x=-3."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « x=-3 » est correcte pour « l’équation x+5=2 ».",
                "answer": true,
                "explanation": "Vrai. On soustrait 5 aux deux membres: x=-3."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’équation x+5=2 » dans une situation d'application ?",
                "answer": "x=-3",
                "wrongs": [
                  "x=3",
                  "x=7",
                  "x=-7"
                ],
                "explanation": "On soustrait 5 aux deux membres: x=-3."
              }
            ]
          }
        ]
      },
      {
        "title": "Inéquations et systèmes de deux inéquations à une inconnue",
        "domain": "Activités numériques",
        "competency": "Maîtriser Inéquations et systèmes de deux inéquations à une inconnue et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Inéquations et systèmes de deux inéquations à une inconnue",
            "objectives": [
              "Définir et expliquer Inéquations et systèmes de deux inéquations à une inconnue.",
              "Identifier les propriétés et méthodes essentielles de Inéquations et systèmes de deux inéquations à une inconnue.",
              "Résoudre ou interpréter une situation liée à Inéquations et systèmes de deux inéquations à une inconnue.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Résoudre une inéquation revient à déterminer un ensemble de valeurs; lors d’une multiplication ou division par un nombre négatif, le sens de l’inégalité s’inverse.",
            "content": "# Inéquations\n\nUne inéquation compare deux expressions. Les solutions peuvent être représentées par un intervalle. Lorsqu’on multiplie ou divise les deux membres par un nombre négatif, on inverse le signe.\n\n### Exemple\n-2x>6 donne x<-3.\n\n### Systèmes\nLes solutions d’un système sont les valeurs communes aux ensembles de solutions des inéquations.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la résolution de -2x>6 » ?",
                "answer": "x<-3",
                "wrongs": [
                  "x>3",
                  "x<-6",
                  "x> -3"
                ],
                "explanation": "En divisant par -2, le sens de l’inégalité s’inverse."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « x<-3 » est correcte pour « la résolution de -2x>6 ».",
                "answer": true,
                "explanation": "Vrai. En divisant par -2, le sens de l’inégalité s’inverse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la résolution de -2x>6 » dans une situation d'application ?",
                "answer": "x<-3",
                "wrongs": [
                  "x>3",
                  "x<-6",
                  "x> -3"
                ],
                "explanation": "En divisant par -2, le sens de l’inégalité s’inverse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’effet d’une division par un nombre négatif » ?",
                "answer": "le sens de l’inégalité s’inverse",
                "wrongs": [
                  "il reste toujours identique",
                  "l’inégalité devient une égalité",
                  "la variable disparaît"
                ],
                "explanation": "C’est une règle fondamentale des inéquations."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le sens de l’inégalité s’inverse » est correcte pour « l’effet d’une division par un nombre négatif ».",
                "answer": true,
                "explanation": "Vrai. C’est une règle fondamentale des inéquations."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’effet d’une division par un nombre négatif » dans une situation d'application ?",
                "answer": "le sens de l’inégalité s’inverse",
                "wrongs": [
                  "il reste toujours identique",
                  "l’inégalité devient une égalité",
                  "la variable disparaît"
                ],
                "explanation": "C’est une règle fondamentale des inéquations."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « les solutions d’un système de deux inéquations » ?",
                "answer": "l’intersection des deux ensembles de solutions",
                "wrongs": [
                  "leur réunion obligatoire",
                  "aucune valeur",
                  "le premier ensemble seulement"
                ],
                "explanation": "Une solution doit satisfaire simultanément les deux conditions."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’intersection des deux ensembles de solutions » est correcte pour « les solutions d’un système de deux inéquations ».",
                "answer": true,
                "explanation": "Vrai. Une solution doit satisfaire simultanément les deux conditions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « les solutions d’un système de deux inéquations » dans une situation d'application ?",
                "answer": "l’intersection des deux ensembles de solutions",
                "wrongs": [
                  "leur réunion obligatoire",
                  "aucune valeur",
                  "le premier ensemble seulement"
                ],
                "explanation": "Une solution doit satisfaire simultanément les deux conditions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’écriture de x≥2 sous forme d’intervalle » ?",
                "answer": "[2 ; +∞[",
                "wrongs": [
                  "]2 ; +∞[",
                  "]-∞ ; 2]",
                  "[-∞ ; 2]"
                ],
                "explanation": "2 est inclus car le signe est ≥."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « [2 ; +∞[ » est correcte pour « l’écriture de x≥2 sous forme d’intervalle ».",
                "answer": true,
                "explanation": "Vrai. 2 est inclus car le signe est ≥."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’écriture de x≥2 sous forme d’intervalle » dans une situation d'application ?",
                "answer": "[2 ; +∞[",
                "wrongs": [
                  "]2 ; +∞[",
                  "]-∞ ; 2]",
                  "[-∞ ; 2]"
                ],
                "explanation": "2 est inclus car le signe est ≥."
              }
            ]
          }
        ]
      },
      {
        "title": "Applications linéaires",
        "domain": "Activités numériques",
        "competency": "Maîtriser Applications linéaires et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Applications linéaires",
            "objectives": [
              "Définir et expliquer Applications linéaires.",
              "Identifier les propriétés et méthodes essentielles de Applications linéaires.",
              "Résoudre ou interpréter une situation liée à Applications linéaires.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une application linéaire de coefficient a associe à x le nombre ax; sa représentation graphique est une droite passant par l’origine.",
            "content": "# Applications linéaires\n\nUne application linéaire est de la forme f(x)=ax. Le nombre a est son coefficient. Sa représentation graphique est une droite passant par l’origine du repère.\n\n### Exemple\nf(x)=3x donne f(2)=6.\n\n### Proportionnalité\nElle traduit une situation de proportionnalité.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la forme d’une application linéaire » ?",
                "answer": "f(x)=ax",
                "wrongs": [
                  "f(x)=a+x",
                  "f(x)=x/a pour tout a",
                  "f(x)=a-x"
                ],
                "explanation": "Une application linéaire associe x à ax."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « f(x)=ax » est correcte pour « la forme d’une application linéaire ».",
                "answer": true,
                "explanation": "Vrai. Une application linéaire associe x à ax."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la forme d’une application linéaire » dans une situation d'application ?",
                "answer": "f(x)=ax",
                "wrongs": [
                  "f(x)=a+x",
                  "f(x)=x/a pour tout a",
                  "f(x)=a-x"
                ],
                "explanation": "Une application linéaire associe x à ax."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « f(2) pour f(x)=3x » ?",
                "answer": "6",
                "wrongs": [
                  "5",
                  "9",
                  "1"
                ],
                "explanation": "f(2)=3×2=6."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 6 » est correcte pour « f(2) pour f(x)=3x ».",
                "answer": true,
                "explanation": "Vrai. f(2)=3×2=6."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « f(2) pour f(x)=3x » dans une situation d'application ?",
                "answer": "6",
                "wrongs": [
                  "5",
                  "9",
                  "1"
                ],
                "explanation": "f(2)=3×2=6."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la représentation graphique d’une application linéaire » ?",
                "answer": "une droite passant par l’origine",
                "wrongs": [
                  "une parabole",
                  "une droite ne passant jamais par l’origine",
                  "un cercle"
                ],
                "explanation": "Le point (0,0) appartient à la représentation de f(x)=ax."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une droite passant par l’origine » est correcte pour « la représentation graphique d’une application linéaire ».",
                "answer": true,
                "explanation": "Vrai. Le point (0,0) appartient à la représentation de f(x)=ax."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la représentation graphique d’une application linéaire » dans une situation d'application ?",
                "answer": "une droite passant par l’origine",
                "wrongs": [
                  "une parabole",
                  "une droite ne passant jamais par l’origine",
                  "un cercle"
                ],
                "explanation": "Le point (0,0) appartient à la représentation de f(x)=ax."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le coefficient de f(x)=5x » ?",
                "answer": "5",
                "wrongs": [
                  "x",
                  "0",
                  "1/5"
                ],
                "explanation": "Le coefficient est le nombre qui multiplie x."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 5 » est correcte pour « le coefficient de f(x)=5x ».",
                "answer": true,
                "explanation": "Vrai. Le coefficient est le nombre qui multiplie x."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le coefficient de f(x)=5x » dans une situation d'application ?",
                "answer": "5",
                "wrongs": [
                  "x",
                  "0",
                  "1/5"
                ],
                "explanation": "Le coefficient est le nombre qui multiplie x."
              }
            ]
          }
        ]
      },
      {
        "title": "Statistique",
        "domain": "Activités numériques",
        "competency": "Maîtriser Statistique et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Statistique",
            "objectives": [
              "Définir et expliquer Statistique.",
              "Identifier les propriétés et méthodes essentielles de Statistique.",
              "Résoudre ou interpréter une situation liée à Statistique.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une série statistique se décrit par des effectifs, fréquences et représentations; la fréquence est le quotient de l’effectif par l’effectif total.",
            "content": "# Statistique\n\nOn organise une série statistique avec des valeurs, leurs effectifs et leurs fréquences. La fréquence d’une valeur est effectif/effectif total, souvent exprimée en pourcentage. Les diagrammes en bâtons permettent de représenter les effectifs ou fréquences.\n\n### Exemple\nPour 8 élèves dont 2 ont obtenu une valeur donnée, la fréquence est 2/8=25%.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la fréquence d’une valeur » ?",
                "answer": "effectif de la valeur / effectif total",
                "wrongs": [
                  "effectif total / effectif de la valeur",
                  "effectif + total",
                  "effectif × total"
                ],
                "explanation": "La fréquence mesure la part de la population correspondant à la valeur."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « effectif de la valeur / effectif total » est correcte pour « la fréquence d’une valeur ».",
                "answer": true,
                "explanation": "Vrai. La fréquence mesure la part de la population correspondant à la valeur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la fréquence d’une valeur » dans une situation d'application ?",
                "answer": "effectif de la valeur / effectif total",
                "wrongs": [
                  "effectif total / effectif de la valeur",
                  "effectif + total",
                  "effectif × total"
                ],
                "explanation": "La fréquence mesure la part de la population correspondant à la valeur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la fréquence de 2 élèves sur 8 » ?",
                "answer": "25 %",
                "wrongs": [
                  "20 %",
                  "16 %",
                  "40 %"
                ],
                "explanation": "2/8=0,25 soit 25%."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 25 % » est correcte pour « la fréquence de 2 élèves sur 8 ».",
                "answer": true,
                "explanation": "Vrai. 2/8=0,25 soit 25%."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la fréquence de 2 élèves sur 8 » dans une situation d'application ?",
                "answer": "25 %",
                "wrongs": [
                  "20 %",
                  "16 %",
                  "40 %"
                ],
                "explanation": "2/8=0,25 soit 25%."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un diagramme en bâtons » ?",
                "answer": "une représentation adaptée aux valeurs discrètes",
                "wrongs": [
                  "un calcul d’équation",
                  "une preuve géométrique",
                  "une unité de mesure"
                ],
                "explanation": "Les bâtons permettent de comparer visuellement les effectifs ou fréquences."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une représentation adaptée aux valeurs discrètes » est correcte pour « un diagramme en bâtons ».",
                "answer": true,
                "explanation": "Vrai. Les bâtons permettent de comparer visuellement les effectifs ou fréquences."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un diagramme en bâtons » dans une situation d'application ?",
                "answer": "une représentation adaptée aux valeurs discrètes",
                "wrongs": [
                  "un calcul d’équation",
                  "une preuve géométrique",
                  "une unité de mesure"
                ],
                "explanation": "Les bâtons permettent de comparer visuellement les effectifs ou fréquences."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la somme des fréquences d’une série complète » ?",
                "answer": "100 %",
                "wrongs": [
                  "10 %",
                  "50 %",
                  "200 %"
                ],
                "explanation": "Les fréquences représentent toute la population."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 100 % » est correcte pour « la somme des fréquences d’une série complète ».",
                "answer": true,
                "explanation": "Vrai. Les fréquences représentent toute la population."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la somme des fréquences d’une série complète » dans une situation d'application ?",
                "answer": "100 %",
                "wrongs": [
                  "10 %",
                  "50 %",
                  "200 %"
                ],
                "explanation": "Les fréquences représentent toute la population."
              }
            ]
          }
        ]
      },
      {
        "title": "Distance",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Distance et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Distance",
            "objectives": [
              "Définir et expliquer Distance.",
              "Identifier les propriétés et méthodes essentielles de Distance.",
              "Résoudre ou interpréter une situation liée à Distance.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Dans un plan, la distance entre deux points est la longueur du segment qui les relie; dans un repère, elle peut être calculée avec les coordonnées.",
            "content": "# Distance\n\nLa distance entre A et B est la longueur AB. Dans un repère orthonormal, si A(xA,yA) et B(xB,yB), alors AB²=(xB-xA)²+(yB-yA)².\n\n### Exemple\nA(0,0), B(3,4): AB²=9+16=25, donc AB=5.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la distance entre deux points » ?",
                "answer": "la longueur du segment qui les relie",
                "wrongs": [
                  "la somme de leurs coordonnées",
                  "leur différence de niveaux",
                  "le produit de leurs abscisses"
                ],
                "explanation": "La distance AB est la longueur du segment [AB]."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la longueur du segment qui les relie » est correcte pour « la distance entre deux points ».",
                "answer": true,
                "explanation": "Vrai. La distance AB est la longueur du segment [AB]."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la distance entre deux points » dans une situation d'application ?",
                "answer": "la longueur du segment qui les relie",
                "wrongs": [
                  "la somme de leurs coordonnées",
                  "leur différence de niveaux",
                  "le produit de leurs abscisses"
                ],
                "explanation": "La distance AB est la longueur du segment [AB]."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « AB pour A(0,0) et B(3,4) » ?",
                "answer": "5",
                "wrongs": [
                  "7",
                  "1",
                  "25"
                ],
                "explanation": "AB²=3²+4²=25, donc AB=5."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 5 » est correcte pour « AB pour A(0,0) et B(3,4) ».",
                "answer": true,
                "explanation": "Vrai. AB²=3²+4²=25, donc AB=5."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « AB pour A(0,0) et B(3,4) » dans une situation d'application ?",
                "answer": "5",
                "wrongs": [
                  "7",
                  "1",
                  "25"
                ],
                "explanation": "AB²=3²+4²=25, donc AB=5."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la formule de distance dans un repère orthonormal » ?",
                "answer": "AB²=(xB-xA)²+(yB-yA)²",
                "wrongs": [
                  "AB=xB-xA+yB-yA",
                  "AB²=(xB+xA)²+(yB+yA)²",
                  "AB²=xAyB"
                ],
                "explanation": "Elle découle du théorème de Pythagore."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « AB²=(xB-xA)²+(yB-yA)² » est correcte pour « la formule de distance dans un repère orthonormal ».",
                "answer": true,
                "explanation": "Vrai. Elle découle du théorème de Pythagore."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la formule de distance dans un repère orthonormal » dans une situation d'application ?",
                "answer": "AB²=(xB-xA)²+(yB-yA)²",
                "wrongs": [
                  "AB=xB-xA+yB-yA",
                  "AB²=(xB+xA)²+(yB+yA)²",
                  "AB²=xAyB"
                ],
                "explanation": "Elle découle du théorème de Pythagore."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la distance entre A(2,1) et B(2,5) » ?",
                "answer": "4",
                "wrongs": [
                  "3",
                  "6",
                  "8"
                ],
                "explanation": "Les points ont la même abscisse, donc AB=|5-1|=4."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 4 » est correcte pour « la distance entre A(2,1) et B(2,5) ».",
                "answer": true,
                "explanation": "Vrai. Les points ont la même abscisse, donc AB=|5-1|=4."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la distance entre A(2,1) et B(2,5) » dans une situation d'application ?",
                "answer": "4",
                "wrongs": [
                  "3",
                  "6",
                  "8"
                ],
                "explanation": "Les points ont la même abscisse, donc AB=|5-1|=4."
              }
            ]
          }
        ]
      },
      {
        "title": "Droites des milieux",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Droites des milieux et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Droites des milieux",
            "objectives": [
              "Définir et expliquer Droites des milieux.",
              "Identifier les propriétés et méthodes essentielles de Droites des milieux.",
              "Résoudre ou interpréter une situation liée à Droites des milieux.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Dans un triangle, le segment joignant les milieux de deux côtés est parallèle au troisième côté et mesure sa moitié.",
            "content": "# Droites des milieux\n\nSi I et J sont les milieux de deux côtés d’un triangle ABC, alors (IJ) est parallèle à (BC) et IJ=BC/2. La réciproque permet de reconnaître des milieux sous les conditions adaptées.\n\n### Exemple\nSi BC=10 cm, alors IJ=5 cm.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le théorème des milieux » ?",
                "answer": "le segment joignant deux milieux est parallèle au troisième côté",
                "wrongs": [
                  "il est perpendiculaire au troisième côté",
                  "il a toujours la même longueur que le troisième côté",
                  "il passe par un sommet"
                ],
                "explanation": "C’est le théorème des milieux dans un triangle."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le segment joignant deux milieux est parallèle au troisième côté » est correcte pour « le théorème des milieux ».",
                "answer": true,
                "explanation": "Vrai. C’est le théorème des milieux dans un triangle."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le théorème des milieux » dans une situation d'application ?",
                "answer": "le segment joignant deux milieux est parallèle au troisième côté",
                "wrongs": [
                  "il est perpendiculaire au troisième côté",
                  "il a toujours la même longueur que le troisième côté",
                  "il passe par un sommet"
                ],
                "explanation": "C’est le théorème des milieux dans un triangle."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « IJ si BC=10 cm » ?",
                "answer": "5 cm",
                "wrongs": [
                  "10 cm",
                  "20 cm",
                  "2 cm"
                ],
                "explanation": "IJ=BC/2."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 5 cm » est correcte pour « IJ si BC=10 cm ».",
                "answer": true,
                "explanation": "Vrai. IJ=BC/2."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « IJ si BC=10 cm » dans une situation d'application ?",
                "answer": "5 cm",
                "wrongs": [
                  "10 cm",
                  "20 cm",
                  "2 cm"
                ],
                "explanation": "IJ=BC/2."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la position de IJ par rapport à BC » ?",
                "answer": "IJ est parallèle à BC",
                "wrongs": [
                  "IJ est perpendiculaire à BC",
                  "IJ coupe BC en son milieu",
                  "IJ est confondue avec BC"
                ],
                "explanation": "Les milieux de deux côtés déterminent une droite parallèle au troisième côté."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « IJ est parallèle à BC » est correcte pour « la position de IJ par rapport à BC ».",
                "answer": true,
                "explanation": "Vrai. Les milieux de deux côtés déterminent une droite parallèle au troisième côté."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la position de IJ par rapport à BC » dans une situation d'application ?",
                "answer": "IJ est parallèle à BC",
                "wrongs": [
                  "IJ est perpendiculaire à BC",
                  "IJ coupe BC en son milieu",
                  "IJ est confondue avec BC"
                ],
                "explanation": "Les milieux de deux côtés déterminent une droite parallèle au troisième côté."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une condition permettant d’utiliser le théorème des milieux » ?",
                "answer": "I et J sont les milieux de deux côtés du même triangle",
                "wrongs": [
                  "I est seulement un sommet",
                  "J est extérieur sans condition",
                  "les trois points sont alignés"
                ],
                "explanation": "Les hypothèses portent sur les milieux de deux côtés."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « I et J sont les milieux de deux côtés du même triangle » est correcte pour « une condition permettant d’utiliser le théorème des milieux ».",
                "answer": true,
                "explanation": "Vrai. Les hypothèses portent sur les milieux de deux côtés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une condition permettant d’utiliser le théorème des milieux » dans une situation d'application ?",
                "answer": "I et J sont les milieux de deux côtés du même triangle",
                "wrongs": [
                  "I est seulement un sommet",
                  "J est extérieur sans condition",
                  "les trois points sont alignés"
                ],
                "explanation": "Les hypothèses portent sur les milieux de deux côtés."
              }
            ]
          }
        ]
      },
      {
        "title": "Droites remarquables dans un triangle",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Droites remarquables dans un triangle et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Droites remarquables dans un triangle",
            "objectives": [
              "Définir et expliquer Droites remarquables dans un triangle.",
              "Identifier les propriétés et méthodes essentielles de Droites remarquables dans un triangle.",
              "Résoudre ou interpréter une situation liée à Droites remarquables dans un triangle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les médiatrices, médianes, hauteurs et bissectrices sont des droites remarquables qui se coupent en des points caractéristiques.",
            "content": "# Droites remarquables dans un triangle\n\nLa médiatrice d’un côté est perpendiculaire à ce côté et passe par son milieu. Une médiane joint un sommet au milieu du côté opposé. Une hauteur passe par un sommet et est perpendiculaire au côté opposé. Une bissectrice partage un angle en deux angles égaux.\n\n### Points\nLes trois médianes se coupent au centre de gravité, les trois hauteurs à l’orthocentre, les trois médiatrices au centre du cercle circonscrit et les trois bissectrices au centre du cercle inscrit.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une médiane » ?",
                "answer": "une droite joignant un sommet au milieu du côté opposé",
                "wrongs": [
                  "une droite perpendiculaire à tout côté",
                  "une droite partageant toujours un angle",
                  "une droite passant par deux centres"
                ],
                "explanation": "C’est la définition d’une médiane."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une droite joignant un sommet au milieu du côté opposé » est correcte pour « une médiane ».",
                "answer": true,
                "explanation": "Vrai. C’est la définition d’une médiane."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une médiane » dans une situation d'application ?",
                "answer": "une droite joignant un sommet au milieu du côté opposé",
                "wrongs": [
                  "une droite perpendiculaire à tout côté",
                  "une droite partageant toujours un angle",
                  "une droite passant par deux centres"
                ],
                "explanation": "C’est la définition d’une médiane."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le point de concours des médianes » ?",
                "answer": "le centre de gravité",
                "wrongs": [
                  "l’orthocentre",
                  "le centre du cercle inscrit",
                  "le centre du cercle circonscrit"
                ],
                "explanation": "Les trois médianes sont concourantes au centre de gravité."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le centre de gravité » est correcte pour « le point de concours des médianes ».",
                "answer": true,
                "explanation": "Vrai. Les trois médianes sont concourantes au centre de gravité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le point de concours des médianes » dans une situation d'application ?",
                "answer": "le centre de gravité",
                "wrongs": [
                  "l’orthocentre",
                  "le centre du cercle inscrit",
                  "le centre du cercle circonscrit"
                ],
                "explanation": "Les trois médianes sont concourantes au centre de gravité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une hauteur » ?",
                "answer": "une droite passant par un sommet et perpendiculaire au côté opposé",
                "wrongs": [
                  "une droite parallèle au côté opposé",
                  "une médiane par définition",
                  "une bissectrice"
                ],
                "explanation": "La perpendicularité caractérise la hauteur."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une droite passant par un sommet et perpendiculaire au côté opposé » est correcte pour « une hauteur ».",
                "answer": true,
                "explanation": "Vrai. La perpendicularité caractérise la hauteur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une hauteur » dans une situation d'application ?",
                "answer": "une droite passant par un sommet et perpendiculaire au côté opposé",
                "wrongs": [
                  "une droite parallèle au côté opposé",
                  "une médiane par définition",
                  "une bissectrice"
                ],
                "explanation": "La perpendicularité caractérise la hauteur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le point équidistant des sommets d’un triangle » ?",
                "answer": "le centre du cercle circonscrit",
                "wrongs": [
                  "le centre de gravité",
                  "l’orthocentre",
                  "le centre du cercle inscrit"
                ],
                "explanation": "Le centre du cercle circonscrit est équidistant des trois sommets."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le centre du cercle circonscrit » est correcte pour « le point équidistant des sommets d’un triangle ».",
                "answer": true,
                "explanation": "Vrai. Le centre du cercle circonscrit est équidistant des trois sommets."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le point équidistant des sommets d’un triangle » dans une situation d'application ?",
                "answer": "le centre du cercle circonscrit",
                "wrongs": [
                  "le centre de gravité",
                  "l’orthocentre",
                  "le centre du cercle inscrit"
                ],
                "explanation": "Le centre du cercle circonscrit est équidistant des trois sommets."
              }
            ]
          }
        ]
      },
      {
        "title": "Triangle rectangle",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Triangle rectangle et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Triangle rectangle",
            "objectives": [
              "Définir et expliquer Triangle rectangle.",
              "Identifier les propriétés et méthodes essentielles de Triangle rectangle.",
              "Résoudre ou interpréter une situation liée à Triangle rectangle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Dans un triangle rectangle, le théorème de Pythagore relie les longueurs des côtés; sa réciproque permet de démontrer qu’un triangle est rectangle.",
            "content": "# Triangle rectangle\n\nSi ABC est rectangle en A, alors BC²=AB²+AC². La réciproque permet de conclure au triangle rectangle lorsqu’une égalité de Pythagore est vérifiée.\n\n### Exemple\n3²+4²=5², donc un triangle de côtés 3,4,5 est rectangle.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le côté opposé à l’angle droit » ?",
                "answer": "l’hypoténuse",
                "wrongs": [
                  "la médiane",
                  "la bissectrice",
                  "la hauteur"
                ],
                "explanation": "Dans un triangle rectangle, l’hypoténuse est le côté opposé à l’angle droit."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’hypoténuse » est correcte pour « le côté opposé à l’angle droit ».",
                "answer": true,
                "explanation": "Vrai. Dans un triangle rectangle, l’hypoténuse est le côté opposé à l’angle droit."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le côté opposé à l’angle droit » dans une situation d'application ?",
                "answer": "l’hypoténuse",
                "wrongs": [
                  "la médiane",
                  "la bissectrice",
                  "la hauteur"
                ],
                "explanation": "Dans un triangle rectangle, l’hypoténuse est le côté opposé à l’angle droit."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la relation de Pythagore pour un triangle rectangle en A » ?",
                "answer": "BC²=AB²+AC²",
                "wrongs": [
                  "AB²=BC²+AC²",
                  "AC=AB+BC",
                  "BC=AB²+AC²"
                ],
                "explanation": "BC est l’hypoténuse."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « BC²=AB²+AC² » est correcte pour « la relation de Pythagore pour un triangle rectangle en A ».",
                "answer": true,
                "explanation": "Vrai. BC est l’hypoténuse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la relation de Pythagore pour un triangle rectangle en A » dans une situation d'application ?",
                "answer": "BC²=AB²+AC²",
                "wrongs": [
                  "AB²=BC²+AC²",
                  "AC=AB+BC",
                  "BC=AB²+AC²"
                ],
                "explanation": "BC est l’hypoténuse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le calcul de l’hypoténuse avec 3 cm et 4 cm » ?",
                "answer": "5 cm",
                "wrongs": [
                  "7 cm",
                  "1 cm",
                  "12 cm"
                ],
                "explanation": "√(3²+4²)=√25=5."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 5 cm » est correcte pour « le calcul de l’hypoténuse avec 3 cm et 4 cm ».",
                "answer": true,
                "explanation": "Vrai. √(3²+4²)=√25=5."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le calcul de l’hypoténuse avec 3 cm et 4 cm » dans une situation d'application ?",
                "answer": "5 cm",
                "wrongs": [
                  "7 cm",
                  "1 cm",
                  "12 cm"
                ],
                "explanation": "√(3²+4²)=√25=5."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la réciproque de Pythagore » ?",
                "answer": "elle permet de démontrer qu’un triangle est rectangle",
                "wrongs": [
                  "elle calcule toujours une aire",
                  "elle prouve que tout triangle est équilatéral",
                  "elle donne seulement le périmètre"
                ],
                "explanation": "Elle utilise une égalité entre carrés de longueurs pour caractériser l’angle droit."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « elle permet de démontrer qu’un triangle est rectangle » est correcte pour « la réciproque de Pythagore ».",
                "answer": true,
                "explanation": "Vrai. Elle utilise une égalité entre carrés de longueurs pour caractériser l’angle droit."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la réciproque de Pythagore » dans une situation d'application ?",
                "answer": "elle permet de démontrer qu’un triangle est rectangle",
                "wrongs": [
                  "elle calcule toujours une aire",
                  "elle prouve que tout triangle est équilatéral",
                  "elle donne seulement le périmètre"
                ],
                "explanation": "Elle utilise une égalité entre carrés de longueurs pour caractériser l’angle droit."
              }
            ]
          }
        ]
      },
      {
        "title": "Translations et vecteurs",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Translations et vecteurs et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Translations et vecteurs",
            "objectives": [
              "Définir et expliquer Translations et vecteurs.",
              "Identifier les propriétés et méthodes essentielles de Translations et vecteurs.",
              "Résoudre ou interpréter une situation liée à Translations et vecteurs.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une translation déplace tous les points d’une même façon; elle est caractérisée par un vecteur et conserve longueurs, angles et parallélisme.",
            "content": "# Translations et vecteurs\n\nUne translation de vecteur u associe à chaque point A un point A’ tel que le vecteur AA’ soit égal à u. Une translation conserve les distances, les angles et le parallélisme.\n\n### Exemple\nUne translation de vecteur (2,-1) envoie (x,y) sur (x+2,y-1).",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la caractérisation d’une translation » ?",
                "answer": "AA’ est égal au vecteur de translation",
                "wrongs": [
                  "AA’ est toujours perpendiculaire au vecteur",
                  "A’=A pour toute translation",
                  "elle change les longueurs"
                ],
                "explanation": "Le vecteur définit le déplacement commun à tous les points."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « AA’ est égal au vecteur de translation » est correcte pour « la caractérisation d’une translation ».",
                "answer": true,
                "explanation": "Vrai. Le vecteur définit le déplacement commun à tous les points."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la caractérisation d’une translation » dans une situation d'application ?",
                "answer": "AA’ est égal au vecteur de translation",
                "wrongs": [
                  "AA’ est toujours perpendiculaire au vecteur",
                  "A’=A pour toute translation",
                  "elle change les longueurs"
                ],
                "explanation": "Le vecteur définit le déplacement commun à tous les points."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’image de (3,4) par le vecteur (2,-1) » ?",
                "answer": "(5,3)",
                "wrongs": [
                  "(1,5)",
                  "(5,5)",
                  "(3,2)"
                ],
                "explanation": "On ajoute les composantes du vecteur: (3+2,4-1)."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « (5,3) » est correcte pour « l’image de (3,4) par le vecteur (2,-1) ».",
                "answer": true,
                "explanation": "Vrai. On ajoute les composantes du vecteur: (3+2,4-1)."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’image de (3,4) par le vecteur (2,-1) » dans une situation d'application ?",
                "answer": "(5,3)",
                "wrongs": [
                  "(1,5)",
                  "(5,5)",
                  "(3,2)"
                ],
                "explanation": "On ajoute les composantes du vecteur: (3+2,4-1)."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une propriété conservée par translation » ?",
                "answer": "les longueurs",
                "wrongs": [
                  "la position absolue des points",
                  "les coordonnées initiales",
                  "l’origine du repère"
                ],
                "explanation": "Une translation est une isométrie: elle conserve les distances."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « les longueurs » est correcte pour « une propriété conservée par translation ».",
                "answer": true,
                "explanation": "Vrai. Une translation est une isométrie: elle conserve les distances."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une propriété conservée par translation » dans une situation d'application ?",
                "answer": "les longueurs",
                "wrongs": [
                  "la position absolue des points",
                  "les coordonnées initiales",
                  "l’origine du repère"
                ],
                "explanation": "Une translation est une isométrie: elle conserve les distances."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’effet d’une translation sur deux droites parallèles » ?",
                "answer": "elles restent parallèles",
                "wrongs": [
                  "elles deviennent toujours perpendiculaires",
                  "elles se confondent forcément",
                  "elles deviennent des cercles"
                ],
                "explanation": "Le parallélisme est conservé."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « elles restent parallèles » est correcte pour « l’effet d’une translation sur deux droites parallèles ».",
                "answer": true,
                "explanation": "Vrai. Le parallélisme est conservé."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’effet d’une translation sur deux droites parallèles » dans une situation d'application ?",
                "answer": "elles restent parallèles",
                "wrongs": [
                  "elles deviennent toujours perpendiculaires",
                  "elles se confondent forcément",
                  "elles deviennent des cercles"
                ],
                "explanation": "Le parallélisme est conservé."
              }
            ]
          }
        ]
      },
      {
        "title": "Projection orthogonale dans le plan",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Projection orthogonale dans le plan et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Projection orthogonale dans le plan",
            "objectives": [
              "Définir et expliquer Projection orthogonale dans le plan.",
              "Identifier les propriétés et méthodes essentielles de Projection orthogonale dans le plan.",
              "Résoudre ou interpréter une situation liée à Projection orthogonale dans le plan.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La projection orthogonale d’un point sur une droite est le pied de la perpendiculaire issue du point à cette droite.",
            "content": "# Projection orthogonale\n\nPour projeter orthogonalement A sur une droite d, on trace la perpendiculaire à d passant par A. Son intersection H avec d est le projeté orthogonal de A. AH est alors perpendiculaire à d.\n\n### À retenir\nLe pied de la perpendiculaire est unique.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le projeté orthogonal H de A sur d » ?",
                "answer": "le point d’intersection de d avec la perpendiculaire à d passant par A",
                "wrongs": [
                  "un point quelconque de d",
                  "le milieu de d",
                  "un point de la parallèle à d"
                ],
                "explanation": "C’est la définition de la projection orthogonale."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le point d’intersection de d avec la perpendiculaire à d passant par A » est correcte pour « le projeté orthogonal H de A sur d ».",
                "answer": true,
                "explanation": "Vrai. C’est la définition de la projection orthogonale."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le projeté orthogonal H de A sur d » dans une situation d'application ?",
                "answer": "le point d’intersection de d avec la perpendiculaire à d passant par A",
                "wrongs": [
                  "un point quelconque de d",
                  "le milieu de d",
                  "un point de la parallèle à d"
                ],
                "explanation": "C’est la définition de la projection orthogonale."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la relation entre AH et d » ?",
                "answer": "AH est perpendiculaire à d",
                "wrongs": [
                  "AH est parallèle à d",
                  "AH est confondue avec d",
                  "AH forme toujours 30° avec d"
                ],
                "explanation": "La projection orthogonale repose sur une perpendicularité."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « AH est perpendiculaire à d » est correcte pour « la relation entre AH et d ».",
                "answer": true,
                "explanation": "Vrai. La projection orthogonale repose sur une perpendicularité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la relation entre AH et d » dans une situation d'application ?",
                "answer": "AH est perpendiculaire à d",
                "wrongs": [
                  "AH est parallèle à d",
                  "AH est confondue avec d",
                  "AH forme toujours 30° avec d"
                ],
                "explanation": "La projection orthogonale repose sur une perpendicularité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le nombre de pieds de la perpendiculaire depuis un point à une droite » ?",
                "answer": "un seul",
                "wrongs": [
                  "deux toujours",
                  "trois",
                  "aucun"
                ],
                "explanation": "Par un point donné, il existe une unique perpendiculaire à une droite donnée."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un seul » est correcte pour « le nombre de pieds de la perpendiculaire depuis un point à une droite ».",
                "answer": true,
                "explanation": "Vrai. Par un point donné, il existe une unique perpendiculaire à une droite donnée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le nombre de pieds de la perpendiculaire depuis un point à une droite » dans une situation d'application ?",
                "answer": "un seul",
                "wrongs": [
                  "deux toujours",
                  "trois",
                  "aucun"
                ],
                "explanation": "Par un point donné, il existe une unique perpendiculaire à une droite donnée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la distance d’un point A à une droite d » ?",
                "answer": "la longueur du segment perpendiculaire AH",
                "wrongs": [
                  "la longueur d’une parallèle",
                  "la longueur d’un segment quelconque",
                  "le périmètre du triangle"
                ],
                "explanation": "La distance point-droite est la longueur du plus court segment, perpendiculaire à la droite."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la longueur du segment perpendiculaire AH » est correcte pour « la distance d’un point A à une droite d ».",
                "answer": true,
                "explanation": "Vrai. La distance point-droite est la longueur du plus court segment, perpendiculaire à la droite."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la distance d’un point A à une droite d » dans une situation d'application ?",
                "answer": "la longueur du segment perpendiculaire AH",
                "wrongs": [
                  "la longueur d’une parallèle",
                  "la longueur d’un segment quelconque",
                  "le périmètre du triangle"
                ],
                "explanation": "La distance point-droite est la longueur du plus court segment, perpendiculaire à la droite."
              }
            ]
          }
        ]
      },
      {
        "title": "Rotations – polygones réguliers",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Rotations – polygones réguliers et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Rotations – polygones réguliers",
            "objectives": [
              "Définir et expliquer Rotations – polygones réguliers.",
              "Identifier les propriétés et méthodes essentielles de Rotations – polygones réguliers.",
              "Résoudre ou interpréter une situation liée à Rotations – polygones réguliers.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une rotation de centre O et d’angle donné conserve les distances; un polygone régulier possède des côtés et des angles réguliers.",
            "content": "# Rotations et polygones réguliers\n\nUne rotation de centre O et d’angle θ envoie un point A sur A’ en conservant OA et en imposant l’angle AOA’=θ. Un polygone régulier a tous ses côtés et ses angles égaux.\n\n### Exemple\nUn carré est un polygone régulier à quatre côtés.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une propriété d’une rotation » ?",
                "answer": "elle conserve les distances au centre de rotation",
                "wrongs": [
                  "elle change toujours les longueurs",
                  "elle transforme tout segment en point",
                  "elle supprime les angles"
                ],
                "explanation": "OA=OA’ pour une rotation de centre O."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « elle conserve les distances au centre de rotation » est correcte pour « une propriété d’une rotation ».",
                "answer": true,
                "explanation": "Vrai. OA=OA’ pour une rotation de centre O."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une propriété d’une rotation » dans une situation d'application ?",
                "answer": "elle conserve les distances au centre de rotation",
                "wrongs": [
                  "elle change toujours les longueurs",
                  "elle transforme tout segment en point",
                  "elle supprime les angles"
                ],
                "explanation": "OA=OA’ pour une rotation de centre O."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un carré comme polygone régulier » ?",
                "answer": "il a quatre côtés de même longueur et quatre angles égaux",
                "wrongs": [
                  "un seul côté",
                  "des angles tous différents",
                  "des côtés tous différents"
                ],
                "explanation": "Le carré satisfait les propriétés d’un polygone régulier."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « il a quatre côtés de même longueur et quatre angles égaux » est correcte pour « un carré comme polygone régulier ».",
                "answer": true,
                "explanation": "Vrai. Le carré satisfait les propriétés d’un polygone régulier."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un carré comme polygone régulier » dans une situation d'application ?",
                "answer": "il a quatre côtés de même longueur et quatre angles égaux",
                "wrongs": [
                  "un seul côté",
                  "des angles tous différents",
                  "des côtés tous différents"
                ],
                "explanation": "Le carré satisfait les propriétés d’un polygone régulier."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une rotation de 90° autour de O » ?",
                "answer": "elle fait tourner chaque point d’un angle de 90° autour de O",
                "wrongs": [
                  "elle translate les points de 90 cm",
                  "elle réfléchit les points",
                  "elle change le centre"
                ],
                "explanation": "L’angle est la caractéristique de la rotation."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « elle fait tourner chaque point d’un angle de 90° autour de O » est correcte pour « une rotation de 90° autour de O ».",
                "answer": true,
                "explanation": "Vrai. L’angle est la caractéristique de la rotation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une rotation de 90° autour de O » dans une situation d'application ?",
                "answer": "elle fait tourner chaque point d’un angle de 90° autour de O",
                "wrongs": [
                  "elle translate les points de 90 cm",
                  "elle réfléchit les points",
                  "elle change le centre"
                ],
                "explanation": "L’angle est la caractéristique de la rotation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’image d’un cercle centré en O par une rotation de centre O » ?",
                "answer": "le même cercle",
                "wrongs": [
                  "un segment",
                  "un triangle",
                  "un point"
                ],
                "explanation": "Une rotation autour du centre du cercle laisse le cercle invariant."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le même cercle » est correcte pour « l’image d’un cercle centré en O par une rotation de centre O ».",
                "answer": true,
                "explanation": "Vrai. Une rotation autour du centre du cercle laisse le cercle invariant."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’image d’un cercle centré en O par une rotation de centre O » dans une situation d'application ?",
                "answer": "le même cercle",
                "wrongs": [
                  "un segment",
                  "un triangle",
                  "un point"
                ],
                "explanation": "Une rotation autour du centre du cercle laisse le cercle invariant."
              }
            ]
          }
        ]
      },
      {
        "title": "Géométrie dans l’espace",
        "domain": "Activités géométriques",
        "competency": "Maîtriser Géométrie dans l’espace et mobiliser ses propriétés dans des situations variées.",
        "lessons": [
          {
            "title": "Géométrie dans l’espace",
            "objectives": [
              "Définir et expliquer Géométrie dans l’espace.",
              "Identifier les propriétés et méthodes essentielles de Géométrie dans l’espace.",
              "Résoudre ou interpréter une situation liée à Géométrie dans l’espace.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les solides de l’espace se décrivent par faces, arêtes et sommets; les volumes utilisent des formules adaptées.",
            "content": "# Géométrie dans l’espace\n\nOn étudie des solides comme le pavé droit, le prisme, la pyramide, le cylindre ou la sphère. Un pavé droit de dimensions L,l,h a pour volume V=L×l×h.\n\n### Exemple\nUn pavé de 3 cm, 4 cm et 5 cm a un volume de 60 cm³.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le volume d’un pavé droit » ?",
                "answer": "V=L×l×h",
                "wrongs": [
                  "V=L+l+h",
                  "V=2(L+l+h)",
                  "V=L×l"
                ],
                "explanation": "Le volume est le produit des trois dimensions."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « V=L×l×h » est correcte pour « le volume d’un pavé droit ».",
                "answer": true,
                "explanation": "Vrai. Le volume est le produit des trois dimensions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le volume d’un pavé droit » dans une situation d'application ?",
                "answer": "V=L×l×h",
                "wrongs": [
                  "V=L+l+h",
                  "V=2(L+l+h)",
                  "V=L×l"
                ],
                "explanation": "Le volume est le produit des trois dimensions."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le volume d’un pavé 3×4×5 » ?",
                "answer": "60 cm³",
                "wrongs": [
                  "12 cm³",
                  "20 cm³",
                  "15 cm³"
                ],
                "explanation": "3×4×5=60."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « 60 cm³ » est correcte pour « le volume d’un pavé 3×4×5 ».",
                "answer": true,
                "explanation": "Vrai. 3×4×5=60."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le volume d’un pavé 3×4×5 » dans une situation d'application ?",
                "answer": "60 cm³",
                "wrongs": [
                  "12 cm³",
                  "20 cm³",
                  "15 cm³"
                ],
                "explanation": "3×4×5=60."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une arête d’un solide » ?",
                "answer": "un segment commun à deux faces",
                "wrongs": [
                  "un point unique",
                  "une surface entière",
                  "un angle"
                ],
                "explanation": "Les arêtes sont les segments de rencontre des faces."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un segment commun à deux faces » est correcte pour « une arête d’un solide ».",
                "answer": true,
                "explanation": "Vrai. Les arêtes sont les segments de rencontre des faces."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une arête d’un solide » dans une situation d'application ?",
                "answer": "un segment commun à deux faces",
                "wrongs": [
                  "un point unique",
                  "une surface entière",
                  "un angle"
                ],
                "explanation": "Les arêtes sont les segments de rencontre des faces."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un sommet d’un polyèdre » ?",
                "answer": "un point où se rencontrent plusieurs arêtes",
                "wrongs": [
                  "une face entière",
                  "un segment quelconque",
                  "une longueur"
                ],
                "explanation": "Les sommets sont les points de rencontre des arêtes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un point où se rencontrent plusieurs arêtes » est correcte pour « un sommet d’un polyèdre ».",
                "answer": true,
                "explanation": "Vrai. Les sommets sont les points de rencontre des arêtes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un sommet d’un polyèdre » dans une situation d'application ?",
                "answer": "un point où se rencontrent plusieurs arêtes",
                "wrongs": [
                  "une face entière",
                  "un segment quelconque",
                  "une longueur"
                ],
                "explanation": "Les sommets sont les points de rencontre des arêtes."
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
    "version": "4e-svt-adem-v1",
    "chapters": [
      {
        "title": "Les ressources naturelles et leur gestion durable",
        "domain": "Sciences de la vie",
        "competency": "Comprendre Les ressources naturelles et leur gestion durable, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Les ressources naturelles et leur gestion durable",
            "objectives": [
              "Définir et expliquer Les ressources naturelles et leur gestion durable.",
              "Identifier les propriétés et méthodes essentielles de Les ressources naturelles et leur gestion durable.",
              "Résoudre ou interpréter une situation liée à Les ressources naturelles et leur gestion durable.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les ressources naturelles sont diverses et leur exploitation doit tenir compte de leur renouvellement et de la préservation des milieux.",
            "content": "# Ressources naturelles et gestion durable\n\nLes ressources naturelles comprennent notamment l’eau, les sols, les ressources minières et énergétiques. Leur gestion durable cherche à satisfaire les besoins actuels sans compromettre les ressources futures. Au Sénégal, l’eau, les ressources halieutiques, les sols et certaines ressources minières sont des exemples pertinents.\n\n### Démarche\nIdentifier la ressource, son usage, ses limites et les mesures de gestion.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une ressource naturelle » ?",
                "answer": "une ressource provenant du milieu naturel et utilisable par l’être humain",
                "wrongs": [
                  "une ressource créée uniquement en laboratoire",
                  "un déchet industriel",
                  "un objet sans utilité"
                ],
                "explanation": "Les ressources naturelles proviennent des composantes du milieu."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une ressource provenant du milieu naturel et utilisable par l’être humain » est correcte pour « une ressource naturelle ».",
                "answer": true,
                "explanation": "Vrai. Les ressources naturelles proviennent des composantes du milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une ressource naturelle » dans une situation d'application ?",
                "answer": "une ressource provenant du milieu naturel et utilisable par l’être humain",
                "wrongs": [
                  "une ressource créée uniquement en laboratoire",
                  "un déchet industriel",
                  "un objet sans utilité"
                ],
                "explanation": "Les ressources naturelles proviennent des composantes du milieu."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une ressource énergétique renouvelable » ?",
                "answer": "le soleil",
                "wrongs": [
                  "le pétrole",
                  "le charbon",
                  "le gaz naturel"
                ],
                "explanation": "Le rayonnement solaire est une source renouvelable à l’échelle humaine."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le soleil » est correcte pour « une ressource énergétique renouvelable ».",
                "answer": true,
                "explanation": "Vrai. Le rayonnement solaire est une source renouvelable à l’échelle humaine."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une ressource énergétique renouvelable » dans une situation d'application ?",
                "answer": "le soleil",
                "wrongs": [
                  "le pétrole",
                  "le charbon",
                  "le gaz naturel"
                ],
                "explanation": "Le rayonnement solaire est une source renouvelable à l’échelle humaine."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la gestion durable » ?",
                "answer": "satisfaire les besoins présents tout en préservant les ressources futures",
                "wrongs": [
                  "exploiter sans limite",
                  "interdire toute utilisation",
                  "épuiser rapidement une ressource"
                ],
                "explanation": "La durabilité implique un équilibre entre usages et préservation."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « satisfaire les besoins présents tout en préservant les ressources futures » est correcte pour « la gestion durable ».",
                "answer": true,
                "explanation": "Vrai. La durabilité implique un équilibre entre usages et préservation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la gestion durable » dans une situation d'application ?",
                "answer": "satisfaire les besoins présents tout en préservant les ressources futures",
                "wrongs": [
                  "exploiter sans limite",
                  "interdire toute utilisation",
                  "épuiser rapidement une ressource"
                ],
                "explanation": "La durabilité implique un équilibre entre usages et préservation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une mesure de gestion des ressources halieutiques » ?",
                "answer": "respecter les périodes et tailles minimales de capture",
                "wrongs": [
                  "capturer tous les individus disponibles",
                  "détruire les zones de reproduction",
                  "augmenter sans limite l’effort de pêche"
                ],
                "explanation": "Les règles de pêche contribuent au renouvellement des stocks."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « respecter les périodes et tailles minimales de capture » est correcte pour « une mesure de gestion des ressources halieutiques ».",
                "answer": true,
                "explanation": "Vrai. Les règles de pêche contribuent au renouvellement des stocks."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une mesure de gestion des ressources halieutiques » dans une situation d'application ?",
                "answer": "respecter les périodes et tailles minimales de capture",
                "wrongs": [
                  "capturer tous les individus disponibles",
                  "détruire les zones de reproduction",
                  "augmenter sans limite l’effort de pêche"
                ],
                "explanation": "Les règles de pêche contribuent au renouvellement des stocks."
              }
            ]
          }
        ]
      },
      {
        "title": "Digestion et absorption intestinale chez l’espèce humaine",
        "domain": "Sciences de la vie",
        "competency": "Comprendre Digestion et absorption intestinale chez l’espèce humaine, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Digestion et absorption intestinale chez l’espèce humaine",
            "objectives": [
              "Définir et expliquer Digestion et absorption intestinale chez l’espèce humaine.",
              "Identifier les propriétés et méthodes essentielles de Digestion et absorption intestinale chez l’espèce humaine.",
              "Résoudre ou interpréter une situation liée à Digestion et absorption intestinale chez l’espèce humaine.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La digestion transforme les aliments en nutriments absorbables; l’intestin grêle est le principal siège de l’absorption.",
            "content": "# Digestion et absorption intestinale\n\nLa digestion transforme les aliments complexes en petites molécules grâce aux actions mécaniques et chimiques. Les enzymes digestives participent à cette transformation. Dans l’intestin grêle, les nutriments traversent la paroi et rejoignent principalement le sang ou la lymphe.\n\n### À retenir\nLes villosités intestinales augmentent la surface disponible pour les échanges.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la digestion » ?",
                "answer": "la transformation des aliments en nutriments absorbables",
                "wrongs": [
                  "le transport du sang",
                  "la respiration",
                  "la production de déchets seulement"
                ],
                "explanation": "La digestion rend les molécules alimentaires utilisables par l’organisme."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la transformation des aliments en nutriments absorbables » est correcte pour « la digestion ».",
                "answer": true,
                "explanation": "Vrai. La digestion rend les molécules alimentaires utilisables par l’organisme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la digestion » dans une situation d'application ?",
                "answer": "la transformation des aliments en nutriments absorbables",
                "wrongs": [
                  "le transport du sang",
                  "la respiration",
                  "la production de déchets seulement"
                ],
                "explanation": "La digestion rend les molécules alimentaires utilisables par l’organisme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le principal lieu de l’absorption des nutriments » ?",
                "answer": "l’intestin grêle",
                "wrongs": [
                  "la bouche",
                  "l’œsophage",
                  "le gros intestin"
                ],
                "explanation": "La paroi de l’intestin grêle est spécialisée dans l’absorption."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’intestin grêle » est correcte pour « le principal lieu de l’absorption des nutriments ».",
                "answer": true,
                "explanation": "Vrai. La paroi de l’intestin grêle est spécialisée dans l’absorption."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le principal lieu de l’absorption des nutriments » dans une situation d'application ?",
                "answer": "l’intestin grêle",
                "wrongs": [
                  "la bouche",
                  "l’œsophage",
                  "le gros intestin"
                ],
                "explanation": "La paroi de l’intestin grêle est spécialisée dans l’absorption."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des villosités intestinales » ?",
                "answer": "augmenter la surface d’échange",
                "wrongs": [
                  "produire les globules rouges",
                  "pomper l’air",
                  "stocker les aliments"
                ],
                "explanation": "Une grande surface facilite le passage des nutriments."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « augmenter la surface d’échange » est correcte pour « le rôle des villosités intestinales ».",
                "answer": true,
                "explanation": "Vrai. Une grande surface facilite le passage des nutriments."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des villosités intestinales » dans une situation d'application ?",
                "answer": "augmenter la surface d’échange",
                "wrongs": [
                  "produire les globules rouges",
                  "pomper l’air",
                  "stocker les aliments"
                ],
                "explanation": "Une grande surface facilite le passage des nutriments."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le produit de digestion des glucides comme l’amidon » ?",
                "answer": "des molécules simples comme le glucose",
                "wrongs": [
                  "des protéines intactes",
                  "de l’oxygène uniquement",
                  "des fibres uniquement"
                ],
                "explanation": "Les glucides complexes sont transformés en sucres simples absorbables."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « des molécules simples comme le glucose » est correcte pour « le produit de digestion des glucides comme l’amidon ».",
                "answer": true,
                "explanation": "Vrai. Les glucides complexes sont transformés en sucres simples absorbables."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le produit de digestion des glucides comme l’amidon » dans une situation d'application ?",
                "answer": "des molécules simples comme le glucose",
                "wrongs": [
                  "des protéines intactes",
                  "de l’oxygène uniquement",
                  "des fibres uniquement"
                ],
                "explanation": "Les glucides complexes sont transformés en sucres simples absorbables."
              }
            ]
          }
        ]
      },
      {
        "title": "Le sang : composition et maladies",
        "domain": "Sciences de la vie",
        "competency": "Comprendre Le sang : composition et maladies, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Le sang : composition et maladies",
            "objectives": [
              "Définir et expliquer Le sang : composition et maladies.",
              "Identifier les propriétés et méthodes essentielles de Le sang : composition et maladies.",
              "Résoudre ou interpréter une situation liée à Le sang : composition et maladies.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le sang comprend plasma et éléments figurés; certaines maladies affectent ses constituants ou son fonctionnement.",
            "content": "# Le sang\n\nLe sang est un tissu liquide composé de plasma, de globules rouges, de globules blancs et de plaquettes. Les globules rouges transportent principalement le dioxygène; les globules blancs participent à la défense de l’organisme; les plaquettes interviennent dans la coagulation.\n\n### Exemple\nUne anémie correspond notamment à une diminution de la capacité du sang à transporter l’oxygène, souvent liée à une baisse de l’hémoglobine.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la composition du sang » ?",
                "answer": "plasma, globules rouges, globules blancs et plaquettes",
                "wrongs": [
                  "uniquement des globules rouges",
                  "uniquement de l’eau",
                  "uniquement des cellules nerveuses"
                ],
                "explanation": "Le sang comprend une phase liquide et plusieurs éléments figurés."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « plasma, globules rouges, globules blancs et plaquettes » est correcte pour « la composition du sang ».",
                "answer": true,
                "explanation": "Vrai. Le sang comprend une phase liquide et plusieurs éléments figurés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la composition du sang » dans une situation d'application ?",
                "answer": "plasma, globules rouges, globules blancs et plaquettes",
                "wrongs": [
                  "uniquement des globules rouges",
                  "uniquement de l’eau",
                  "uniquement des cellules nerveuses"
                ],
                "explanation": "Le sang comprend une phase liquide et plusieurs éléments figurés."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle principal des globules rouges » ?",
                "answer": "transporter le dioxygène",
                "wrongs": [
                  "produire les hormones",
                  "digérer les aliments",
                  "former les os"
                ],
                "explanation": "L’hémoglobine des globules rouges permet le transport du dioxygène."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « transporter le dioxygène » est correcte pour « le rôle principal des globules rouges ».",
                "answer": true,
                "explanation": "Vrai. L’hémoglobine des globules rouges permet le transport du dioxygène."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle principal des globules rouges » dans une situation d'application ?",
                "answer": "transporter le dioxygène",
                "wrongs": [
                  "produire les hormones",
                  "digérer les aliments",
                  "former les os"
                ],
                "explanation": "L’hémoglobine des globules rouges permet le transport du dioxygène."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des globules blancs » ?",
                "answer": "participer aux défenses de l’organisme",
                "wrongs": [
                  "transporter uniquement le glucose",
                  "coaguler seuls",
                  "produire les dents"
                ],
                "explanation": "Ils interviennent dans les réponses immunitaires."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « participer aux défenses de l’organisme » est correcte pour « le rôle des globules blancs ».",
                "answer": true,
                "explanation": "Vrai. Ils interviennent dans les réponses immunitaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des globules blancs » dans une situation d'application ?",
                "answer": "participer aux défenses de l’organisme",
                "wrongs": [
                  "transporter uniquement le glucose",
                  "coaguler seuls",
                  "produire les dents"
                ],
                "explanation": "Ils interviennent dans les réponses immunitaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des plaquettes » ?",
                "answer": "participer à la coagulation",
                "wrongs": [
                  "transporter l’air",
                  "digérer les protéines",
                  "former les neurones"
                ],
                "explanation": "Les plaquettes interviennent dans l’arrêt des saignements."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « participer à la coagulation » est correcte pour « le rôle des plaquettes ».",
                "answer": true,
                "explanation": "Vrai. Les plaquettes interviennent dans l’arrêt des saignements."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des plaquettes » dans une situation d'application ?",
                "answer": "participer à la coagulation",
                "wrongs": [
                  "transporter l’air",
                  "digérer les protéines",
                  "former les neurones"
                ],
                "explanation": "Les plaquettes interviennent dans l’arrêt des saignements."
              }
            ]
          }
        ]
      },
      {
        "title": "La circulation et le rôle du sang",
        "domain": "Sciences de la vie",
        "competency": "Comprendre La circulation et le rôle du sang, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "La circulation et le rôle du sang",
            "objectives": [
              "Définir et expliquer La circulation et le rôle du sang.",
              "Identifier les propriétés et méthodes essentielles de La circulation et le rôle du sang.",
              "Résoudre ou interpréter une situation liée à La circulation et le rôle du sang.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le cœur met le sang en mouvement dans un réseau de vaisseaux; la circulation distribue dioxygène et nutriments et récupère des déchets.",
            "content": "# Circulation sanguine\n\nLe cœur fonctionne comme une pompe. Les artères conduisent le sang du cœur vers les organes et les veines le ramènent vers le cœur. Les échanges avec les tissus se font au niveau des capillaires.\n\n### À retenir\nLa circulation permet l’approvisionnement des cellules et l’évacuation de certains déchets.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle du cœur » ?",
                "answer": "mettre le sang en mouvement",
                "wrongs": [
                  "digérer les aliments",
                  "produire l’urine",
                  "filtrer l’air"
                ],
                "explanation": "Les contractions cardiaques propulsent le sang."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « mettre le sang en mouvement » est correcte pour « le rôle du cœur ».",
                "answer": true,
                "explanation": "Vrai. Les contractions cardiaques propulsent le sang."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle du cœur » dans une situation d'application ?",
                "answer": "mettre le sang en mouvement",
                "wrongs": [
                  "digérer les aliments",
                  "produire l’urine",
                  "filtrer l’air"
                ],
                "explanation": "Les contractions cardiaques propulsent le sang."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des artères » ?",
                "answer": "conduire le sang du cœur vers les organes",
                "wrongs": [
                  "toujours conduire le sang vers le cœur",
                  "produire les globules rouges",
                  "digérer les nutriments"
                ],
                "explanation": "Dans la circulation générale, les artères partent du cœur."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « conduire le sang du cœur vers les organes » est correcte pour « le rôle des artères ».",
                "answer": true,
                "explanation": "Vrai. Dans la circulation générale, les artères partent du cœur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des artères » dans une situation d'application ?",
                "answer": "conduire le sang du cœur vers les organes",
                "wrongs": [
                  "toujours conduire le sang vers le cœur",
                  "produire les globules rouges",
                  "digérer les nutriments"
                ],
                "explanation": "Dans la circulation générale, les artères partent du cœur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des veines » ?",
                "answer": "ramener le sang vers le cœur",
                "wrongs": [
                  "partir toujours du cœur",
                  "produire l’oxygène",
                  "former les os"
                ],
                "explanation": "Les veines conduisent le sang vers le cœur."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « ramener le sang vers le cœur » est correcte pour « le rôle des veines ».",
                "answer": true,
                "explanation": "Vrai. Les veines conduisent le sang vers le cœur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des veines » dans une situation d'application ?",
                "answer": "ramener le sang vers le cœur",
                "wrongs": [
                  "partir toujours du cœur",
                  "produire l’oxygène",
                  "former les os"
                ],
                "explanation": "Les veines conduisent le sang vers le cœur."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le lieu privilégié des échanges avec les tissus » ?",
                "answer": "les capillaires",
                "wrongs": [
                  "les grosses artères uniquement",
                  "les valves cardiaques",
                  "les os"
                ],
                "explanation": "Les capillaires ont des parois adaptées aux échanges."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « les capillaires » est correcte pour « le lieu privilégié des échanges avec les tissus ».",
                "answer": true,
                "explanation": "Vrai. Les capillaires ont des parois adaptées aux échanges."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le lieu privilégié des échanges avec les tissus » dans une situation d'application ?",
                "answer": "les capillaires",
                "wrongs": [
                  "les grosses artères uniquement",
                  "les valves cardiaques",
                  "les os"
                ],
                "explanation": "Les capillaires ont des parois adaptées aux échanges."
              }
            ]
          }
        ]
      },
      {
        "title": "Pression artérielle et maladies cardiovasculaires",
        "domain": "Sciences de la vie",
        "competency": "Comprendre Pression artérielle et maladies cardiovasculaires, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Pression artérielle et maladies cardiovasculaires",
            "objectives": [
              "Définir et expliquer Pression artérielle et maladies cardiovasculaires.",
              "Identifier les propriétés et méthodes essentielles de Pression artérielle et maladies cardiovasculaires.",
              "Résoudre ou interpréter une situation liée à Pression artérielle et maladies cardiovasculaires.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La pression artérielle varie avec l’activité et doit rester dans des limites compatibles avec le bon fonctionnement cardiovasculaire.",
            "content": "# Pression artérielle\n\nLa pression artérielle correspond à la pression exercée par le sang sur la paroi des artères. Elle varie notamment avec l’activité physique, le stress, l’âge et certains facteurs de santé. Une hypertension durable augmente le risque cardiovasculaire.\n\n### Prévention\nUne alimentation équilibrée, l’activité physique régulière et le suivi médical participent à la prévention.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la pression artérielle » ?",
                "answer": "la pression exercée par le sang sur les parois des artères",
                "wrongs": [
                  "la pression de l’air dans les poumons",
                  "la quantité de nourriture dans l’estomac",
                  "la température du sang"
                ],
                "explanation": "Elle caractérise la pression du sang dans les artères."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la pression exercée par le sang sur les parois des artères » est correcte pour « la pression artérielle ».",
                "answer": true,
                "explanation": "Vrai. Elle caractérise la pression du sang dans les artères."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la pression artérielle » dans une situation d'application ?",
                "answer": "la pression exercée par le sang sur les parois des artères",
                "wrongs": [
                  "la pression de l’air dans les poumons",
                  "la quantité de nourriture dans l’estomac",
                  "la température du sang"
                ],
                "explanation": "Elle caractérise la pression du sang dans les artères."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un facteur pouvant augmenter temporairement la pression artérielle » ?",
                "answer": "un effort physique",
                "wrongs": [
                  "le sommeil profond uniquement",
                  "l’absence totale d’activité",
                  "la lecture silencieuse obligatoirement"
                ],
                "explanation": "L’activité physique modifie temporairement les paramètres cardiovasculaires."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un effort physique » est correcte pour « un facteur pouvant augmenter temporairement la pression artérielle ».",
                "answer": true,
                "explanation": "Vrai. L’activité physique modifie temporairement les paramètres cardiovasculaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un facteur pouvant augmenter temporairement la pression artérielle » dans une situation d'application ?",
                "answer": "un effort physique",
                "wrongs": [
                  "le sommeil profond uniquement",
                  "l’absence totale d’activité",
                  "la lecture silencieuse obligatoirement"
                ],
                "explanation": "L’activité physique modifie temporairement les paramètres cardiovasculaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une conséquence possible d’une hypertension durable » ?",
                "answer": "un risque accru de maladies cardiovasculaires",
                "wrongs": [
                  "une amélioration automatique du cœur",
                  "la disparition des vaisseaux",
                  "une croissance des os"
                ],
                "explanation": "L’hypertension chronique est un facteur de risque cardiovasculaire."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un risque accru de maladies cardiovasculaires » est correcte pour « une conséquence possible d’une hypertension durable ».",
                "answer": true,
                "explanation": "Vrai. L’hypertension chronique est un facteur de risque cardiovasculaire."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une conséquence possible d’une hypertension durable » dans une situation d'application ?",
                "answer": "un risque accru de maladies cardiovasculaires",
                "wrongs": [
                  "une amélioration automatique du cœur",
                  "la disparition des vaisseaux",
                  "une croissance des os"
                ],
                "explanation": "L’hypertension chronique est un facteur de risque cardiovasculaire."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une mesure de prévention cardiovasculaire » ?",
                "answer": "pratiquer régulièrement une activité physique adaptée",
                "wrongs": [
                  "fumer davantage",
                  "supprimer toute activité",
                  "manger sans limite de sel"
                ],
                "explanation": "L’activité physique régulière contribue à la prévention."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « pratiquer régulièrement une activité physique adaptée » est correcte pour « une mesure de prévention cardiovasculaire ».",
                "answer": true,
                "explanation": "Vrai. L’activité physique régulière contribue à la prévention."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une mesure de prévention cardiovasculaire » dans une situation d'application ?",
                "answer": "pratiquer régulièrement une activité physique adaptée",
                "wrongs": [
                  "fumer davantage",
                  "supprimer toute activité",
                  "manger sans limite de sel"
                ],
                "explanation": "L’activité physique régulière contribue à la prévention."
              }
            ]
          }
        ]
      },
      {
        "title": "La puberté et le rôle des organes génitaux",
        "domain": "Sciences de la vie",
        "competency": "Comprendre La puberté et le rôle des organes génitaux, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "La puberté et le rôle des organes génitaux",
            "objectives": [
              "Définir et expliquer La puberté et le rôle des organes génitaux.",
              "Identifier les propriétés et méthodes essentielles de La puberté et le rôle des organes génitaux.",
              "Résoudre ou interpréter une situation liée à La puberté et le rôle des organes génitaux.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La puberté correspond à une période de transformations corporelles et fonctionnelles conduisant à la maturité sexuelle.",
            "content": "# Puberté\n\nÀ la puberté, des transformations physiques et physiologiques apparaissent sous l’action des hormones. Les organes reproducteurs acquièrent leur fonctionnement reproducteur.\n\n### Respect et santé\nLes transformations sont normales mais variables selon les individus; une information scientifique fiable aide à comprendre cette période.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la puberté » ?",
                "answer": "une période de transformations conduisant à la maturité sexuelle",
                "wrongs": [
                  "une maladie",
                  "une étape identique à tous les âges",
                  "une simple croissance des cheveux"
                ],
                "explanation": "La puberté comporte des transformations physiques et fonctionnelles."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une période de transformations conduisant à la maturité sexuelle » est correcte pour « la puberté ».",
                "answer": true,
                "explanation": "Vrai. La puberté comporte des transformations physiques et fonctionnelles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la puberté » dans une situation d'application ?",
                "answer": "une période de transformations conduisant à la maturité sexuelle",
                "wrongs": [
                  "une maladie",
                  "une étape identique à tous les âges",
                  "une simple croissance des cheveux"
                ],
                "explanation": "La puberté comporte des transformations physiques et fonctionnelles."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle des hormones à la puberté » ?",
                "answer": "déclencher et coordonner de nombreuses transformations",
                "wrongs": [
                  "digérer directement les aliments",
                  "remplacer le sang",
                  "former les os uniquement"
                ],
                "explanation": "Les hormones participent à la régulation des changements pubertaires."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « déclencher et coordonner de nombreuses transformations » est correcte pour « le rôle des hormones à la puberté ».",
                "answer": true,
                "explanation": "Vrai. Les hormones participent à la régulation des changements pubertaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle des hormones à la puberté » dans une situation d'application ?",
                "answer": "déclencher et coordonner de nombreuses transformations",
                "wrongs": [
                  "digérer directement les aliments",
                  "remplacer le sang",
                  "former les os uniquement"
                ],
                "explanation": "Les hormones participent à la régulation des changements pubertaires."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une transformation pubertaire chez les garçons » ?",
                "answer": "la production de spermatozoïdes débute",
                "wrongs": [
                  "les ovaires apparaissent",
                  "la menstruation commence",
                  "les poumons disparaissent"
                ],
                "explanation": "La maturation des organes reproducteurs permet le début de la production de spermatozoïdes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la production de spermatozoïdes débute » est correcte pour « une transformation pubertaire chez les garçons ».",
                "answer": true,
                "explanation": "Vrai. La maturation des organes reproducteurs permet le début de la production de spermatozoïdes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une transformation pubertaire chez les garçons » dans une situation d'application ?",
                "answer": "la production de spermatozoïdes débute",
                "wrongs": [
                  "les ovaires apparaissent",
                  "la menstruation commence",
                  "les poumons disparaissent"
                ],
                "explanation": "La maturation des organes reproducteurs permet le début de la production de spermatozoïdes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une transformation pubertaire chez les filles » ?",
                "answer": "le cycle menstruel peut commencer",
                "wrongs": [
                  "la production de spermatozoïdes",
                  "la disparition de l’utérus",
                  "l’arrêt de la croissance"
                ],
                "explanation": "La maturation reproductive permet l’installation du cycle menstruel."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le cycle menstruel peut commencer » est correcte pour « une transformation pubertaire chez les filles ».",
                "answer": true,
                "explanation": "Vrai. La maturation reproductive permet l’installation du cycle menstruel."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une transformation pubertaire chez les filles » dans une situation d'application ?",
                "answer": "le cycle menstruel peut commencer",
                "wrongs": [
                  "la production de spermatozoïdes",
                  "la disparition de l’utérus",
                  "l’arrêt de la croissance"
                ],
                "explanation": "La maturation reproductive permet l’installation du cycle menstruel."
              }
            ]
          }
        ]
      },
      {
        "title": "De la fécondation à la naissance",
        "domain": "Sciences de la vie",
        "competency": "Comprendre De la fécondation à la naissance, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "De la fécondation à la naissance",
            "objectives": [
              "Définir et expliquer De la fécondation à la naissance.",
              "Identifier les propriétés et méthodes essentielles de De la fécondation à la naissance.",
              "Résoudre ou interpréter une situation liée à De la fécondation à la naissance.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La fécondation résulte de la rencontre des gamètes; le développement de l’embryon puis du fœtus se déroule dans l’utérus.",
            "content": "# De la fécondation à la naissance\n\nLa fécondation correspond à la fusion d’un spermatozoïde et d’un ovule. Elle forme une cellule-œuf qui se divise et se développe. L’embryon puis le fœtus se développent dans l’utérus pendant la grossesse.\n\n### À retenir\nLe placenta permet des échanges entre la mère et le fœtus sans mélange direct de leurs sangs.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la fécondation » ?",
                "answer": "la fusion d’un spermatozoïde et d’un ovule",
                "wrongs": [
                  "la division d’une cellule musculaire",
                  "la respiration",
                  "la naissance"
                ],
                "explanation": "La fécondation réunit les deux gamètes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la fusion d’un spermatozoïde et d’un ovule » est correcte pour « la fécondation ».",
                "answer": true,
                "explanation": "Vrai. La fécondation réunit les deux gamètes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la fécondation » dans une situation d'application ?",
                "answer": "la fusion d’un spermatozoïde et d’un ovule",
                "wrongs": [
                  "la division d’une cellule musculaire",
                  "la respiration",
                  "la naissance"
                ],
                "explanation": "La fécondation réunit les deux gamètes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la cellule issue de la fécondation » ?",
                "answer": "la cellule-œuf",
                "wrongs": [
                  "un globule rouge",
                  "un neurone",
                  "une plaquette"
                ],
                "explanation": "La fusion des gamètes forme la cellule-œuf."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la cellule-œuf » est correcte pour « la cellule issue de la fécondation ».",
                "answer": true,
                "explanation": "Vrai. La fusion des gamètes forme la cellule-œuf."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la cellule issue de la fécondation » dans une situation d'application ?",
                "answer": "la cellule-œuf",
                "wrongs": [
                  "un globule rouge",
                  "un neurone",
                  "une plaquette"
                ],
                "explanation": "La fusion des gamètes forme la cellule-œuf."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le lieu du développement de l’embryon humain » ?",
                "answer": "l’utérus",
                "wrongs": [
                  "l’estomac",
                  "le poumon",
                  "le rein"
                ],
                "explanation": "L’embryon puis le fœtus se développent dans l’utérus."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’utérus » est correcte pour « le lieu du développement de l’embryon humain ».",
                "answer": true,
                "explanation": "Vrai. L’embryon puis le fœtus se développent dans l’utérus."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le lieu du développement de l’embryon humain » dans une situation d'application ?",
                "answer": "l’utérus",
                "wrongs": [
                  "l’estomac",
                  "le poumon",
                  "le rein"
                ],
                "explanation": "L’embryon puis le fœtus se développent dans l’utérus."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le rôle du placenta » ?",
                "answer": "permettre des échanges entre la mère et le fœtus",
                "wrongs": [
                  "produire les os de la mère",
                  "digérer les aliments de la mère",
                  "remplacer le cœur du fœtus"
                ],
                "explanation": "Le placenta participe aux échanges de dioxygène, nutriments et déchets."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « permettre des échanges entre la mère et le fœtus » est correcte pour « le rôle du placenta ».",
                "answer": true,
                "explanation": "Vrai. Le placenta participe aux échanges de dioxygène, nutriments et déchets."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le rôle du placenta » dans une situation d'application ?",
                "answer": "permettre des échanges entre la mère et le fœtus",
                "wrongs": [
                  "produire les os de la mère",
                  "digérer les aliments de la mère",
                  "remplacer le cœur du fœtus"
                ],
                "explanation": "Le placenta participe aux échanges de dioxygène, nutriments et déchets."
              }
            ]
          }
        ]
      },
      {
        "title": "Comment éviter la grossesse ?",
        "domain": "Sciences de la vie",
        "competency": "Comprendre Comment éviter la grossesse ?, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Comment éviter la grossesse ?",
            "objectives": [
              "Définir et expliquer Comment éviter la grossesse ?.",
              "Identifier les propriétés et méthodes essentielles de Comment éviter la grossesse ?.",
              "Résoudre ou interpréter une situation liée à Comment éviter la grossesse ?.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La prévention d’une grossesse repose sur des méthodes contraceptives dont l’efficacité dépend d’un usage correct et régulier.",
            "content": "# Prévention de la grossesse\n\nLa contraception vise à éviter une grossesse. Les méthodes comprennent notamment le préservatif, les méthodes hormonales et les dispositifs intra-utérins. Le préservatif présente aussi l’intérêt de contribuer à prévenir certaines IST.\n\n### Santé\nLe choix d’une méthode doit être éclairé et, lorsque nécessaire, accompagné par un professionnel de santé.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la contraception » ?",
                "answer": "un ensemble de méthodes visant à éviter une grossesse",
                "wrongs": [
                  "un traitement d’une fracture",
                  "une méthode pour augmenter la fécondité",
                  "une maladie"
                ],
                "explanation": "La contraception vise à prévenir la grossesse."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un ensemble de méthodes visant à éviter une grossesse » est correcte pour « la contraception ».",
                "answer": true,
                "explanation": "Vrai. La contraception vise à prévenir la grossesse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la contraception » dans une situation d'application ?",
                "answer": "un ensemble de méthodes visant à éviter une grossesse",
                "wrongs": [
                  "un traitement d’une fracture",
                  "une méthode pour augmenter la fécondité",
                  "une maladie"
                ],
                "explanation": "La contraception vise à prévenir la grossesse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un avantage spécifique du préservatif » ?",
                "answer": "il peut contribuer à prévenir certaines IST",
                "wrongs": [
                  "il protège contre toutes les maladies",
                  "il remplace tous les vaccins",
                  "il augmente toujours la fertilité"
                ],
                "explanation": "Le préservatif est une méthode contraceptive qui réduit aussi le risque de transmission de certaines IST."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « il peut contribuer à prévenir certaines IST » est correcte pour « un avantage spécifique du préservatif ».",
                "answer": true,
                "explanation": "Vrai. Le préservatif est une méthode contraceptive qui réduit aussi le risque de transmission de certaines IST."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un avantage spécifique du préservatif » dans une situation d'application ?",
                "answer": "il peut contribuer à prévenir certaines IST",
                "wrongs": [
                  "il protège contre toutes les maladies",
                  "il remplace tous les vaccins",
                  "il augmente toujours la fertilité"
                ],
                "explanation": "Le préservatif est une méthode contraceptive qui réduit aussi le risque de transmission de certaines IST."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une méthode hormonale » ?",
                "answer": "la pilule contraceptive",
                "wrongs": [
                  "le plâtre",
                  "le thermomètre",
                  "la radiographie"
                ],
                "explanation": "La pilule utilise des hormones pour prévenir la grossesse."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la pilule contraceptive » est correcte pour « une méthode hormonale ».",
                "answer": true,
                "explanation": "Vrai. La pilule utilise des hormones pour prévenir la grossesse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une méthode hormonale » dans une situation d'application ?",
                "answer": "la pilule contraceptive",
                "wrongs": [
                  "le plâtre",
                  "le thermomètre",
                  "la radiographie"
                ],
                "explanation": "La pilule utilise des hormones pour prévenir la grossesse."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une règle de prévention efficace » ?",
                "answer": "utiliser correctement et régulièrement la méthode choisie",
                "wrongs": [
                  "utiliser une méthode au hasard",
                  "ignorer les indications",
                  "partager un médicament"
                ],
                "explanation": "L’efficacité dépend notamment du respect du mode d’utilisation."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « utiliser correctement et régulièrement la méthode choisie » est correcte pour « une règle de prévention efficace ».",
                "answer": true,
                "explanation": "Vrai. L’efficacité dépend notamment du respect du mode d’utilisation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une règle de prévention efficace » dans une situation d'application ?",
                "answer": "utiliser correctement et régulièrement la méthode choisie",
                "wrongs": [
                  "utiliser une méthode au hasard",
                  "ignorer les indications",
                  "partager un médicament"
                ],
                "explanation": "L’efficacité dépend notamment du respect du mode d’utilisation."
              }
            ]
          }
        ]
      },
      {
        "title": "La transmission des caractères héréditaires",
        "domain": "Sciences de la vie",
        "competency": "Comprendre La transmission des caractères héréditaires, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "La transmission des caractères héréditaires",
            "objectives": [
              "Définir et expliquer La transmission des caractères héréditaires.",
              "Identifier les propriétés et méthodes essentielles de La transmission des caractères héréditaires.",
              "Résoudre ou interpréter une situation liée à La transmission des caractères héréditaires.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les caractères héréditaires sont liés à une information génétique portée par les chromosomes et transmise lors de la reproduction.",
            "content": "# Génétique\n\nLes caractères héréditaires sont des caractéristiques transmissibles. L’information génétique est portée par les chromosomes dans le noyau des cellules. Les individus d’une même espèce partagent un ensemble de caractéristiques mais présentent aussi des variations.\n\n### À retenir\nLe caryotype permet d’observer le nombre et l’organisation des chromosomes.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la localisation de l’information génétique » ?",
                "answer": "sur les chromosomes du noyau",
                "wrongs": [
                  "uniquement dans le sang",
                  "dans les os seulement",
                  "dans l’air"
                ],
                "explanation": "Les chromosomes portent l’information génétique dans le noyau des cellules."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « sur les chromosomes du noyau » est correcte pour « la localisation de l’information génétique ».",
                "answer": true,
                "explanation": "Vrai. Les chromosomes portent l’information génétique dans le noyau des cellules."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la localisation de l’information génétique » dans une situation d'application ?",
                "answer": "sur les chromosomes du noyau",
                "wrongs": [
                  "uniquement dans le sang",
                  "dans les os seulement",
                  "dans l’air"
                ],
                "explanation": "Les chromosomes portent l’information génétique dans le noyau des cellules."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un caractère héréditaire » ?",
                "answer": "une caractéristique pouvant être transmise des parents aux descendants",
                "wrongs": [
                  "une maladie toujours contagieuse",
                  "un événement météorologique",
                  "une habitude sans composante biologique"
                ],
                "explanation": "L’hérédité concerne la transmission de caractères biologiques."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une caractéristique pouvant être transmise des parents aux descendants » est correcte pour « un caractère héréditaire ».",
                "answer": true,
                "explanation": "Vrai. L’hérédité concerne la transmission de caractères biologiques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un caractère héréditaire » dans une situation d'application ?",
                "answer": "une caractéristique pouvant être transmise des parents aux descendants",
                "wrongs": [
                  "une maladie toujours contagieuse",
                  "un événement météorologique",
                  "une habitude sans composante biologique"
                ],
                "explanation": "L’hérédité concerne la transmission de caractères biologiques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le caryotype » ?",
                "answer": "une représentation ordonnée des chromosomes d’une cellule",
                "wrongs": [
                  "une photo du cœur",
                  "un tableau de fréquences",
                  "une radiographie des poumons"
                ],
                "explanation": "Le caryotype permet d’étudier le nombre et la morphologie des chromosomes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « une représentation ordonnée des chromosomes d’une cellule » est correcte pour « le caryotype ».",
                "answer": true,
                "explanation": "Vrai. Le caryotype permet d’étudier le nombre et la morphologie des chromosomes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le caryotype » dans une situation d'application ?",
                "answer": "une représentation ordonnée des chromosomes d’une cellule",
                "wrongs": [
                  "une photo du cœur",
                  "un tableau de fréquences",
                  "une radiographie des poumons"
                ],
                "explanation": "Le caryotype permet d’étudier le nombre et la morphologie des chromosomes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une cause de variation entre individus » ?",
                "answer": "la combinaison de caractères hérités et les variations génétiques",
                "wrongs": [
                  "le fait que tous les individus aient exactement le même génome",
                  "la météo uniquement",
                  "la couleur des vêtements"
                ],
                "explanation": "Les individus présentent des différences génétiques tout en appartenant à la même espèce."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la combinaison de caractères hérités et les variations génétiques » est correcte pour « une cause de variation entre individus ».",
                "answer": true,
                "explanation": "Vrai. Les individus présentent des différences génétiques tout en appartenant à la même espèce."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une cause de variation entre individus » dans une situation d'application ?",
                "answer": "la combinaison de caractères hérités et les variations génétiques",
                "wrongs": [
                  "le fait que tous les individus aient exactement le même génome",
                  "la météo uniquement",
                  "la couleur des vêtements"
                ],
                "explanation": "Les individus présentent des différences génétiques tout en appartenant à la même espèce."
              }
            ]
          }
        ]
      },
      {
        "title": "La contamination par les microorganismes",
        "domain": "Sciences de la vie",
        "competency": "Comprendre La contamination par les microorganismes, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "La contamination par les microorganismes",
            "objectives": [
              "Définir et expliquer La contamination par les microorganismes.",
              "Identifier les propriétés et méthodes essentielles de La contamination par les microorganismes.",
              "Résoudre ou interpréter une situation liée à La contamination par les microorganismes.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les microorganismes peuvent se transmettre par différentes voies et certains sont pathogènes; l’hygiène, l’asepsie et l’antisepsie réduisent les risques.",
            "content": "# Contamination par les microorganismes\n\nLes bactéries, virus, champignons microscopiques et certains parasites peuvent être responsables d’infections. La contamination correspond à l’entrée de microorganismes dans l’organisme. Des mesures comme le lavage des mains, l’asepsie et l’antisepsie limitent la transmission.\n\n### À retenir\nPrévenir la contamination nécessite d’identifier les voies de transmission et d’appliquer des mesures adaptées.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un microorganisme » ?",
                "answer": "un organisme ou agent biologique de très petite taille, souvent invisible à l’œil nu",
                "wrongs": [
                  "un organe humain",
                  "un minéral",
                  "un vêtement"
                ],
                "explanation": "Le terme regroupe des organismes microscopiques et, selon le contexte, des agents comme les virus."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un organisme ou agent biologique de très petite taille, souvent invisible à l’œil nu » est correcte pour « un microorganisme ».",
                "answer": true,
                "explanation": "Vrai. Le terme regroupe des organismes microscopiques et, selon le contexte, des agents comme les virus."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un microorganisme » dans une situation d'application ?",
                "answer": "un organisme ou agent biologique de très petite taille, souvent invisible à l’œil nu",
                "wrongs": [
                  "un organe humain",
                  "un minéral",
                  "un vêtement"
                ],
                "explanation": "Le terme regroupe des organismes microscopiques et, selon le contexte, des agents comme les virus."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la contamination » ?",
                "answer": "l’entrée de microorganismes dans l’organisme",
                "wrongs": [
                  "la guérison",
                  "la digestion",
                  "la croissance"
                ],
                "explanation": "La contamination précède éventuellement une infection."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’entrée de microorganismes dans l’organisme » est correcte pour « la contamination ».",
                "answer": true,
                "explanation": "Vrai. La contamination précède éventuellement une infection."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la contamination » dans une situation d'application ?",
                "answer": "l’entrée de microorganismes dans l’organisme",
                "wrongs": [
                  "la guérison",
                  "la digestion",
                  "la croissance"
                ],
                "explanation": "La contamination précède éventuellement une infection."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’asepsie » ?",
                "answer": "l’ensemble des mesures visant à empêcher l’introduction de microorganismes",
                "wrongs": [
                  "une méthode pour augmenter les microbes",
                  "un traitement nutritionnel",
                  "une mesure de croissance"
                ],
                "explanation": "L’asepsie cherche à éviter la contamination."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « l’ensemble des mesures visant à empêcher l’introduction de microorganismes » est correcte pour « l’asepsie ».",
                "answer": true,
                "explanation": "Vrai. L’asepsie cherche à éviter la contamination."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’asepsie » dans une situation d'application ?",
                "answer": "l’ensemble des mesures visant à empêcher l’introduction de microorganismes",
                "wrongs": [
                  "une méthode pour augmenter les microbes",
                  "un traitement nutritionnel",
                  "une mesure de croissance"
                ],
                "explanation": "L’asepsie cherche à éviter la contamination."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une mesure simple de prévention » ?",
                "answer": "se laver correctement les mains",
                "wrongs": [
                  "toucher une plaie avec des mains sales",
                  "partager des objets contaminés",
                  "ignorer les règles d’hygiène"
                ],
                "explanation": "L’hygiène des mains réduit la transmission de nombreux microorganismes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « se laver correctement les mains » est correcte pour « une mesure simple de prévention ».",
                "answer": true,
                "explanation": "Vrai. L’hygiène des mains réduit la transmission de nombreux microorganismes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une mesure simple de prévention » dans une situation d'application ?",
                "answer": "se laver correctement les mains",
                "wrongs": [
                  "toucher une plaie avec des mains sales",
                  "partager des objets contaminés",
                  "ignorer les règles d’hygiène"
                ],
                "explanation": "L’hygiène des mains réduit la transmission de nombreux microorganismes."
              }
            ]
          }
        ]
      },
      {
        "title": "Le volcanisme",
        "domain": "Sciences de la Terre",
        "competency": "Comprendre Le volcanisme, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Le volcanisme",
            "objectives": [
              "Définir et expliquer Le volcanisme.",
              "Identifier les propriétés et méthodes essentielles de Le volcanisme.",
              "Résoudre ou interpréter une situation liée à Le volcanisme.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le volcanisme correspond à la remontée et à l’émission de produits magmatiques; les éruptions présentent des manifestations différentes.",
            "content": "# Volcanisme\n\nLe magma peut remonter vers la surface et donner une activité volcanique. Une éruption peut émettre des laves, des gaz et des projections. Les caractéristiques d’une éruption dépendent notamment de la nature du magma et de sa viscosité.\n\n### Démarche\nObserver les produits et les manifestations pour caractériser l’activité volcanique.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le magma » ?",
                "answer": "un matériau rocheux en fusion présent en profondeur",
                "wrongs": [
                  "une roche toujours solide à la surface",
                  "un gaz atmosphérique",
                  "un sol"
                ],
                "explanation": "Le magma est un matériau en fusion situé sous la surface."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « un matériau rocheux en fusion présent en profondeur » est correcte pour « le magma ».",
                "answer": true,
                "explanation": "Vrai. Le magma est un matériau en fusion situé sous la surface."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le magma » dans une situation d'application ?",
                "answer": "un matériau rocheux en fusion présent en profondeur",
                "wrongs": [
                  "une roche toujours solide à la surface",
                  "un gaz atmosphérique",
                  "un sol"
                ],
                "explanation": "Le magma est un matériau en fusion situé sous la surface."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un produit volcanique » ?",
                "answer": "la lave",
                "wrongs": [
                  "le sang",
                  "le bois",
                  "le sable uniquement"
                ],
                "explanation": "La lave est le magma émis à la surface après dégazage partiel."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la lave » est correcte pour « un produit volcanique ».",
                "answer": true,
                "explanation": "Vrai. La lave est le magma émis à la surface après dégazage partiel."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un produit volcanique » dans une situation d'application ?",
                "answer": "la lave",
                "wrongs": [
                  "le sang",
                  "le bois",
                  "le sable uniquement"
                ],
                "explanation": "La lave est le magma émis à la surface après dégazage partiel."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un gaz volcanique » ?",
                "answer": "la vapeur d’eau",
                "wrongs": [
                  "le dioxygène uniquement",
                  "l’azote uniquement",
                  "le glucose"
                ],
                "explanation": "La vapeur d’eau fait partie des gaz fréquemment émis par les volcans."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la vapeur d’eau » est correcte pour « un gaz volcanique ».",
                "answer": true,
                "explanation": "Vrai. La vapeur d’eau fait partie des gaz fréquemment émis par les volcans."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un gaz volcanique » dans une situation d'application ?",
                "answer": "la vapeur d’eau",
                "wrongs": [
                  "le dioxygène uniquement",
                  "l’azote uniquement",
                  "le glucose"
                ],
                "explanation": "La vapeur d’eau fait partie des gaz fréquemment émis par les volcans."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « un facteur influençant le style éruptif » ?",
                "answer": "la viscosité du magma",
                "wrongs": [
                  "la couleur du ciel",
                  "la taille des océans",
                  "le nombre de continents"
                ],
                "explanation": "La viscosité influence la facilité d’écoulement et de dégazage du magma."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la viscosité du magma » est correcte pour « un facteur influençant le style éruptif ».",
                "answer": true,
                "explanation": "Vrai. La viscosité influence la facilité d’écoulement et de dégazage du magma."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « un facteur influençant le style éruptif » dans une situation d'application ?",
                "answer": "la viscosité du magma",
                "wrongs": [
                  "la couleur du ciel",
                  "la taille des océans",
                  "le nombre de continents"
                ],
                "explanation": "La viscosité influence la facilité d’écoulement et de dégazage du magma."
              }
            ]
          }
        ]
      },
      {
        "title": "La formation des roches magmatiques",
        "domain": "Sciences de la Terre",
        "competency": "Comprendre La formation des roches magmatiques, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "La formation des roches magmatiques",
            "objectives": [
              "Définir et expliquer La formation des roches magmatiques.",
              "Identifier les propriétés et méthodes essentielles de La formation des roches magmatiques.",
              "Résoudre ou interpréter une situation liée à La formation des roches magmatiques.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les roches magmatiques se forment par refroidissement et solidification d’un magma, en profondeur ou à la surface.",
            "content": "# Roches magmatiques\n\nUne roche magmatique se forme lorsque le magma se refroidit et se solidifie. En profondeur, le refroidissement lent favorise la formation de cristaux visibles; à la surface, le refroidissement plus rapide peut produire une texture différente.\n\n### Exemples\nLe granite est une roche magmatique plutonique; le basalte est une roche volcanique.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « la formation d’une roche magmatique » ?",
                "answer": "le refroidissement et la solidification d’un magma",
                "wrongs": [
                  "la digestion",
                  "la combustion du bois",
                  "l’évaporation de l’eau seulement"
                ],
                "explanation": "Les roches magmatiques proviennent de la solidification d’un magma."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le refroidissement et la solidification d’un magma » est correcte pour « la formation d’une roche magmatique ».",
                "answer": true,
                "explanation": "Vrai. Les roches magmatiques proviennent de la solidification d’un magma."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « la formation d’une roche magmatique » dans une situation d'application ?",
                "answer": "le refroidissement et la solidification d’un magma",
                "wrongs": [
                  "la digestion",
                  "la combustion du bois",
                  "l’évaporation de l’eau seulement"
                ],
                "explanation": "Les roches magmatiques proviennent de la solidification d’un magma."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une roche magmatique plutonique » ?",
                "answer": "le granite",
                "wrongs": [
                  "le calcaire",
                  "le charbon",
                  "l’argile"
                ],
                "explanation": "Le granite se forme en profondeur à partir d’un magma qui refroidit lentement."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le granite » est correcte pour « une roche magmatique plutonique ».",
                "answer": true,
                "explanation": "Vrai. Le granite se forme en profondeur à partir d’un magma qui refroidit lentement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une roche magmatique plutonique » dans une situation d'application ?",
                "answer": "le granite",
                "wrongs": [
                  "le calcaire",
                  "le charbon",
                  "l’argile"
                ],
                "explanation": "Le granite se forme en profondeur à partir d’un magma qui refroidit lentement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « une roche volcanique » ?",
                "answer": "le basalte",
                "wrongs": [
                  "le granite",
                  "le marbre",
                  "le grès"
                ],
                "explanation": "Le basalte se forme à partir de lave refroidie en surface."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le basalte » est correcte pour « une roche volcanique ».",
                "answer": true,
                "explanation": "Vrai. Le basalte se forme à partir de lave refroidie en surface."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « une roche volcanique » dans une situation d'application ?",
                "answer": "le basalte",
                "wrongs": [
                  "le granite",
                  "le marbre",
                  "le grès"
                ],
                "explanation": "Le basalte se forme à partir de lave refroidie en surface."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’effet d’un refroidissement lent en profondeur » ?",
                "answer": "il favorise la croissance de cristaux visibles",
                "wrongs": [
                  "il empêche toute cristallisation",
                  "il transforme la roche en eau",
                  "il produit uniquement du gaz"
                ],
                "explanation": "Le temps disponible favorise la croissance des cristaux."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « il favorise la croissance de cristaux visibles » est correcte pour « l’effet d’un refroidissement lent en profondeur ».",
                "answer": true,
                "explanation": "Vrai. Le temps disponible favorise la croissance des cristaux."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’effet d’un refroidissement lent en profondeur » dans une situation d'application ?",
                "answer": "il favorise la croissance de cristaux visibles",
                "wrongs": [
                  "il empêche toute cristallisation",
                  "il transforme la roche en eau",
                  "il produit uniquement du gaz"
                ],
                "explanation": "Le temps disponible favorise la croissance des cristaux."
              }
            ]
          }
        ]
      },
      {
        "title": "Les séismes et la structure du globe terrestre",
        "domain": "Sciences de la Terre",
        "competency": "Comprendre Les séismes et la structure du globe terrestre, exploiter des documents et raisonner scientifiquement.",
        "lessons": [
          {
            "title": "Les séismes et la structure du globe terrestre",
            "objectives": [
              "Définir et expliquer Les séismes et la structure du globe terrestre.",
              "Identifier les propriétés et méthodes essentielles de Les séismes et la structure du globe terrestre.",
              "Résoudre ou interpréter une situation liée à Les séismes et la structure du globe terrestre.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les séismes résultent de ruptures brutales dans les roches et produisent des ondes; leur étude renseigne sur la structure interne de la Terre.",
            "content": "# Séismes et structure du globe\n\nUn séisme correspond à une libération brutale d’énergie liée à une rupture de roches, souvent le long d’une faille. L’énergie se propage sous forme d’ondes sismiques. L’étude de leur propagation permet d’inférer la structure interne du globe.\n\n### À retenir\nLe foyer est le lieu de rupture en profondeur; l’épicentre est le point de la surface situé à la verticale du foyer.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « le foyer d’un séisme » ?",
                "answer": "le lieu en profondeur où se produit la rupture",
                "wrongs": [
                  "le point le plus éloigné du séisme",
                  "un volcan",
                  "une station météo"
                ],
                "explanation": "Le foyer est la zone de rupture à l’origine des ondes sismiques."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le lieu en profondeur où se produit la rupture » est correcte pour « le foyer d’un séisme ».",
                "answer": true,
                "explanation": "Vrai. Le foyer est la zone de rupture à l’origine des ondes sismiques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « le foyer d’un séisme » dans une situation d'application ?",
                "answer": "le lieu en profondeur où se produit la rupture",
                "wrongs": [
                  "le point le plus éloigné du séisme",
                  "un volcan",
                  "une station météo"
                ],
                "explanation": "Le foyer est la zone de rupture à l’origine des ondes sismiques."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « l’épicentre » ?",
                "answer": "le point de la surface situé à la verticale du foyer",
                "wrongs": [
                  "le centre de la Terre",
                  "un point quelconque de l’océan",
                  "le noyau"
                ],
                "explanation": "L’épicentre se situe à la surface, au-dessus du foyer."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « le point de la surface situé à la verticale du foyer » est correcte pour « l’épicentre ».",
                "answer": true,
                "explanation": "Vrai. L’épicentre se situe à la surface, au-dessus du foyer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « l’épicentre » dans une situation d'application ?",
                "answer": "le point de la surface situé à la verticale du foyer",
                "wrongs": [
                  "le centre de la Terre",
                  "un point quelconque de l’océan",
                  "le noyau"
                ],
                "explanation": "L’épicentre se situe à la surface, au-dessus du foyer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « les ondes sismiques » ?",
                "answer": "elles transportent l’énergie libérée par le séisme",
                "wrongs": [
                  "elles transportent uniquement de la lumière",
                  "elles forment les continents",
                  "elles arrêtent la rotation terrestre"
                ],
                "explanation": "Les ondes se propagent depuis la source et permettent d’enregistrer le séisme."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « elles transportent l’énergie libérée par le séisme » est correcte pour « les ondes sismiques ».",
                "answer": true,
                "explanation": "Vrai. Les ondes se propagent depuis la source et permettent d’enregistrer le séisme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « les ondes sismiques » dans une situation d'application ?",
                "answer": "elles transportent l’énergie libérée par le séisme",
                "wrongs": [
                  "elles transportent uniquement de la lumière",
                  "elles forment les continents",
                  "elles arrêtent la rotation terrestre"
                ],
                "explanation": "Les ondes se propagent depuis la source et permettent d’enregistrer le séisme."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « ce que l’étude des ondes sismiques permet d’inférer » ?",
                "answer": "la structure interne de la Terre",
                "wrongs": [
                  "la composition de tous les océans uniquement",
                  "la météo de demain",
                  "la couleur des roches en surface uniquement"
                ],
                "explanation": "Les changements de vitesse et de trajectoire des ondes renseignent sur les structures internes."
              },
              {
                "kind": "tf",
                "prompt": "L'affirmation « la structure interne de la Terre » est correcte pour « ce que l’étude des ondes sismiques permet d’inférer ».",
                "answer": true,
                "explanation": "Vrai. Les changements de vitesse et de trajectoire des ondes renseignent sur les structures internes."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse faut-il retenir pour « ce que l’étude des ondes sismiques permet d’inférer » dans une situation d'application ?",
                "answer": "la structure interne de la Terre",
                "wrongs": [
                  "la composition de tous les océans uniquement",
                  "la météo de demain",
                  "la couleur des roches en surface uniquement"
                ],
                "explanation": "Les changements de vitesse et de trajectoire des ondes renseignent sur les structures internes."
              }
            ]
          }
        ]
      }
    ]
  }
];
function toQuestion(q:RawQuestion,index:number){if(q.kind==="tf"){const answer=Boolean(q.answer);return{type:"true_false" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[{label:"Vrai",is_correct:answer,order:1},{label:"Faux",is_correct:!answer,order:2}]};}const wrongs=q.wrongs??[];return{type:"single_choice" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[String(q.answer),...wrongs].map((label,i)=>({label,is_correct:i===0,order:i+1}))};}
async function getCycle(){const {data,error}=await supabase.from("school_cycles").select("*").eq("code","moyen").maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_cycles").insert({code:"moyen",name:"Moyen",order:2}).select().single();if(r.error)throw r.error;return r.data;}
async function getLevel(cycleId:string){const {data,error}=await supabase.from("school_levels").select("*").eq("cycle_id",cycleId).in("code",["4e","4eme","4ème"]).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_levels").insert({cycle_id:cycleId,code:"4e",name:"4e",order:3}).select().single();if(r.error)throw r.error;return r.data;}
async function getSubject(name:string){const aliases:Record<string,string[]>= {"Mathématiques":["maths","mathematiques","mathématiques"],"SVT":["svt"]};const codes=aliases[name]??[name.toLowerCase()];const {data,error}=await supabase.from("subjects").select("*").in("code",codes).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("subjects").insert({code:codes[0],name,icon:name==="Mathématiques"?"Calculator":"Leaf"}).select().single();if(r.error)throw r.error;return r.data;}
async function ensureLevelSubject(levelId:string,subjectId:string){const {data,error}=await supabase.from("level_subjects").select("id").eq("level_id",levelId).eq("subject_id",subjectId).is("series_id",null).maybeSingle();if(error)throw error;if(!data){const r=await supabase.from("level_subjects").insert({level_id:levelId,subject_id:subjectId,series_id:null,is_optional:false});if(r.error)throw r.error;}}
async function getCurriculum(levelId:string,subjectId:string,p:RawProgram){const title=`${p.subject} 4e – Programme sénégalais`;const {data,error}=await supabase.from("curriculums").select("*").eq("level_id",levelId).eq("subject_id",subjectId).eq("title",title).eq("version",p.version).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("curriculums").insert({level_id:levelId,series_id:null,subject_id:subjectId,title,description:`Progression 4e de ${p.subject}, structurée à partir de ressources pédagogiques sénégalaises. Contenu original EdTech Sénégal.`,version:p.version,status:STATUS,source:"Ressources pédagogiques sénégalaises — cadrage institutionnel; rédaction originale EdTech Sénégal.",source_url:p.source||PROMET_URL,source_document:"Cadrage à partir des ressources ADEM/PROMET; ne pas présenter comme reproduction intégrale du référentiel officiel.",is_demo:false,validated:false,published_at:STATUS==="published"?new Date().toISOString():null}).select().single();if(r.error)throw r.error;return r.data;}
async function getDomain(curriculumId:string,name:string,order:number){const {data,error}=await supabase.from("domains").select("*").eq("curriculum_id",curriculumId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("domains").insert({curriculum_id:curriculumId,name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getCompetency(domainId:string,name:string,order:number){const {data,error}=await supabase.from("competencies").select("*").eq("domain_id",domainId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("competencies").insert({domain_id:domainId,name,description:name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getChapter(curriculumId:string,domainId:string,c:RawChapter,order:number){const {data,error}=await supabase.from("chapters").select("*").eq("curriculum_id",curriculumId).eq("title",c.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("chapters").insert({curriculum_id:curriculumId,domain_id:domainId,title:c.title,order,status:STATUS,source:"Ressources sénégalaises; structuration originale EdTech Sénégal.",source_url:PROMET_URL}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getLesson(chapterId:string,competencyId:string,l:RawLesson,order:number,sourceUrl:string){const {data,error}=await supabase.from("lessons").select("*").eq("chapter_id",chapterId).eq("title",l.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("lessons").insert({chapter_id:chapterId,competency_id:competencyId,title:l.title,content_md:l.content,objectives:l.objectives,summary:l.summary,order,status:STATUS,source:"Contenu original EdTech Sénégal, structuré à partir de ressources pédagogiques sénégalaises.",source_url:sourceUrl}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getExercise(lessonId:string,competencyId:string,title:string,instructions:string,difficulty:"easy"|"medium"|"hard",score:number){const {data,error}=await supabase.from("exercises").select("*").eq("lesson_id",lessonId).eq("title",title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("exercises").insert({lesson_id:lessonId,competency_id:competencyId,title,instructions,difficulty,difficulty_score:score,status:STATUS}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function addQuestion(exerciseId:string,competencyId:string,chapterId:string,q:ReturnType<typeof toQuestion>){const {data,error}=await supabase.from("questions").select("id").eq("exercise_id",exerciseId).eq("prompt",q.prompt).is("deleted_at",null).maybeSingle();if(error)throw error;let questionId:string;if(data?.id){questionId=data.id;}else{const r=await supabase.from("questions").insert({exercise_id:exerciseId,competency_id:competencyId,chapter_id:chapterId,type:q.type,prompt:q.prompt,explanation:q.explanation,points:q.points,difficulty_score:q.difficulty_score,status:STATUS}).select("id").single();if(r.error)throw r.error;questionId=r.data.id;}const {data:existing,error:readErr}=await supabase.from("question_options").select("id,label,is_correct,order").eq("question_id",questionId);if(readErr)throw readErr;const expected=q.options.length, correct=q.options.filter(x=>x.is_correct).length, actualCorrect=(existing??[]).filter(x=>x.is_correct).length;if((existing??[]).length!==expected||actualCorrect!==correct){if((existing??[]).length){const d=await supabase.from("question_options").delete().eq("question_id",questionId);if(d.error)throw d.error;}const ins=await supabase.from("question_options").insert(q.options.map(o=>({...o,question_id:questionId})));if(ins.error)throw ins.error;}return!data?.id;}
async function runProgram(levelId:string,p:RawProgram){const subject=await getSubject(p.subject);await ensureLevelSubject(levelId,subject.id);const curriculum=await getCurriculum(levelId,subject.id,p);const stats={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(let ci=0;ci<p.chapters.length;ci++){const c=p.chapters[ci];if(!c)throw new Error(`[${p.subject}] Chapitre ${ci+1} introuvable.`);const domain=await getDomain(curriculum.id,c.domain,ci+1);const comp=await getCompetency(domain.id,c.competency,1);const chapter=await getChapter(curriculum.id,domain.id,c,ci+1);for(let li=0;li<c.lessons.length;li++){const l=c.lessons[li];if(!l)throw new Error(`[${p.subject}] Leçon ${ci+1}.${li+1} introuvable.`);if(l.questions.length<12)throw new Error(`[${p.subject}] ${l.title}: ${l.questions.length} questions, 12 attendues.`);const lesson=await getLesson(chapter.data.id,comp.id,l,li+1,p.source);if(lesson.created)stats.lessons++;const groups=[{title:`${l.title} — notions essentielles`,difficulty:"easy" as const,score:30,start:0,end:4,instructions:"Maîtrise les définitions, repères et propriétés essentielles."},{title:`${l.title} — application`,difficulty:"medium" as const,score:55,start:4,end:8,instructions:"Applique la notion à une situation nouvelle et justifie ton choix."},{title:`${l.title} — raisonnement`,difficulty:"hard" as const,score:75,start:8,end:12,instructions:"Analyse la situation, justifie le raisonnement et vérifie le résultat."}];for(const g of groups){const ex=await getExercise(lesson.data.id,comp.id,g.title,g.instructions,g.difficulty,g.score);if(ex.created)stats.exercises++;for(let qi=g.start;qi<g.end;qi++){const raw=l.questions[qi];if(!raw)throw new Error(`[${p.subject}] ${l.title}: question ${qi+1} manquante.`);if(await addQuestion(ex.data.id,comp.id,chapter.data.id,toQuestion(raw,qi)))stats.questions++;else stats.duplicates++;}}}}stats.chapters=p.chapters.length;return stats;}
async function main(){console.log("==============================================");console.log(" IMPORT LOT A — 4e — MATHÉMATIQUES + SVT");console.log("==============================================");console.log(`Statut : ${STATUS}`);const cycle=await getCycle();const level=await getLevel(cycle.id);console.log(`Niveau : ${level.name}`);const totals={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(const p of programs){const st=await runProgram(level.id,p);for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=st[k];console.log(`\n=== ${p.subject.toUpperCase()} 4e ===`);console.log(st);}console.log("\n==============================================");console.log("IMPORT LOT A 4e TERMINÉ");console.log("==============================================");console.log(totals);console.log("Contenu en review par défaut.");}
main().catch(e=>{console.error("❌ Import Lot A 4e échoué");console.error(e);process.exit(1);});
