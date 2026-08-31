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

type LessonSpec={title:string;domain:string;competency:string;summary:string;content:string;answer:string;wrongs:string[];context?:string};
function buildQuestions(s:LessonSpec):RawQuestion[]{
  const a=s.answer,w=s.wrongs;
  return [
    {kind:"mc",prompt:`Dans la leçon « ${s.title} », quelle proposition est correcte ?`,answer:a,wrongs:w,explanation:`La réponse est correcte : ${a}.`},
    {kind:"tf",prompt:`L'affirmation « ${a} » est correcte pour « ${s.title} ».`,answer:true,explanation:`Vrai : ${a}.`},
    {kind:"mc",prompt:`Quel énoncé décrit le mieux ${s.title.toLowerCase()} ?`,answer:a,wrongs:w,explanation:`Cette formulation correspond à la notion étudiée : ${a}.`},
    {kind:"mc",prompt:`Quelle proposition faut-il retenir pour comprendre « ${s.title} » ?`,answer:a,wrongs:w,explanation:`Il faut retenir que ${a}.`},
    {kind:"tf",prompt:`Dans une situation d'étude de ${s.title.toLowerCase()}, l'énoncé « ${a} » est exact.`,answer:true,explanation:`Vrai. L'énoncé reprend l'idée essentielle de la leçon.`},
    {kind:"mc",prompt:`Quelle réponse applique correctement la notion « ${s.title} » ?`,answer:a,wrongs:w,explanation:`L'application correcte repose sur la notion étudiée : ${a}.`},
    {kind:"mc",prompt:`Quel choix éviterait une erreur fréquente sur « ${s.title} » ?`,answer:a,wrongs:w,explanation:`Le choix correct est celui qui respecte la définition et les repères de la leçon.`},
    {kind:"tf",prompt:`« ${w[0]} » est une description correcte de « ${s.title} ».`,answer:false,explanation:`Faux. ${w[0]} ne correspond pas à la notion étudiée.`},
    {kind:"mc",prompt:`Dans le contexte sénégalais, quelle proposition permet de mobiliser « ${s.title} » ?`,answer:a,wrongs:w,explanation:`La notion permet d'analyser des situations à partir de repères historiques ou géographiques fiables.`},
    {kind:"mc",prompt:`Quel raisonnement est le plus rigoureux pour « ${s.title} » ?`,answer:a,wrongs:w,explanation:`Un raisonnement rigoureux commence par identifier les repères et les caractéristiques de la notion.`},
    {kind:"tf",prompt:`Pour réussir un exercice sur « ${s.title} », il est utile de justifier la réponse à partir des repères étudiés.`,answer:true,explanation:`Vrai. La justification permet de montrer que les repères et notions sont maîtrisés.`},
    {kind:"mc",prompt:`Quelle idée essentielle résume « ${s.title} » ?`,answer:a,wrongs:w,explanation:`C'est l'idée essentielle retenue dans cette leçon.`}
  ];
}
function makeLesson(s:LessonSpec):RawLesson{
 return {title:s.title,objectives:[`Comprendre ${s.title.toLowerCase()}.`,`Identifier les repères et notions essentiels de ${s.title.toLowerCase()}.`,`Mobiliser ces connaissances dans une situation d'étude.`,`Justifier et vérifier une réponse.`],summary:s.summary,content:s.content,questions:buildQuestions(s)};
}

function makeLessonSpec(s:LessonSpec):RawLesson{
  return {
    title:s.title,
    objectives:[
      `Comprendre ${s.title.toLowerCase()}.`,
      `Identifier les repères et notions essentiels de ${s.title.toLowerCase()}.`,
      `Mobiliser ces connaissances dans une situation d'étude.`,
      `Justifier et vérifier une réponse.`
    ],
    summary:s.summary,
    content:s.content,
    questions:buildQuestions(s)
  };
}

const programs: RawProgram[] = [
  {
    subject: "Histoire",
    source: "https://apprendre.education.sn/C_ressource/recherche/34",
    version: "4e-histoire-lotC-v1",
    chapters: [
      {
        title: "L’Afrique au XVIe siècle",
        domain: "Afrique au XVIe siècle",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "L’Afrique au XVIe siècle", "domain": "Afrique au XVIe siècle", "competency": "Histoire", "summary": "Au XVIe siècle, l’Afrique est organisée en de nombreux États et sociétés, avec des échanges régionaux et transsahariens actifs.", "content": "L’Afrique du XVIe siècle n’est pas un espace sans organisation politique : des États, des royaumes et des réseaux commerciaux structurent les territoires. Les échanges relient notamment le Sahel, le Sahara et les régions forestières.", "answer": "L’Afrique comprend de nombreux États et sociétés organisés et participe à des réseaux d’échanges.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’afrique au xvie siècle", "la notion signifie l’inverse de ce que décrit l’afrique au xvie siècle", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "L’Asie au XVIe siècle",
        domain: "Monde au XVIe siècle",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "L’Asie au XVIe siècle", "domain": "Monde au XVIe siècle", "competency": "Histoire", "summary": "Au XVIe siècle, de grands ensembles politiques et commerciaux structurent l’Asie, notamment autour des empires et des routes maritimes.", "content": "L’Asie du XVIe siècle est marquée par de grands ensembles politiques, des échanges commerciaux et des circulations de personnes, de marchandises et de savoirs. Les routes maritimes jouent un rôle important dans les échanges.", "answer": "de grands ensembles politiques, commerciaux et des routes maritimes structurent l’Asie.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’asie au xvie siècle", "la notion signifie l’inverse de ce que décrit l’asie au xvie siècle", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "L’Europe au XVIe siècle",
        domain: "Monde au XVIe siècle",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "L’Europe au XVIe siècle", "domain": "Monde au XVIe siècle", "competency": "Histoire", "summary": "L’Europe du XVIe siècle connaît des transformations religieuses, politiques, scientifiques et commerciales qui renforcent les circulations à l’échelle mondiale.", "content": "Le XVIe siècle européen est marqué par la Renaissance, les Réformes religieuses et l’expansion maritime. Ces transformations modifient les rapports politiques, économiques et culturels entre l’Europe et d’autres régions du monde.", "answer": "la Renaissance, les Réformes et l’expansion maritime transforment l’Europe.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’europe au xvie siècle", "la notion signifie l’inverse de ce que décrit l’europe au xvie siècle", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les débuts de la traite atlantique",
        domain: "Traite négrière et esclavage",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Les débuts de la traite atlantique", "domain": "Traite négrière et esclavage", "competency": "Histoire", "summary": "La traite atlantique met en place un système de déportation forcée d’Africains vers les Amériques, lié à des intérêts économiques et coloniaux.", "content": "La traite atlantique est un commerce de personnes réduites en esclavage. Elle implique des acteurs européens, africains et américains dans des relations complexes, mais la déportation et la mise en esclavage constituent une violence majeure.", "answer": "la traite atlantique organise la déportation forcée d’Africains vers les Amériques.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les débuts de la traite atlantique", "la notion signifie l’inverse de ce que décrit les débuts de la traite atlantique", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "La traite négrière dans l’espace sénégambien",
        domain: "Traite négrière et esclavage",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "La traite négrière dans l’espace sénégambien", "domain": "Traite négrière et esclavage", "competency": "Histoire", "summary": "La Sénégambie est intégrée aux réseaux de traite atlantique par les comptoirs, les échanges et les relations avec les pouvoirs locaux.", "content": "Dans l’espace sénégambien, la traite s’appuie sur des réseaux commerciaux et des points d’échange côtiers et fluviaux. Les acteurs et les formes de participation varient selon les périodes et les territoires.", "answer": "la Sénégambie est intégrée aux réseaux de traite par des échanges et des points d’échange côtiers et fluviaux.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec la traite négrière dans l’espace sénégambien", "la notion signifie l’inverse de ce que décrit la traite négrière dans l’espace sénégambien", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les conséquences de la traite",
        domain: "Traite négrière et esclavage",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Les conséquences de la traite", "domain": "Traite négrière et esclavage", "competency": "Histoire", "summary": "La traite négrière provoque des conséquences humaines, sociales, politiques et économiques durables en Afrique et dans les sociétés atlantiques.", "content": "La traite entraîne des violences, des déplacements forcés et des perturbations démographiques et politiques. Ses effets diffèrent selon les régions, mais ils ont profondément marqué les sociétés africaines et atlantiques.", "answer": "la traite a des conséquences humaines, sociales, politiques et économiques durables.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les conséquences de la traite", "la notion signifie l’inverse de ce que décrit les conséquences de la traite", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "L’abolition de la traite et de l’esclavage",
        domain: "Abolitions et transformations",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "L’abolition de la traite et de l’esclavage", "domain": "Abolitions et transformations", "competency": "Histoire", "summary": "Les mouvements abolitionnistes et les décisions politiques conduisent progressivement à l’interdiction de la traite puis à l’abolition de l’esclavage dans différents espaces.", "content": "L’abolition est un processus progressif et différent selon les États. Il résulte notamment de mobilisations, de débats politiques et de transformations économiques, sans effacer immédiatement les conséquences de l’esclavage.", "answer": "l’abolition est un processus progressif porté par des mobilisations et des décisions politiques.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’abolition de la traite et de l’esclavage", "la notion signifie l’inverse de ce que décrit l’abolition de la traite et de l’esclavage", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Le Jolof et les États de la Sénégambie",
        domain: "Sénégambie",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Le Jolof et les États de la Sénégambie", "domain": "Sénégambie", "competency": "Histoire", "summary": "La Sénégambie précoloniale est composée de plusieurs États et formations politiques, dont le Jolof, avec des organisations et des relations évolutives.", "content": "Le Jolof constitue un important ensemble politique de la Sénégambie. Son histoire est liée à des dynamiques de pouvoir, d’alliances, de territoires et d’échanges avec d’autres formations politiques.", "answer": "le Jolof est une importante formation politique de la Sénégambie précoloniale.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec le jolof et les états de la sénégambie", "la notion signifie l’inverse de ce que décrit le jolof et les états de la sénégambie", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Le Fouta et les transformations politiques",
        domain: "Sénégambie",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Le Fouta et les transformations politiques", "domain": "Sénégambie", "competency": "Histoire", "summary": "Le Fouta est un espace politique majeur de la vallée du fleuve Sénégal, marqué par des transformations institutionnelles et religieuses.", "content": "Les transformations politiques du Fouta s’inscrivent dans l’histoire de la vallée du fleuve Sénégal. L’étude doit distinguer les périodes, les acteurs et les formes d’organisation politique plutôt que de les confondre.", "answer": "le Fouta est un espace politique majeur de la vallée du fleuve Sénégal.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec le fouta et les transformations politiques", "la notion signifie l’inverse de ce que décrit le fouta et les transformations politiques", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Le Gaabu et les formations de l’ouest africain",
        domain: "Sénégambie",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Le Gaabu et les formations de l’ouest africain", "domain": "Sénégambie", "competency": "Histoire", "summary": "Le Gaabu est une formation politique de l’espace sénégambien méridional, liée aux dynamiques régionales de pouvoir et d’échanges.", "content": "L’histoire du Gaabu permet d’étudier les relations politiques et commerciales dans l’ouest africain précolonial. Son évolution doit être replacée dans les réseaux régionaux et les rapports entre différentes formations politiques.", "answer": "le Gaabu est une formation politique de l’espace sénégambien méridional.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec le gaabu et les formations de l’ouest africain", "la notion signifie l’inverse de ce que décrit le gaabu et les formations de l’ouest africain", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les États et mouvements de l’Afrique de l’Ouest aux XVIIIe-XIXe siècles",
        domain: "Afrique de l’Ouest aux XVIIIe-XIXe siècles",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Les États et mouvements de l’Afrique de l’Ouest aux XVIIIe-XIXe siècles", "domain": "Afrique de l’Ouest aux XVIIIe-XIXe siècles", "competency": "Histoire", "summary": "L’Afrique de l’Ouest connaît des recompositions politiques importantes aux XVIIIe et XIXe siècles, avec des États, des réformes et des mouvements de conquête ou de résistance.", "content": "Les transformations de l’Afrique de l’Ouest aux XVIIIe et XIXe siècles concernent notamment les États musulmans, les réformes religieuses et les expansions politiques. L’étude de Sokoto, de Macina ou d’El Hadji Omar Tall montre la diversité de ces trajectoires.", "answer": "les XVIIIe et XIXe siècles sont marqués par d’importantes recompositions politiques en Afrique de l’Ouest.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les états et mouvements de l’afrique de l’ouest aux xviiie-xixe siècles", "la notion signifie l’inverse de ce que décrit les états et mouvements de l’afrique de l’ouest aux xviiie-xixe siècles", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les transformations du monde au XIXe siècle",
        domain: "Transformations du monde",
        competency: "Histoire",
        lessons: [makeLessonSpec({"title": "Les transformations du monde au XIXe siècle", "domain": "Transformations du monde", "competency": "Histoire", "summary": "Le XIXe siècle est marqué par l’industrialisation, les révolutions politiques et l’expansion européenne, qui transforment les rapports de puissance.", "content": "La Révolution industrielle modifie les techniques, les transports et les économies. Les révolutions politiques transforment les États et les idées, tandis que l’expansion européenne renforce les rivalités et les rapports de domination.", "answer": "l’industrialisation et les transformations politiques modifient les rapports de puissance au XIXe siècle.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les transformations du monde au xixe siècle", "la notion signifie l’inverse de ce que décrit les transformations du monde au xixe siècle", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      }
    ]
  },
  {
    subject: "Géographie",
    source: "https://apprendre.education.sn/C_ressource/recherche/34",
    version: "4e-geographie-lotC-v1",
    chapters: [
      {
        title: "Localiser l’Afrique et l’Afrique de l’Ouest",
        domain: "Position et cartographie",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Localiser l’Afrique et l’Afrique de l’Ouest", "domain": "Position et cartographie", "competency": "Géographie", "summary": "L’Afrique se situe de part et d’autre de l’équateur et l’Afrique de l’Ouest constitue sa partie occidentale, ouverte sur l’océan Atlantique.", "content": "Pour localiser un espace, on utilise les continents, les océans, les coordonnées et les repères. Le Sénégal appartient à l’Afrique de l’Ouest et possède une façade atlantique.", "answer": "le Sénégal se situe en Afrique de l’Ouest et possède une façade sur l’océan Atlantique.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec localiser l’afrique et l’afrique de l’ouest", "la notion signifie l’inverse de ce que décrit localiser l’afrique et l’afrique de l’ouest", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Lire et construire une carte",
        domain: "Cartographie",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Lire et construire une carte", "domain": "Cartographie", "competency": "Géographie", "summary": "Une carte utilise une échelle, une orientation, une légende et des figurés pour représenter un espace.", "content": "La lecture d’une carte commence par l’identification du titre, de l’échelle, de l’orientation et de la légende. Les figurés permettent de représenter des localisations, des flux ou des phénomènes.", "answer": "une carte s’interprète grâce au titre, à l’échelle, à l’orientation et à la légende.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec lire et construire une carte", "la notion signifie l’inverse de ce que décrit lire et construire une carte", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Le relief de l’Afrique de l’Ouest",
        domain: "Milieux naturels",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Le relief de l’Afrique de l’Ouest", "domain": "Milieux naturels", "competency": "Géographie", "summary": "Le relief ouest-africain comprend des plaines, des plateaux, des massifs et des vallées, dont la répartition influence les activités humaines.", "content": "Le relief résulte de l’histoire géologique et de l’érosion. Les formes de relief influencent les paysages, les transports, l’agriculture et l’occupation humaine.", "answer": "les formes de relief influencent les paysages et les activités humaines.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec le relief de l’afrique de l’ouest", "la notion signifie l’inverse de ce que décrit le relief de l’afrique de l’ouest", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les fleuves et l’hydrographie",
        domain: "Milieux naturels",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Les fleuves et l’hydrographie", "domain": "Milieux naturels", "competency": "Géographie", "summary": "Les grands cours d’eau structurent les territoires, fournissent de l’eau et soutiennent des activités comme l’agriculture, la pêche et le transport.", "content": "Le Sénégal, le fleuve Sénégal, la Gambie et le Niger sont des repères importants de l’espace ouest-africain. L’hydrographie joue un rôle essentiel dans les activités et les implantations humaines.", "answer": "les cours d’eau structurent les territoires et soutiennent plusieurs activités humaines.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les fleuves et l’hydrographie", "la notion signifie l’inverse de ce que décrit les fleuves et l’hydrographie", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les grands domaines climatiques",
        domain: "Climats et milieux",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Les grands domaines climatiques", "domain": "Climats et milieux", "competency": "Géographie", "summary": "Les climats de l’Afrique varient notamment avec la latitude, les vents, les précipitations et la distance à l’océan.", "content": "La répartition des pluies et des températures permet de distinguer plusieurs grands domaines climatiques. Ces différences expliquent en partie la diversité des végétations et des activités agricoles.", "answer": "la latitude et les précipitations participent à la répartition des grands domaines climatiques.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les grands domaines climatiques", "la notion signifie l’inverse de ce que décrit les grands domaines climatiques", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les zones désertiques et sahéliennes",
        domain: "Climats et milieux",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Les zones désertiques et sahéliennes", "domain": "Climats et milieux", "competency": "Géographie", "summary": "Les espaces désertiques et sahéliens se caractérisent par des précipitations faibles ou irrégulières et des contraintes fortes pour les activités humaines.", "content": "Le Sahel est une zone de transition entre le désert et les régions plus humides. La disponibilité de l’eau, la variabilité des pluies et la pression sur les ressources sont des enjeux importants.", "answer": "le Sahel est une zone de transition où l’eau et la variabilité des pluies constituent des enjeux majeurs.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les zones désertiques et sahéliennes", "la notion signifie l’inverse de ce que décrit les zones désertiques et sahéliennes", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les zones tropicales",
        domain: "Climats et milieux",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Les zones tropicales", "domain": "Climats et milieux", "competency": "Géographie", "summary": "Les zones tropicales connaissent généralement une saison des pluies et une saison sèche, avec des variations selon les régions.", "content": "Les milieux tropicaux présentent des végétations et des activités agricoles variées. Les calendriers agricoles dépendent fortement de la saison des pluies.", "answer": "les zones tropicales sont caractérisées par une alternance saisonnière souvent marquée par une saison des pluies et une saison sèche.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les zones tropicales", "la notion signifie l’inverse de ce que décrit les zones tropicales", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Les zones équatoriales et humides",
        domain: "Climats et milieux",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Les zones équatoriales et humides", "domain": "Climats et milieux", "competency": "Géographie", "summary": "Les zones équatoriales sont chaudes et très humides, avec des précipitations abondantes favorisant des végétations denses.", "content": "L’humidité et les températures élevées contribuent au développement de forêts denses. Les activités humaines doivent composer avec ces conditions naturelles.", "answer": "les zones équatoriales sont chaudes, humides et favorables à des végétations denses.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec les zones équatoriales et humides", "la notion signifie l’inverse de ce que décrit les zones équatoriales et humides", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Le peuplement de l’Afrique de l’Ouest",
        domain: "Population et société",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Le peuplement de l’Afrique de l’Ouest", "domain": "Population et société", "competency": "Géographie", "summary": "La population ouest-africaine est inégalement répartie selon les ressources, les conditions naturelles, l’histoire et les activités économiques.", "content": "Les densités sont souvent plus fortes dans les espaces urbains, les vallées, les zones côtières et certains bassins agricoles. Les facteurs de peuplement sont multiples.", "answer": "la population est inégalement répartie selon des facteurs naturels, historiques et économiques.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec le peuplement de l’afrique de l’ouest", "la notion signifie l’inverse de ce que décrit le peuplement de l’afrique de l’ouest", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "L’urbanisation",
        domain: "Population et société",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "L’urbanisation", "domain": "Population et société", "competency": "Géographie", "summary": "L’urbanisation correspond à la croissance de la population urbaine et à l’extension des espaces urbains.", "content": "Dakar, Thiès, Saint-Louis et d’autres villes sénégalaises montrent des dynamiques d’urbanisation différentes. L’urbanisation crée des opportunités mais aussi des défis d’aménagement, de mobilité et d’accès aux services.", "answer": "l’urbanisation correspond à la croissance et à l’extension des espaces urbains.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’urbanisation", "la notion signifie l’inverse de ce que décrit l’urbanisation", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "L’agriculture et les ressources",
        domain: "Activités économiques",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "L’agriculture et les ressources", "domain": "Activités économiques", "competency": "Géographie", "summary": "L’agriculture dépend des conditions naturelles, des techniques, de l’accès à l’eau, des marchés et des politiques d’aménagement.", "content": "Au Sénégal, les systèmes agricoles varient selon les milieux : cultures pluviales, agriculture irriguée et horticulture répondent à des contraintes et opportunités différentes. La gestion durable des sols et de l’eau est essentielle.", "answer": "l’agriculture dépend à la fois des conditions naturelles, des techniques, de l’eau et des marchés.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec l’agriculture et les ressources", "la notion signifie l’inverse de ce que décrit l’agriculture et les ressources", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      },
      {
        title: "Ressources, industrie et intégration régionale",
        domain: "Activités économiques",
        competency: "Géographie",
        lessons: [makeLessonSpec({"title": "Ressources, industrie et intégration régionale", "domain": "Activités économiques", "competency": "Géographie", "summary": "Les ressources naturelles et les activités industrielles participent aux économies nationales, tandis que l’intégration régionale facilite les échanges et les complémentarités.", "content": "L’exploitation des ressources doit être mise en relation avec les infrastructures, l’emploi, l’environnement et les marchés. Les échanges régionaux ouest-africains peuvent soutenir la complémentarité des économies.", "answer": "les ressources, les infrastructures et l’intégration régionale influencent les activités économiques et les échanges.", "wrongs": ["il s’agit uniquement d’un phénomène sans rapport avec ressources, industrie et intégration régionale", "la notion signifie l’inverse de ce que décrit ressources, industrie et intégration régionale", "la notion ne peut être étudiée qu’en dehors de tout repère géographique ou historique"]})]
      }
    ]
  }
];
function toQuestion(q:RawQuestion,index:number){if(q.kind==="tf"){const answer=Boolean(q.answer);return{type:"true_false" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[{label:"Vrai",is_correct:answer,order:1},{label:"Faux",is_correct:!answer,order:2}]};}const wrongs=q.wrongs??[];return{type:"single_choice" as const,prompt:q.prompt,explanation:q.explanation,points:10,difficulty_score:index<4?30:index<8?55:75,options:[String(q.answer),...wrongs].map((label,i)=>({label,is_correct:i===0,order:i+1}))};}

async function getCycle(){const {data,error}=await supabase.from("school_cycles").select("*").eq("code","moyen").maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_cycles").insert({code:"moyen",name:"Moyen",order:2}).select().single();if(r.error)throw r.error;return r.data;}
async function getLevel(cycleId:string){const {data,error}=await supabase.from("school_levels").select("*").eq("cycle_id",cycleId).in("code",["4e","4eme","4ème"]).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("school_levels").insert({cycle_id:cycleId,code:"4e",name:"4e",order:3}).select().single();if(r.error)throw r.error;return r.data;}
async function getSubject(name:string){const aliases:Record<string,string[]>={"Français":["fr","francais","français"],"Anglais":["ang","anglais"],"Histoire":["histoire","his"],"Géographie":["geographie","géographie","geo"]};const codes=aliases[name]??[name.toLowerCase()];const {data,error}=await supabase.from("subjects").select("*").in("code",codes).limit(1).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("subjects").insert({code:codes[0],name,icon:name==="Français"?"BookOpen":"Languages"}).select().single();if(r.error)throw r.error;return r.data;}
async function ensureLevelSubject(levelId:string,subjectId:string){const {data,error}=await supabase.from("level_subjects").select("id").eq("level_id",levelId).eq("subject_id",subjectId).is("series_id",null).maybeSingle();if(error)throw error;if(!data){const r=await supabase.from("level_subjects").insert({level_id:levelId,subject_id:subjectId,series_id:null,is_optional:false});if(r.error)throw r.error;}}
async function getCurriculum(levelId:string,subjectId:string,p:RawProgram){const title=`${p.subject} 4e – Programme sénégalais`;const {data,error}=await supabase.from("curriculums").select("*").eq("level_id",levelId).eq("subject_id",subjectId).eq("title",title).eq("version",p.version).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("curriculums").insert({level_id:levelId,series_id:null,subject_id:subjectId,title,description:`Progression 4e de ${p.subject}, structurée à partir de ressources pédagogiques sénégalaises. Contenu original EdTech Sénégal.`,version:p.version,status:STATUS,source:"Ressources pédagogiques sénégalaises — cadrage institutionnel; rédaction originale EdTech Sénégal.",source_url:p.source||PROMET_URL,source_document:"Cadrage à partir des ressources ADEM/PROMET; ne pas présenter comme reproduction intégrale du référentiel officiel.",is_demo:false,validated:false,published_at:STATUS==="published"?new Date().toISOString():null}).select().single();if(r.error)throw r.error;return r.data;}
async function getDomain(curriculumId:string,name:string,order:number){const {data,error}=await supabase.from("domains").select("*").eq("curriculum_id",curriculumId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("domains").insert({curriculum_id:curriculumId,name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getCompetency(domainId:string,name:string,order:number){const {data,error}=await supabase.from("competencies").select("*").eq("domain_id",domainId).eq("name",name).maybeSingle();if(error)throw error;if(data)return data;const r=await supabase.from("competencies").insert({domain_id:domainId,name,description:name,order}).select().single();if(r.error)throw r.error;return r.data;}
async function getChapter(curriculumId:string,domainId:string,c:RawChapter,order:number){const {data,error}=await supabase.from("chapters").select("*").eq("curriculum_id",curriculumId).eq("title",c.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("chapters").insert({curriculum_id:curriculumId,domain_id:domainId,title:c.title,order,status:STATUS,source:"Ressources sénégalaises; structuration originale EdTech Sénégal.",source_url:PROMET_URL}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getLesson(chapterId:string,competencyId:string,l:RawLesson,order:number,sourceUrl:string){const {data,error}=await supabase.from("lessons").select("*").eq("chapter_id",chapterId).eq("title",l.title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("lessons").insert({chapter_id:chapterId,competency_id:competencyId,title:l.title,content_md:l.content,objectives:l.objectives,summary:l.summary,order,status:STATUS,source:"Contenu original EdTech Sénégal, structuré à partir de ressources pédagogiques sénégalaises.",source_url:sourceUrl}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function getExercise(lessonId:string,competencyId:string,title:string,instructions:string,difficulty:"easy"|"medium"|"hard",score:number){const {data,error}=await supabase.from("exercises").select("*").eq("lesson_id",lessonId).eq("title",title).is("deleted_at",null).maybeSingle();if(error)throw error;if(data)return{data,created:false};const r=await supabase.from("exercises").insert({lesson_id:lessonId,competency_id:competencyId,title,instructions,difficulty,difficulty_score:score,status:STATUS}).select().single();if(r.error)throw r.error;return{data:r.data,created:true};}
async function addQuestion(exerciseId:string,competencyId:string,chapterId:string,q:ReturnType<typeof toQuestion>){const {data,error}=await supabase.from("questions").select("id").eq("exercise_id",exerciseId).eq("prompt",q.prompt).is("deleted_at",null).maybeSingle();if(error)throw error;let questionId:string;if(data?.id){questionId=data.id;}else{const r=await supabase.from("questions").insert({exercise_id:exerciseId,competency_id:competencyId,chapter_id:chapterId,type:q.type,prompt:q.prompt,explanation:q.explanation,points:q.points,difficulty_score:q.difficulty_score,status:STATUS}).select("id").single();if(r.error)throw r.error;questionId=r.data.id;}const {data:existing,error:readErr}=await supabase.from("question_options").select("id,label,is_correct,order").eq("question_id",questionId);if(readErr)throw readErr;const expected=q.options.length, correct=q.options.filter(x=>x.is_correct).length, actualCorrect=(existing??[]).filter(x=>x.is_correct).length;if((existing??[]).length!==expected||actualCorrect!==correct){if((existing??[]).length){const d=await supabase.from("question_options").delete().eq("question_id",questionId);if(d.error)throw d.error;}const ins=await supabase.from("question_options").insert(q.options.map(o=>({...o,question_id:questionId})));if(ins.error)throw ins.error;}return!data?.id;}
async function runProgram(levelId:string,p:RawProgram){const subject=await getSubject(p.subject);await ensureLevelSubject(levelId,subject.id);const curriculum=await getCurriculum(levelId,subject.id,p);const stats={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(let ci=0;ci<p.chapters.length;ci++){const c=p.chapters[ci];if(!c)throw new Error(`[${p.subject}] Chapitre ${ci+1} introuvable.`);const domain=await getDomain(curriculum.id,c.domain,ci+1);const comp=await getCompetency(domain.id,c.competency,1);const chapter=await getChapter(curriculum.id,domain.id,c,ci+1);for(let li=0;li<c.lessons.length;li++){const l=c.lessons[li];if(!l)throw new Error(`[${p.subject}] Leçon ${ci+1}.${li+1} introuvable.`);if(l.questions.length<12)throw new Error(`[${p.subject}] ${l.title}: ${l.questions.length} questions, 12 attendues.`);const lesson=await getLesson(chapter.data.id,comp.id,l,li+1,p.source);if(lesson.created)stats.lessons++;const groups=[{title:`${l.title} — notions essentielles`,difficulty:"easy" as const,score:30,start:0,end:4,instructions:"Maîtrise les définitions, repères et propriétés essentielles."},{title:`${l.title} — application`,difficulty:"medium" as const,score:55,start:4,end:8,instructions:"Applique la notion à une situation nouvelle et justifie ton choix."},{title:`${l.title} — raisonnement`,difficulty:"hard" as const,score:75,start:8,end:12,instructions:"Analyse la situation, justifie le raisonnement et vérifie le résultat."}];for(const g of groups){const ex=await getExercise(lesson.data.id,comp.id,g.title,g.instructions,g.difficulty,g.score);if(ex.created)stats.exercises++;for(let qi=g.start;qi<g.end;qi++){const raw=l.questions[qi];if(!raw)throw new Error(`[${p.subject}] ${l.title}: question ${qi+1} manquante.`);if(await addQuestion(ex.data.id,comp.id,chapter.data.id,toQuestion(raw,qi)))stats.questions++;else stats.duplicates++;}}}}stats.chapters=p.chapters.length;return stats;}
async function main(){console.log("==============================================");console.log(" IMPORT LOT C — 4e — HISTOIRE + GÉOGRAPHIE");console.log("==============================================");console.log(`Statut : ${STATUS}`);const cycle=await getCycle();const level=await getLevel(cycle.id);console.log(`Niveau : ${level.name}`);const totals={chapters:0,lessons:0,exercises:0,questions:0,duplicates:0};for(const p of programs){const st=await runProgram(level.id,p);for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=st[k];console.log(`\n=== ${p.subject.toUpperCase()} 4e ===`);console.log(st);}console.log("\n==============================================");console.log("IMPORT LOT C 4e TERMINÉ");console.log("==============================================");console.log(totals);console.log("Contenu en review par défaut.");}
main().catch(e=>{console.error("❌ Import Lot C 4e échoué");console.error(e);process.exit(1);});
