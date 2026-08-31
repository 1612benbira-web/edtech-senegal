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
    "subject": "Français",
    "source": "https://apprendre.education.sn/detail/411/12",
    "version": "4e-français-lotB-v1",
    "chapters": [
      {
        "title": "Compréhension du récit",
        "domain": "Lecture et compréhension",
        "competency": "Comprendre un récit, repérer les personnages, le cadre, les événements et le point de vue.",
        "lessons": [
          {
            "title": "Compréhension du récit",
            "objectives": [
              "Comprendre un récit, repérer les personnages, le cadre, les événements et le point de vue.",
              "Identifier les notions essentielles de Compréhension du récit.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue.",
            "content": "# Compréhension du récit\n\nUn texte narratif peut être étudié en relevant les personnages, le cadre spatio-temporel, les actions et les indices du point de vue.\n\n### À retenir\nUn récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Compréhension du récit », quel élément correspond directement à l’objectif principal ?",
                "answer": "Comprendre un récit, repérer les personnages, le cadre, les événements et le point de vue.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Compréhension du récit » ?",
                "answer": "Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Compréhension du récit » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Compréhension du récit » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Compréhension du récit » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Compréhension du récit » ?",
                "answer": "Comprendre un récit, repérer les personnages, le cadre, les événements et le point de vue.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Compréhension du récit » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Compréhension du récit » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Un récit organise des événements dans le temps. Pour le comprendre, on distingue la situation initiale, les événements, les transformations et la situation finale. On repère aussi qui raconte et depuis quel point de vue."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Compréhension du récit » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Compréhension du récit » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Compréhension du récit ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Compréhension du récit », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Le portrait et la description",
        "domain": "Expression écrite",
        "competency": "Construire une description précise d’une personne, d’un lieu ou d’un objet.",
        "lessons": [
          {
            "title": "Le portrait et la description",
            "objectives": [
              "Construire une description précise d’une personne, d’un lieu ou d’un objet.",
              "Identifier les notions essentielles de Le portrait et la description.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception.",
            "content": "# Le portrait et la description\n\nUne bonne description ne juxtapose pas des mots : elle organise les détails selon un ordre et produit un effet sur le lecteur.\n\n### À retenir\nLa description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Le portrait et la description », quel élément correspond directement à l’objectif principal ?",
                "answer": "Construire une description précise d’une personne, d’un lieu ou d’un objet.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Le portrait et la description » ?",
                "answer": "La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Le portrait et la description » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Le portrait et la description » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Le portrait et la description » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Le portrait et la description » ?",
                "answer": "Construire une description précise d’une personne, d’un lieu ou d’un objet.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Le portrait et la description » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Le portrait et la description » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La description sélectionne des détails utiles et les organise. Elle peut utiliser des expansions du nom, des adjectifs qualificatifs, des compléments circonstanciels et des verbes de perception."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Le portrait et la description » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Le portrait et la description » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Le portrait et la description ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Le portrait et la description », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Le récit autobiographique",
        "domain": "Genres littéraires",
        "competency": "Identifier les marques de l’autobiographie et produire un récit personnel maîtrisé.",
        "lessons": [
          {
            "title": "Le récit autobiographique",
            "objectives": [
              "Identifier les marques de l’autobiographie et produire un récit personnel maîtrisé.",
              "Identifier les notions essentielles de Le récit autobiographique.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents.",
            "content": "# Le récit autobiographique\n\nLe pacte autobiographique repose sur l’identité entre auteur, narrateur et personnage principal, même si le récit reste une construction littéraire.\n\n### À retenir\nDans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Le récit autobiographique », quel élément correspond directement à l’objectif principal ?",
                "answer": "Identifier les marques de l’autobiographie et produire un récit personnel maîtrisé.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Le récit autobiographique » ?",
                "answer": "Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Le récit autobiographique » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Le récit autobiographique » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Le récit autobiographique » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Le récit autobiographique » ?",
                "answer": "Identifier les marques de l’autobiographie et produire un récit personnel maîtrisé.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Le récit autobiographique » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Le récit autobiographique » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Dans l’autobiographie, l’auteur raconte sa propre vie. Les pronoms de première personne, les souvenirs, les repères temporels et les commentaires personnels sont fréquents."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Le récit autobiographique » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Le récit autobiographique » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Le récit autobiographique ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Le récit autobiographique », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Le texte argumentatif",
        "domain": "Argumentation",
        "competency": "Identifier une thèse, des arguments, des exemples et des connecteurs logiques.",
        "lessons": [
          {
            "title": "Le texte argumentatif",
            "objectives": [
              "Identifier une thèse, des arguments, des exemples et des connecteurs logiques.",
              "Identifier les notions essentielles de Le texte argumentatif.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement.",
            "content": "# Le texte argumentatif\n\nPour rendre un argument convaincant, il faut une idée claire, une justification pertinente et un exemple réellement lié à cette idée.\n\n### À retenir\nArgumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Le texte argumentatif », quel élément correspond directement à l’objectif principal ?",
                "answer": "Identifier une thèse, des arguments, des exemples et des connecteurs logiques.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Le texte argumentatif » ?",
                "answer": "Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Le texte argumentatif » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Le texte argumentatif » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Le texte argumentatif » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Le texte argumentatif » ?",
                "answer": "Identifier une thèse, des arguments, des exemples et des connecteurs logiques.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Le texte argumentatif » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Le texte argumentatif » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Argumenter consiste à défendre une idée. La thèse exprime la position soutenue ; les arguments la justifient ; les exemples l’illustrent. Les connecteurs organisent le raisonnement."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Le texte argumentatif » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Le texte argumentatif » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Le texte argumentatif ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Le texte argumentatif », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Le dialogue et le théâtre",
        "domain": "Genres littéraires",
        "competency": "Lire un dialogue, distinguer paroles et didascalies et respecter les codes du théâtre.",
        "lessons": [
          {
            "title": "Le dialogue et le théâtre",
            "objectives": [
              "Lire un dialogue, distinguer paroles et didascalies et respecter les codes du théâtre.",
              "Identifier les notions essentielles de Le dialogue et le théâtre.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement.",
            "content": "# Le dialogue et le théâtre\n\nLe dialogue théâtral avance par les paroles et les actions scéniques ; la ponctuation aide à rendre les intentions des personnages.\n\n### À retenir\nAu théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Le dialogue et le théâtre », quel élément correspond directement à l’objectif principal ?",
                "answer": "Lire un dialogue, distinguer paroles et didascalies et respecter les codes du théâtre.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Le dialogue et le théâtre » ?",
                "answer": "Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Le dialogue et le théâtre » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Le dialogue et le théâtre » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Le dialogue et le théâtre » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Le dialogue et le théâtre » ?",
                "answer": "Lire un dialogue, distinguer paroles et didascalies et respecter les codes du théâtre.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Le dialogue et le théâtre » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Le dialogue et le théâtre » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Au théâtre, les répliques sont prononcées par les personnages. Les didascalies donnent des indications de mise en scène, de gestes, de ton ou de déplacement."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Le dialogue et le théâtre » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Le dialogue et le théâtre » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Le dialogue et le théâtre ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Le dialogue et le théâtre », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "La poésie et les images",
        "domain": "Poésie",
        "competency": "Reconnaître quelques procédés poétiques et interpréter leur effet.",
        "lessons": [
          {
            "title": "La poésie et les images",
            "objectives": [
              "Reconnaître quelques procédés poétiques et interpréter leur effet.",
              "Identifier les notions essentielles de La poésie et les images.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée.",
            "content": "# La poésie et les images\n\nUn procédé stylistique doit être identifié puis interprété : il faut expliquer ce qu’il produit dans le texte.\n\n### À retenir\nLa poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « La poésie et les images », quel élément correspond directement à l’objectif principal ?",
                "answer": "Reconnaître quelques procédés poétiques et interpréter leur effet.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « La poésie et les images » ?",
                "answer": "La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « La poésie et les images » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « La poésie et les images » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « La poésie et les images » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « La poésie et les images » ?",
                "answer": "Reconnaître quelques procédés poétiques et interpréter leur effet.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « La poésie et les images » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « La poésie et les images » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: La poésie joue sur les sons, le rythme et les images. Comparaison, métaphore, personnification, répétition et jeux de sonorités peuvent renforcer une émotion ou une idée."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « La poésie et les images » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « La poésie et les images » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « La poésie et les images ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « La poésie et les images », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Les paroles rapportées",
        "domain": "Grammaire du discours",
        "competency": "Distinguer discours direct et indirect et transformer correctement une phrase.",
        "lessons": [
          {
            "title": "Les paroles rapportées",
            "objectives": [
              "Distinguer discours direct et indirect et transformer correctement une phrase.",
              "Identifier les notions essentielles de Les paroles rapportées.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer.",
            "content": "# Les paroles rapportées\n\nLa transformation doit conserver le sens tout en respectant les règles de concordance et les pronoms adaptés.\n\n### À retenir\nLe discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Les paroles rapportées », quel élément correspond directement à l’objectif principal ?",
                "answer": "Distinguer discours direct et indirect et transformer correctement une phrase.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Les paroles rapportées » ?",
                "answer": "Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Les paroles rapportées » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Les paroles rapportées » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Les paroles rapportées » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Les paroles rapportées » ?",
                "answer": "Distinguer discours direct et indirect et transformer correctement une phrase.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Les paroles rapportées » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Les paroles rapportées » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Le discours direct reproduit les paroles avec leurs marques propres. Le discours indirect les intègre dans une proposition dépendant d’un verbe introducteur ; certains pronoms, temps et repères peuvent changer."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Les paroles rapportées » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Les paroles rapportées » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Les paroles rapportées ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Les paroles rapportées », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Les temps du récit",
        "domain": "Conjugaison",
        "competency": "Employer imparfait, passé simple et plus-que-parfait selon leur valeur.",
        "lessons": [
          {
            "title": "Les temps du récit",
            "objectives": [
              "Employer imparfait, passé simple et plus-que-parfait selon leur valeur.",
              "Identifier les notions essentielles de Les temps du récit.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité.",
            "content": "# Les temps du récit\n\nLe choix du temps dépend de la valeur de l’action dans la chronologie et dans l’organisation du récit.\n\n### À retenir\nL’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Les temps du récit », quel élément correspond directement à l’objectif principal ?",
                "answer": "Employer imparfait, passé simple et plus-que-parfait selon leur valeur.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Les temps du récit » ?",
                "answer": "L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Les temps du récit » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Les temps du récit » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Les temps du récit » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Les temps du récit » ?",
                "answer": "Employer imparfait, passé simple et plus-que-parfait selon leur valeur.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Les temps du récit » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Les temps du récit » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: L’imparfait présente souvent une action habituelle, une description ou un arrière-plan. Le passé simple marque des actions de premier plan dans le récit écrit. Le plus-que-parfait exprime une antériorité."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Les temps du récit » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Les temps du récit » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Les temps du récit ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Les temps du récit », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "L’accord du participe passé",
        "domain": "Orthographe grammaticale",
        "competency": "Accorder correctement le participe passé avec être et avoir.",
        "lessons": [
          {
            "title": "L’accord du participe passé",
            "objectives": [
              "Accorder correctement le participe passé avec être et avoir.",
              "Identifier les notions essentielles de L’accord du participe passé.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord.",
            "content": "# L’accord du participe passé\n\nLa méthode consiste à repérer l’auxiliaire, chercher le COD et vérifier sa position avant le verbe.\n\n### À retenir\nAvec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « L’accord du participe passé », quel élément correspond directement à l’objectif principal ?",
                "answer": "Accorder correctement le participe passé avec être et avoir.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « L’accord du participe passé » ?",
                "answer": "Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « L’accord du participe passé » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « L’accord du participe passé » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « L’accord du participe passé » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « L’accord du participe passé » ?",
                "answer": "Accorder correctement le participe passé avec être et avoir.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « L’accord du participe passé » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « L’accord du participe passé » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Avec être, le participe passé s’accorde généralement avec le sujet. Avec avoir, il s’accorde avec le complément d’objet direct placé avant le verbe. Il faut identifier la fonction avant de décider de l’accord."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « L’accord du participe passé » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « L’accord du participe passé » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « L’accord du participe passé ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « L’accord du participe passé », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Les propositions subordonnées",
        "domain": "Syntaxe",
        "competency": "Identifier proposition principale et subordonnée et distinguer quelques relations logiques.",
        "lessons": [
          {
            "title": "Les propositions subordonnées",
            "objectives": [
              "Identifier proposition principale et subordonnée et distinguer quelques relations logiques.",
              "Identifier les notions essentielles de Les propositions subordonnées.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition.",
            "content": "# Les propositions subordonnées\n\nPour analyser une phrase complexe, on repère les verbes conjugués puis les liens syntaxiques qui unissent les propositions.\n\n### À retenir\nUne phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Les propositions subordonnées », quel élément correspond directement à l’objectif principal ?",
                "answer": "Identifier proposition principale et subordonnée et distinguer quelques relations logiques.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Les propositions subordonnées » ?",
                "answer": "Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Les propositions subordonnées » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Les propositions subordonnées » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Les propositions subordonnées » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Les propositions subordonnées » ?",
                "answer": "Identifier proposition principale et subordonnée et distinguer quelques relations logiques.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Les propositions subordonnées » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Les propositions subordonnées » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une phrase complexe peut contenir plusieurs propositions. Une subordonnée dépend d’une autre proposition. Les mots subordonnants indiquent notamment le temps, la cause, la conséquence, le but ou la condition."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Les propositions subordonnées » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Les propositions subordonnées » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Les propositions subordonnées ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Les propositions subordonnées », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Les connecteurs logiques",
        "domain": "Expression et argumentation",
        "competency": "Utiliser des connecteurs pour organiser une explication ou une argumentation.",
        "lessons": [
          {
            "title": "Les connecteurs logiques",
            "objectives": [
              "Utiliser des connecteurs pour organiser une explication ou une argumentation.",
              "Identifier les notions essentielles de Les connecteurs logiques.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible.",
            "content": "# Les connecteurs logiques\n\nUn connecteur doit correspondre à la relation logique réellement voulue ; il ne suffit pas d’en ajouter beaucoup.\n\n### À retenir\nLes connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Les connecteurs logiques », quel élément correspond directement à l’objectif principal ?",
                "answer": "Utiliser des connecteurs pour organiser une explication ou une argumentation.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Les connecteurs logiques » ?",
                "answer": "Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Les connecteurs logiques » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Les connecteurs logiques » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Les connecteurs logiques » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Les connecteurs logiques » ?",
                "answer": "Utiliser des connecteurs pour organiser une explication ou une argumentation.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Les connecteurs logiques » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Les connecteurs logiques » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Les connecteurs expriment des relations : addition, opposition, cause, conséquence, but, condition ou conclusion. Ils rendent le raisonnement plus lisible."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Les connecteurs logiques » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Les connecteurs logiques » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Les connecteurs logiques ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Les connecteurs logiques », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Produire un texte organisé",
        "domain": "Production écrite",
        "competency": "Planifier, rédiger, relire et améliorer un texte adapté à une consigne.",
        "lessons": [
          {
            "title": "Produire un texte organisé",
            "objectives": [
              "Planifier, rédiger, relire et améliorer un texte adapté à une consigne.",
              "Identifier les notions essentielles de Produire un texte organisé.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation.",
            "content": "# Produire un texte organisé\n\nAvant de rédiger, on peut préparer un plan simple : idée principale, arguments ou événements, exemples, conclusion puis relecture.\n\n### À retenir\nUne production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "Dans « Produire un texte organisé », quel élément correspond directement à l’objectif principal ?",
                "answer": "Planifier, rédiger, relire et améliorer un texte adapté à une consigne.",
                "wrongs": [
                  "Mémoriser sans comprendre",
                  "Changer de sujet",
                  "Éviter toute justification"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle affirmation est correcte à propos de « Produire un texte organisé » ?",
                "answer": "Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation.",
                "wrongs": [
                  "La notion interdit tout exemple",
                  "La notion ne concerne que la poésie",
                  "La notion ne demande aucune organisation"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle démarche est la plus pertinente pour travailler « Produire un texte organisé » ?",
                "answer": "Lire ou analyser la consigne, repérer les indices utiles, puis justifier la réponse.",
                "wrongs": [
                  "Choisir au hasard",
                  "Copier une phrase sans lien",
                  "Ignorer la consigne"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle erreur faut-il éviter dans « Produire un texte organisé » ?",
                "answer": "Répondre sans tenir compte de la consigne et sans justifier lorsque la justification est demandée.",
                "wrongs": [
                  "Relire son travail",
                  "Vérifier la cohérence",
                  "Utiliser les indices du texte"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quel outil aide particulièrement à réussir « Produire un texte organisé » ?",
                "answer": "La relecture organisée et l’identification précise des indices linguistiques ou textuels.",
                "wrongs": [
                  "La suppression de la ponctuation",
                  "La répétition mécanique",
                  "Le changement de sujet"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle réponse applique correctement « Produire un texte organisé » ?",
                "answer": "Planifier, rédiger, relire et améliorer un texte adapté à une consigne.",
                "wrongs": [
                  "Une réponse sans rapport",
                  "Une contradiction avec la notion",
                  "Une réponse choisie au hasard"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Pourquoi « Produire un texte organisé » est-il important ?",
                "answer": "Parce qu’il permet de mieux comprendre, analyser ou produire un texte en fonction d’une intention précise.",
                "wrongs": [
                  "Parce qu’il remplace toutes les autres notions",
                  "Parce qu’il dispense de relire",
                  "Parce qu’il interdit les exemples"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "mc",
                "prompt": "Quelle étape vient avant une réponse solide sur « Produire un texte organisé » ?",
                "answer": "Identifier précisément ce que demande la consigne.",
                "wrongs": [
                  "Donner immédiatement une conclusion",
                  "Ignorer les mots-clés",
                  "Supprimer les éléments utiles"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Une production écrite réussie respecte la consigne, organise les idées, utilise un vocabulaire précis et relit la grammaire, l’orthographe et la ponctuation."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : « Produire un texte organisé » peut être maîtrisé sans comprendre la consigne.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : une réponse sur « Produire un texte organisé » doit rester cohérente avec la notion étudiée.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : la relecture peut permettre de repérer une erreur liée à « Produire un texte organisé ».",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "Vrai ou faux : pour « Produire un texte organisé », une justification pertinente doit avoir un lien avec la question.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "subject": "Anglais",
    "source": "https://apprendre.education.sn/C_ressource/recherche/34",
    "version": "4e-anglais-lotB-v1",
    "chapters": [
      {
        "title": "Introducing yourself and others",
        "domain": "Communication",
        "competency": "Introduce yourself and another person using accurate personal information.",
        "lessons": [
          {
            "title": "Introducing yourself and others",
            "objectives": [
              "Introduce yourself and another person using accurate personal information.",
              "Use the key language of Introducing yourself and others in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information.",
            "content": "# Introducing yourself and others\n\nA clear introduction gives relevant information and respects the difference between a statement and a question.\n\n### À retenir\nUse basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Introducing yourself and others”?",
                "answer": "Introduce yourself and another person using accurate personal information.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Introducing yourself and others”?",
                "answer": "Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Introducing yourself and others”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Introducing yourself and others”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Introducing yourself and others”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Introducing yourself and others”?",
                "answer": "Introduce yourself and another person using accurate personal information.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Introducing yourself and others” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Introducing yourself and others”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Use basic structures such as I am, My name is, I live in, I am from and This is my friend. Questions with What, Where, Who and How old help obtain personal information."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Introducing yourself and others” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Introducing yourself and others”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Introducing yourself and others”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Daily routines and the present simple",
        "domain": "Grammar and communication",
        "competency": "Describe habits and routines and ask about them.",
        "lessons": [
          {
            "title": "Daily routines and the present simple",
            "objectives": [
              "Describe habits and routines and ask about them.",
              "Use the key language of Daily routines and the present simple in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives.",
            "content": "# Daily routines and the present simple\n\nTime expressions such as every day, usually and sometimes help show frequency.\n\n### À retenir\nThe present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Daily routines and the present simple”?",
                "answer": "Describe habits and routines and ask about them.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Daily routines and the present simple”?",
                "answer": "The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Daily routines and the present simple”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Daily routines and the present simple”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Daily routines and the present simple”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Daily routines and the present simple”?",
                "answer": "Describe habits and routines and ask about them.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Daily routines and the present simple” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Daily routines and the present simple”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present simple describes habits and regular actions. In the third person singular, the verb usually takes -s or -es. Do and does are used for many questions and negatives."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Daily routines and the present simple” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Daily routines and the present simple”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Daily routines and the present simple”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Past events and the past simple",
        "domain": "Grammar and communication",
        "competency": "Talk about completed events in the past.",
        "lessons": [
          {
            "title": "Past events and the past simple",
            "objectives": [
              "Talk about completed events in the past.",
              "Use the key language of Past events and the past simple in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw.",
            "content": "# Past events and the past simple\n\nPast time markers such as yesterday, last week and two days ago help establish the time of an event.\n\n### À retenir\nThe past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Past events and the past simple”?",
                "answer": "Talk about completed events in the past.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Past events and the past simple”?",
                "answer": "The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Past events and the past simple”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Past events and the past simple”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Past events and the past simple”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Past events and the past simple”?",
                "answer": "Talk about completed events in the past.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Past events and the past simple” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Past events and the past simple”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The past simple is used for completed past actions. Regular verbs often take -ed, while common irregular verbs have special forms such as go/went and see/saw."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Past events and the past simple” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Past events and the past simple”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Past events and the past simple”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Future plans and intentions",
        "domain": "Grammar and communication",
        "competency": "Express plans, intentions and simple predictions.",
        "lessons": [
          {
            "title": "Future plans and intentions",
            "objectives": [
              "Express plans, intentions and simple predictions.",
              "Use the key language of Future plans and intentions in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form.",
            "content": "# Future plans and intentions\n\nA plan already decided before speaking often uses be going to.\n\n### À retenir\nBe going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Future plans and intentions”?",
                "answer": "Express plans, intentions and simple predictions.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Future plans and intentions”?",
                "answer": "Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Future plans and intentions”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Future plans and intentions”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Future plans and intentions”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Future plans and intentions”?",
                "answer": "Express plans, intentions and simple predictions.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Future plans and intentions” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Future plans and intentions”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Be going to is commonly used for plans and intentions. Will can express a decision made at the moment or a prediction. The context determines the most suitable form."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Future plans and intentions” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Future plans and intentions”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Future plans and intentions”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Countable and uncountable nouns",
        "domain": "Grammar and vocabulary",
        "competency": "Use nouns and quantifiers accurately.",
        "lessons": [
          {
            "title": "Countable and uncountable nouns",
            "objectives": [
              "Use nouns and quantifiers accurately.",
              "Use the key language of Countable and uncountable nouns in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type.",
            "content": "# Countable and uncountable nouns\n\nChoosing a quantifier requires first deciding whether the noun is countable or uncountable.\n\n### À retenir\nCountable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Countable and uncountable nouns”?",
                "answer": "Use nouns and quantifiers accurately.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Countable and uncountable nouns”?",
                "answer": "Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Countable and uncountable nouns”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Countable and uncountable nouns”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Countable and uncountable nouns”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Countable and uncountable nouns”?",
                "answer": "Use nouns and quantifiers accurately.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Countable and uncountable nouns” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Countable and uncountable nouns”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Countable nouns can be counted and have singular and plural forms. Uncountable nouns are treated as masses. Some and any, much and many, a lot of and a few/a little depend on the noun and sentence type."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Countable and uncountable nouns” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Countable and uncountable nouns”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Countable and uncountable nouns”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Comparing people, places and things",
        "domain": "Grammar and communication",
        "competency": "Make comparisons using comparative and superlative forms.",
        "lessons": [
          {
            "title": "Comparing people, places and things",
            "objectives": [
              "Make comparisons using comparative and superlative forms.",
              "Use the key language of Comparing people, places and things in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures.",
            "content": "# Comparing people, places and things\n\nComparisons should compare the same type of thing and use the appropriate adjective form.\n\n### À retenir\nShort adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Comparing people, places and things”?",
                "answer": "Make comparisons using comparative and superlative forms.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Comparing people, places and things”?",
                "answer": "Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Comparing people, places and things”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Comparing people, places and things”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Comparing people, places and things”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Comparing people, places and things”?",
                "answer": "Make comparisons using comparative and superlative forms.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Comparing people, places and things” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Comparing people, places and things”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Short adjectives often take -er and -est; longer adjectives commonly use more and most. Than introduces many comparative structures."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Comparing people, places and things” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Comparing people, places and things”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Comparing people, places and things”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Ability, obligation and advice",
        "domain": "Grammar and communication",
        "competency": "Use modal verbs for ability, obligation and advice.",
        "lessons": [
          {
            "title": "Ability, obligation and advice",
            "objectives": [
              "Use modal verbs for ability, obligation and advice.",
              "Use the key language of Ability, obligation and advice in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb.",
            "content": "# Ability, obligation and advice\n\nThe modal changes the meaning of the sentence while the main verb remains in the base form.\n\n### À retenir\nCan expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Ability, obligation and advice”?",
                "answer": "Use modal verbs for ability, obligation and advice.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Ability, obligation and advice”?",
                "answer": "Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Ability, obligation and advice”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Ability, obligation and advice”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Ability, obligation and advice”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Ability, obligation and advice”?",
                "answer": "Use modal verbs for ability, obligation and advice.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Ability, obligation and advice” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Ability, obligation and advice”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Can expresses ability or permission in many contexts. Must and have to express obligation. Should is commonly used for advice. Modal verbs are followed by the base form of the verb."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Ability, obligation and advice” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Ability, obligation and advice”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Ability, obligation and advice”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Present continuous",
        "domain": "Grammar and communication",
        "competency": "Describe actions happening now or around the present time.",
        "lessons": [
          {
            "title": "Present continuous",
            "objectives": [
              "Describe actions happening now or around the present time.",
              "Use the key language of Present continuous in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking.",
            "content": "# Present continuous\n\nDo not confuse a current action with a habitual action normally expressed by the present simple.\n\n### À retenir\nThe present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Present continuous”?",
                "answer": "Describe actions happening now or around the present time.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Present continuous”?",
                "answer": "The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Present continuous”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Present continuous”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Present continuous”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Present continuous”?",
                "answer": "Describe actions happening now or around the present time.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Present continuous” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Present continuous”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present continuous uses be + verb-ing. It commonly describes an action happening at or around the moment of speaking."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Present continuous” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Present continuous”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Present continuous”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Experiences and the present perfect",
        "domain": "Grammar and communication",
        "competency": "Talk about life experiences and recent events using the present perfect at an appropriate level.",
        "lessons": [
          {
            "title": "Experiences and the present perfect",
            "objectives": [
              "Talk about life experiences and recent events using the present perfect at an appropriate level.",
              "Use the key language of Experiences and the present perfect in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time.",
            "content": "# Experiences and the present perfect\n\nWords such as ever, never, already and yet are frequent with the present perfect.\n\n### À retenir\nThe present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Experiences and the present perfect”?",
                "answer": "Talk about life experiences and recent events using the present perfect at an appropriate level.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Experiences and the present perfect”?",
                "answer": "The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Experiences and the present perfect”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Experiences and the present perfect”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Experiences and the present perfect”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Experiences and the present perfect”?",
                "answer": "Talk about life experiences and recent events using the present perfect at an appropriate level.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Experiences and the present perfect” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Experiences and the present perfect”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: The present perfect is formed with have/has + past participle. It can connect a past event to the present, especially for experiences without a specified finished time."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Experiences and the present perfect” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Experiences and the present perfect”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Experiences and the present perfect”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Places, directions and transport",
        "domain": "Everyday communication",
        "competency": "Ask for and give simple directions and talk about transport.",
        "lessons": [
          {
            "title": "Places, directions and transport",
            "objectives": [
              "Ask for and give simple directions and talk about transport.",
              "Use the key language of Places, directions and transport in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common.",
            "content": "# Places, directions and transport\n\nClear directions use landmarks, sequence words and precise location expressions.\n\n### À retenir\nUseful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Places, directions and transport”?",
                "answer": "Ask for and give simple directions and talk about transport.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Places, directions and transport”?",
                "answer": "Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Places, directions and transport”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Places, directions and transport”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Places, directions and transport”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Places, directions and transport”?",
                "answer": "Ask for and give simple directions and talk about transport.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Places, directions and transport” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Places, directions and transport”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Useful expressions include turn left, turn right, go straight, next to, opposite, between and near. Questions such as How do I get to...? are common."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Places, directions and transport” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Places, directions and transport”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Places, directions and transport”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Health, safety and healthy habits",
        "domain": "Communication and vocabulary",
        "competency": "Discuss simple health problems and give practical advice.",
        "lessons": [
          {
            "title": "Health, safety and healthy habits",
            "objectives": [
              "Discuss simple health problems and give practical advice.",
              "Use the key language of Health, safety and healthy habits in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions.",
            "content": "# Health, safety and healthy habits\n\nAdvice should be clear, respectful and appropriate to the situation.\n\n### À retenir\nVocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Health, safety and healthy habits”?",
                "answer": "Discuss simple health problems and give practical advice.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Health, safety and healthy habits”?",
                "answer": "Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Health, safety and healthy habits”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Health, safety and healthy habits”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Health, safety and healthy habits”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Health, safety and healthy habits”?",
                "answer": "Discuss simple health problems and give practical advice.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Health, safety and healthy habits” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Health, safety and healthy habits”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Vocabulary for common symptoms can be combined with have, feel and be. Should is useful for advice, while imperatives can give simple instructions."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Health, safety and healthy habits” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Health, safety and healthy habits”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Health, safety and healthy habits”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      },
      {
        "title": "Environment and responsible actions",
        "domain": "Reading and writing",
        "competency": "Understand and produce a short text about environmental responsibility.",
        "lessons": [
          {
            "title": "Environment and responsible actions",
            "objectives": [
              "Understand and produce a short text about environmental responsibility.",
              "Use the key language of Environment and responsible actions in a familiar situation.",
              "Appliquer la notion dans une situation nouvelle.",
              "Justifier et vérifier une réponse."
            ],
            "summary": "Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not.",
            "content": "# Environment and responsible actions\n\nAn effective environmental message states a problem, gives concrete actions and explains why they matter.\n\n### À retenir\nStudents can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not.",
            "questions": [
              {
                "kind": "mc",
                "prompt": "What is the main goal of “Environment and responsible actions”?",
                "answer": "Understand and produce a short text about environmental responsibility.",
                "wrongs": [
                  "Change the topic completely",
                  "Avoid using the target language",
                  "Memorize unrelated words"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "Which statement is correct about “Environment and responsible actions”?",
                "answer": "Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not.",
                "wrongs": [
                  "It has no useful application",
                  "It must never be used in context",
                  "It is unrelated to communication"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "What is a good way to practise “Environment and responsible actions”?",
                "answer": "Read the situation, identify the useful language, then produce and check a relevant answer.",
                "wrongs": [
                  "Choose an answer randomly",
                  "Ignore the context",
                  "Use unrelated vocabulary"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "Which mistake should a learner avoid in “Environment and responsible actions”?",
                "answer": "Using a form without checking the subject, tense, meaning or context.",
                "wrongs": [
                  "Checking the answer",
                  "Reading the whole sentence",
                  "Using context clues"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "Which strategy is useful for “Environment and responsible actions”?",
                "answer": "Notice key words and the communicative situation before choosing a form.",
                "wrongs": [
                  "Ignore the context",
                  "Translate every word blindly",
                  "Remove the verb"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "Which response best applies “Environment and responsible actions”?",
                "answer": "Understand and produce a short text about environmental responsibility.",
                "wrongs": [
                  "A response with no connection to the topic",
                  "An unrelated sentence",
                  "A random choice"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "Why is “Environment and responsible actions” useful?",
                "answer": "It helps learners communicate more accurately in familiar school and everyday situations.",
                "wrongs": [
                  "It replaces all grammar",
                  "It prevents communication",
                  "It is only useful for tests"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "mc",
                "prompt": "What should you do before answering a question about “Environment and responsible actions”?",
                "answer": "Identify what the question asks and the context in which the language is used.",
                "wrongs": [
                  "Answer immediately without reading",
                  "Ignore the subject",
                  "Change the topic"
                ],
                "explanation": "The answer follows from the lesson objective and the key idea: Students can discuss waste, water, energy, trees and clean surroundings. Useful language includes we should, we must, we can and we should not."
              },
              {
                "kind": "tf",
                "prompt": "True or false: “Environment and responsible actions” can be used correctly without considering meaning or context.",
                "answer": false,
                "explanation": "The statement is not correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: context helps learners choose the correct language form for “Environment and responsible actions”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: checking the subject and tense can help avoid errors in “Environment and responsible actions”.",
                "answer": true,
                "explanation": "The statement is correct."
              },
              {
                "kind": "tf",
                "prompt": "True or false: a good answer to a language question should be connected to the situation.",
                "answer": true,
                "explanation": "The statement is correct."
              }
            ]
          }
        ]
      }
    ]
  }
]

function toQuestion(q:RawQuestion,index:number){if(q.kind==="tf"){const answer=Boolean(q.answer);return{type:"true_false" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[{label:"Vrai",is_correct:answer,order:1},{label:"Faux",is_correct:!answer,order:2}]};}const wrongs=q.wrongs??[];return{type:"single_choice" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[String(q.answer),...wrongs].map((label,i)=>({label,is_correct:i===0,order:i+1}))};}

async function getCycle(){const {data,error}=await supabase.from("school_cycles").select("*").eq("code","moyen").maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_cycles").insert({code:"moyen",name:"Moyen",order:2}).select().single();if(r.error)throw r.error;return r.data;}
async function getLevel(cycleId:string){const {data,error}=await supabase.from("school_levels").select("*").eq("cycle_id",cycleId).in("code",["4e","4eme","4ème"]).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_levels").insert({cycle_id:cycleId,code:"4e",name:"4e",order:3}).select().single();if(r.error)throw r.error;return r.data;}
async function getSubject(name:string){const aliases:Record<string,string[]>={"Français":["fr","francais","français"],"Anglais":["ang","anglais"]};const codes=aliases[name]??[name.toLowerCase()];const {data,error}=await supabase.from("subjects").select("*").in("code",codes).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("subjects").insert({code:codes[0],name,icon:name==="Français"?"BookOpen":"Languages"}).select().single();if(r.error)throw r.error;return r.data;}
async function ensureLevelSubject(levelId:string,subjectId:string){const {data,error}=await supabase.from("level_subjects").select("id").eq("level_id",levelId).eq("subject_id",subjectId).is("series_id",null).maybeSingle();if(error)throw error;if(!data){const r=await supabase.from("level_subjects").insert({level_id:levelId,subject_id:subjectId,series_id:null,is_optional:false});if(r.error)throw r.error;}}
async function getCurriculum(levelId:string,subjectId:string,p:RawProgram){const title=`${p.subject} 4e – Programme sénégalais`;const {data,error}=await supabase.from("curriculums").select("*").eq("level_id",levelId).eq("subject_id",subjectId).eq("title",title).eq("version",p.version).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("curriculums").insert({level_id:levelId,series_id:null,subject_id:subjectId,title,description:`Progression 4e de ${p.subject}, structurée à partir de ressources pédagogiques sénégalaises. Contenu original EdTech Sénégal.`,version:p.version,status:STATUS,source:"Ressources pédagogiques sénégalaises — cadrage institutionnel; rédaction originale EdTech Sénégal.",source_url:p.source||PROMET_URL,source_document:"Cadrage à partir des ressources ADEM/PROMET; ne pas présenter comme reproduction intégrale du référentiel officiel.",is_demo:false,validated:false,published_at:STATUS==="published"?new Date().toISOString():null}).select().single();if(r.error)throw r.error;return r.data;}
async function getDomain(curriculumId:string,name:string,order:number){const {data,error}=await supabase.from("domains").select("*").eq("curriculum_id",curriculumId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("domains").insert({curriculum_id:curriculumId,name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getCompetency(domainId:string,name:string,order:number){const {data,error}=await supabase.from("competencies").select("*").eq("domain_id",domainId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("competencies").insert({domain_id:domainId,name,description:name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getChapter(curriculumId:string,domainId:string,c:RawChapter,order:number){const {data,error}=await supabase.from("chapters").select("*").eq("curriculum_id",curriculumId).eq("title",c.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("chapters").insert({curriculum_id:curriculumId,domain_id:domainId,title:c.title,order,status:STATUS,source:"Ressources sénégalaises; structuration originale EdTech Sénégal.",source_url:PROMET_URL}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getLesson(chapterId:string,competencyId:string,l:RawLesson,order:number,sourceUrl:string){const {data,error}=await supabase.from("lessons").select("*").eq("chapter_id",chapterId).eq("title",l.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("lessons").insert({chapter_id:chapterId,competency_id:competencyId,title:l.title,content_md:l.content,objectives:l.objectives,summary:l.summary,order,status:STATUS,source:"Contenu original EdTech Sénégal, structuré à partir de ressources pédagogiques sénégalaises.",source_url:sourceUrl}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getExercise(lessonId:string,competencyId:string,title:string,instructions:string,difficulty:"easy"|"medium"|"hard",score:number){const {data,error}=await supabase.from("exercises").select("*").eq("lesson_id",lessonId).eq("title",title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("exercises").insert({lesson_id:lessonId,competency_id:competencyId,title,instructions,difficulty,difficulty_score:score,status:STATUS}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function addQuestion(exerciseId:string,competencyId:string,chapterId:string,q:ReturnType<typeof toQuestion>){const {data,error}=await supabase.from("questions").select("id").eq("exercise_id",exerciseId).eq("prompt",q.prompt).is("deleted_at",null).maybeSingle();if(error)throw error;let questionId:string;if(data?.id){questionId=data.id;}else{const r=await supabase.from("questions").insert({exercise_id:exerciseId,competency_id:competencyId,chapter_id:chapterId,type:q.type,prompt:q.prompt,explanation:q.explanation,points:q.points,difficulty_score:q.difficulty_score,status:STATUS}).select("id").single();if(r.error)throw r.error;questionId=r.data.id;}const {data:existing,error:readErr}=await supabase.from("question_options").select("id,label,is_correct,order").eq("question_id",questionId);if(readErr)throw readErr;const expected=q.options.length, correct=q.options.filter(x=>x.is_correct).length, actualCorrect=(existing??[]).filter(x=>x.is_correct).length;if((existing??[]).length!==expected||actualCorrect!==correct){if((existing??[]).length){const d=await supabase.from("question_options").delete().eq("question_id",questionId);if(d.error)throw d.error;}const ins=await supabase.from("question_options").insert(q.options.map(o=>({...o,question_id:questionId})));if(ins.error)throw ins.error;}return!data?.id;}
async function runProgram(levelId:string,p:RawProgram){const subject=await getSubject(p.subject);await ensureLevelSubject(levelId,subject.id);const curriculum=await getCurriculum(levelId,subject.id,p);const stats={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(let ci=0;ci<p.chapters.length;ci++){const c=p.chapters[ci];if(!c)throw new Error(`[${p.subject}] Chapitre ${ci+1} introuvable.`);const domain=await getDomain(curriculum.id,c.domain,ci+1);const comp=await getCompetency(domain.id,c.competency,1);const chapter=await getChapter(curriculum.id,domain.id,c,ci+1);for(let li=0;li<c.lessons.length;li++){const l=c.lessons[li];if(!l)throw new Error(`[${p.subject}] Leçon ${ci+1}.${li+1} introuvable.`);if(l.questions.length<12)throw new Error(`[${p.subject}] ${l.title}: ${l.questions.length} questions, 12 attendues.`);const lesson=await getLesson(chapter.data.id,comp.id,l,li+1,p.source);if(lesson.created)stats.lessons++;const groups=[{title:`${l.title} — notions essentielles`,difficulty:"easy" as const,score:30,start:0,end:4,instructions:"Maîtrise les définitions, repères et propriétés essentielles."},{title:`${l.title} — application`,difficulty:"medium" as const,score:55,start:4,end:8,instructions:"Applique la notion à une situation nouvelle et justifie ton choix."},{title:`${l.title} — raisonnement`,difficulty:"hard" as const,score:75,start:8,end:12,instructions:"Analyse la situation, justifie le raisonnement et vérifie le résultat."}];for(const g of groups){const ex=await getExercise(lesson.data.id,comp.id,g.title,g.instructions,g.difficulty,g.score);if(ex.created)stats.exercises++;for(let qi=g.start;qi<g.end;qi++){const raw=l.questions[qi];if(!raw)throw new Error(`[${p.subject}] ${l.title}: question ${qi+1} manquante.`);if(await addQuestion(ex.data.id,comp.id,chapter.data.id,toQuestion(raw,qi)))stats.questions++;else stats.duplicates++;}}}}stats.chapters=p.chapters.length;return stats;}
async function main(){console.log("==============================================");console.log(" IMPORT LOT B — 4e — FRANÇAIS + ANGLAIS");console.log("==============================================");console.log(`Statut : ${STATUS}`);const cycle=await getCycle();const level=await getLevel(cycle.id);console.log(`Niveau : ${level.name}`);const totals={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(const p of programs){const st=await runProgram(level.id,p);for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=st[k];console.log(`\n=== ${p.subject.toUpperCase()} 4e ===`);console.log(st);}console.log("\n==============================================");console.log("IMPORT LOT B 4e TERMINÉ");console.log("==============================================");console.log(totals);console.log("Contenu en review par défaut.");}
main().catch(e=>{console.error("❌ Import Lot A 4e échoué");console.error(e);process.exit(1);});
