import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL est manquant dans .env.local");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY est manquant dans .env.local");
}

const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const CURRICULUM_TITLE = "Programme de SVT - 6e";

type Lesson = {
  title: string;
  exerciseTitle: string;
  instructions: string;
  difficulty: "easy" | "medium" | "hard";
  difficultyScore: number;
  questions: Array<{
    type:
      | "single_choice"
      | "multiple_choice"
      | "true_false"
      | "numeric"
      | "short_answer";
    prompt: string;
    explanation: string;
    points: number;
    difficultyScore: number;
    options?: Array<{
      label: string;
      is_correct: boolean;
      order: number;
    }>;
  }>;
};

const content: Record<string, Lesson[]> = {
  "DiversitÃ© et composantes du milieu naturel": [
    {
      title: "DÃ©couverte et observation d'un milieu naturel",
      exerciseTitle: "Identifier les Ã©lÃ©ments d'un milieu naturel",
      instructions:
        "Observe un milieu naturel et distingue les Ã©lÃ©ments vivants des Ã©lÃ©ments non vivants.",
      difficulty: "easy",
      difficultyScore: 20,
      questions: [
        {
          type: "single_choice",
          prompt: "Lequel de ces Ã©lÃ©ments est un Ãªtre vivant ?",
          explanation:
            "Une plante est un Ãªtre vivant car elle naÃ®t, se nourrit, grandit, se reproduit et meurt.",
          points: 10,
          difficultyScore: 20,
          options: [
            { label: "Une pierre", is_correct: false, order: 1 },
            { label: "Une plante", is_correct: true, order: 2 },
            { label: "L'eau", is_correct: false, order: 3 },
            { label: "Le sol", is_correct: false, order: 4 },
          ],
        },
        {
          type: "multiple_choice",
          prompt:
            "Quels Ã©lÃ©ments peuvent Ãªtre considÃ©rÃ©s comme des composantes non vivantes d'un milieu naturel ?",
          explanation:
            "L'eau, l'air, le sol et la lumiÃ¨re sont des Ã©lÃ©ments non vivants du milieu.",
          points: 10,
          difficultyScore: 30,
          options: [
            { label: "L'eau", is_correct: true, order: 1 },
            { label: "L'air", is_correct: true, order: 2 },
            { label: "Un arbre", is_correct: false, order: 3 },
            { label: "Le sol", is_correct: true, order: 4 },
          ],
        },
      ],
    },
    {
      title: "Les composantes vivantes et non vivantes d'un milieu",
      exerciseTitle: "Classer les composantes d'un milieu",
      instructions:
        "Classe les diffÃ©rents Ã©lÃ©ments observÃ©s dans un milieu naturel.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt: "Lequel est une composante vivante ?",
          explanation: "Un insecte est un Ãªtre vivant.",
          points: 10,
          difficultyScore: 20,
          options: [
            { label: "Le sable", is_correct: false, order: 1 },
            { label: "L'insecte", is_correct: true, order: 2 },
            { label: "L'eau", is_correct: false, order: 3 },
            { label: "La lumiÃ¨re", is_correct: false, order: 4 },
          ],
        },
        {
          type: "true_false",
          prompt:
            "L'eau et l'air sont des composantes non vivantes d'un milieu naturel.",
          explanation:
            "Vrai. L'eau et l'air ne sont pas des Ãªtres vivants, mais ils sont indispensables Ã  de nombreux Ãªtres vivants.",
          points: 10,
          difficultyScore: 20,
          options: [
            { label: "Vrai", is_correct: true, order: 1 },
            { label: "Faux", is_correct: false, order: 2 },
          ],
        },
      ],
    },
    {
      title: "Les relations entre les Ãªtres vivants et leur milieu",
      exerciseTitle: "Comprendre les relations dans un milieu",
      instructions:
        "Analyse les relations entre les Ãªtres vivants et les Ã©lÃ©ments de leur milieu.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Pourquoi les plantes ont-elles besoin de lumiÃ¨re dans leur milieu ?",
          explanation:
            "La lumiÃ¨re permet aux plantes vertes de rÃ©aliser leur nutrition chlorophyllienne.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Pour fabriquer leur matiÃ¨re organique", is_correct: true, order: 1 },
            { label: "Pour respirer uniquement", is_correct: false, order: 2 },
            { label: "Pour absorber le sol", is_correct: false, order: 3 },
            { label: "Pour produire de l'eau", is_correct: false, order: 4 },
          ],
        },
        {
          type: "single_choice",
          prompt:
            "Une grenouille vivant prÃ¨s d'une mare dÃ©pend principalement de quel Ã©lÃ©ment de son milieu ?",
          explanation:
            "La mare fournit Ã  la grenouille un milieu adaptÃ© Ã  son mode de vie.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "La mare et son environnement", is_correct: true, order: 1 },
            { label: "Une roche uniquement", is_correct: false, order: 2 },
            { label: "Le sable uniquement", is_correct: false, order: 3 },
            { label: "La lumiÃ¨re uniquement", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "RepÃ©rage, orientation et rÃ©partition des Ãªtres vivants": [
    {
      title: "RepÃ©rer et dÃ©crire un milieu naturel",
      exerciseTitle: "DÃ©crire un milieu naturel",
      instructions:
        "Utilise des observations simples pour dÃ©crire l'organisation d'un milieu.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quelle information est utile pour dÃ©crire un milieu naturel ?",
          explanation:
            "On peut dÃ©crire les Ãªtres vivants prÃ©sents ainsi que les facteurs physiques du milieu.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "Les Ãªtres vivants prÃ©sents", is_correct: true, order: 1 },
            { label: "La couleur des vÃªtements de l'observateur", is_correct: false, order: 2 },
            { label: "Le numÃ©ro de tÃ©lÃ©phone de l'observateur", is_correct: false, order: 3 },
            { label: "La marque du cahier", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La rÃ©partition des Ãªtres vivants dans un milieu",
      exerciseTitle: "Relier les Ãªtres vivants Ã  leur milieu",
      instructions:
        "Observe comment les Ãªtres vivants se rÃ©partissent selon les conditions du milieu.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Pourquoi tous les Ãªtres vivants ne se trouvent-ils pas au mÃªme endroit ?",
          explanation:
            "Chaque espÃ¨ce possÃ¨de des besoins et des conditions de vie particuliÃ¨res.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Parce qu'ils ont des besoins diffÃ©rents", is_correct: true, order: 1 },
            { label: "Parce qu'ils ont tous les mÃªmes besoins", is_correct: false, order: 2 },
            { label: "Parce que le milieu est toujours identique", is_correct: false, order: 3 },
            { label: "Parce qu'ils ne dÃ©pendent jamais du milieu", is_correct: false, order: 4 },
          ],
        },
        {
          type: "true_false",
          prompt:
            "La rÃ©partition des Ãªtres vivants peut dÃ©pendre des conditions du milieu.",
          explanation:
            "Vrai. La tempÃ©rature, l'eau, la lumiÃ¨re et la disponibilitÃ© des ressources influencent leur rÃ©partition.",
          points: 10,
          difficultyScore: 35,
          options: [
            { label: "Vrai", is_correct: true, order: 1 },
            { label: "Faux", is_correct: false, order: 2 },
          ],
        },
      ],
    },
  ],

  "La nutrition minÃ©rale des plantes vertes": [
    {
      title: "Les besoins en eau des plantes vertes",
      exerciseTitle: "Comprendre le rÃ´le de l'eau",
      instructions:
        "Identifie le rÃ´le de l'eau dans la nutrition des plantes vertes.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel Ã©lÃ©ment du sol est indispensable Ã  l'alimentation minÃ©rale d'une plante verte ?",
          explanation:
            "La plante absorbe notamment de l'eau contenant des sels minÃ©raux par ses racines.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "L'eau", is_correct: true, order: 1 },
            { label: "Le plastique", is_correct: false, order: 2 },
            { label: "Le verre", is_correct: false, order: 3 },
            { label: "Le mÃ©tal", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "Les sels minÃ©raux et la nutrition des plantes",
      exerciseTitle: "Identifier les besoins minÃ©raux",
      instructions:
        "Explique pourquoi les sels minÃ©raux sont nÃ©cessaires aux plantes.",
      difficulty: "medium",
      difficultyScore: 35,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Par quelle partie de la plante l'eau et les sels minÃ©raux sont-ils principalement absorbÃ©s ?",
          explanation:
            "Les racines, notamment les zones portant des poils absorbants, assurent principalement cette absorption.",
          points: 10,
          difficultyScore: 35,
          options: [
            { label: "Les racines", is_correct: true, order: 1 },
            { label: "Les fleurs", is_correct: false, order: 2 },
            { label: "Les fruits", is_correct: false, order: 3 },
            { label: "Les graines uniquement", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La lumiÃ¨re et le dioxyde de carbone dans la nutrition des plantes vertes",
      exerciseTitle: "Les conditions de la nutrition des plantes vertes",
      instructions:
        "Identifie les Ã©lÃ©ments nÃ©cessaires Ã  la nutrition des plantes vertes.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quels Ã©lÃ©ments sont nÃ©cessaires Ã  la nutrition chlorophyllienne d'une plante verte ?",
          explanation:
            "La plante verte utilise notamment l'eau, le dioxyde de carbone et la lumiÃ¨re pour produire sa matiÃ¨re organique.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "L'eau", is_correct: true, order: 1 },
            { label: "Le dioxyde de carbone", is_correct: true, order: 2 },
            { label: "La lumiÃ¨re", is_correct: true, order: 3 },
            { label: "Le plastique", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "La nutrition des animaux et rÃ©gimes alimentaires": [
    {
      title: "Les besoins alimentaires des animaux",
      exerciseTitle: "Identifier les besoins alimentaires",
      instructions:
        "Reconnais les aliments nÃ©cessaires Ã  diffÃ©rents animaux.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt: "Pourquoi les animaux se nourrissent-ils ?",
          explanation:
            "Les aliments apportent notamment de la matiÃ¨re et de l'Ã©nergie nÃ©cessaires au fonctionnement de l'organisme.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "Pour assurer le fonctionnement de leur organisme", is_correct: true, order: 1 },
            { label: "Pour devenir des plantes", is_correct: false, order: 2 },
            { label: "Pour produire uniquement de l'eau", is_correct: false, order: 3 },
            { label: "Pour ne plus respirer", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "Les diffÃ©rents rÃ©gimes alimentaires",
      exerciseTitle: "ReconnaÃ®tre les rÃ©gimes alimentaires",
      instructions:
        "Classe les animaux selon leur rÃ©gime alimentaire.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "single_choice",
          prompt: "Quel animal est gÃ©nÃ©ralement herbivore ?",
          explanation:
            "La vache se nourrit principalement de vÃ©gÃ©taux.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "La vache", is_correct: true, order: 1 },
            { label: "Le lion", is_correct: false, order: 2 },
            { label: "Le chat", is_correct: false, order: 3 },
            { label: "Le crocodile", is_correct: false, order: 4 },
          ],
        },
        {
          type: "single_choice",
          prompt: "Quel rÃ©gime correspond Ã  un animal qui mange des vÃ©gÃ©taux et des animaux ?",
          explanation:
            "Un omnivore peut consommer des aliments d'origine vÃ©gÃ©tale et animale.",
          points: 10,
          difficultyScore: 35,
          options: [
            { label: "Herbivore", is_correct: false, order: 1 },
            { label: "Carnivore", is_correct: false, order: 2 },
            { label: "Omnivore", is_correct: true, order: 3 },
            { label: "MinÃ©ral", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La denture et le rÃ©gime alimentaire",
      exerciseTitle: "Relier denture et alimentation",
      instructions:
        "Observe les caractÃ©ristiques de la denture pour relier un animal Ã  son rÃ©gime.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Chez un animal herbivore comme la vache, les dents sont adaptÃ©es principalement Ã  :",
          explanation:
            "Les dents des herbivores sont adaptÃ©es Ã  la prÃ©hension et au broyage des vÃ©gÃ©taux.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "La mastication des vÃ©gÃ©taux", is_correct: true, order: 1 },
            { label: "La chasse uniquement", is_correct: false, order: 2 },
            { label: "La respiration", is_correct: false, order: 3 },
            { label: "La vision", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "La respiration dans diffÃ©rents milieux de vie": [
    {
      title: "La respiration chez les Ãªtres vivants",
      exerciseTitle: "Comprendre la respiration",
      instructions:
        "Identifie les Ã©changes gazeux rÃ©alisÃ©s par les Ãªtres vivants.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Lors de la respiration, les Ãªtres vivants rÃ©alisent des Ã©changes avec leur milieu.",
          explanation:
            "La respiration implique notamment des Ã©changes de dioxygÃ¨ne et de dioxyde de carbone avec le milieu.",
          points: 10,
          difficultyScore: 30,
          options: [
            { label: "Vrai", is_correct: true, order: 1 },
            { label: "Faux", is_correct: false, order: 2 },
          ],
        },
      ],
    },
    {
      title: "La respiration dans l'air",
      exerciseTitle: "La respiration en milieu aÃ©rien",
      instructions:
        "Compare les diffÃ©rents modes de respiration dans l'air.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel organe permet principalement aux humains d'effectuer les Ã©changes gazeux respiratoires ?",
          explanation:
            "Chez l'Ãªtre humain, les Ã©changes gazeux se produisent principalement au niveau des poumons.",
          points: 10,
          difficultyScore: 35,
          options: [
            { label: "Les poumons", is_correct: true, order: 1 },
            { label: "L'estomac", is_correct: false, order: 2 },
            { label: "Les reins", is_correct: false, order: 3 },
            { label: "Les os", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La respiration dans l'eau",
      exerciseTitle: "Respirer dans un milieu aquatique",
      instructions:
        "DÃ©couvre comment certains animaux rÃ©alisent leurs Ã©changes gazeux dans l'eau.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel organe permet gÃ©nÃ©ralement aux poissons de rÃ©aliser leurs Ã©changes gazeux dans l'eau ?",
          explanation:
            "Les branchies permettent aux poissons de prÃ©lever le dioxygÃ¨ne dissous dans l'eau.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Les branchies", is_correct: true, order: 1 },
            { label: "Les poumons humains", is_correct: false, order: 2 },
            { label: "Les racines", is_correct: false, order: 3 },
            { label: "Les feuilles", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "L'Homme et la qualitÃ© de l'air respirÃ©": [
    {
      title: "L'appareil respiratoire humain",
      exerciseTitle: "Identifier les organes respiratoires",
      instructions:
        "Identifie les principaux organes de l'appareil respiratoire humain.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel est le principal organe de l'appareil respiratoire humain ?",
          explanation:
            "Les poumons sont les principaux organes oÃ¹ ont lieu les Ã©changes gazeux.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "Les poumons", is_correct: true, order: 1 },
            { label: "Le foie", is_correct: false, order: 2 },
            { label: "L'estomac", is_correct: false, order: 3 },
            { label: "Le cÅ“ur uniquement", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La qualitÃ© de l'air et la respiration",
      exerciseTitle: "Pollution et respiration",
      instructions:
        "Analyse l'effet de la pollution de l'air sur la respiration.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quels Ã©lÃ©ments peuvent dÃ©grader la qualitÃ© de l'air ?",
          explanation:
            "Les fumÃ©es, certaines poussiÃ¨res et certains gaz polluants peuvent dÃ©grader la qualitÃ© de l'air.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Les fumÃ©es", is_correct: true, order: 1 },
            { label: "Certaines poussiÃ¨res", is_correct: true, order: 2 },
            { label: "Certains gaz polluants", is_correct: true, order: 3 },
            { label: "L'air propre", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "ProtÃ©ger son appareil respiratoire",
      exerciseTitle: "Adopter de bonnes habitudes respiratoires",
      instructions:
        "Identifie les comportements qui contribuent Ã  protÃ©ger l'appareil respiratoire.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quelles actions contribuent Ã  protÃ©ger l'appareil respiratoire ?",
          explanation:
            "Ã‰viter la fumÃ©e, aÃ©rer les locaux et limiter l'exposition aux polluants contribuent Ã  prÃ©server la santÃ© respiratoire.",
          points: 10,
          difficultyScore: 30,
          options: [
            { label: "AÃ©rer rÃ©guliÃ¨rement les piÃ¨ces", is_correct: true, order: 1 },
            { label: "Ã‰viter la fumÃ©e de cigarette", is_correct: true, order: 2 },
            { label: "Respirer volontairement des fumÃ©es", is_correct: false, order: 3 },
            { label: "Limiter l'exposition aux polluants", is_correct: true, order: 4 },
          ],
        },
      ],
    },
  ],
};

async function getCurriculum() {
  const { data, error } = await supabase
    .from("curriculums")
    .select("id,title,status,version,is_demo")
    .eq("title", CURRICULUM_TITLE)
    .eq("is_demo", false)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(`Programme introuvable : ${CURRICULUM_TITLE}`);
  }

  return data;
}

async function main() {
  console.log("==============================================");
  console.log("   IMPORT EXERCICES SVT 6e â€” EDTECH SÃ‰NÃ‰GAL");
  console.log("==============================================");
  console.log("");

  const curriculum = await getCurriculum();

  console.log("ðŸ“š Programme trouvÃ©");
  console.log(`   ${curriculum.title}`);
  console.log(`   Statut : ${curriculum.status}`);
  console.log(`   Version : ${curriculum.version}`);
  console.log(`   Demo : ${curriculum.is_demo}`);
  console.log("");

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id,title,order,status")
    .eq("curriculum_id", curriculum.id)
    .is("deleted_at", null)
    .order("order");

  if (chaptersError) throw chaptersError;

  if (!chapters || chapters.length === 0) {
    throw new Error("Aucun chapitre trouvÃ©.");
  }

  let totalExercises = 0;
  let insertedExercises = 0;
  let existingExercises = 0;
  let totalQuestions = 0;
  let insertedQuestions = 0;
  let existingQuestions = 0;

  for (const chapter of chapters) {
    const lessons = content[chapter.title];

    if (!lessons) {
      console.warn(`âš ï¸ Aucun contenu prÃ©vu pour : ${chapter.title}`);
      continue;
    }

    console.log("");
    console.log(`ðŸ“– ${chapter.order}. ${chapter.title}`);

    const { data: dbLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id,title,competency_id")
      .eq("chapter_id", chapter.id)
      .is("deleted_at", null)
      .order("order");

    if (lessonsError) throw lessonsError;

    for (const lesson of lessons) {
      const dbLesson = dbLessons?.find(
        (item) => item.title === lesson.title
      );

      if (!dbLesson) {
        console.warn(`   âš ï¸ LeÃ§on introuvable : ${lesson.title}`);
        continue;
      }

      totalExercises++;

      const { data: existing, error: existingError } = await supabase
        .from("exercises")
        .select("id,title")
        .eq("lesson_id", dbLesson.id)
        .eq("title", lesson.exerciseTitle)
        .is("deleted_at", null)
        .maybeSingle();

      if (existingError) throw existingError;

      let exerciseId: string;

      if (existing) {
        exerciseId = existing.id;
        existingExercises++;
        console.log(`   â†ªï¸ ${lesson.title} â€” exercice dÃ©jÃ  prÃ©sent`);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("exercises")
          .insert({
            lesson_id: dbLesson.id,
            competency_id: dbLesson.competency_id,
            title: lesson.exerciseTitle,
            instructions: lesson.instructions,
            difficulty: lesson.difficulty,
            difficulty_score: lesson.difficultyScore,
            status: "draft",
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        exerciseId = inserted.id;
        insertedExercises++;

        console.log(`   âœ… ${lesson.title} â€” exercice crÃ©Ã©`);
      }

      for (const question of lesson.questions) {
        totalQuestions++;

        const { data: existingQuestion, error: questionCheckError } =
          await supabase
            .from("questions")
            .select("id")
            .eq("exercise_id", exerciseId)
            .eq("prompt", question.prompt)
            .is("deleted_at", null)
            .maybeSingle();

        if (questionCheckError) throw questionCheckError;

        let questionId: string;

        if (existingQuestion) {
          questionId = existingQuestion.id;
          existingQuestions++;
        } else {
          const { data: insertedQuestion, error: questionError } =
            await supabase
              .from("questions")
              .insert({
                exercise_id: exerciseId,
                competency_id: dbLesson.competency_id,
                chapter_id: chapter.id,
                type: question.type,
                prompt: question.prompt,
                explanation: question.explanation,
                points: question.points,
                difficulty_score: question.difficultyScore,
                status: "draft",
              })
              .select("id")
              .single();

          if (questionError) throw questionError;

          questionId = insertedQuestion.id;
          insertedQuestions++;
        }

        if (question.options && question.options.length > 0) {
          const { data: currentOptions, error: optionsError } =
            await supabase
              .from("question_options")
              .select("id")
              .eq("question_id", questionId);

          if (optionsError) throw optionsError;

          if (!currentOptions || currentOptions.length === 0) {
            const { error: insertOptionsError } = await supabase
              .from("question_options")
              .insert(
                question.options.map((option) => ({
                  question_id: questionId,
                  label: option.label,
                  is_correct: option.is_correct,
                  order: option.order,
                }))
              );

            if (insertOptionsError) throw insertOptionsError;
          }
        }
      }
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("              IMPORT TERMINÃ‰");
  console.log("==============================================");
  console.log("");
  console.log(`ðŸ“ Exercices prÃ©vus : ${totalExercises}`);
  console.log(`âœ… Exercices crÃ©Ã©s : ${insertedExercises}`);
  console.log(`â†ªï¸ Exercices dÃ©jÃ  prÃ©sents : ${existingExercises}`);
  console.log("");
  console.log(`â“ Questions prÃ©vues : ${totalQuestions}`);
  console.log(`âœ… Questions crÃ©Ã©es : ${insertedQuestions}`);
  console.log(`â†ªï¸ Questions dÃ©jÃ  prÃ©sentes : ${existingQuestions}`);
  console.log("");
  console.log("ðŸ”’ Les exercices et questions sont en statut draft.");
  console.log("âž¡ï¸ Tu pourras ensuite les valider depuis l'administration.");
}

main().catch((error) => {
  console.error("");
  console.error("ERREUR LORS DE L'IMPORT SVT 6e :");
  console.error(error);
  process.exit(1);
});
