import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLISH = process.env.EDTECH_PUBLISH_ENRICHMENT === "true";
const STATUS = PUBLISH ? "published" : "review";
const SOURCE_URL = "https://senprof.education.sn/ADEM/SVT%206e/res/SVT-6e.pdf";
const CURRICULUM_ID = "ff89b282-ab13-41f1-a5b7-923d1e935749";

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY sont requis.");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

type Question = {
  type: "single_choice" | "true_false";
  prompt: string;
  explanation: string;
  points: number;
  difficulty_score: number;
  options: { label: string; is_correct: boolean; order: number }[];
};
type Exercise = { title: string; instructions: string; difficulty: "easy" | "medium" | "hard"; difficulty_score: number; questions: Question[] };
type Pack = { chapter: string; domain: string; competency: string; lessonTitle: string; objectives: string[]; summary: string; content: string; exercises: Exercise[] };

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
    chapter: "Diversité et composantes du milieu naturel", domain: "Environnement", competency: "Identifier et caractériser les composantes d'un environnement",
    lessonTitle: "Approfondissement : décrire un environnement à partir d'observations",
    objectives: ["Distinguer composantes vivantes et non vivantes.", "Classer les éléments d'un environnement en groupes pertinents.", "Justifier une classification à partir d'observations."],
    summary: "Un environnement comprend des êtres vivants et des composantes physiques. Une observation scientifique consiste à relever des éléments puis à les classer selon des critères explicites.",
    content: `# Décrire un environnement à partir d'observations\n\nUn **environnement** regroupe les êtres vivants présents dans un lieu et les éléments physiques qui les entourent. On distingue notamment les animaux, les végétaux et le milieu physique (eau, air, sol, lumière, température...).\n\n## Méthode d'observation\n1. Observer sans interpréter trop vite.\n2. Nommer les éléments visibles.\n3. Les classer selon un critère annoncé.\n4. Justifier le classement.\n\n### Exemple sénégalais\nDans une mare, on peut observer des poissons, des algues, des insectes, de l'eau, de la boue et de la lumière. Le poisson est vivant ; l'eau et la boue sont des composantes non vivantes.\n\n## À retenir\nUne classification scientifique doit reposer sur des critères observables et clairement formulés.`,
    exercises: [
      { title: "Classer les composantes d'une mare", instructions: "Classe les éléments puis justifie le critère utilisé.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Lequel est une composante non vivante d'une mare ?", "L'eau", ["Le poisson", "L'algue", "La grenouille"], "L'eau appartient au milieu physique ; les autres propositions sont des êtres vivants.", 25),
        q("Quel classement est correct ?", "Poisson : animal ; algue : végétal ; eau : milieu physique", ["Poisson : végétal ; algue : animal ; eau : animal", "Poisson : milieu physique ; algue : animal ; eau : végétal", "Poisson : végétal ; algue : milieu physique ; eau : animal"], "Le classement distingue les êtres vivants selon leur groupe et les éléments physiques du milieu.", 40),
        tf("Pour être scientifique, une classification doit utiliser un critère explicite.", true, "Un critère explicite permet de comprendre et de vérifier le classement.", 35),
      ]},
      { title: "Observation d'un milieu proche", instructions: "Raisonne à partir d'une description de terrain.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Lors d'une sortie, un élève note arbre, herbe, roche, eau et fourmi. Combien d'éléments vivants a-t-il relevés ?", "3", ["2", "4", "5"], "L'arbre, l'herbe et la fourmi sont vivants.", 45),
        q("Pourquoi faut-il noter le lieu d'observation ?", "Parce que les conditions du milieu influencent les êtres vivants observés", ["Pour décorer le compte rendu", "Pour remplacer les observations", "Parce que tous les milieux sont identiques"], "La répartition des êtres vivants dépend notamment des conditions du milieu.", 55),
        tf("Deux milieux différents peuvent présenter des composantes physiques différentes.", true, "La quantité d'eau, la lumière, le sol ou la température peuvent varier d'un milieu à l'autre.", 45),
      ]},
    ],
  },
  {
    chapter: "Repérage, orientation et répartition des êtres vivants", domain: "Environnement", competency: "Relier la répartition des êtres vivants aux caractéristiques du milieu",
    lessonTitle: "Approfondissement : facteurs de répartition des êtres vivants",
    objectives: ["Identifier des facteurs du milieu.", "Relier un facteur à la présence d'un être vivant.", "Interpréter une répartition simple."],
    summary: "La présence et la répartition des êtres vivants ne sont pas aléatoires : elles dépendent des conditions du milieu et des besoins des espèces.",
    content: `# Facteurs de répartition des êtres vivants\n\nLes êtres vivants occupent des endroits où les conditions répondent à leurs besoins. L'eau, la lumière, la température, la nature du sol et la disponibilité de nourriture sont des facteurs importants.\n\n## Exemple\nUne plante exigeante en eau sera plus fréquente près d'une zone humide qu'un endroit très sec. Cela ne signifie pas qu'un seul facteur explique toujours toute la répartition : plusieurs facteurs peuvent agir ensemble.\n\n## Méthode\nComparer deux zones, identifier la différence de condition, puis relier cette différence à la répartition observée.`,
    exercises: [
      { title: "Relier milieu et répartition", instructions: "Identifie le facteur qui explique le mieux chaque situation.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quel facteur explique directement qu'une plante aquatique vive dans l'eau ?", "La disponibilité de l'eau", ["La couleur du cahier", "Le bruit de la classe", "La taille de l'observateur"], "La plante aquatique est adaptée à un milieu où l'eau est disponible.", 30),
        q("Quel facteur peut influencer la répartition des plantes sur une pente ?", "La disponibilité de l'eau et les conditions du sol", ["Le prénom de l'élève", "La marque du microscope", "La couleur des feuilles du cahier"], "L'eau et le sol influencent fortement les conditions de croissance.", 45),
        tf("La répartition d'une espèce peut être liée à plusieurs facteurs du milieu.", true, "Les conditions physiques et les ressources agissent souvent ensemble.", 40),
      ]},
      { title: "Interpréter une observation", instructions: "Utilise les données décrites pour proposer une explication.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Dans une zone A humide, on observe beaucoup de grenouilles ; dans une zone B sèche, très peu. Quelle interprétation est la plus prudente ?", "L'humidité semble favoriser leur présence", ["L'humidité est l'unique cause certaine", "Les grenouilles n'ont aucun besoin d'eau", "La zone B est forcément sans vie"], "Une observation permet de proposer une relation ; il faut éviter d'affirmer une causalité unique sans étude complémentaire.", 60),
        q("Pour comparer deux zones, quelle information est la plus utile ?", "Les conditions du milieu et les êtres vivants observés", ["La couleur des chaussures", "Le nom du professeur", "La marque du téléphone"], "Il faut relier les observations biologiques aux conditions du milieu.", 35),
        tf("Une différence de répartition peut être un indice d'adaptation aux conditions du milieu.", true, "La répartition peut refléter les exigences écologiques d'une espèce.", 50),
      ]},
    ],
  },
  {
    chapter: "Les relations dans l'environnement", domain: "Environnement", competency: "Identifier et expliquer les relations entre les êtres vivants",
    lessonTitle: "Relations alimentaires et interrelations dans l'environnement",
    objectives: ["Identifier prédation, parasitisme, compétition et coopération.", "Construire une chaîne alimentaire simple.", "Relier une relation à ses conséquences sur les organismes."],
    summary: "Les êtres vivants d'un milieu sont reliés par des relations alimentaires ou d'autres interactions. Ces relations contribuent à l'équilibre du milieu.",
    content: `# Relations dans l'environnement\n\nLes êtres vivants entretiennent différentes relations. Dans une **prédation**, un organisme capture et mange une proie. Dans le **parasitisme**, le parasite tire profit d'un hôte sans le tuer immédiatement. La **compétition** apparaît lorsque des organismes recherchent une même ressource limitée.\n\n## Chaîne alimentaire\nUne chaîne alimentaire montre qui mange qui. Exemple : **herbe → criquet → grenouille → serpent**. La flèche indique le transfert de matière et d'énergie alimentaire vers le consommateur.\n\n## Exemple au Sénégal\nDans un milieu de savane, les relations entre végétaux, herbivores et carnivores forment des réseaux alimentaires. Une modification importante d'une population peut donc avoir des conséquences sur d'autres populations.`,
    exercises: [
      { title: "Identifier les relations", instructions: "Associe chaque situation au type de relation adapté.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Un lion capture et mange une antilope. Quelle relation est illustrée ?", "La prédation", ["La compétition", "La symbiose", "Le commensalisme"], "Le prédateur capture et consomme une proie.", 25),
        q("Un parasite vit aux dépens d'un hôte. Quelle relation est illustrée ?", "Le parasitisme", ["La prédation", "La photosynthèse", "La respiration"], "Le parasite bénéficie de l'hôte et lui cause un préjudice.", 30),
        tf("Deux animaux qui recherchent la même nourriture limitée peuvent être en compétition.", true, "La compétition apparaît lorsque des organismes utilisent une même ressource limitée.", 40),
      ]},
      { title: "Construire une chaîne alimentaire", instructions: "Analyse les relations alimentaires et place les organismes dans le bon ordre.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Quelle chaîne est correctement ordonnée ?", "Herbe → criquet → grenouille → serpent", ["Serpent → grenouille → criquet → herbe", "Criquet → herbe → serpent → grenouille", "Grenouille → serpent → herbe → criquet"], "Le criquet mange l'herbe, la grenouille peut manger le criquet et le serpent la grenouille.", 45),
        q("Dans une chaîne alimentaire, que représente l'herbe ?", "Une source de matière organique pour le premier consommateur", ["Un prédateur supérieur", "Un animal parasite", "Un élément non vivant"], "L'herbe est un végétal producteur de matière organique.", 50),
        tf("Une chaîne alimentaire peut être reliée à d'autres chaînes pour former un réseau alimentaire.", true, "Plusieurs chaînes peuvent partager des organismes et former un réseau.", 45),
      ]},
    ],
  },
  {
    chapter: "La nutrition minérale des plantes vertes", domain: "Production d'aliments", competency: "Expliquer les besoins des végétaux chlorophylliens",
    lessonTitle: "Approfondissement : production de matière organique chez les végétaux chlorophylliens",
    objectives: ["Identifier les éléments nécessaires à la production de matière organique.", "Relier lumière, eau, sels minéraux et dioxyde de carbone au fonctionnement des végétaux verts.", "Distinguer nutrition minérale et production de matière organique."],
    summary: "Les végétaux chlorophylliens prélèvent de l'eau et des sels minéraux dans le sol et utilisent notamment le dioxyde de carbone de l'air ; la lumière intervient dans la production de matière organique.",
    content: `# Production de matière organique chez les végétaux chlorophylliens\n\nLes racines prélèvent de l'eau et des sels minéraux. Les feuilles échangent des gaz avec l'air. En présence de lumière, les végétaux chlorophylliens peuvent produire de la matière organique à partir de matières minérales.\n\n## Ne pas confondre\nLa **nutrition minérale** concerne notamment l'absorption d'eau et de sels minéraux. La production de matière organique par les végétaux chlorophylliens utilise aussi le dioxyde de carbone et dépend de la lumière.\n\n## Expérience simple\nSi une plante verte est privée durablement de lumière, sa production de matière organique est perturbée. Une expérience doit comparer un groupe témoin et un groupe soumis à une condition différente.`,
    exercises: [
      { title: "Besoins des végétaux verts", instructions: "Identifie les éléments nécessaires et leur rôle.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quel élément est absorbé principalement par les racines ?", "L'eau et les sels minéraux", ["La lumière", "Le dioxyde de carbone uniquement", "L'oxygène uniquement"], "Les racines prélèvent l'eau et les sels minéraux du sol.", 30),
        q("Quel facteur fournit l'énergie nécessaire à la production de matière organique chez les végétaux chlorophylliens ?", "La lumière", ["Le sable", "Le vent", "La roche"], "La lumière fournit l'énergie utilisée lors de la photosynthèse.", 45),
        tf("Les sels minéraux sont une source de matière minérale pour la plante.", true, "Ils sont absorbés avec l'eau et participent au fonctionnement et à la croissance de la plante.", 35),
      ]},
      { title: "Raisonner à partir d'une expérience", instructions: "Interprète une expérience simple sur une plante verte.", difficulty: "medium", difficulty_score: 60, questions: [
        q("Pourquoi faut-il prévoir une plante témoin dans une expérience ?", "Pour disposer d'une situation de comparaison", ["Pour rendre la plante plus grande", "Pour supprimer toutes les variables", "Pour éviter toute observation"], "Le témoin permet de comparer l'effet de la condition testée.", 50),
        q("Une plante verte placée dans l'obscurité produit moins de matière organique. Quelle variable a été modifiée ?", "La lumière disponible", ["La couleur du pot", "Le nom de la plante", "Le nombre de racines observées"], "La condition expérimentale modifiée est l'éclairement.", 45),
        tf("La nutrition minérale et la production de matière organique sont exactement la même chose.", false, "La nutrition minérale concerne les prélèvements d'eau et de sels minéraux ; la production de matière organique est un processus distinct.", 55),
      ]},
    ],
  },
  {
    chapter: "La nutrition des animaux et régimes alimentaires", domain: "Production d'aliments", competency: "Relier régime alimentaire, besoins et production animale",
    lessonTitle: "Amélioration de la production d'aliments chez les animaux",
    objectives: ["Identifier les besoins alimentaires d'un animal d'élevage.", "Relier alimentation, croissance et production.", "Proposer des pratiques simples d'amélioration d'un élevage."],
    summary: "Chez les animaux d'élevage, une alimentation adaptée à l'espèce et à l'âge contribue à la croissance, à la santé et à la production.",
    content: `# Améliorer la production d'aliments chez les animaux\n\nUn animal d'élevage a besoin d'une alimentation adaptée, d'eau et de conditions d'élevage favorables. La ration doit répondre à ses besoins sans confondre quantité et qualité.\n\n## Exemples\nPour les volailles, bovins, ovins ou caprins, les aliments disponibles et les besoins varient. Une alimentation équilibrée, une eau propre et une bonne hygiène contribuent aux performances de l'élevage.\n\n## Raisonnement\nUne baisse de production ne doit pas être attribuée automatiquement à l'alimentation : la maladie, le stress, la chaleur ou les conditions d'hébergement peuvent aussi intervenir.`,
    exercises: [
      { title: "Besoins d'un élevage", instructions: "Choisis les mesures qui améliorent raisonnablement les conditions d'élevage.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quelle pratique est favorable à un élevage ?", "Fournir une eau propre et une alimentation adaptée", ["Supprimer l'eau", "Donner toujours le même aliment sans tenir compte de l'âge", "Négliger l'hygiène"], "L'eau et l'alimentation adaptées sont essentielles aux animaux d'élevage.", 25),
        q("Pourquoi l'âge de l'animal peut-il être pris en compte dans l'alimentation ?", "Parce que les besoins évoluent avec la croissance", ["Parce que tous les animaux ont exactement les mêmes besoins", "Parce que l'âge ne change jamais les besoins", "Parce que l'eau devient inutile"], "Les besoins nutritifs varient notamment avec la croissance et l'état physiologique.", 40),
        tf("Une bonne production dépend uniquement de la quantité de nourriture donnée.", false, "La santé, l'eau, l'hygiène, le logement et d'autres facteurs interviennent aussi.", 45),
      ]},
      { title: "Étude d'un petit élevage", instructions: "Analyse une situation et identifie les facteurs à améliorer.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Des poulets ont de l'aliment mais l'eau est sale. Quelle mesure est prioritaire ?", "Fournir une eau propre et régulièrement renouvelée", ["Supprimer l'alimentation", "Augmenter seulement la lumière", "Changer uniquement la couleur du bâtiment"], "L'eau propre est indispensable à la santé et au fonctionnement de l'organisme.", 45),
        q("Si deux groupes d'animaux reçoivent des aliments différents, que faut-il comparer pour conclure ?", "Des mesures comparables dans des conditions contrôlées", ["Uniquement la couleur des animaux", "Le prénom de l'éleveur", "Une seule observation sans contrôle"], "Une comparaison fiable demande des conditions et des mesures pertinentes.", 60),
        tf("Une expérimentation sur l'alimentation doit tenir compte des autres conditions d'élevage.", true, "Sinon une autre variable pourrait expliquer la différence observée.", 55),
      ]},
    ],
  },
  {
    chapter: "Déplacement chez les animaux : adaptation aux déplacements en milieu terrestre, aérien et aquatique", domain: "Fonction de relation : déplacement", competency: "Relier les organes de déplacement aux milieux de vie",
    lessonTitle: "Adaptations des animaux au déplacement",
    objectives: ["Identifier des organes de déplacement.", "Relier une structure à un mode de déplacement.", "Comparer les adaptations en milieux terrestre, aérien et aquatique."],
    summary: "Les animaux présentent des structures adaptées à leur mode de déplacement. Pattes, ailes, nageoires ou formes du corps contribuent à des déplacements différents.",
    content: `# Adaptations au déplacement\n\nLe déplacement dépend du milieu et des caractéristiques de l'animal. Sur terre, les pattes permettent notamment de marcher, courir ou sauter. Dans l'air, les ailes et une forme corporelle adaptée favorisent le vol. Dans l'eau, les nageoires et la forme du corps facilitent la nage.\n\n## Comparer\nUn poisson et un oiseau n'utilisent pas les mêmes organes. Leurs structures sont liées aux propriétés de leur milieu.\n\n## À retenir\nUne adaptation est une caractéristique qui contribue à la survie et au mode de vie d'un organisme dans son environnement.`,
    exercises: [
      { title: "Associer structure et déplacement", instructions: "Relie chaque structure à son utilisation principale.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quel organe est particulièrement adapté à la nage chez de nombreux poissons ?", "Les nageoires", ["Les ailes", "Les sabots", "Les plumes"], "Les nageoires participent à la propulsion, à la direction et à la stabilisation.", 25),
        q("Quelle structure est indispensable au vol d'un oiseau ?", "Les ailes", ["Les nageoires", "Les sabots", "Les racines"], "Les ailes permettent de produire les forces nécessaires au vol chez les oiseaux.", 25),
        tf("Tous les animaux se déplacent avec des pattes.", false, "Les modes de déplacement sont variés : nage, vol, marche, reptation, etc.", 25),
      ]},
      { title: "Comparer trois milieux", instructions: "Analyse les adaptations à partir de trois exemples.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Pourquoi le corps fuselé de nombreux poissons favorise-t-il la nage ?", "Il réduit la résistance de l'eau", ["Il augmente volontairement le poids", "Il empêche tout mouvement", "Il transforme les nageoires en ailes"], "Une forme fuselée limite la résistance à l'avancement dans l'eau.", 55),
        q("Quel couple est correctement associé ?", "Oiseau — ailes — déplacement aérien", ["Poisson — sabots — déplacement aérien", "Cheval — nageoires — vol", "Poisson — ailes — marche terrestre"], "L'oiseau possède des ailes adaptées au déplacement aérien.", 30),
        tf("Les structures de déplacement peuvent être liées aux contraintes du milieu.", true, "Les caractéristiques du milieu influencent les adaptations observées.", 45),
      ]},
    ],
  },
  {
    chapter: "Fonction de reproduction : production de nouvelles plantes", domain: "Fonction de reproduction", competency: "Expliquer comment de nouvelles plantes peuvent être obtenues",
    lessonTitle: "Cellules et division cellulaire : une première approche",
    objectives: ["Comprendre qu'un organisme est constitué de cellules.", "Décrire simplement la multiplication des cellules.", "Relier la division cellulaire à la croissance."],
    summary: "La cellule est une unité de base du vivant. La multiplication des cellules contribue notamment à la croissance et au renouvellement des tissus.",
    content: `# Cellules et division cellulaire\n\nLes êtres vivants sont constitués de cellules. Chez un organisme pluricellulaire, la croissance s'accompagne d'une multiplication des cellules.\n\n## Idée essentielle\nUne cellule peut donner naissance à de nouvelles cellules par division. Cette multiplication doit conserver l'information nécessaire au fonctionnement des cellules filles.\n\nÀ ce niveau, on retient surtout le lien entre **cellule → division → augmentation du nombre de cellules → croissance**.`,
    exercises: [
      { title: "Comprendre la cellule", instructions: "Vérifie les notions essentielles sur les cellules.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quelle affirmation est correcte ?", "Les êtres vivants sont constitués de cellules", ["Seuls les végétaux possèdent des cellules", "Les cellules ne font pas partie du vivant", "Un organisme ne contient jamais plusieurs cellules"], "La cellule constitue une unité fondamentale du vivant.", 25),
        q("À quoi contribue la division cellulaire chez un jeune organisme ?", "À l'augmentation du nombre de cellules", ["À la disparition de toutes les cellules", "À la suppression de la croissance", "À la transformation d'une cellule en roche"], "La multiplication des cellules participe à la croissance.", 30),
        tf("La division cellulaire peut participer au renouvellement de cellules.", true, "Certaines cellules sont remplacées grâce à la multiplication cellulaire.", 35),
      ]},
      { title: "Raisonner sur la croissance", instructions: "Relie les observations au mécanisme étudié.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Un jeune plant grandit. Quelle explication est compatible avec la multiplication cellulaire ?", "Le nombre de cellules augmente dans certaines zones de croissance", ["Toutes les cellules disparaissent", "La plante cesse de former des cellules", "La croissance vient uniquement de l'eau ajoutée au sol"], "La croissance implique notamment une augmentation du nombre et de la taille des cellules.", 50),
        q("Pourquoi parler de cellules filles après une division ?", "Parce que la cellule initiale donne naissance à de nouvelles cellules", ["Parce que les cellules sont toujours des organismes animaux", "Parce que la cellule devient une graine", "Parce que la division produit uniquement de l'eau"], "L'expression désigne les cellules issues de la division d'une cellule initiale.", 40),
        tf("La croissance d'un organisme pluricellulaire peut être liée à une augmentation du nombre de cellules.", true, "La multiplication cellulaire contribue à la croissance.", 35),
      ]},
    ],
  },
  {
    chapter: "Fonction de reproduction : production de nouvelles plantes", domain: "Fonction de reproduction", competency: "Décrire des modes de reproduction des plantes",
    lessonTitle: "Obtenir une nouvelle plante : reproduction et multiplication végétative",
    objectives: ["Distinguer reproduction sexuée et multiplication végétative à un niveau introductif.", "Identifier graines, boutures et organes végétatifs comme moyens d'obtenir de nouvelles plantes.", "Décrire une expérience simple de germination."],
    summary: "Une nouvelle plante peut provenir d'une graine ou, chez certaines espèces, d'un organe végétatif. La germination dépend de conditions favorables comme l'eau, une température convenable et, selon l'espèce, l'air.",
    content: `# Obtenir une nouvelle plante\n\nUne plante peut être obtenue à partir d'une **graine**. Certaines plantes peuvent aussi être multipliées à partir d'organes végétatifs, par exemple par bouturage.\n\n## Germination\nUne graine viable placée dans des conditions favorables absorbe de l'eau et reprend son activité. La température et la disponibilité de l'air peuvent également intervenir.\n\n## Expérience\nPour étudier un facteur, on compare deux lots en ne changeant qu'une condition importante. Par exemple, comparer des graines avec et sans eau permet d'étudier le rôle de l'eau dans la germination.`,
    exercises: [
      { title: "Germination", instructions: "Identifie les conditions et les étapes principales.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quelle condition est indispensable au démarrage de la germination d'une graine ?", "La présence d'eau", ["La présence de sel en grande quantité", "L'absence totale d'air", "La lumière obligatoire dans tous les cas"], "L'eau permet la reprise de l'activité de la graine. Les besoins précis peuvent varier selon l'espèce.", 30),
        q("Quelle partie apparaît généralement en premier lors de la germination ?", "La radicule", ["La fleur", "Le fruit", "Le pollen"], "La radicule est la jeune racine issue de la graine.", 40),
        tf("Toutes les graines ont besoin d'être exposées directement à une forte lumière pour germer.", false, "La lumière n'est pas une condition obligatoire de germination pour toutes les espèces.", 45),
      ]},
      { title: "Bouturage et comparaison expérimentale", instructions: "Compare des modes d'obtention d'une nouvelle plante et une expérience de germination.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Le bouturage consiste à", "utiliser une partie d'une plante capable de produire une nouvelle plante", ["transformer une pierre en graine", "supprimer toutes les racines d'une plante sans objectif", "faire germer un animal"], "Une bouture est un fragment végétatif utilisé pour multiplier une plante.", 40),
        q("Pour étudier le rôle de l'eau dans la germination, quelle comparaison est la plus pertinente ?", "Des graines identiques avec eau et sans eau, dans des conditions comparables", ["Deux espèces différentes dans des conditions différentes", "Une seule graine sans aucune observation", "Des graines avec eau et des animaux sans eau"], "Il faut isoler la variable étudiée autant que possible.", 60),
        tf("Une expérience fiable doit limiter les différences entre le groupe témoin et le groupe testé à la variable étudiée.", true, "C'est le principe d'une comparaison contrôlée.", 55),
      ]},
    ],
  },
  {
    chapter: "Les agressions contre l'homme", domain: "Santé et environnement", competency: "Identifier des maladies, leurs modes de transmission et des moyens de prévention",
    lessonTitle: "Paludisme : transmission, prévention et comportements protecteurs",
    objectives: ["Identifier le rôle du moustique dans la transmission du paludisme.", "Distinguer transmission et prévention.", "Proposer des comportements protecteurs."],
    summary: "Le paludisme est une maladie parasitaire transmise à l'être humain par la piqûre de certains moustiques infectés. La prévention repose notamment sur la réduction des piqûres et la lutte contre les vecteurs.",
    content: `# Le paludisme\n\nLe paludisme est une maladie parasitaire transmise par la piqûre d'un moustique vecteur infecté. Le moustique transmet le parasite lors de la piqûre.\n\n## Prévention\nDormir sous une moustiquaire imprégnée, réduire l'exposition aux moustiques et suivre les recommandations sanitaires sont des mesures de protection. La lutte contre les gîtes larvaires peut également contribuer à réduire les populations de moustiques.\n\n**Important :** une mesure de prévention ne signifie pas que toute personne exposée développera nécessairement la maladie ; elle réduit le risque.`,
    exercises: [
      { title: "Comprendre la transmission", instructions: "Identifie le vecteur et les mesures de prévention.", difficulty: "easy", difficulty_score: 35, questions: [
        q("Quel organisme joue le rôle de vecteur du paludisme ?", "Un moustique infecté", ["Une plante", "Une roche", "Un poisson"], "Le parasite du paludisme peut être transmis par la piqûre d'un moustique vecteur infecté.", 25),
        q("Quelle mesure réduit directement le risque de piqûre pendant la nuit ?", "Dormir sous une moustiquaire adaptée", ["Boire de l'eau salée", "Manger uniquement des fruits", "Éteindre le réfrigérateur"], "La moustiquaire constitue une barrière contre les moustiques.", 25),
        tf("La prévention du paludisme peut inclure la lutte contre les moustiques vecteurs.", true, "Réduire l'exposition aux vecteurs contribue à réduire le risque de transmission.", 35),
      ]},
      { title: "Prévention dans un quartier", instructions: "Analyse une situation de prévention communautaire.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Pourquoi éviter les eaux stagnantes inutiles peut-il aider à lutter contre certains moustiques ?", "Parce que certaines espèces y pondent leurs œufs", ["Parce que l'eau stagnante détruit toujours tous les moustiques", "Parce que les moustiques vivent uniquement dans les arbres", "Parce que cela remplace tous les traitements médicaux"], "Certaines espèces de moustiques utilisent des eaux stagnantes comme sites de reproduction.", 50),
        q("Quel comportement complète le mieux une stratégie de prévention ?", "Utiliser une moustiquaire et suivre les conseils des services de santé", ["Ignorer une fièvre persistante", "Multiplier les piqûres", "Supprimer toute eau potable"], "La prévention combine des mesures individuelles et collectives adaptées.", 45),
        tf("Une campagne de prévention peut être plus efficace lorsqu'elle associe actions individuelles et actions communautaires.", true, "La lutte contre un vecteur et la réduction de l'exposition peuvent nécessiter une action collective.", 50),
      ]},
    ],
  },
  {
    chapter: "Les agressions contre l'homme", domain: "Santé et environnement", competency: "Relier une maladie à son mode de transmission et à sa prévention",
    lessonTitle: "Ascaridiase : transmission et hygiène",
    objectives: ["Comprendre le rôle de l'hygiène dans la prévention.", "Relier contamination et ingestion d'éléments souillés.", "Identifier des comportements protecteurs."],
    summary: "L'ascaridiase est une parasitose liée à un ver parasite. La prévention repose notamment sur l'hygiène des mains, l'eau potable, l'assainissement et le lavage des aliments.",
    content: `# L'ascaridiase\n\nL'ascaridiase est due à un ver parasite appelé **Ascaris**. La contamination peut être liée à l'ingestion d'œufs présents dans un environnement souillé.\n\n## Prévention\nLe lavage des mains, l'utilisation d'eau potable, le lavage soigneux des aliments et un assainissement correct réduisent le risque de contamination.\n\n## Idée essentielle\nLa prévention vise à interrompre la chaîne de transmission en évitant que des éléments contaminés atteignent la bouche.`,
    exercises: [
      { title: "Hygiène et transmission", instructions: "Choisis les comportements qui interrompent la transmission.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quelle mesure réduit le risque de contamination par ingestion d'éléments souillés ?", "Se laver les mains avant de manger", ["Manger sans se laver les mains", "Boire une eau non contrôlée", "Laisser les aliments au sol"], "Le lavage des mains réduit le transfert d'agents contaminant vers la bouche.", 25),
        q("Quel élément est important pour la prévention ?", "Un assainissement correct", ["L'absence totale d'eau", "Le stockage des déchets dans l'eau potable", "Le partage d'aliments non lavés"], "L'assainissement contribue à limiter la contamination de l'environnement.", 35),
        tf("Laver les fruits et légumes avant consommation peut contribuer à réduire certains risques de contamination.", true, "Le lavage permet d'éliminer une partie des souillures et contaminants présents à la surface.", 35),
      ]},
      { title: "Chaîne de contamination", instructions: "Repère l'étape sur laquelle une mesure de prévention agit.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Si des mains contaminées touchent un aliment prêt à être mangé, quelle mesure est la plus directe ?", "Se laver correctement les mains", ["Augmenter la quantité de sucre", "Changer la couleur de l'assiette", "Fermer les fenêtres"], "Le lavage des mains agit directement sur la contamination des mains.", 45),
        q("Pourquoi l'eau potable est-elle importante ?", "Elle réduit le risque d'ingérer des agents contaminants présents dans une eau souillée", ["Elle rend inutile toute hygiène", "Elle empêche toutes les maladies", "Elle remplace l'alimentation"], "Une eau sûre réduit une voie possible de contamination.", 50),
        tf("Une seule mesure d'hygiène suffit toujours à éliminer tout risque de maladie.", false, "La prévention est généralement plus efficace lorsqu'elle combine plusieurs mesures adaptées.", 45),
      ]},
    ],
  },
  {
    chapter: "Les agressions contre l'homme", domain: "Santé et environnement", competency: "Identifier le choléra et prévenir sa transmission",
    lessonTitle: "Choléra : eau, aliments et prévention",
    objectives: ["Relier le choléra à une contamination par voie féco-orale.", "Identifier les mesures de prévention liées à l'eau et aux aliments.", "Adopter une attitude responsable face aux symptômes et aux recommandations sanitaires."],
    summary: "Le choléra est une maladie infectieuse intestinale qui peut se transmettre par ingestion d'eau ou d'aliments contaminés. L'accès à l'eau sûre, l'assainissement et l'hygiène sont essentiels à la prévention.",
    content: `# Le choléra\n\nLe choléra est une maladie infectieuse intestinale causée par une bactérie. La transmission peut se faire par ingestion d'eau ou d'aliments contaminés.\n\n## Prévention\nLes mesures essentielles comprennent l'accès à une eau sûre, le lavage des mains, une bonne hygiène alimentaire et un assainissement adapté. En cas de symptômes importants, il faut rechercher rapidement une prise en charge selon les recommandations sanitaires.\n\n## À retenir\nLa prévention vise surtout à empêcher la contamination de l'eau, des aliments et des mains.`,
    exercises: [
      { title: "Prévenir la transmission", instructions: "Identifie les mesures qui limitent le risque.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Quelle mesure est prioritaire pour réduire la transmission du choléra ?", "Utiliser une eau sûre pour boire", ["Boire une eau inconnue sans traitement", "Partager des aliments souillés", "Négliger le lavage des mains"], "Une eau sûre réduit une voie majeure de transmission.", 25),
        q("Quelle pratique contribue à l'hygiène alimentaire ?", "Se laver les mains et protéger les aliments de la contamination", ["Laisser les aliments à découvert près des déchets", "Utiliser une eau contaminée", "Ignorer les règles d'hygiène"], "L'hygiène des mains et des aliments réduit la contamination.", 30),
        tf("L'assainissement contribue à la prévention du choléra.", true, "Un assainissement correct limite la contamination de l'environnement par les matières fécales.", 30),
      ]},
      { title: "Situation de prévention", instructions: "Choisis la réponse la plus cohérente avec une campagne de prévention.", difficulty: "medium", difficulty_score: 55, questions: [
        q("Une école organise une campagne. Quelle combinaison est la plus pertinente ?", "Eau sûre + lavage des mains + hygiène alimentaire + assainissement", ["Uniquement fermer les fenêtres", "Uniquement changer les uniformes", "Boire moins d'eau"], "La prévention agit sur plusieurs voies de contamination.", 45),
        q("Pourquoi faut-il protéger les aliments ?", "Pour éviter leur contamination par des agents infectieux", ["Pour les rendre automatiquement plus nutritifs", "Pour empêcher toute croissance végétale", "Pour remplacer l'eau potable"], "Des aliments contaminés peuvent transmettre des agents infectieux.", 40),
        tf("Les conseils de prévention peuvent être relayés par l'école, les familles et les services de santé.", true, "La prévention des maladies infectieuses bénéficie d'une action coordonnée.", 40),
      ]},
    ],
  },
  {
    chapter: "Les paysages", domain: "Sciences de la Terre", competency: "Décrire et comparer des paysages à partir de leurs éléments",
    lessonTitle: "Éléments du paysage et diversité des paysages",
    objectives: ["Identifier les éléments naturels et humains d'un paysage.", "Décrire un paysage avec un vocabulaire précis.", "Expliquer que les paysages peuvent varier selon le milieu et les activités humaines."],
    summary: "Un paysage est ce que l'on observe depuis un point de vue. Il comprend des éléments naturels et, souvent, des éléments aménagés par l'être humain. Les paysages sont divers et peuvent évoluer.",
    content: `# Les éléments du paysage et la diversité des paysages\n\nUn **paysage** correspond à l'ensemble des éléments visibles depuis un point d'observation. On peut y distinguer des éléments naturels (relief, végétation, cours d'eau...) et des éléments liés aux activités humaines (routes, bâtiments, champs, ouvrages...).\n\n## Décrire un paysage\nIl faut préciser le point de vue, repérer les éléments principaux, les localiser et comparer plusieurs paysages.\n\n### Exemple sénégalais\nUn paysage littoral de Dakar, une zone agricole de l'intérieur du pays et un paysage de savane ne présentent pas les mêmes reliefs, végétations, sols ou aménagements. Les activités humaines contribuent également à transformer les paysages.`,
    exercises: [
      { title: "Décrire un paysage", instructions: "Distingue éléments naturels et éléments aménagés.", difficulty: "easy", difficulty_score: 30, questions: [
        q("Lequel est généralement un élément naturel d'un paysage ?", "Une colline", ["Une route goudronnée", "Un immeuble", "Un pont construit"], "Une colline est une forme naturelle du relief.", 25),
        q("Quel élément peut témoigner d'une activité humaine ?", "Un champ cultivé", ["Une dune naturelle", "Une rivière naturelle", "Une roche non aménagée"], "Un champ résulte d'une activité agricole humaine, même s'il s'insère dans un milieu naturel.", 30),
        tf("La description d'un paysage doit préciser ce qui est observé et éviter d'inventer des éléments non visibles.", true, "Une description scientifique repose sur des observations.", 35),
      ]},
      { title: "Comparer deux paysages", instructions: "Utilise des critères pour comparer deux paysages.", difficulty: "medium", difficulty_score: 50, questions: [
        q("Quel critère permet de comparer deux paysages ?", "Le relief, la végétation, l'eau et les aménagements visibles", ["La marque du téléphone", "Le prénom de l'observateur", "La couleur du cahier"], "Des critères géographiques et environnementaux permettent une comparaison pertinente.", 30),
        q("Pourquoi deux paysages d'une même région peuvent-ils être différents ?", "Parce que le relief, les milieux et les activités humaines peuvent varier", ["Parce que tous les paysages sont identiques", "Parce que les paysages ne changent jamais", "Parce que seul le ciel compte"], "Les paysages résultent de plusieurs facteurs naturels et humains.", 45),
        tf("Les activités humaines peuvent transformer durablement un paysage.", true, "Agriculture, urbanisation, routes et autres aménagements modifient les paysages.", 40),
      ]},
    ],
  },
];

async function getCurriculum() {
  const { data, error } = await supabase.from("curriculums").select("id,title,status,version,is_demo").eq("id", CURRICULUM_ID).eq("is_demo", false).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Programme SVT 6e introuvable : ${CURRICULUM_ID}`);
  return data;
}

async function getOrCreateDomain(curriculumId: string, name: string, order: number) {
  const { data, error } = await supabase.from("domains").select("*").eq("curriculum_id", curriculumId).eq("name", name).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await supabase.from("domains").insert({ curriculum_id: curriculumId, name, order }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateCompetency(domainId: string, name: string, order: number) {
  const { data, error } = await supabase.from("competencies").select("*").eq("domain_id", domainId).eq("name", name).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await supabase.from("competencies").insert({ domain_id: domainId, name, order, description: name }).select().single();
  if (insertError) throw insertError;
  return created;
}

async function getOrCreateChapter(curriculumId: string, domainId: string, title: string, order: number) {
  const { data, error } = await supabase.from("chapters").select("*").eq("curriculum_id", curriculumId).eq("title", title).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const { data: created, error: insertError } = await supabase.from("chapters").insert({ curriculum_id: curriculumId, domain_id: domainId, title, order, status: STATUS, source: "Contenu original EdTech Sénégal, structuré selon le référentiel ADEM Dakar.", source_url: SOURCE_URL }).select().single();
  if (insertError) throw insertError;
  return { data: created, created: true };
}

async function getOrCreateLesson(chapterId: string, competencyId: string | null, pack: Pack, order: number) {
  const { data, error } = await supabase.from("lessons").select("id,title").eq("chapter_id", chapterId).eq("title", pack.lessonTitle).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const { data: created, error: insertError } = await supabase.from("lessons").insert({ chapter_id: chapterId, competency_id: competencyId, title: pack.lessonTitle, content_md: pack.content.trim(), objectives: pack.objectives, summary: pack.summary, order, status: STATUS, source: "Contenu original EdTech Sénégal, structuré selon le référentiel ADEM Dakar.", source_url: SOURCE_URL }).select("id,title").single();
  if (insertError) throw insertError;
  return { data: created, created: true };
}

async function ensureExercise(lessonId: string, competencyId: string | null, exercise: Exercise) {
  const { data, error } = await supabase.from("exercises").select("id,title").eq("lesson_id", lessonId).eq("title", exercise.title).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { data, created: false };
  const { data: created, error: insertError } = await supabase.from("exercises").insert({ lesson_id: lessonId, competency_id: competencyId, title: exercise.title, instructions: exercise.instructions, difficulty: exercise.difficulty, difficulty_score: exercise.difficulty_score, status: STATUS }).select("id,title").single();
  if (insertError) throw insertError;
  return { data: created, created: true };
}

async function ensureQuestion(exerciseId: string, competencyId: string | null, chapterId: string, question: Question) {
  const { data, error } = await supabase.from("questions").select("id,prompt").eq("exercise_id", exerciseId).eq("prompt", question.prompt).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (data) return { created: false };
  const { data: created, error: insertError } = await supabase.from("questions").insert({ exercise_id: exerciseId, competency_id: competencyId, chapter_id: chapterId, type: question.type, prompt: question.prompt, explanation: question.explanation, points: question.points, difficulty_score: question.difficulty_score, status: STATUS }).select("id").single();
  if (insertError) throw insertError;
  const { error: optionsError } = await supabase.from("question_options").insert(question.options.map(o => ({ question_id: created.id, label: o.label, is_correct: o.is_correct, order: o.order })));
  if (optionsError) throw optionsError;
  return { created: true };
}

async function main() {
  const curriculum = await getCurriculum();
  const stats = { chaptersCreated: 0, lessonsCreated: 0, exercisesCreated: 0, questionsCreated: 0, duplicates: 0 };
  const domainOrders: Record<string, number> = {};
  const competencyOrders: Record<string, number> = {};
  const chapterOrders = new Map<string, number>();

  const { data: existingChapters, error: chaptersError } = await supabase.from("chapters").select("title,order").eq("curriculum_id", curriculum.id).is("deleted_at", null);
  if (chaptersError) throw chaptersError;
  for (const c of existingChapters ?? []) {
    if (typeof c.order === "number") chapterOrders.set(c.title, c.order);
  }
  const existingOrderValues = Array.from(chapterOrders.values());
  let nextChapterOrder = (existingOrderValues.length ? Math.max(...existingOrderValues) : 0) + 1;

  for (const [index, pack] of packs.entries()) {
    domainOrders[pack.domain] ??= index + 1;
    competencyOrders[`${pack.domain}|${pack.competency}`] ??= index + 1;
    const domainOrder = domainOrders[pack.domain];
    const competencyOrder = competencyOrders[`${pack.domain}|${pack.competency}`];
    if (domainOrder == null || competencyOrder == null) throw new Error("Ordre de domaine/compétence invalide");
    const domain = await getOrCreateDomain(curriculum.id, pack.domain, domainOrder);
    const competency = await getOrCreateCompetency(domain.id, pack.competency, competencyOrder);
    let chapterOrder = chapterOrders.get(pack.chapter);
    if (chapterOrder == null) { chapterOrder = nextChapterOrder++; chapterOrders.set(pack.chapter, chapterOrder); }
    const chapterResult = await getOrCreateChapter(curriculum.id, domain.id, pack.chapter, chapterOrder);
    if (chapterResult.created) stats.chaptersCreated++;
    const lessonResult = await getOrCreateLesson(chapterResult.data.id, competency.id, pack, chapterOrder * 10 + 3);
    if (lessonResult.created) stats.lessonsCreated++;
    for (const exercise of pack.exercises) {
      const exerciseResult = await ensureExercise(lessonResult.data.id, competency.id, exercise);
      if (exerciseResult.created) stats.exercisesCreated++;
      for (const question of exercise.questions) {
        const result = await ensureQuestion(exerciseResult.data.id, competency.id, chapterResult.data.id, question);
        if (result.created) stats.questionsCreated++; else stats.duplicates++;
      }
    }
    console.log(`✅ ${pack.chapter} → ${pack.lessonTitle}`);
  }

  console.log("\n=== LOT 2 — SVT 6e ===");
  console.log(`Chapitres créés : ${stats.chaptersCreated}`);
  console.log(`Leçons créées   : ${stats.lessonsCreated}`);
  console.log(`Exercices créés : ${stats.exercisesCreated}`);
  console.log(`Questions créées: ${stats.questionsCreated}`);
  console.log(`Doublons évités : ${stats.duplicates}`);
  console.log(`Statut          : ${STATUS}`);
  if (!PUBLISH) console.log("Pour publier après validation : EDTECH_PUBLISH_ENRICHMENT=true npx tsx scripts/enrich-6e-svt.ts");
}

main().catch(error => { console.error("❌ Lot 2 SVT échoué", error); process.exit(1); });
