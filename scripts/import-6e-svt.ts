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

const CURRICULUM_ID = "ff89b282-ab13-41f1-a5b7-923d1e935749";

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
  "Diversité et composantes du milieu naturel": [
    {
      title: "Découverte et observation d'un milieu naturel",
      exerciseTitle: "Identifier les éléments d'un milieu naturel",
      instructions:
        "Observe un milieu naturel et distingue les éléments vivants des éléments non vivants.",
      difficulty: "easy",
      difficultyScore: 20,
      questions: [
        {
          type: "single_choice",
          prompt: "Lequel de ces éléments est un être vivant ?",
          explanation:
            "Une plante est un être vivant car elle naît, se nourrit, grandit, se reproduit et meurt.",
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
            "Quels éléments peuvent être considérés comme des composantes non vivantes d'un milieu naturel ?",
          explanation:
            "L'eau, l'air, le sol et la lumière sont des éléments non vivants du milieu.",
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
        "Classe les différents éléments observés dans un milieu naturel.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt: "Lequel est une composante vivante ?",
          explanation: "Un insecte est un être vivant.",
          points: 10,
          difficultyScore: 20,
          options: [
            { label: "Le sable", is_correct: false, order: 1 },
            { label: "L'insecte", is_correct: true, order: 2 },
            { label: "L'eau", is_correct: false, order: 3 },
            { label: "La lumière", is_correct: false, order: 4 },
          ],
        },
        {
          type: "true_false",
          prompt:
            "L'eau et l'air sont des composantes non vivantes d'un milieu naturel.",
          explanation:
            "Vrai. L'eau et l'air ne sont pas des êtres vivants, mais ils sont indispensables à de nombreux êtres vivants.",
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
      title: "Les relations entre les êtres vivants et leur milieu",
      exerciseTitle: "Comprendre les relations dans un milieu",
      instructions:
        "Analyse les relations entre les êtres vivants et les éléments de leur milieu.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Pourquoi les plantes ont-elles besoin de lumière dans leur milieu ?",
          explanation:
            "La lumière permet aux plantes vertes de réaliser leur nutrition chlorophyllienne.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Pour fabriquer leur matière organique", is_correct: true, order: 1 },
            { label: "Pour respirer uniquement", is_correct: false, order: 2 },
            { label: "Pour absorber le sol", is_correct: false, order: 3 },
            { label: "Pour produire de l'eau", is_correct: false, order: 4 },
          ],
        },
        {
          type: "single_choice",
          prompt:
            "Une grenouille vivant près d'une mare dépend principalement de quel élément de son milieu ?",
          explanation:
            "La mare fournit à la grenouille un milieu adapté à son mode de vie.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "La mare et son environnement", is_correct: true, order: 1 },
            { label: "Une roche uniquement", is_correct: false, order: 2 },
            { label: "Le sable uniquement", is_correct: false, order: 3 },
            { label: "La lumière uniquement", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "Repérage, orientation et répartition des êtres vivants": [
    {
      title: "Repérer et décrire un milieu naturel",
      exerciseTitle: "Décrire un milieu naturel",
      instructions:
        "Utilise des observations simples pour décrire l'organisation d'un milieu.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quelle information est utile pour décrire un milieu naturel ?",
          explanation:
            "On peut décrire les êtres vivants présents ainsi que les facteurs physiques du milieu.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "Les êtres vivants présents", is_correct: true, order: 1 },
            { label: "La couleur des vêtements de l'observateur", is_correct: false, order: 2 },
            { label: "Le numéro de téléphone de l'observateur", is_correct: false, order: 3 },
            { label: "La marque du cahier", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La répartition des êtres vivants dans un milieu",
      exerciseTitle: "Relier les êtres vivants à leur milieu",
      instructions:
        "Observe comment les êtres vivants se répartissent selon les conditions du milieu.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Pourquoi tous les êtres vivants ne se trouvent-ils pas au même endroit ?",
          explanation:
            "Chaque espèce possède des besoins et des conditions de vie particulières.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Parce qu'ils ont des besoins différents", is_correct: true, order: 1 },
            { label: "Parce qu'ils ont tous les mêmes besoins", is_correct: false, order: 2 },
            { label: "Parce que le milieu est toujours identique", is_correct: false, order: 3 },
            { label: "Parce qu'ils ne dépendent jamais du milieu", is_correct: false, order: 4 },
          ],
        },
        {
          type: "true_false",
          prompt:
            "La répartition des êtres vivants peut dépendre des conditions du milieu.",
          explanation:
            "Vrai. La température, l'eau, la lumière et la disponibilité des ressources influencent leur répartition.",
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

  "La nutrition minérale des plantes vertes": [
    {
      title: "Les besoins en eau des plantes vertes",
      exerciseTitle: "Comprendre le rôle de l'eau",
      instructions:
        "Identifie le rôle de l'eau dans la nutrition des plantes vertes.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel élément du sol est indispensable à l'alimentation minérale d'une plante verte ?",
          explanation:
            "La plante absorbe notamment de l'eau contenant des sels minéraux par ses racines.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "L'eau", is_correct: true, order: 1 },
            { label: "Le plastique", is_correct: false, order: 2 },
            { label: "Le verre", is_correct: false, order: 3 },
            { label: "Le métal", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "Les sels minéraux et la nutrition des plantes",
      exerciseTitle: "Identifier les besoins minéraux",
      instructions:
        "Explique pourquoi les sels minéraux sont nécessaires aux plantes.",
      difficulty: "medium",
      difficultyScore: 35,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Par quelle partie de la plante l'eau et les sels minéraux sont-ils principalement absorbés ?",
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
      title: "La lumière et le dioxyde de carbone dans la nutrition des plantes vertes",
      exerciseTitle: "Les conditions de la nutrition des plantes vertes",
      instructions:
        "Identifie les éléments nécessaires à la nutrition des plantes vertes.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quels éléments sont nécessaires à la nutrition chlorophyllienne d'une plante verte ?",
          explanation:
            "La plante verte utilise notamment l'eau, le dioxyde de carbone et la lumière pour produire sa matière organique.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "L'eau", is_correct: true, order: 1 },
            { label: "Le dioxyde de carbone", is_correct: true, order: 2 },
            { label: "La lumière", is_correct: true, order: 3 },
            { label: "Le plastique", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "La nutrition des animaux et régimes alimentaires": [
    {
      title: "Les besoins alimentaires des animaux",
      exerciseTitle: "Identifier les besoins alimentaires",
      instructions:
        "Reconnais les aliments nécessaires à différents animaux.",
      difficulty: "easy",
      difficultyScore: 25,
      questions: [
        {
          type: "single_choice",
          prompt: "Pourquoi les animaux se nourrissent-ils ?",
          explanation:
            "Les aliments apportent notamment de la matière et de l'énergie nécessaires au fonctionnement de l'organisme.",
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
      title: "Les différents régimes alimentaires",
      exerciseTitle: "Reconnaître les régimes alimentaires",
      instructions:
        "Classe les animaux selon leur régime alimentaire.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "single_choice",
          prompt: "Quel animal est généralement herbivore ?",
          explanation:
            "La vache se nourrit principalement de végétaux.",
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
          prompt: "Quel régime correspond à un animal qui mange des végétaux et des animaux ?",
          explanation:
            "Un omnivore peut consommer des aliments d'origine végétale et animale.",
          points: 10,
          difficultyScore: 35,
          options: [
            { label: "Herbivore", is_correct: false, order: 1 },
            { label: "Carnivore", is_correct: false, order: 2 },
            { label: "Omnivore", is_correct: true, order: 3 },
            { label: "Minéral", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La denture et le régime alimentaire",
      exerciseTitle: "Relier denture et alimentation",
      instructions:
        "Observe les caractéristiques de la denture pour relier un animal à son régime.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Chez un animal herbivore comme la vache, les dents sont adaptées principalement à :",
          explanation:
            "Les dents des herbivores sont adaptées à la préhension et au broyage des végétaux.",
          points: 10,
          difficultyScore: 45,
          options: [
            { label: "La mastication des végétaux", is_correct: true, order: 1 },
            { label: "La chasse uniquement", is_correct: false, order: 2 },
            { label: "La respiration", is_correct: false, order: 3 },
            { label: "La vision", is_correct: false, order: 4 },
          ],
        },
      ],
    },
  ],

  "La respiration dans différents milieux de vie": [
    {
      title: "La respiration chez les êtres vivants",
      exerciseTitle: "Comprendre la respiration",
      instructions:
        "Identifie les échanges gazeux réalisés par les êtres vivants.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Lors de la respiration, les êtres vivants réalisent des échanges avec leur milieu.",
          explanation:
            "La respiration implique notamment des échanges de dioxygène et de dioxyde de carbone avec le milieu.",
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
      exerciseTitle: "La respiration en milieu aérien",
      instructions:
        "Compare les différents modes de respiration dans l'air.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel organe permet principalement aux humains d'effectuer les échanges gazeux respiratoires ?",
          explanation:
            "Chez l'être humain, les échanges gazeux se produisent principalement au niveau des poumons.",
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
        "Découvre comment certains animaux réalisent leurs échanges gazeux dans l'eau.",
      difficulty: "medium",
      difficultyScore: 45,
      questions: [
        {
          type: "single_choice",
          prompt:
            "Quel organe permet généralement aux poissons de réaliser leurs échanges gazeux dans l'eau ?",
          explanation:
            "Les branchies permettent aux poissons de prélever le dioxygène dissous dans l'eau.",
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

  "L'Homme et la qualité de l'air respiré": [
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
            "Les poumons sont les principaux organes où ont lieu les échanges gazeux.",
          points: 10,
          difficultyScore: 25,
          options: [
            { label: "Les poumons", is_correct: true, order: 1 },
            { label: "Le foie", is_correct: false, order: 2 },
            { label: "L'estomac", is_correct: false, order: 3 },
            { label: "Le cœur uniquement", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "La qualité de l'air et la respiration",
      exerciseTitle: "Pollution et respiration",
      instructions:
        "Analyse l'effet de la pollution de l'air sur la respiration.",
      difficulty: "medium",
      difficultyScore: 40,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quels éléments peuvent dégrader la qualité de l'air ?",
          explanation:
            "Les fumées, certaines poussières et certains gaz polluants peuvent dégrader la qualité de l'air.",
          points: 10,
          difficultyScore: 40,
          options: [
            { label: "Les fumées", is_correct: true, order: 1 },
            { label: "Certaines poussières", is_correct: true, order: 2 },
            { label: "Certains gaz polluants", is_correct: true, order: 3 },
            { label: "L'air propre", is_correct: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: "Protéger son appareil respiratoire",
      exerciseTitle: "Adopter de bonnes habitudes respiratoires",
      instructions:
        "Identifie les comportements qui contribuent à protéger l'appareil respiratoire.",
      difficulty: "easy",
      difficultyScore: 30,
      questions: [
        {
          type: "multiple_choice",
          prompt:
            "Quelles actions contribuent à protéger l'appareil respiratoire ?",
          explanation:
            "Éviter la fumée, aérer les locaux et limiter l'exposition aux polluants contribuent à préserver la santé respiratoire.",
          points: 10,
          difficultyScore: 30,
          options: [
            { label: "Aérer régulièrement les pièces", is_correct: true, order: 1 },
            { label: "Éviter la fumée de cigarette", is_correct: true, order: 2 },
            { label: "Respirer volontairement des fumées", is_correct: false, order: 3 },
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
    .eq("id", CURRICULUM_ID)
    .eq("is_demo", false)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      `Programme SVT 6e introuvable avec l'identifiant ${CURRICULUM_ID}.`
    );
  }

  return data;
}

async function main() {
  console.log("==============================================");
  console.log("   IMPORT EXERCICES SVT 6e — EDTECH SÉNÉGAL");
  console.log("==============================================");
  console.log("");

  const curriculum = await getCurriculum();

  console.log("📚 Programme trouvé");
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
    throw new Error("Aucun chapitre trouvé.");
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
      console.warn(`⚠️ Aucun contenu prévu pour : ${chapter.title}`);
      continue;
    }

    console.log("");
    console.log(`📖 ${chapter.order}. ${chapter.title}`);

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
        console.warn(`   ⚠️ Leçon introuvable : ${lesson.title}`);
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
        console.log(`   ↪️ ${lesson.title} — exercice déjà présent`);
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

        console.log(`   ✅ ${lesson.title} — exercice créé`);
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
  console.log("              IMPORT TERMINÉ");
  console.log("==============================================");
  console.log("");
  console.log(`📝 Exercices prévus : ${totalExercises}`);
  console.log(`✅ Exercices créés : ${insertedExercises}`);
  console.log(`↪️ Exercices déjà présents : ${existingExercises}`);
  console.log("");
  console.log(`❓ Questions prévues : ${totalQuestions}`);
  console.log(`✅ Questions créées : ${insertedQuestions}`);
  console.log(`↪️ Questions déjà présentes : ${existingQuestions}`);
  console.log("");
  console.log("🔒 Les exercices et questions sont en statut draft.");
  console.log("➡️ Tu pourras ensuite les valider depuis l'administration.");
}

main().catch((error) => {
  console.error("");
  console.error("ERREUR LORS DE L'IMPORT SVT 6e :");
  console.error(error);
  process.exit(1);
});
