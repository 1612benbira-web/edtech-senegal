import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) throw new Error("❌ NEXT_PUBLIC_SUPABASE_URL est absente de .env.local");
if (!SUPABASE_SECRET_KEY) throw new Error("❌ SUPABASE_SECRET_KEY est absente de .env.local");

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Pack original EdTech Sénégal – Français 6e.
 *
 * Référentiel de cadrage : ressources ADEM Dakar / Ministère de l'Éducation
 * nationale. Les formulations des cours et questions ci-dessous sont originales
 * et ne reproduisent pas les exercices du fascicule source.
 */
const SOURCE_URL = "https://ademdakar.wixsite.com/adem/eleves-parents";
const CURRICULUM_TITLE = "Français 6e – Programme sénégalais";
const CURRICULUM_VERSION = "6e-francais-v1";

const q = (prompt: string, correct: string, wrong: string[], explanation: string) => ({
  type: "single_choice" as const,
  prompt,
  explanation,
  points: 10,
  difficulty_score: 35,
  options: [correct, ...wrong].map((label, i) => ({ label, is_correct: i === 0, order: i + 1 })),
});

const tf = (prompt: string, answer: boolean, explanation: string) => ({
  type: "true_false" as const,
  prompt,
  explanation,
  points: 10,
  difficulty_score: 25,
  options: ["Vrai", "Faux"].map((label, i) => ({
    label,
    is_correct: answer ? i === 0 : i === 1,
    order: i + 1,
  })),
});

type QuestionSeed = ReturnType<typeof q> | ReturnType<typeof tf>;
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

const lesson = (
  title: string,
  summary: string,
  objectives: string[],
  content: string,
  questions: QuestionSeed[],
  difficulty: "easy" | "medium" | "hard" = "medium"
): LessonSeed => ({
  title,
  summary,
  objectives,
  content,
  exercise: {
    title: `Exercice — ${title}`,
    instructions: "Lis attentivement chaque question puis choisis la réponse la plus juste.",
    difficulty,
    difficulty_score: difficulty === "easy" ? 25 : difficulty === "hard" ? 65 : 45,
    questions,
  },
});

const chapters: ChapterSeed[] = [
  {
    title: "Lire et comprendre un récit",
    competency: "Comprendre un texte narratif",
    competencyDescription: "Repérer les informations explicites, identifier les personnages, le cadre et les principales étapes d'un récit.",
    lessons: [
      lesson(
        "Identifier le narrateur, les personnages et le cadre",
        "Un récit raconte des événements vécus ou imaginés. Pour le comprendre, on repère qui raconte, qui agit, où et quand les événements se déroulent.",
        ["Identifier le narrateur.", "Distinguer personnage principal et personnages secondaires.", "Repérer le lieu et le moment de l'action."],
        `# Comprendre la situation de départ\n\nDans un récit, le **narrateur** est la voix qui raconte. Il peut être un personnage de l'histoire ou raconter les événements de l'extérieur.\n\nLes **personnages** accomplissent les actions. Le personnage principal joue le rôle central ; les personnages secondaires l'aident, l'accompagnent ou s'opposent à lui.\n\nLe **cadre** correspond notamment au lieu et au moment. Les indices peuvent être donnés directement (« à Dakar », « le lendemain ») ou indirectement par les descriptions et les actions.\n\n## Méthode\n1. Lis le texte une première fois sans répondre aux questions.\n2. Cherche qui agit et qui raconte.\n3. Entoure les indices de lieu et de temps.\n4. Résume la situation en une ou deux phrases.\n\n## À retenir\nComprendre un récit, c'est reconstruire une situation : **qui ? fait quoi ? où ? quand ?**`,
        [
          q("Dans un récit, qui raconte les événements ?", "Le narrateur", ["Le décor", "Le lecteur", "Le titre"], "Le narrateur est la voix qui prend en charge le récit."),
          q("Quel élément indique le cadre spatial ?", "À Saint-Louis", ["Le lendemain", "Avec courage", "Rapidement"], "Un lieu renseigne sur le cadre spatial."),
          q("Comment appelle-t-on le personnage qui occupe la place centrale de l'histoire ?", "Le personnage principal", ["Le figurant", "Le narrateur uniquement", "Le lecteur"], "Le personnage principal est au centre des actions et des enjeux du récit."),
          tf("Le lieu et le moment font partie des informations utiles pour comprendre un récit.", true, "Le cadre spatio-temporel aide à situer les événements."),
        ],
        "easy"
      ),
      lesson(
        "Repérer les étapes d'un récit",
        "Un récit bien organisé fait généralement passer le lecteur d'une situation initiale à un événement déclencheur, puis à des péripéties et à une situation finale.",
        ["Reconnaître la situation initiale.", "Identifier l'élément déclencheur et les péripéties.", "Repérer le dénouement."],
        `# Les étapes du récit\n\nOn peut organiser une histoire en plusieurs moments. La **situation initiale** présente le contexte. Un **élément déclencheur** vient modifier l'équilibre. Les **péripéties** racontent les actions et les difficultés. Le **dénouement** apporte une solution et la **situation finale** montre le nouvel équilibre.\n\nExemple : un élève prépare tranquillement un concours ; il perd son cahier la veille ; il cherche dans plusieurs endroits ; une amie le retrouve ; il peut finalement réviser.\n\n## Astuce\nDemande-toi : « Qu'est-ce qui était vrai au début ? Qu'est-ce qui a changé ? Comment le problème est-il résolu ? »`,
        [
          q("Quelle étape présente le contexte avant le problème ?", "La situation initiale", ["Le dénouement", "La péripétie", "La conclusion argumentative"], "La situation initiale installe le cadre et l'équilibre de départ."),
          q("Qu'est-ce qui provoque généralement le changement dans un récit ?", "L'élément déclencheur", ["Le titre", "La description finale", "La ponctuation"], "L'élément déclencheur lance l'action principale."),
          q("Quelle étape apporte la solution au problème ?", "Le dénouement", ["La situation initiale", "Le portrait", "L'exposition d'un argument"], "Le dénouement résout ou clarifie le problème central."),
          tf("Les péripéties correspondent aux actions et difficultés qui se déroulent après l'élément déclencheur.", true, "Les péripéties constituent le développement de l'action."),
        ]
      ),
      lesson(
        "Répondre à des questions de compréhension",
        "Une bonne réponse de compréhension s'appuie sur le texte, reformule l'information et évite les suppositions qui ne sont pas justifiées.",
        ["Repérer une information explicite.", "Justifier une déduction par des indices.", "Formuler une réponse complète."],
        `# Répondre avec précision\n\nUne question de compréhension peut demander une information **explicite**, présente dans le texte, ou une information **implicite**, que l'on déduit à partir de plusieurs indices.\n\nPour répondre, utilise les mots du texte sans recopier inutilement tout le passage. Une phrase complète est préférable à un seul mot lorsque la question demande une explication.\n\n## Exemple\nSi le texte dit : « Awa prit son parapluie et enfila ses bottes avant de sortir », on peut déduire qu'il pleuvait probablement ou que le temps était très humide. Il faut toutefois présenter cette idée comme une déduction si le texte ne dit pas directement « il pleuvait ».`,
        [
          q("Une information explicitement donnée est une information...", "directement présente dans le texte", ["toujours fausse", "inventée par le lecteur", "uniquement donnée par le titre"], "Explicite signifie que l'information est clairement formulée."),
          q("Pour justifier une réponse implicite, il faut surtout...", "s'appuyer sur des indices du texte", ["inventer un événement", "ignorer le texte", "utiliser seulement son opinion"], "Une inférence doit être appuyée par des indices observables."),
          q("Quelle réponse est la plus complète à « Où habite Moussa ? »", "Moussa habite à Thiès.", ["Thiès", "Oui", "Chez lui"], "Une phrase complète répond clairement à la question."),
          tf("Une réponse de compréhension peut être justifiée même si elle n'est pas écrite mot pour mot, à condition de s'appuyer sur des indices.", true, "C'est le principe de la compréhension implicite."),
        ]
      ),
    ],
  },
  {
    title: "Raconter et organiser le temps",
    competency: "Organiser un récit dans le temps",
    competencyDescription: "Utiliser les indicateurs temporels et les temps verbaux pour raconter des actions dans un ordre cohérent.",
    lessons: [
      lesson(
        "Les indicateurs de temps",
        "Les indicateurs temporels permettent de situer et d'enchaîner les actions : hier, auparavant, ensuite, puis, le lendemain, enfin, etc.",
        ["Identifier les indicateurs temporels.", "Ordonner des actions.", "Éviter les ruptures chronologiques inutiles."],
        `# Situer les actions dans le temps\n\nLes expressions **d'abord, ensuite, puis, pendant ce temps, le lendemain, enfin** permettent au lecteur de suivre la chronologie.\n\nPour raconter clairement, on peut construire une ligne du temps avant d'écrire. Cela évite de mélanger les événements.\n\n### Exemple\n**D'abord**, Fatou prépare son sac. **Ensuite**, elle rejoint l'arrêt de bus. **Enfin**, elle arrive au collège.\n\nLes indicateurs peuvent aussi exprimer l'antériorité (« auparavant »), la simultanéité (« pendant que ») ou la postériorité (« après »).`,
        [
          q("Quel mot indique une action qui vient après une autre ?", "Ensuite", ["Auparavant", "Hier", "Jamais"], "« Ensuite » marque la postériorité dans une succession."),
          q("Quel connecteur convient : « ___, nous avons mangé ; ensuite, nous sommes repartis. »", "D'abord", ["Jamais", "Parce que", "Pourtant"], "« D'abord » introduit la première étape."),
          q("Quel groupe exprime la simultanéité ?", "Pendant que", ["Le lendemain", "Finalement", "Auparavant"], "« Pendant que » met deux actions en relation au même moment."),
          tf("« Auparavant » signale généralement une action antérieure.", true, "Auparavant signifie avant le moment dont on parle."),
        ],
        "easy"
      ),
      lesson(
        "Le présent, l'imparfait et le passé composé dans le récit",
        "Les temps du récit ont des rôles différents : le présent peut raconter ou commenter, l'imparfait installe le décor et les habitudes, le passé composé présente des actions achevées.",
        ["Reconnaître le présent, l'imparfait et le passé composé.", "Associer un temps à sa valeur.", "Choisir un temps cohérent dans un récit."],
        `# Les temps du récit\n\nL'**imparfait** sert souvent à décrire, à présenter une habitude ou une action en cours dans le passé : « La cour était calme. »\n\nLe **passé composé** présente fréquemment une action achevée : « Le directeur est arrivé. »\n\nLe **présent** peut raconter des faits au moment où ils se produisent, exprimer une vérité générale ou donner de la vivacité à un récit.\n\n### Astuce\nDans un récit au passé, demande-toi si l'action sert à **installer le décor / l'habitude** (imparfait) ou à **faire avancer l'action** (souvent passé composé).`,
        [
          q("Dans « La cour était silencieuse », le verbe est à quel temps ?", "À l'imparfait", ["Au futur", "Au passé simple", "Au présent"], "« Était » est l'imparfait du verbe être."),
          q("Quel temps convient à une action achevée : « Ce matin, Awa ___ son devoir. »", "a terminé", ["terminait", "terminera", "termine"], "Le passé composé présente ici une action achevée."),
          q("Dans un récit au passé, quel temps sert souvent à installer le décor ?", "L'imparfait", ["Le futur", "L'impératif", "Le présent uniquement"], "L'imparfait permet de décrire le cadre et les habitudes."),
          tf("Le passé composé peut servir à faire avancer l'action d'un récit.", true, "Il présente souvent des événements achevés qui font progresser l'histoire."),
        ]
      ),
      lesson(
        "Raconter un événement dans l'ordre chronologique",
        "Un récit chronologique suit l'ordre des événements et utilise des temps et connecteurs cohérents.",
        ["Construire une chronologie.", "Enchaîner les événements.", "Rédiger un paragraphe narratif cohérent."],
        `# Construire un récit cohérent\n\nAvant d'écrire, note les événements dans l'ordre. Choisis ensuite un temps dominant et garde-le sauf changement justifié.\n\nUne structure simple peut être :\n1. situation de départ ;\n2. événement qui change la situation ;\n3. actions et réactions ;\n4. solution ;\n5. bilan final.\n\nUtilise des connecteurs : **d'abord, puis, après cela, pendant ce temps, finalement**. Chaque étape doit être compréhensible même si le lecteur ne connaît pas ton idée de départ.`,
        [
          q("Quel élément aide le plus à maintenir une chronologie claire ?", "Les connecteurs temporels", ["Les adjectifs uniquement", "Les titres de journaux", "Les parenthèses"], "Les connecteurs signalent l'ordre des actions."),
          q("Quelle séquence est la plus logique ?", "D'abord → ensuite → enfin", ["Enfin → d'abord → ensuite", "Ensuite → enfin → d'abord", "Jamais → puis → hier"], "Cette séquence respecte l'ordre chronologique habituel."),
          q("Avant de rédiger un récit complexe, il est utile de...", "faire une liste chronologique des événements", ["supprimer tous les verbes", "choisir les mots au hasard", "ignorer le cadre"], "La chronologie sert de plan avant la rédaction."),
          tf("Un récit peut être cohérent même si toutes les actions sont placées au hasard.", false, "La cohérence exige des relations temporelles compréhensibles."),
        ]
      ),
    ],
  },
  {
    title: "Décrire un lieu et un personnage",
    competency: "Produire une description organisée",
    competencyDescription: "Décrire un lieu ou une personne en sélectionnant des détails pertinents et en utilisant un vocabulaire précis.",
    lessons: [
      lesson(
        "Décrire un lieu",
        "Une description permet au lecteur de se représenter un lieu grâce à des repères spatiaux, des détails sensoriels et un vocabulaire précis.",
        ["Identifier les éléments d'un lieu.", "Utiliser des repères spatiaux.", "Organiser une description."],
        `# Décrire un lieu\n\nPour décrire un lieu, on peut partir du général vers le particulier, de l'entrée vers le fond, de la gauche vers la droite ou du proche vers le lointain.\n\nLes **repères spatiaux** indiquent les positions : devant, derrière, à gauche, au centre, au bord, au-dessus, près de…\n\nLes sensations enrichissent la description : couleurs, sons, odeurs, température, lumière. L'objectif n'est pas d'accumuler des détails mais de choisir ceux qui permettent d'imaginer le lieu.`,
        [
          q("Quel mot est un repère spatial ?", "À gauche", ["Hier", "Rapidement", "Parce que"], "« À gauche » indique une position dans l'espace."),
          q("Pour organiser une description, on peut aller...", "du général au particulier", ["du hasard au hasard", "uniquement par dates", "sans ordre"], "Une organisation spatiale rend la description plus claire."),
          q("Quel détail est principalement visuel ?", "Une façade blanche", ["Une odeur de café", "Un bruit de moteur", "Un goût sucré"], "La couleur d'une façade est perçue par la vue."),
          tf("Une bonne description doit obligatoirement contenir tous les détails possibles.", false, "Il vaut mieux sélectionner les détails utiles et pertinents."),
        ],
        "easy"
      ),
      lesson(
        "Faire le portrait d'un personnage",
        "Le portrait associe l'apparence physique et les traits de caractère pour faire comprendre qui est le personnage.",
        ["Décrire l'apparence.", "Exprimer des traits de caractère.", "Relier le portrait aux actions du personnage."],
        `# Le portrait\n\nLe **portrait physique** présente l'apparence : taille, visage, vêtements, démarche. Le **portrait moral** présente le caractère : généreux, prudent, curieux, impatient, courageux…\n\nUne description devient plus crédible lorsqu'elle est reliée à une action. Au lieu de dire seulement « Awa est généreuse », on peut montrer qu'elle partage ses fournitures avec une camarade.\n\nUtilise des adjectifs précis et évite les répétitions.`,
        [
          q("Quel élément appartient au portrait moral ?", "La générosité", ["La taille", "La couleur des yeux", "Le vêtement"], "La générosité est un trait de caractère."),
          q("Quel élément appartient au portrait physique ?", "Une démarche rapide", ["La patience", "La jalousie", "Le courage"], "La démarche décrit la manière de se déplacer."),
          q("Pour rendre un portrait plus vivant, il est utile de...", "relier les traits à des actions", ["supprimer les verbes", "répéter le même adjectif", "ne donner aucun détail"], "Les actions permettent de montrer le caractère au lieu de seulement l'affirmer."),
          tf("Un portrait peut mélanger description physique et morale.", true, "Les deux dimensions peuvent être complémentaires."),
        ]
      ),
      lesson(
        "Les adjectifs qualificatifs dans la description",
        "Les adjectifs précisent les noms et permettent de nuancer une description.",
        ["Identifier les adjectifs.", "Choisir des adjectifs précis.", "Accorder l'adjectif avec le nom."],
        `# Les adjectifs qualificatifs\n\nUn adjectif qualificatif donne une précision sur un nom : **une rue étroite**, **des maisons colorées**.\n\nL'adjectif s'accorde généralement en genre et en nombre avec le nom auquel il se rapporte.\n\n### Pour améliorer une description\nRemplace les mots vagues par des mots précis : « une maison » → « une petite maison aux volets bleus ». Mais évite l'accumulation inutile.`,
        [
          q("Dans « une rue étroite », quel mot est l'adjectif ?", "étroite", ["une", "rue", "dans"], "« Étroit » qualifie le nom « rue » et s'accorde au féminin singulier."),
          q("Quelle forme convient : « des maisons ___ » ?", "blanches", ["blanc", "blanche", "blancs"], "« Maisons » est féminin pluriel, donc « blanches »."),
          q("Quel adjectif est le plus précis pour décrire une voix ?", "grave", ["chose", "truc", "machin"], "« Grave » donne une caractéristique précise de la voix."),
          tf("L'adjectif qualificatif peut aider à rendre une description plus précise.", true, "Il ajoute une caractéristique au nom."),
        ]
      ),
    ],
  },
  {
    title: "Insérer un dialogue dans un récit",
    competency: "Faire parler les personnages dans un récit",
    competencyDescription: "Identifier et produire un dialogue en respectant les marques de ponctuation et les verbes de parole.",
    lessons: [
      lesson(
        "Les marques du dialogue",
        "Le dialogue se reconnaît notamment grâce aux paroles rapportées, aux deux-points, aux guillemets ou aux tirets selon la mise en page choisie.",
        ["Repérer les paroles d'un personnage.", "Utiliser une ponctuation adaptée.", "Distinguer récit et paroles."],
        `# Écrire un dialogue\n\nDans un récit, les paroles peuvent être introduites par un verbe de parole : **dire, demander, répondre, murmurer, expliquer**.\n\nExemple :\n\n**Moussa demande : « Tu viens demain ? »**\n\nLe deux-points peut annoncer les paroles. Les guillemets encadrent les paroles rapportées dans cette présentation. Chaque changement de locuteur peut être signalé par un retour à la ligne et un tiret dans une autre présentation.`,
        [
          q("Quel verbe est un verbe de parole ?", "répondre", ["courir", "dormir", "grandir"], "« Répondre » introduit une parole."),
          q("Quel signe peut annoncer des paroles rapportées après un verbe de parole ?", "Les deux-points", ["Le point-virgule uniquement", "L'apostrophe", "Le trait d'union dans tous les cas"], "Les deux-points peuvent annoncer les paroles directes."),
          q("Dans « Awa demande : « Tu viens ? » », quelle phrase est prononcée par Awa ?", "Tu viens ?", ["Awa demande", "Awa", "demande"], "Les mots entre guillemets représentent les paroles."),
          tf("Le dialogue doit permettre au lecteur d'identifier qui parle.", true, "Les verbes de parole, la mise en page et le contexte peuvent aider."),
        ],
        "easy"
      ),
      lesson(
        "Faire avancer le récit grâce au dialogue",
        "Un dialogue ne sert pas seulement à faire joli : il peut révéler un conflit, donner une information ou faire progresser l'action.",
        ["Choisir des répliques utiles.", "Faire progresser l'action.", "Varier les verbes de parole."],
        `# Un dialogue utile\n\nUne bonne réplique apporte une information, exprime une émotion, pose un problème ou provoque une action.\n\nÉvite les conversations qui répètent ce que le lecteur sait déjà. Les verbes de parole peuvent aussi donner une indication de ton : **murmurer, crier, protester, demander, préciser**.\n\nLe narrateur peut intervenir entre les répliques pour décrire les gestes et les réactions.`,
        [
          q("Quel est l'un des rôles d'un dialogue dans un récit ?", "Faire progresser l'action", ["Remplacer tous les paragraphes", "Supprimer les personnages", "Éviter toute information"], "Une réplique efficace peut modifier la situation ou apporter une information."),
          q("Quel verbe indique une parole prononcée à voix basse ?", "murmurer", ["crier", "hurler", "annoncer à haute voix"], "Murmurer signifie parler doucement."),
          q("Pourquoi éviter les répliques inutiles ?", "Pour garder un récit dynamique et pertinent", ["Pour supprimer toute émotion", "Pour empêcher les personnages de parler", "Pour rendre le texte incompréhensible"], "Chaque réplique doit avoir une fonction dans le récit."),
          tf("Le narrateur peut décrire les gestes entre deux répliques.", true, "Le récit et le dialogue peuvent se compléter."),
        ]
      ),
      lesson(
        "Du discours direct au discours indirect",
        "Le discours direct reproduit les paroles ; le discours indirect les intègre dans la phrase du narrateur et peut entraîner des changements de pronoms et de temps.",
        ["Reconnaître le discours direct.", "Transformer une phrase simple au discours indirect.", "Adapter les pronoms et les temps lorsque nécessaire."],
        `# Deux façons de rapporter des paroles\n\n**Discours direct** : Mariama dit : « Je viens demain. »\n\n**Discours indirect** : Mariama dit qu'elle viendra le lendemain.\n\nAu discours indirect, les paroles deviennent une partie de la phrase. Il faut parfois modifier les pronoms et certains repères temporels selon le contexte : **je → il/elle**, **demain → le lendemain**.`,
        [
          q("Dans « Il dit : « Je suis prêt. » », quelle forme est utilisée ?", "Le discours direct", ["Le discours indirect", "Le résumé", "La description"], "Les paroles sont reproduites directement entre guillemets."),
          q("Transforme : « Awa dit : “Je viens.” »", "Awa dit qu'elle vient.", ["Awa dit que je viens.", "Awa dit qu'il vient.", "Awa dit : qu'elle vient."], "Le pronom « je » devient « elle » car il désigne Awa."),
          q("Dans un récit au passé, « demain » peut devenir...", "le lendemain", ["hier", "la veille", "maintenant"], "Le repère temporel s'adapte au nouveau point de vue."),
          tf("Le discours indirect utilise généralement une proposition introduite par « que » pour une déclaration.", true, "« Que » introduit souvent la parole rapportée au discours indirect."),
        ],
        "hard"
      ),
    ],
  },
  {
    title: "Enrichir son vocabulaire",
    competency: "Comprendre et utiliser un vocabulaire précis",
    competencyDescription: "Construire des familles de mots, reconnaître les relations de sens et choisir un niveau de langue adapté.",
    lessons: [
      lesson(
        "Familles de mots et formation des mots",
        "Une famille de mots regroupe des mots construits autour d'un même radical et liés par le sens.",
        ["Identifier un radical.", "Regrouper des mots d'une même famille.", "Reconnaître préfixes et suffixes simples."],
        `# Les familles de mots\n\nLes mots **terre, terrestre, enterrer, déterrer** appartiennent à une même famille parce qu'ils sont liés par le sens et par une base commune.\n\nLe **préfixe** se place avant le radical : possible → impossible. Le **suffixe** se place après : courage → courageux.\n\nAttention : une ressemblance de lettres ne suffit pas ; il faut aussi une relation de sens.`,
        [
          q("Quel mot appartient à la famille de « terre » ?", "terrestre", ["terrassement", "terminer", "terreur"], "« Terrestre » est construit sur la même base de sens que « terre »."),
          q("Dans « impossible », quel élément est le préfixe ?", "im-", ["-ible", "poss", "possible"], "« im- » modifie le sens du mot « possible »."),
          q("Quel mot est formé avec un suffixe ?", "chanteur", ["revenir", "impossible", "défaire"], "« -eur » permet de former un nom à partir de « chanter »."),
          tf("Deux mots qui se ressemblent par quelques lettres appartiennent toujours à la même famille.", false, "Il faut vérifier le lien de sens et de formation."),
        ]
      ),
      lesson(
        "Synonymes, antonymes et polysémie",
        "Les synonymes ont un sens proche, les antonymes un sens opposé et un même mot peut avoir plusieurs sens selon le contexte.",
        ["Trouver un synonyme adapté.", "Trouver un antonyme.", "Comprendre le sens d'un mot selon le contexte."],
        `# Les relations de sens\n\nUn **synonyme** a un sens proche : heureux / content. Un **antonyme** exprime une opposition : grand / petit.\n\nLa **polysémie** désigne le fait qu'un même mot peut avoir plusieurs sens. « Une feuille » peut être une partie d'une plante ou une feuille de papier. Le contexte permet de choisir le bon sens.\n\nUn synonyme n'est pas forcément interchangeable dans toutes les phrases : il faut tenir compte du contexte et du niveau de langue.`,
        [
          q("Quel mot est un synonyme de « commencer » ?", "débuter", ["terminer", "oublier", "fermer"], "« Débuter » et « commencer » ont un sens proche."),
          q("Quel est l'antonyme de « généreux » ?", "égoïste", ["solidaire", "gentil", "patient"], "« Égoïste » s'oppose au fait de donner ou partager volontiers."),
          q("Dans « une feuille de papier », le mot « feuille » désigne...", "une page", ["une partie d'un arbre", "une racine", "un fruit"], "Le complément « de papier » indique le sens concerné."),
          tf("Le contexte aide à déterminer le sens d'un mot polysémique.", true, "Le contexte fournit les indices nécessaires."),
        ]
      ),
      lesson(
        "Les niveaux de langue",
        "Le niveau de langue dépend de la situation : familier entre proches, courant dans la plupart des échanges, soutenu dans des contextes formels.",
        ["Reconnaître les niveaux de langue.", "Adapter son vocabulaire au destinataire.", "Éviter les mélanges inappropriés."],
        `# Adapter son langage\n\nLe **niveau familier** convient à des échanges très proches et spontanés. Le **niveau courant** est adapté à la plupart des situations scolaires. Le **niveau soutenu** utilise des formulations plus recherchées et convient à certains contextes formels.\n\nÀ l'école, dans une lettre officielle ou face à une personne inconnue, le niveau courant ou soutenu est généralement préférable.`,
        [
          q("Quelle expression appartient plutôt au niveau familier ?", "C'est super cool !", ["Je vous prie d'agréer", "Veuillez trouver ci-joint", "Nous vous remercions"], "« C'est super cool ! » est une formulation familière."),
          q("Quel niveau convient généralement à une lettre officielle ?", "Courant ou soutenu", ["Très familier", "Argotique uniquement", "Abréviations de discussion"], "Une lettre officielle demande une formulation claire et respectueuse."),
          q("Pourquoi adapter son niveau de langue ?", "Pour tenir compte de la situation et du destinataire", ["Pour utiliser toujours les mêmes mots", "Pour rendre le message incompréhensible", "Pour supprimer les règles"], "La communication dépend du contexte."),
          tf("Le langage familier est toujours incorrect.", false, "Il peut être adapté à certaines situations ; il devient inapproprié dans d'autres."),
        ]
      ),
    ],
  },
  {
    title: "Construire et transformer la phrase",
    competency: "Maîtriser la phrase simple",
    competencyDescription: "Identifier les constituants de la phrase, reconnaître les types et formes et utiliser la ponctuation avec précision.",
    lessons: [
      lesson(
        "La phrase et ses constituants",
        "Une phrase organisée autour d'un verbe comporte généralement un groupe sujet et un groupe verbal, auxquels peuvent s'ajouter des compléments.",
        ["Repérer le verbe.", "Identifier le sujet.", "Distinguer groupe sujet et groupe verbal."],
        `# La phrase simple\n\nLe **verbe** est un élément central : il permet de repérer l'action ou l'état. Pour trouver le sujet, on pose souvent la question « Qui est-ce qui ? » ou « Qu'est-ce qui ? » avant le verbe.\n\nExemple : **Les élèves révisent leurs leçons.**\n- Sujet : les élèves\n- Verbe : révisent\n- Groupe verbal : révisent leurs leçons\n\nUne phrase peut être enrichie par des compléments sans perdre son organisation.`,
        [
          q("Dans « Les élèves révisent », quel est le sujet ?", "Les élèves", ["révisent", "élèves révisent", "les"], "Le groupe qui accomplit l'action est « les élèves »."),
          q("Quel est le verbe dans « Awa lit un roman » ?", "lit", ["Awa", "un roman", "roman"], "« Lit » est le verbe conjugué de la phrase."),
          q("Pour trouver le sujet, on peut poser la question...", "Qui est-ce qui ?", ["Combien ?", "Pourquoi uniquement ?", "Comment écrire ?"], "Cette question aide à identifier le groupe sujet."),
          tf("Le groupe sujet peut être constitué de plusieurs mots.", true, "Par exemple : « Les élèves de 6e » forme un groupe sujet."),
        ],
        "easy"
      ),
      lesson(
        "Les types de phrases",
        "Une phrase peut être déclarative, interrogative, injonctive ou exclamative selon l'intention de communication.",
        ["Reconnaître les quatre types de phrases.", "Associer type et intention.", "Utiliser la ponctuation adaptée."],
        `# Les types de phrases\n\n- **Déclarative** : elle donne une information. « Le cours commence. »\n- **Interrogative** : elle pose une question. « Le cours commence-t-il ? »\n- **Injonctive** : elle donne un ordre, un conseil ou une consigne. « Ouvrez vos cahiers. »\n- **Exclamative** : elle exprime une émotion forte. « Quel beau résultat ! »\n\nLa ponctuation finale aide à reconnaître le type, mais il faut surtout observer l'intention.`,
        [
          q("« Ferme la porte. » est une phrase...", "injonctive", ["interrogative", "exclamative", "narrative"], "Elle donne un ordre."),
          q("« Pourquoi arrives-tu tard ? » est...", "une phrase interrogative", ["une phrase injonctive", "une phrase déclarative", "une phrase nominale"], "Elle pose une question."),
          q("Quelle phrase exprime une émotion forte ?", "Comme ce paysage est magnifique !", ["Le paysage est magnifique.", "Le paysage est-il magnifique ?", "Observe le paysage."], "Le point d'exclamation et l'émotion indiquent le type exclamative."),
          tf("Une phrase injonctive peut exprimer un conseil et pas seulement un ordre.", true, "« Pense à réviser » est une consigne ou un conseil."),
        ]
      ),
      lesson(
        "Les formes affirmative, négative et emphatique",
        "La forme négative transforme l'affirmation, tandis que certaines constructions permettent de mettre un élément en valeur.",
        ["Transformer une phrase affirmative en phrase négative.", "Reconnaître la négation.", "Comprendre la mise en relief simple."],
        `# Transformer une phrase\n\nLa négation française utilise souvent **ne ... pas** : « Il vient » → « Il ne vient pas ». D'autres négations existent : **ne... jamais**, **ne... plus**, **ne... rien**.\n\nLa mise en relief peut attirer l'attention sur un élément : « C'est Awa qui a gagné. »\n\nÀ l'écrit, ne supprime pas le premier élément de la négation dans une phrase scolaire standard.`,
        [
          q("Transforme « Il vient » à la forme négative.", "Il ne vient pas.", ["Il vient pas.", "Il ne vient.", "Pas il vient."], "La négation standard utilise « ne ... pas »."),
          q("Quelle phrase contient une négation de fréquence ?", "Il ne vient jamais le dimanche.", ["Il vient le dimanche.", "Il vient demain.", "Il vient souvent."], "« Jamais » exprime l'absence totale de fréquence."),
          q("Dans « C'est Mariama qui a répondu », quel élément est mis en valeur ?", "Mariama", ["C'est", "a répondu", "qui"], "La structure « c'est... qui » met le sujet en relief."),
          tf("« Ne... plus » signifie qu'une action continue davantage.", false, "« Ne... plus » indique que l'action a cessé."),
        ]
      ),
    ],
  },
  {
    title: "Le groupe nominal et ses expansions",
    competency: "Enrichir le groupe nominal",
    competencyDescription: "Identifier le nom noyau, les déterminants et les principales expansions du groupe nominal.",
    lessons: [
      lesson(
        "Déterminants et noms",
        "Le déterminant accompagne le nom et renseigne notamment sur le genre, le nombre ou la quantité.",
        ["Identifier le nom noyau.", "Reconnaître les déterminants.", "Accorder déterminant et nom."],
        `# Le groupe nominal\n\nDans **les grandes maisons**, le nom noyau est **maisons**. Le déterminant **les** accompagne le nom et indique le pluriel.\n\nOn rencontre notamment les articles définis (le, la, les), indéfinis (un, une, des), possessifs (mon, ton, son…) et démonstratifs (ce, cette, ces).\n\nLe déterminant et le nom doivent être compatibles en genre et en nombre.`,
        [
          q("Quel est le nom noyau dans « ces belles maisons » ?", "maisons", ["ces", "belles", "ces belles"], "Le nom noyau est le mot principal du groupe nominal."),
          q("Quel déterminant convient : « ___ école » ?", "cette", ["ces", "ce", "des"], "« École » est féminin singulier : « cette école »."),
          q("Quel groupe est au pluriel ?", "les élèves", ["un élève", "la classe", "cet élève"], "Le déterminant « les » et le nom au pluriel indiquent le nombre."),
          tf("Le déterminant peut donner une information sur le nombre du nom.", true, "Par exemple, « les » indique le pluriel."),
        ],
        "easy"
      ),
      lesson(
        "L'adjectif et le complément du nom",
        "Les expansions du nom ajoutent des informations : adjectif qualificatif, complément du nom et autres groupes selon la phrase.",
        ["Identifier un adjectif épithète.", "Identifier un complément du nom.", "Enrichir un groupe nominal."],
        `# Les expansions du nom\n\nDans **une grande cour**, « grande » est un adjectif qualificatif qui précise le nom « cour ».\n\nDans **la cour de l'école**, « de l'école » est un complément du nom : il précise de quelle cour il s'agit.\n\nEnrichir un groupe nominal permet de rendre une description plus précise : **un marché** → **un grand marché couvert de Dakar**.`,
        [
          q("Dans « une cour spacieuse », quel mot est l'adjectif ?", "spacieuse", ["une", "cour", "une cour"], "« Spacieuse » qualifie « cour »."),
          q("Dans « le marché de Sandaga », quel groupe complète le nom « marché » ?", "de Sandaga", ["le", "marché", "le marché"], "« De Sandaga » précise le nom « marché »."),
          q("Quelle expansion est un complément du nom ?", "de l'école", ["rapide", "grande", "ces"], "Le groupe prépositionnel « de l'école » complète le nom."),
          tf("Une expansion du nom peut apporter une précision sans changer le nom noyau.", true, "Elle enrichit le groupe nominal autour du même noyau."),
        ]
      ),
      lesson(
        "La proposition subordonnée relative",
        "La relative complète un nom et est souvent introduite par un pronom relatif comme qui, que, dont ou où.",
        ["Reconnaître une relative simple.", "Identifier le nom qu'elle complète.", "Utiliser qui, que, dont et où dans des phrases simples."],
        `# La relative\n\nUne proposition subordonnée relative complète un nom appelé **antécédent**.\n\nExemples :\n- **Le livre qui est sur la table** est à Awa.\n- **La maison que nous visitons** est ancienne.\n- **Le village où je suis né** se trouve dans la région de Thiès.\n\nLe choix du pronom relatif dépend de sa fonction et de la construction de la phrase.`,
        [
          q("Dans « Le livre qui est sur la table », quel mot est l'antécédent ?", "livre", ["table", "qui", "est"], "La relative « qui est sur la table » complète le nom « livre »."),
          q("Quel pronom relatif convient : « La maison ___ nous visitons » ?", "que", ["où", "qui", "dont"], "« Que » est COD du verbe « visitons » dans cette phrase."),
          q("Quel pronom convient pour un lieu : « Le village ___ je suis né » ?", "où", ["que", "qui", "dont"], "« Où » peut introduire une relative exprimant le lieu."),
          tf("Une proposition relative peut préciser un nom.", true, "C'est précisément l'une de ses fonctions principales."),
        ],
        "hard"
      ),
    ],
  },
  {
    title: "Les fonctions grammaticales",
    competency: "Identifier les fonctions dans la phrase",
    competencyDescription: "Distinguer sujet, COD, COI, attribut et principaux compléments circonstanciels.",
    lessons: [
      lesson(
        "Sujet, verbe et attribut",
        "Le sujet commande l'accord du verbe ; l'attribut du sujet donne une caractéristique ou une identité au sujet après certains verbes d'état.",
        ["Identifier le sujet.", "Identifier un verbe d'état.", "Reconnaître l'attribut du sujet."],
        `# Sujet et attribut\n\nLe **sujet** est celui dont on parle ou qui réalise l'action.\n\nAprès un verbe d'état comme **être, sembler, paraître, devenir, rester**, un groupe peut être **attribut du sujet** : « La classe est calme. » « Calme » donne une caractéristique à « la classe ».\n\nLe sujet et le verbe doivent être accordés.`,
        [
          q("Dans « Les élèves travaillent », quel est le sujet ?", "Les élèves", ["travaillent", "élèves travaillent", "les"], "Le groupe sujet réalise l'action."),
          q("Quel verbe est un verbe d'état ?", "sembler", ["manger", "courir", "écrire"], "« Sembler » peut introduire un attribut du sujet."),
          q("Dans « La cour est vaste », quelle est la fonction de « vaste » ?", "Attribut du sujet", ["COD", "COI", "Sujet"], "« Vaste » caractérise le sujet « la cour » après le verbe être."),
          tf("Le sujet peut être placé après le verbe dans certaines phrases.", true, "Par exemple : « Arrivent les élèves. »"),
        ]
      ),
      lesson(
        "COD et COI",
        "Le complément d'objet direct complète directement le verbe ; le complément d'objet indirect est généralement introduit par une préposition.",
        ["Identifier le COD.", "Identifier le COI.", "Utiliser les questions qui aident à les distinguer."],
        `# COD et COI\n\nLe **COD** complète directement le verbe : « Awa lit **un livre**. » On peut poser « lit quoi ? ».\n\nLe **COI** est généralement introduit par une préposition : « Awa pense **à son examen**. » On peut poser « pense à quoi ? ».\n\nAttention : la préposition seule ne suffit pas toujours ; il faut regarder la construction du verbe.`,
        [
          q("Dans « Moussa mange le riz », quel est le COD ?", "le riz", ["Moussa", "mange", "le"], "Moussa mange quoi ? → le riz."),
          q("Dans « Awa parle à son amie », quel est le COI ?", "à son amie", ["Awa", "parle", "son amie"], "Le groupe est introduit par « à » et complète le verbe « parle »."),
          q("Quelle question aide à trouver un COD ?", "Qui ? ou quoi ?", ["Où uniquement ?", "Quand uniquement ?", "Combien de lettres ?"], "Le COD répond souvent à « qui ? » ou « quoi ? » après le verbe."),
          tf("Le COD est toujours introduit par une préposition.", false, "Le COD est directement relié au verbe, sans préposition obligatoire."),
        ]
      ),
      lesson(
        "Les compléments circonstanciels",
        "Les compléments circonstanciels précisent les circonstances de l'action : lieu, temps, manière, cause, but, etc.",
        ["Identifier le lieu et le temps.", "Identifier la manière et la cause.", "Comprendre la mobilité de certains compléments."],
        `# Les circonstances\n\nDans « Nous travaillons **à la bibliothèque** », le groupe indique le **lieu**. Dans « Nous travaillons **le soir** », il indique le **temps**. Dans « Il répond **calmement** », il indique la **manière**.\n\nBeaucoup de compléments circonstanciels peuvent être déplacés : « Le soir, nous révisons. » / « Nous révisons le soir. »\n\nLe sens de la question permet d'identifier la circonstance : où ? quand ? comment ? pourquoi ? dans quel but ?`,
        [
          q("Dans « Nous étudions à Dakar », quel est le complément circonstanciel de lieu ?", "à Dakar", ["nous", "étudions", "Dakar"], "Le groupe répond à la question « où ? »."),
          q("Dans « Le matin, Awa lit », quel complément indique le temps ?", "Le matin", ["Awa", "lit", "Awa lit"], "« Le matin » répond à la question « quand ? »."),
          q("Dans « Il parle doucement », quel complément indique la manière ?", "doucement", ["il", "parle", "il parle"], "« Doucement » précise comment il parle."),
          tf("Un complément circonstanciel de lieu peut souvent être déplacé dans la phrase.", true, "« À Dakar, nous étudions » et « Nous étudions à Dakar » sont possibles."),
        ]
      ),
    ],
  },
  {
    title: "Conjuguer pour raconter et communiquer",
    competency: "Maîtriser les temps verbaux usuels",
    competencyDescription: "Conjuguer et employer correctement les temps usuels du cycle : présent, imparfait, passé composé et futur simple.",
    lessons: [
      lesson(
        "Le présent de l'indicatif",
        "Le présent exprime notamment une action actuelle, une habitude ou une vérité générale.",
        ["Conjuguer des verbes réguliers au présent.", "Reconnaître les valeurs du présent.", "Éviter les erreurs d'accord."],
        `# Le présent\n\nLe présent peut indiquer ce qui se passe maintenant : « Je lis. » Il peut aussi exprimer une habitude : « Chaque soir, je révise. » ou une vérité générale : « L'eau bout à 100 °C dans les conditions usuelles. »\n\nPour conjuguer, repère le groupe du verbe et son sujet. Certains verbes fréquents sont irréguliers : être, avoir, aller, faire, venir.`,
        [
          q("Quelle forme est correcte : « Nous ___ au collège. »", "allons", ["allez", "va", "aller"], "Le sujet « nous » commande la forme « allons »."),
          q("Quel emploi du présent trouve-t-on dans « Chaque matin, il lit. » ?", "Une habitude", ["Une action future uniquement", "Une action passée", "Une supposition"], "« Chaque matin » indique une répétition habituelle."),
          q("Quelle forme est correcte : « Vous ___ vos devoirs. »", "faites", ["fais", "fait", "font"], "Le sujet « vous » donne « faites » pour le verbe faire."),
          tf("Le présent peut exprimer une vérité générale.", true, "C'est l'une des valeurs du présent de l'indicatif."),
        ],
        "easy"
      ),
      lesson(
        "L'imparfait et le passé composé",
        "L'imparfait décrit souvent une situation ou une habitude passée ; le passé composé présente fréquemment un événement achevé.",
        ["Former l'imparfait.", "Former le passé composé.", "Choisir le temps selon la valeur."],
        `# Deux temps du passé\n\nL'imparfait sert souvent à installer un décor, décrire une habitude ou une action en cours : « Il faisait chaud. »\n\nLe passé composé se construit avec **avoir** ou **être** au présent + participe passé : « Elle a travaillé. » « Ils sont partis. »\n\nDans un récit, les deux temps peuvent se compléter : « Il pleuvait quand le bus est arrivé. »`,
        [
          q("Quel temps convient : « Quand j'étais petit, je ___ souvent au village. »", "jouais", ["jouerai", "ai joué", "joue"], "L'imparfait exprime ici une habitude passée."),
          q("Comment forme-t-on généralement le passé composé ?", "Auxiliaire + participe passé", ["Infinitif seul", "Préfixe + nom", "Adjectif + déterminant"], "Exemple : « a travaillé », « sont partis »."),
          q("Dans « Il pleuvait quand le bus est arrivé », quel temps présente l'événement ponctuel ?", "Le passé composé", ["L'imparfait", "Le présent", "Le futur"], "« Est arrivé » marque l'événement qui survient dans le décor posé par « pleuvait »."),
          tf("L'imparfait peut exprimer une habitude passée.", true, "Exemple : « Chaque dimanche, nous visitions nos grands-parents. »"),
        ]
      ),
      lesson(
        "Le futur simple",
        "Le futur simple sert à annoncer une action à venir, une prévision ou un engagement.",
        ["Former le futur simple.", "Identifier ses terminaisons.", "Utiliser le futur dans un projet."],
        `# Le futur simple\n\nLes terminaisons du futur simple sont : **-ai, -as, -a, -ons, -ez, -ont**.\n\nPour beaucoup de verbes, on ajoute ces terminaisons à l'infinitif : je parlerai, nous finirons. Certains verbes ont un radical particulier : être → ser-, avoir → aur-, aller → ir-.\n\nLe futur est utile pour annoncer un projet : « Demain, nous visiterons le musée. »`,
        [
          q("Quelle forme est correcte : « Demain, nous ___ au musée. »", "irons", ["allons", "iront", "allerons"], "Le futur du verbe aller à « nous » est « irons »."),
          q("Quelle est la terminaison de « vous parlerez » ?", "-ez", ["-ons", "-ont", "-as"], "La terminaison « -ez » correspond à « vous »."),
          q("Quel radical utilise-t-on dans « je serai » ?", "ser-", ["êt-", "soi-", "ét-"], "Le verbe être possède le radical irrégulier « ser- » au futur."),
          tf("Le futur simple peut servir à annoncer un projet.", true, "Il permet notamment de parler d'actions à venir."),
        ],
        "easy"
      ),
    ],
  },
  {
    title: "Accorder les mots et éviter les erreurs",
    competency: "Maîtriser les accords et l'orthographe grammaticale",
    competencyDescription: "Accorder le groupe nominal et le verbe et distinguer plusieurs homophones grammaticaux fréquents.",
    lessons: [
      lesson(
        "L'accord dans le groupe nominal",
        "Le déterminant, le nom et l'adjectif s'accordent en genre et en nombre lorsqu'ils appartiennent au même groupe nominal.",
        ["Identifier genre et nombre.", "Accorder un adjectif.", "Vérifier une chaîne d'accords."],
        `# Les accords du groupe nominal\n\nDans **les grandes maisons blanches**, le déterminant, le nom et les adjectifs sont au féminin pluriel.\n\nPour vérifier l'accord, trouve d'abord le nom noyau, puis demande : masculin ou féminin ? singulier ou pluriel ?\n\nExemple : **un petit village calme** → **des petits villages calmes**.`,
        [
          q("Quelle forme convient : « des maison___ blanche___ » ?", "des maisons blanches", ["des maison blanche", "des maisons blanche", "des maison blanches"], "Le nom et l'adjectif passent au pluriel."),
          q("Quel élément commande l'accord de l'adjectif ?", "Le nom qu'il qualifie", ["Le point final", "Le lecteur", "Le titre"], "L'adjectif s'accorde avec le nom auquel il se rapporte."),
          q("Quelle phrase est correctement accordée ?", "Une grande cour propre.", ["Une grand cour propre.", "Un grande cour propre.", "Une grandes cour propres."], "« Cour » est féminin singulier : grande, propre."),
          tf("Un adjectif peut changer de forme selon le genre et le nombre du nom.", true, "Exemple : petit, petite, petits, petites."),
        ],
        "easy"
      ),
      lesson(
        "L'accord sujet-verbe",
        "Le verbe s'accorde avec son sujet en personne et en nombre, même lorsque le sujet est éloigné du verbe.",
        ["Repérer le sujet réel.", "Accorder le verbe.", "Éviter les pièges avec les groupes longs."],
        `# Sujet et verbe\n\nLe verbe doit correspondre à son sujet : **Les élèves travaillent** ; **L'élève travaille**.\n\nPour éviter une erreur, ne te laisse pas tromper par un nom placé entre le sujet et le verbe : « La liste des élèves **est** complète. » Le sujet est « la liste », pas « élèves ».`,
        [
          q("Quelle forme convient : « Les élèves ___ en classe. »", "travaillent", ["travaille", "travaillons", "travailles"], "Le sujet « les élèves » est à la troisième personne du pluriel."),
          q("Dans « La liste des élèves est longue », quel est le sujet ?", "La liste", ["les élèves", "longue", "des élèves"], "Le noyau du groupe sujet est « liste », au singulier."),
          q("Quelle phrase est correcte ?", "Les enfants jouent.", ["Les enfants joue.", "L'enfant jouent.", "Les enfant jouent."], "Le sujet pluriel « les enfants » exige « jouent »."),
          tf("Le nom placé juste avant le verbe est toujours le sujet.", false, "Il faut identifier le véritable groupe sujet et son noyau."),
        ]
      ),
      lesson(
        "Homophones grammaticaux fréquents",
        "Certains mots se prononcent de la même manière mais s'écrivent différemment : a/à, et/est, son/sont, on/ont.",
        ["Distinguer a/à.", "Distinguer et/est.", "Distinguer on/ont et son/sont."],
        `# Les homophones\n\n**a / à** : « Il a un livre » / « Il va à l'école ». On peut remplacer « a » par « avait ».\n\n**et / est** : « Awa et Moussa » / « Moussa est prêt ». On peut remplacer « est » par « était ».\n\n**on / ont** : « On travaille » / « Ils ont travaillé ». On peut remplacer « ont » par « avaient ».\n\n**son / sont** : « son cahier » / « Ils sont prêts ».`,
        [
          q("Quelle phrase est correcte ?", "Il va à l'école.", ["Il va a l'école.", "Il vas à l'école.", "Il va as l'école."], "La préposition de lieu s'écrit « à »."),
          q("Dans « Moussa ___ prêt », quel mot convient ?", "est", ["et", "ai", "es"], "On peut dire « Moussa était prêt » : il s'agit du verbe être."),
          q("Dans « Ils ___ un livre », quel mot convient ?", "ont", ["on", "à", "sont"], "« Ont » est le verbe avoir à la troisième personne du pluriel."),
          tf("On peut parfois utiliser un remplacement par « avait » ou « était » pour vérifier un homophone.", true, "Ces tests aident à distinguer plusieurs homophones grammaticaux."),
        ]
      ),
    ],
  },
  {
    title: "Lire, interpréter et apprécier un poème",
    competency: "Comprendre un texte poétique",
    competencyDescription: "Repérer les images, les répétitions, les sons et les émotions dans un texte poétique court.",
    lessons: [
      lesson(
        "Le vers, la strophe et les répétitions",
        "Un poème peut être organisé en vers et en strophes. Les répétitions donnent du rythme et peuvent insister sur une idée.",
        ["Reconnaître un vers.", "Reconnaître une strophe.", "Observer les répétitions."],
        `# Découvrir le poème\n\nUn **vers** est une ligne poétique. Une **strophe** regroupe plusieurs vers. Les poèmes peuvent utiliser des répétitions de mots, de sons ou de structures.\n\nIl n'est pas nécessaire qu'un poème rime pour être un poème. La mise en page, le rythme, les images et le choix des mots participent également à son effet.`,
        [
          q("Comment appelle-t-on une ligne d'un poème ?", "Un vers", ["Un paragraphe", "Une note", "Un dialogue"], "Le vers correspond à une ligne poétique."),
          q("Comment appelle-t-on un groupe de vers ?", "Une strophe", ["Un chapitre", "Une phrase", "Un titre"], "Une strophe rassemble plusieurs vers."),
          q("À quoi peut servir une répétition ?", "À créer un effet de rythme ou d'insistance", ["À supprimer le sens", "À interdire toute émotion", "À remplacer le titre"], "La répétition peut renforcer une idée ou une musicalité."),
          tf("Tous les poèmes doivent obligatoirement rimer.", false, "La poésie peut exister sans rimes régulières."),
        ],
        "easy"
      ),
      lesson(
        "Images et comparaisons",
        "Les images permettent de représenter une idée ou une émotion de manière plus expressive ; la comparaison rapproche explicitement deux éléments.",
        ["Identifier une comparaison.", "Repérer le comparé et le comparant.", "Comprendre l'effet produit."],
        `# Créer des images\n\nUne comparaison rapproche deux éléments à l'aide d'un outil comme **comme, tel que, semblable à** : « Le ciel est rouge **comme** une braise. »\n\nLe premier élément est le **comparé**, le second le **comparant**. L'image aide le lecteur à visualiser ou à ressentir.\n\nLa métaphore rapproche également deux éléments mais sans outil de comparaison explicite : « Le soleil est une boule d'or. »`,
        [
          q("Quel mot introduit souvent une comparaison ?", "comme", ["donc", "mais", "car"], "« Comme » est un outil fréquent de comparaison."),
          q("Dans « Il est courageux comme un lion », quel est le comparé ?", "Il", ["lion", "comme", "courageux"], "C'est « il » qui est rapproché du lion."),
          q("Quel est le comparant dans « blanche comme la neige » ?", "la neige", ["blanche", "comme", "elle"], "La neige sert de référence pour la comparaison."),
          tf("Une métaphore peut fonctionner sans le mot « comme ».", true, "Exemple : « Cette enfant est un rayon de soleil. »"),
        ]
      ),
      lesson(
        "Exprimer une émotion et interpréter un poème",
        "Lire un poème consiste aussi à identifier les émotions, les thèmes et les indices qui les font ressentir.",
        ["Identifier une émotion.", "Justifier une interprétation.", "Relier les mots aux effets produits."],
        `# Interpréter\n\nUn lecteur peut ressentir de la joie, de la nostalgie, de la peur, de l'admiration ou de la colère. Pour justifier une interprétation, cite ou reformule les indices : vocabulaire, répétitions, images, ponctuation, rythme.\n\nÉvite les réponses absolues lorsqu'un texte laisse plusieurs interprétations possibles. Formule : « Je pense que… parce que… ».`,
        [
          q("Quelle réponse est la mieux justifiée ?", "Je pense que le poème exprime la nostalgie car le locuteur évoque souvent son enfance.", ["C'est triste, c'est tout.", "Le poème est forcément heureux.", "Je ne sais pas."], "Une interprétation efficace associe une idée à un indice textuel."),
          q("Quel indice peut aider à repérer une émotion ?", "Le vocabulaire utilisé", ["Le nombre de pages du manuel", "Le nom de l'imprimerie", "La date du cours uniquement"], "Les mots choisis peuvent exprimer une émotion."),
          q("Que faut-il faire avant de donner une interprétation ?", "Repérer des indices dans le texte", ["Inventer le contexte", "Ignorer le texte", "Choisir au hasard"], "L'interprétation doit être fondée sur la lecture."),
          tf("Une interprétation peut être différente entre deux lecteurs si chacun la justifie par le texte.", true, "Plusieurs interprétations sont possibles lorsque le texte reste ouvert, à condition d'être argumentées."),
        ]
      ),
    ],
  },
  {
    title: "Écrire pour raconter et décrire",
    competency: "Produire un texte cohérent",
    competencyDescription: "Planifier, rédiger, organiser et relire un court texte narratif ou descriptif adapté à une consigne.",
    lessons: [
      lesson(
        "Préparer une rédaction",
        "Avant d'écrire, il faut comprendre la consigne, choisir les idées et organiser un plan simple.",
        ["Identifier le sujet.", "Choisir les informations utiles.", "Construire un plan."],
        `# Préparer avant d'écrire\n\nUne rédaction réussie commence par une lecture attentive de la consigne. Demande-toi : **qui ? quoi ? où ? quand ? pourquoi ? pour qui ?**\n\nEnsuite, note quelques idées et classe-les. Pour un récit, prépare les étapes de l'action. Pour une description, choisis un ordre spatial et les détails importants.\n\nLe plan n'a pas besoin d'être long : quelques mots-clés suffisent pour guider la rédaction.`,
        [
          q("Que faut-il faire en premier face à une consigne de rédaction ?", "La lire attentivement", ["Commencer au hasard", "Choisir la conclusion", "Supprimer les verbes"], "La compréhension de la consigne détermine le contenu attendu."),
          q("Pourquoi faire un plan ?", "Pour organiser les idées", ["Pour éviter d'écrire", "Pour supprimer le vocabulaire", "Pour remplacer la relecture"], "Le plan aide à garder une progression logique."),
          q("Pour une description, quel plan peut être efficace ?", "Un ordre spatial", ["Un ordre alphabétique des mots", "Un ordre sans logique", "Un ordre uniquement grammatical"], "L'ordre spatial aide le lecteur à visualiser le lieu."),
          tf("Un plan doit obligatoirement contenir des phrases complètes.", false, "Des mots-clés peuvent suffire pour préparer une rédaction."),
        ],
        "easy"
      ),
      lesson(
        "Rédiger un paragraphe narratif",
        "Un paragraphe narratif raconte une action avec des personnages, des événements et des repères temporels.",
        ["Construire une progression.", "Utiliser des verbes d'action.", "Relier les phrases par des connecteurs."],
        `# Le paragraphe narratif\n\nUn bon paragraphe raconte une étape précise. Commence par situer l'action, puis enchaîne les événements. Utilise des verbes précis et des connecteurs temporels.\n\nÉvite les phrases isolées qui ne montrent pas le lien entre les actions. Relis-toi pour vérifier les temps verbaux et les accords.`,
        [
          q("Quel élément est particulièrement important dans un récit ?", "L'enchaînement des actions", ["La liste des adjectifs uniquement", "Le nombre de virgules", "La longueur du titre"], "Le récit doit faire comprendre comment les événements s'enchaînent."),
          q("Quel mot est un connecteur temporel ?", "Puis", ["Mais", "Car", "Donc"], "« Puis » indique la succession des actions."),
          q("Pourquoi utiliser des verbes précis ?", "Pour rendre les actions plus claires", ["Pour supprimer les personnages", "Pour éviter toute chronologie", "Pour remplacer les noms"], "Des verbes précis rendent le récit vivant et compréhensible."),
          tf("La relecture permet de vérifier les temps et les accords.", true, "La relecture est une étape essentielle de l'écriture."),
        ]
      ),
      lesson(
        "Réviser et améliorer son texte",
        "La relecture permet de corriger les erreurs et d'améliorer la cohérence, le vocabulaire et la ponctuation.",
        ["Vérifier les accords.", "Corriger les répétitions.", "Améliorer la cohérence et la ponctuation."],
        `# La relecture en trois passages\n\n**1. Le sens** : la consigne est-elle respectée ? Les idées sont-elles dans le bon ordre ?\n\n**2. La langue** : sujets et verbes sont-ils accordés ? Les groupes nominaux sont-ils corrects ? Les homophones sont-ils justes ?\n\n**3. La présentation** : phrases complètes, ponctuation, paragraphes, majuscules.\n\nTu peux lire ton texte à voix basse : les répétitions et les phrases maladroites apparaissent plus facilement.`,
        [
          q("Que vérifie-t-on en premier lors d'une relecture efficace ?", "Le respect de la consigne et la cohérence", ["La couleur du stylo", "Le nombre exact de lignes", "Le titre du manuel"], "Le sens et la consigne sont prioritaires."),
          q("Quel problème peut-on corriger en remplaçant un mot répété ?", "Une répétition excessive", ["Une erreur de calcul", "Un problème de pagination", "Une faute de dessin"], "Le choix d'un synonyme peut améliorer le style."),
          q("Quel élément relève de la correction grammaticale ?", "L'accord sujet-verbe", ["La couleur du cahier", "La taille du bureau", "Le nom de l'école"], "L'accord sujet-verbe est une règle de langue."),
          tf("Relire son texte à voix basse peut aider à repérer certaines maladresses.", true, "L'écoute aide à détecter les répétitions et les phrases difficiles."),
        ]
      ),
    ],
  },
  {
    title: "Écrire un message et une lettre",
    competency: "Adapter son écrit à une situation de communication",
    competencyDescription: "Produire un message clair en tenant compte du destinataire, du but, du registre et de la présentation.",
    lessons: [
      lesson(
        "Le message personnel",
        "Un message personnel doit être compréhensible, adapté au destinataire et suffisamment précis pour permettre l'action attendue.",
        ["Identifier destinataire et but.", "Choisir un ton adapté.", "Donner les informations essentielles."],
        `# Écrire un message\n\nAvant d'écrire, identifie le **destinataire**, le **but** et les informations indispensables. Un message peut annoncer, demander, prévenir ou remercier.\n\nMême dans un message à un proche, reste clair : qui écrit, pourquoi, quand, où et ce que l'on attend de l'autre.`,
        [
          q("Quelles informations faut-il adapter avant tout dans un message ?", "Le destinataire et le but", ["La couleur du texte", "Le nombre de pages du manuel", "Le nom de l'imprimante"], "Le destinataire et l'objectif déterminent le ton et le contenu."),
          q("Un message pour prévenir d'un rendez-vous doit surtout préciser...", "la date, l'heure et le lieu", ["une longue description du paysage", "une liste de synonymes", "un poème complet"], "Ces informations permettent au destinataire d'agir."),
          q("Quel ton convient à un message à un ami proche ?", "Un ton simple et naturel", ["Un ton administratif obligatoire", "Une formule juridique", "Aucun mot"], "Le contexte personnel autorise un ton plus spontané."),
          tf("Un message court doit tout de même être suffisamment précis.", true, "La brièveté ne doit pas créer d'ambiguïté."),
        ],
        "easy"
      ),
      lesson(
        "La lettre personnelle et la lettre formelle",
        "La présentation et le vocabulaire d'une lettre changent selon le destinataire et la relation entre l'expéditeur et le destinataire.",
        ["Identifier les parties d'une lettre.", "Adapter la formule d'appel.", "Choisir une formule de clôture."],
        `# La lettre\n\nUne lettre comporte généralement un destinataire clairement identifié, une formule d'appel, un corps de texte et une formule de clôture.\n\nUne lettre personnelle peut commencer par « Cher... » et se terminer par une formule chaleureuse. Une lettre formelle utilise des formules respectueuses et un vocabulaire plus neutre.\n\nLa présentation doit aider le lecteur à comprendre rapidement qui écrit et pourquoi.`,
        [
          q("Quelle formule convient à une lettre formelle ?", "Madame, Monsieur,", ["Yo !", "Salut mec !", "Coucou !"], "Une formule formelle doit rester respectueuse et neutre."),
          q("Quel élément appartient au corps de la lettre ?", "Le message que l'expéditeur souhaite transmettre", ["Uniquement la signature", "Le nom du navigateur", "La couleur du papier"], "Le corps contient les informations et demandes principales."),
          q("Pourquoi adapter la formule de clôture ?", "Parce que la relation avec le destinataire varie", ["Parce que les verbes changent de groupe", "Pour supprimer la ponctuation", "Pour éviter toute information"], "Une formule adaptée respecte la situation de communication."),
          tf("Une lettre personnelle et une lettre formelle ont exactement le même ton.", false, "Le registre et les formules changent selon le destinataire."),
        ]
      ),
      lesson(
        "Rédiger une demande claire et polie",
        "Une demande efficace présente le contexte, formule clairement la demande et utilise une expression de politesse adaptée.",
        ["Présenter le contexte.", "Formuler une demande précise.", "Employer une politesse adaptée."],
        `# Formuler une demande\n\nUne demande claire peut suivre ce modèle : **contexte → demande → justification éventuelle → remerciement**.\n\nExemple : « Je souhaite participer à la sortie pédagogique prévue vendredi. Pourriez-vous m'indiquer l'heure de départ ? Je vous remercie par avance. »\n\nÉvite les demandes trop vagues (« Je veux ça ») et choisis un ton respectueux.`,
        [
          q("Quelle demande est la plus précise ?", "Pourriez-vous m'indiquer l'heure de départ de la sortie ?", ["Donnez-moi ça.", "Je veux savoir.", "Dites quelque chose."], "La première formule précise exactement l'information recherchée."),
          q("Quel élément peut expliquer pourquoi une demande est faite ?", "Une justification", ["Une rime", "Un dessin obligatoire", "Un changement de sujet"], "La justification peut rendre la demande plus compréhensible."),
          q("Quelle expression marque la politesse ?", "Je vous remercie par avance.", ["Fais-le vite.", "Donne-moi ça.", "Je veux maintenant."], "La formule exprime le respect envers le destinataire."),
          tf("Une demande polie doit rester claire et précise.", true, "La politesse ne remplace pas l'information attendue."),
        ]
      ),
    ],
  },
  {
    title: "Comprendre l'information et reformuler",
    competency: "Sélectionner et reformuler l'information",
    competencyDescription: "Repérer les informations essentielles d'un document court et les reformuler sans déformer le sens.",
    lessons: [
      lesson(
        "Idée principale et informations secondaires",
        "Un texte contient une idée principale et des informations qui l'expliquent, la précisent ou l'illustrent.",
        ["Identifier l'idée principale.", "Distinguer détail essentiel et détail secondaire.", "Résumer une information."],
        `# Aller à l'essentiel\n\nL'idée principale répond à la question : **de quoi parle surtout le texte et que veut-il faire comprendre ?**\n\nLes informations secondaires donnent des exemples, des précisions, des dates ou des explications. Pour préparer un résumé, garde les informations indispensables et supprime les répétitions.`,
        [
          q("Quelle question aide à trouver l'idée principale ?", "De quoi le texte parle-t-il surtout ?", ["Quelle est la couleur du papier ?", "Combien de lettres contient le titre ?", "Qui a imprimé le texte ?"], "L'idée principale correspond au message central."),
          q("Quel élément est généralement secondaire ?", "Un exemple qui illustre une idée déjà donnée", ["Le thème central", "La thèse principale", "Le sujet du texte"], "Un exemple peut préciser sans constituer l'idée principale."),
          q("Pour résumer, que faut-il surtout faire ?", "Conserver les informations essentielles", ["Tout recopier", "Ajouter des opinions personnelles", "Changer le sujet"], "Un résumé sélectionne et reformule l'essentiel."),
          tf("Résumer consiste à recopier chaque phrase du texte.", false, "Le résumé doit être plus court et reformuler l'essentiel."),
        ],
        "easy"
      ),
      lesson(
        "Reformuler sans changer le sens",
        "Reformuler consiste à exprimer la même idée avec d'autres mots ou une autre structure, sans ajouter d'information fausse.",
        ["Remplacer certains mots par des synonymes adaptés.", "Changer la structure d'une phrase.", "Conserver le sens initial."],
        `# Reformuler\n\nPour reformuler, garde d'abord l'idée centrale. Ensuite, change certains mots ou la structure.\n\nExemple : « Les élèves ont réussi grâce à leurs révisions. » → « Leurs révisions ont permis aux élèves de réussir. »\n\nUne bonne reformulation ne doit ni supprimer une information importante ni inventer une nouvelle cause.`,
        [
          q("Que doit conserver une reformulation ?", "Le sens essentiel", ["Exactement les mêmes mots", "Une nouvelle histoire", "Une opinion différente"], "La reformulation change la forme mais garde le sens."),
          q("Quelle phrase reformule correctement « Il est absent parce qu'il est malade » ?", "Il est malade, c'est pourquoi il est absent.", ["Il est absent mais il va très bien.", "Il est présent parce qu'il est malade.", "Il est absent sans raison."], "La relation de cause reste la même."),
          q("Quel procédé peut aider à reformuler ?", "Utiliser un synonyme adapté", ["Changer complètement le sujet", "Inventer une date", "Supprimer le verbe"], "Les synonymes permettent parfois de varier la formulation sans modifier le sens."),
          tf("Une reformulation peut modifier tous les faits si elle paraît plus élégante.", false, "Les faits et le sens doivent rester fidèles au texte initial."),
        ]
      ),
      lesson(
        "Faire un court compte rendu",
        "Un compte rendu présente de manière organisée les informations essentielles d'une activité, d'une réunion ou d'un événement.",
        ["Identifier les faits essentiels.", "Organiser les informations.", "Rester neutre et précis."],
        `# Le compte rendu\n\nUn court compte rendu répond généralement à : **quoi ? quand ? où ? qui ? comment ? résultats ?**\n\nIl privilégie les faits plutôt que les opinions personnelles. Organise les informations dans un ordre logique et utilise des formulations précises.\n\nExemple de contexte scolaire : compte rendu d'une activité de nettoyage du collège, d'une visite pédagogique ou d'une réunion de classe.`,
        [
          q("Que doit privilégier un compte rendu ?", "Les faits essentiels", ["Les rumeurs", "Les opinions personnelles uniquement", "Les blagues"], "Le compte rendu vise à transmettre des informations fiables."),
          q("Quelle question permet de préciser le moment ?", "Quand ?", ["Qui ?", "Pourquoi uniquement ?", "Comment écrire ?"], "« Quand ? » permet de situer l'événement dans le temps."),
          q("Quel ordre est utile pour un compte rendu ?", "Un ordre chronologique ou logique", ["Un ordre aléatoire", "Un ordre selon la longueur des mots", "Un ordre sans lien"], "La structure doit faciliter la compréhension."),
          tf("Un compte rendu peut être court tout en contenant les informations indispensables.", true, "La concision est compatible avec la précision."),
        ]
      ),
    ],
  },
  {
    title: "Réinvestir les compétences de lecture et d'écriture",
    competency: "Mobiliser plusieurs compétences de français",
    competencyDescription: "Combiner compréhension, vocabulaire, grammaire et production écrite dans des situations de communication variées.",
    lessons: [
      lesson(
        "Lire un texte et justifier ses réponses",
        "Une lecture efficace combine repérage, inférence, vocabulaire et justification par des indices précis.",
        ["Repérer des indices.", "Faire une inférence.", "Justifier une réponse."],
        `# Lecture active\n\nLis une première fois pour comprendre l'ensemble, puis une deuxième fois pour repérer les indices utiles. Pour chaque réponse, demande-toi : « Où est la preuve dans le texte ? »\n\nSi la réponse est une déduction, explique le raisonnement : **indice → interprétation**. Cette méthode permet de distinguer ce que le texte dit de ce que le lecteur déduit.`,
        [
          q("Quelle méthode est la plus fiable pour justifier une réponse ?", "Citer ou reformuler un indice du texte", ["Donner uniquement son opinion", "Choisir la réponse la plus longue", "Inventer un détail"], "La justification doit venir du texte."),
          q("Une inférence est...", "une conclusion déduite à partir d'indices", ["une copie exacte", "un titre", "une ponctuation"], "L'inférence permet de comprendre l'implicite."),
          q("Pourquoi relire un texte ?", "Pour vérifier les indices et les détails", ["Pour changer le sujet", "Pour supprimer les personnages", "Pour éviter de comprendre"], "La relecture augmente la précision de la compréhension."),
          tf("Toute réponse personnelle est correcte même si elle contredit le texte.", false, "Une réponse doit rester compatible avec les informations du texte."),
        ]
      ),
      lesson(
        "Corriger une production écrite",
        "Corriger un texte demande de vérifier le sens, la grammaire, l'orthographe, le vocabulaire et la ponctuation.",
        ["Repérer plusieurs types d'erreurs.", "Corriger méthodiquement.", "Améliorer une phrase sans la dénaturer."],
        `# La correction\n\nTravaille par catégories :\n- **sens** : la consigne est-elle respectée ?\n- **syntaxe** : les phrases sont-elles correctement construites ?\n- **accords** : sujet-verbe et groupe nominal ;\n- **orthographe** : homophones, mots usuels ;\n- **ponctuation** : majuscules, points, virgules ;\n- **vocabulaire** : mots précis et non répétitifs.\n\nCorriger ne signifie pas réécrire toute la production : conserve les bonnes idées et améliore les points faibles.`,
        [
          q("Quelle correction concerne « Les élèves travaille » ?", "L'accord sujet-verbe", ["La ponctuation uniquement", "Le niveau de langue uniquement", "La mise en page"], "Le sujet pluriel « les élèves » exige « travaillent »."),
          q("Quel problème corrige-t-on dans « a » / « à » ?", "Un homophone grammatical", ["Un temps verbal", "Une strophe", "Un paragraphe"], "Les deux mots se prononcent de la même façon mais ont des fonctions différentes."),
          q("Quel contrôle vient naturellement après la correction grammaticale ?", "L'orthographe et la ponctuation", ["Changer le sujet", "Supprimer les idées", "Changer le destinataire"], "Une relecture par catégories permet de sécuriser le texte."),
          tf("Corriger un texte signifie forcément remplacer toutes les phrases.", false, "Il faut conserver ce qui fonctionne et corriger ce qui doit l'être."),
        ]
      ),
      lesson(
        "Bilan : communiquer avec précision",
        "Les compétences de français se complètent : comprendre, organiser ses idées, choisir les bons mots et écrire pour un destinataire précis.",
        ["Mobiliser les notions étudiées.", "Adapter son écrit.", "Évaluer sa propre production."],
        `# Bilan de Français 6e\n\nUn bon communicant sait **comprendre avant de répondre**, organiser ses idées et choisir une formulation adaptée.\n\nPour progresser, garde une routine :\n1. je lis la consigne ;\n2. je cherche les informations utiles ;\n3. j'organise mes idées ;\n4. j'écris ;\n5. je relis le sens et la langue ;\n6. je corrige.\n\nLa maîtrise du français se construit par la pratique régulière de la lecture, de l'oral et de l'écriture.`,
        [
          q("Quelle démarche résume le mieux une bonne production écrite ?", "Comprendre → organiser → écrire → relire → corriger", ["Écrire → inventer → oublier", "Copier → supprimer → envoyer", "Répondre au hasard"], "Cette démarche combine préparation et révision."),
          q("Pourquoi faut-il penser au destinataire ?", "Pour adapter le contenu et le niveau de langue", ["Pour supprimer les informations", "Pour éviter la ponctuation", "Pour changer les faits"], "Le destinataire influence la manière de communiquer."),
          q("Quelle habitude aide le plus à progresser en français ?", "Lire et écrire régulièrement", ["Éviter les textes", "Ne jamais relire", "Mémoriser sans comprendre"], "La pratique régulière développe compréhension et expression."),
          tf("Comprendre un texte et produire un texte sont deux compétences totalement indépendantes.", false, "Lecture, vocabulaire, grammaire et écriture se renforcent mutuellement."),
        ],
        "hard"
      ),
    ],
  },
];

async function getOrCreateCycle(client: SupabaseClient, code: string, name: string, order: number) {
  const { data, error } = await client.from("school_cycles").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("school_cycles").insert({ code, name, order }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateLevel(client: SupabaseClient, cycleId: string) {
  const { data, error } = await client.from("school_levels").select("*").eq("cycle_id", cycleId).in("code", ["6e", "6eme", "6ème", "SIXIEME"]).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: byName, error: nameError } = await client.from("school_levels").select("*").eq("cycle_id", cycleId).in("name", ["6e", "6ème", "Sixième", "Sixieme"]).limit(1).maybeSingle();
  if (nameError) throw nameError;
  if (byName) return byName;
  const { data: created, error: insertError } = await client.from("school_levels").insert({ cycle_id: cycleId, code: "6e", name: "6e", order: 1 }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateSubject(client: SupabaseClient) {
  const { data, error } = await client.from("subjects").select("*").in("code", ["francais", "français", "FR", "FRA"]).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: byName, error: nameError } = await client.from("subjects").select("*").ilike("name", "Français").limit(1).maybeSingle();
  if (nameError) throw nameError;
  if (byName) return byName;
  const { data: created, error: insertError } = await client.from("subjects").insert({ code: "francais", name: "Français", icon: "BookOpen" }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function ensureLevelSubject(client: SupabaseClient, levelId: string, subjectId: string) {
  const { data, error } = await client.from("level_subjects").select("id").eq("level_id", levelId).eq("subject_id", subjectId).is("series_id", null).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) {
    const { error: insertError } = await client.from("level_subjects").insert({ level_id: levelId, subject_id: subjectId, series_id: null, is_optional: false });
    if (insertError) throw insertError;
  }
}

async function getOrCreateCurriculum(client: SupabaseClient, levelId: string, subjectId: string) {
  const { data, error } = await client.from("curriculums").select("*").eq("level_id", levelId).eq("subject_id", subjectId).eq("title", CURRICULUM_TITLE).eq("version", CURRICULUM_VERSION).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("curriculums").insert({
    level_id: levelId,
    series_id: null,
    subject_id: subjectId,
    title: CURRICULUM_TITLE,
    description: "Pack pédagogique complet de Français 6e : lecture, vocabulaire, grammaire, conjugaison, orthographe, poésie et production écrite.",
    version: CURRICULUM_VERSION,
    status: "published",
    source: "Ressources ADEM Dakar / Ministère de l'Éducation nationale ; contenu pédagogique original EdTech Sénégal.",
    source_url: SOURCE_URL,
    source_document: "Fascicule Français ADEM Dakar (6e–3e), utilisé comme référentiel de cadrage.",
    is_demo: false,
    validated: false,
    published_at: new Date().toISOString(),
  }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateDomain(client: SupabaseClient, curriculumId: string, name: string, order: number) {
  const { data, error } = await client.from("domains").select("*").eq("curriculum_id", curriculumId).eq("name", name).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("domains").insert({ curriculum_id: curriculumId, name, order }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateCompetency(client: SupabaseClient, domainId: string, name: string, description: string, order: number) {
  const { data, error } = await client.from("competencies").select("*").eq("domain_id", domainId).eq("name", name).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("competencies").insert({ domain_id: domainId, name, description, order }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateChapter(client: SupabaseClient, curriculumId: string, domainId: string, seed: ChapterSeed, order: number) {
  const { data, error } = await client.from("chapters").select("*").eq("curriculum_id", curriculumId).eq("title", seed.title).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("chapters").insert({
    curriculum_id: curriculumId,
    domain_id: domainId,
    title: seed.title,
    order,
    status: "published",
    source: "Contenu original EdTech Sénégal, structuré selon le référentiel ADEM Dakar.",
    source_url: SOURCE_URL,
  }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateLesson(client: SupabaseClient, chapterId: string, competencyId: string, seed: LessonSeed, order: number) {
  const { data, error } = await client.from("lessons").select("*").eq("chapter_id", chapterId).eq("title", seed.title).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("lessons").insert({
    chapter_id: chapterId,
    competency_id: competencyId,
    title: seed.title,
    content_md: seed.content.trim(),
    objectives: seed.objectives,
    summary: seed.summary,
    order,
    status: "published",
    source: "Contenu original EdTech Sénégal, structuré selon le référentiel ADEM Dakar.",
    source_url: SOURCE_URL,
  }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateExercise(client: SupabaseClient, lessonId: string, competencyId: string, exercise: LessonSeed["exercise"]) {
  const { data, error } = await client.from("exercises").select("*").eq("lesson_id", lessonId).eq("title", exercise.title).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("exercises").insert({
    lesson_id: lessonId,
    competency_id: competencyId,
    title: exercise.title,
    instructions: exercise.instructions,
    difficulty: exercise.difficulty,
    difficulty_score: exercise.difficulty_score,
    status: "published",
  }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateQuestion(client: SupabaseClient, exerciseId: string, competencyId: string, chapterId: string, seed: QuestionSeed) {
  const { data, error } = await client.from("questions").select("*").eq("exercise_id", exerciseId).eq("prompt", seed.prompt).limit(1).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await client.from("questions").insert({
    exercise_id: exerciseId,
    competency_id: competencyId,
    chapter_id: chapterId,
    type: seed.type,
    prompt: seed.prompt,
    explanation: seed.explanation,
    points: seed.points,
    difficulty_score: seed.difficulty_score,
    status: "published",
  }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function ensureQuestionOptions(client: SupabaseClient, questionId: string, options: QuestionSeed["options"]) {
  const { data: existing, error } = await client.from("question_options").select("id, label").eq("question_id", questionId);
  if (error) throw error;
  const existingLabels = new Set((existing ?? []).map((o) => o.label));
  const missing = options.filter((o) => !existingLabels.has(o.label));
  if (!missing.length) return;
  const { error: insertError } = await client.from("question_options").insert(missing.map((o) => ({ question_id: questionId, label: o.label, is_correct: o.is_correct, order: o.order })));
  if (insertError) throw insertError;
}

async function main() {
  console.log("\n==============================================");
  console.log("🇸🇳 EDTECH SENEGAL — PACK FRANÇAIS 6e");
  console.log("==============================================\n");

  const cycle = await getOrCreateCycle(supabase, "moyen", "Enseignement moyen", 2);
  const level = await getOrCreateLevel(supabase, cycle.id);
  const subject = await getOrCreateSubject(supabase);
  await ensureLevelSubject(supabase, level.id, subject.id);
  const curriculum = await getOrCreateCurriculum(supabase, level.id, subject.id);

  const reading = await getOrCreateDomain(supabase, curriculum.id, "Lecture et compréhension", 1);
  const language = await getOrCreateDomain(supabase, curriculum.id, "Étude de la langue", 2);
  const writing = await getOrCreateDomain(supabase, curriculum.id, "Expression écrite et orale", 3);

  let totalLessons = 0;
  let totalExercises = 0;
  let totalQuestions = 0;
  let totalOptions = 0;

  for (let i = 0; i < chapters.length; i++) {
    const seed = chapters[i]!;
    const domain = i < 4 || i === 10 ? reading : i < 10 ? language : writing;
    const competency = await getOrCreateCompetency(supabase, domain.id, seed.competency, seed.competencyDescription, i + 1);
    const chapter = await getOrCreateChapter(supabase, curriculum.id, domain.id, seed, i + 1);
    console.log(`📘 ${i + 1}/${chapters.length} — ${seed.title}`);

    for (let j = 0; j < seed.lessons.length; j++) {
      const ls = seed.lessons[j]!;
      const l = await getOrCreateLesson(supabase, chapter.id, competency.id, ls, j + 1);
      totalLessons++;
      const ex = await getOrCreateExercise(supabase, l.id, competency.id, ls.exercise);
      totalExercises++;
      for (const qs of ls.exercise.questions) {
        const question = await getOrCreateQuestion(supabase, ex.id, competency.id, chapter.id, qs);
        totalQuestions++;
        const before = await supabase.from("question_options").select("id", { count: "exact", head: true }).eq("question_id", question.id);
        if (before.error) throw before.error;
        await ensureQuestionOptions(supabase, question.id, qs.options);
        const after = await supabase.from("question_options").select("id", { count: "exact", head: true }).eq("question_id", question.id);
        if (after.error) throw after.error;
        totalOptions += Math.max(0, (after.count ?? 0) - (before.count ?? 0));
      }
    }
  }

  console.log("\n==============================================");
  console.log("🎉 PACK FRANÇAIS 6e IMPORTÉ");
  console.log("==============================================");
  console.log(`📚 Curriculum : ${curriculum.title}`);
  console.log(`📖 Chapitres : ${chapters.length}`);
  console.log(`📝 Leçons : ${totalLessons}`);
  console.log(`✏️ Exercices : ${totalExercises}`);
  console.log(`❓ Questions : ${totalQuestions}`);
  console.log(`🔘 Options : ${totalOptions}`);
  console.log("🎯 Quiz : générés automatiquement par chapitre / matière / révision / évaluation à partir des questions publiées.");
  console.log("==============================================\n");
}

main().catch((error) => {
  console.error("\n❌ ERREUR PENDANT L'IMPORT");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
