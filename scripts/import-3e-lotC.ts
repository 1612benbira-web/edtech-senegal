import dotenv from "dotenv";
import { createClient, type PostgrestError } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY requis.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const STATUS = process.env.EDTECH_PUBLISH_ENRICHMENT === "true" ? "published" : "review";
const SOURCE_URL = "https://apprendre.education.sn/C_ressource/recherche/34";

type RawQuestion = { kind: "mc" | "tf"; prompt: string; answer: string | boolean; wrongs?: string[]; explanation: string };
type LessonSpec = { title: string; domain: string; competency: string; summary: string; content: string; answer: string; wrongs: string[] };
type RawLesson = { title: string; objectives: string[]; summary: string; content: string; questions: RawQuestion[] };
type RawChapter = { title: string; domain: string; competency: string; lessons: RawLesson[] };
type RawProgram = { subject: string; source: string; version: string; chapters: RawChapter[] };
type QuestionRow = ReturnType<typeof toQuestion>;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const unique = <T,>(a: T[]) => [...new Set(a)];

function buildQuestions(s: LessonSpec): RawQuestion[] {
  if (s.wrongs.length < 3) throw new Error(`[${s.title}] 3 mauvaises réponses requises.`);
  if (s.wrongs.map(norm).includes(norm(s.answer))) throw new Error(`[${s.title}] answer présente dans wrongs.`);
  const [a, b, c] = s.wrongs as [string, string, string];
  return [
    { kind: "mc", prompt: `Dans « ${s.title} », quelle proposition est correcte ?`, answer: s.answer, wrongs: [a, b, c], explanation: `La bonne réponse est : ${s.answer}` },
    { kind: "tf", prompt: `L'affirmation « ${s.answer} » est correcte pour « ${s.title} ».`, answer: true, explanation: `Vrai : l'affirmation correspond au repère étudié.` },
    { kind: "mc", prompt: `Quel énoncé décrit le mieux « ${s.title} » ?`, answer: s.answer, wrongs: [b, c, a], explanation: `Cette formulation reprend l'idée centrale de la leçon.` },
    { kind: "mc", prompt: `Quelle idée essentielle faut-il retenir de « ${s.title} » ?`, answer: s.answer, wrongs: [c, a, b], explanation: `Il faut retenir que ${s.answer}` },
    { kind: "mc", prompt: `Quelle réponse applique correctement les repères de « ${s.title} » ?`, answer: s.answer, wrongs: [a, c, b], explanation: `L'application correcte repose sur les repères étudiés.` },
    { kind: "tf", prompt: `Pour réussir un exercice sur « ${s.title} », il faut mobiliser des repères précis.`, answer: true, explanation: `Vrai. Une réponse rigoureuse s'appuie sur des repères historiques ou géographiques précis.` },
    { kind: "mc", prompt: `Quel choix permet d'éviter une erreur fréquente sur « ${s.title} » ?`, answer: s.answer, wrongs: [b, a, c], explanation: `Le choix correct respecte les repères et faits étudiés dans la leçon.` },
    { kind: "tf", prompt: `« ${a} » est une description correcte de « ${s.title} ».`, answer: false, explanation: `Faux. Cette proposition ne correspond pas au repère étudié.` },
    { kind: "mc", prompt: `Quel raisonnement est le plus rigoureux pour « ${s.title} » ?`, answer: s.answer, wrongs: [c, b, a], explanation: `Le raisonnement correct s'appuie sur les repères essentiels de la leçon.` },
    { kind: "mc", prompt: `Quelle formulation correspond à l'objectif principal de « ${s.title} » ?`, answer: s.answer, wrongs: [a, b, c], explanation: `Cette formulation correspond au contenu et à l'objectif de la leçon.` },
    { kind: "tf", prompt: `Une justification à partir des repères étudiés améliore une réponse sur « ${s.title} ».`, answer: true, explanation: `Vrai. La justification permet de vérifier le raisonnement.` },
    { kind: "mc", prompt: `Quelle réponse résume le mieux « ${s.title} » ?`, answer: s.answer, wrongs: [b, c, a], explanation: `C'est la formulation qui résume le mieux l'idée essentielle.` },
  ];
}

function lesson(s: LessonSpec): RawLesson {
  return { title: s.title, objectives: [`Comprendre ${s.title.toLowerCase()}.`, `Identifier les repères essentiels de ${s.title.toLowerCase()}.`, `Mobiliser ces connaissances dans une situation d'étude.`, `Justifier et vérifier une réponse.`], summary: s.summary, content: s.content, questions: buildQuestions(s) };
}

const H = (title: string, domain: string, summary: string, content: string, answer: string, wrongs: string[]): RawLesson => lesson({ title, domain, competency: "Histoire", summary, content, answer, wrongs });
const G = (title: string, domain: string, summary: string, content: string, answer: string, wrongs: string[]): RawLesson => lesson({ title, domain, competency: "Géographie", summary, content, answer, wrongs });

const programs: RawProgram[] = [
  {
    subject: "Histoire", source: SOURCE_URL, version: "3e-histoire-lotC-v1",
    chapters: [
      { title: "La Première Guerre mondiale", domain: "Conflits mondiaux", competency: "Histoire", lessons: [
        H("Causes et déclenchement de la Première Guerre mondiale", "Conflits mondiaux", "La Première Guerre mondiale résulte de rivalités entre puissances européennes, d'alliances militaires et d'un assassinat déclencheur en 1914.", "Les tensions entre grandes puissances européennes, la course aux armements et un système d'alliances opposant la Triple-Entente à la Triple-Alliance créent un contexte explosif. L'assassinat de l'archiduc François-Ferdinand en juin 1914 déclenche l'engrenage des alliances et l'entrée en guerre généralisée.", "des rivalités, des alliances militaires et un assassinat en 1914 déclenchent la Première Guerre mondiale.", ["la guerre commence uniquement à cause d'un désaccord commercial mineur", "aucune alliance militaire n'existait en europe avant 1914", "la guerre n'a concerné qu'un seul pays européen"]),
        H("Le rôle des tirailleurs sénégalais", "Afrique et Première Guerre mondiale", "Des soldats africains, dont des tirailleurs sénégalais, ont été mobilisés dans l'armée française durant la Première Guerre mondiale.", "Les tirailleurs sénégalais, recrutés dans l'Afrique occidentale française, ont combattu sur plusieurs fronts européens. Leur participation soulève des questions sur les conditions de recrutement, d'engagement et de reconnaissance après-guerre.", "des tirailleurs sénégalais ont été mobilisés et ont combattu sur les fronts européens durant la Première Guerre mondiale.", ["les tirailleurs sénégalais n'ont jamais quitté l'afrique durant ce conflit", "seuls des soldats européens ont combattu pendant la première guerre mondiale", "les tirailleurs sénégalais n'ont eu aucun rôle militaire pendant cette période"]),
      ] },
      { title: "La Seconde Guerre mondiale", domain: "Conflits mondiaux", competency: "Histoire", lessons: [
        H("Origines et déroulement de la Seconde Guerre mondiale", "Conflits mondiaux", "La Seconde Guerre mondiale débute en 1939 et oppose les puissances de l'Axe aux Alliés dans un conflit mondial d'une ampleur inédite.", "Les tensions issues de l'entre-deux-guerres, la montée des régimes totalitaires et l'invasion de la Pologne en 1939 déclenchent le conflit. La guerre se déroule sur plusieurs continents et se caractérise par une violence et des pertes humaines considérables jusqu'en 1945.", "la Seconde Guerre mondiale, déclenchée en 1939, oppose l'Axe aux Alliés sur plusieurs continents jusqu'en 1945.", ["la seconde guerre mondiale s'est déroulée uniquement en europe", "le conflit a commencé et s'est achevé la même année", "aucun régime totalitaire n'a joué de rôle dans le déclenchement du conflit"]),
        H("L'Afrique et le Sénégal dans la Seconde Guerre mondiale", "Afrique et Seconde Guerre mondiale", "L'Afrique, dont le Sénégal, a été mobilisée militairement et économiquement durant la Seconde Guerre mondiale.", "Le Sénégal, colonie française, a fourni des soldats et des ressources à l'effort de guerre. Dakar a également constitué un point stratégique important pour les puissances alliées durant le conflit.", "le Sénégal a été mobilisé militairement et économiquement, et Dakar a joué un rôle stratégique durant la Seconde Guerre mondiale.", ["le sénégal n'a eu aucun rôle pendant la seconde guerre mondiale", "dakar n'avait aucune importance stratégique durant ce conflit", "seule l'europe a participé à l'effort de guerre pendant cette période"]),
      ] },
      { title: "La décolonisation", domain: "Décolonisation", competency: "Histoire", lessons: [
        H("Les mouvements de décolonisation en Afrique", "Décolonisation", "Après 1945, des mouvements nationalistes réclament progressivement l'indépendance des territoires colonisés en Afrique.", "L'affaiblissement des puissances coloniales après la Seconde Guerre mondiale, la diffusion des idées nationalistes et la pression de l'opinion internationale favorisent l'émergence de mouvements réclamant l'indépendance dans de nombreux territoires africains à partir des années 1950.", "après 1945, des mouvements nationalistes réclament l'indépendance de nombreux territoires africains colonisés.", ["la décolonisation africaine a eu lieu uniquement avant 1900", "aucun mouvement nationaliste n'a existé en afrique au xxe siècle", "les puissances coloniales se sont renforcées après 1945"]),
        H("L'indépendance du Sénégal", "Décolonisation", "Le Sénégal accède à l'indépendance en 1960, à l'issue d'un processus politique impliquant notamment Léopold Sédar Senghor.", "Après une période de négociations et de transformations institutionnelles au sein de l'Union française puis de la Communauté, le Sénégal proclame son indépendance en 1960. Léopold Sédar Senghor devient le premier président de la République du Sénégal.", "le Sénégal accède à l'indépendance en 1960, avec Léopold Sédar Senghor comme premier président.", ["le sénégal est devenu indépendant au xixe siècle", "le sénégal n'a jamais eu de président après son indépendance", "l'indépendance du sénégal n'a impliqué aucune négociation politique"]),
      ] },
      { title: "Le monde contemporain", domain: "Monde contemporain", competency: "Histoire", lessons: [
        H("La guerre froide et ses effets en Afrique", "Monde contemporain", "La guerre froide oppose les États-Unis et l'URSS et influence aussi les trajectoires politiques de certains États africains nouvellement indépendants.", "Après 1945, le monde se structure autour de deux blocs rivaux. Cette rivalité influence certains choix politiques et alliances des jeunes États africains, y compris à travers des soutiens économiques ou militaires apportés par l'un ou l'autre bloc.", "la guerre froide oppose deux blocs rivaux et influence certains choix politiques des États africains nouvellement indépendants.", ["la guerre froide n'a concerné que l'amérique du sud", "aucun état africain n'a été influencé par la guerre froide", "la guerre froide a opposé uniquement des pays européens entre eux"]),
      ] },
    ]
  },
  {
    subject: "Géographie", source: SOURCE_URL, version: "3e-geographie-lotC-v1",
    chapters: [
      { title: "La population mondiale", domain: "Population et société", competency: "Géographie", lessons: [
        G("Répartition et dynamique de la population mondiale", "Population et société", "La population mondiale est inégalement répartie et connaît une croissance différenciée selon les régions du globe.", "Certaines régions du monde, comme certains littoraux ou grandes vallées fluviales, concentrent de fortes densités de population, tandis que d'autres espaces, comme les déserts, restent faiblement peuplés. La croissance démographique varie fortement d'un continent à l'autre.", "la population mondiale est inégalement répartie et croît à des rythmes différents selon les régions.", ["la population mondiale est répartie de façon parfaitement homogène sur tous les continents", "la croissance démographique est strictement identique partout dans le monde", "les déserts sont les régions les plus densément peuplées du globe"]),
        G("Les migrations internationales", "Population et société", "Les migrations internationales déplacent des populations pour des raisons économiques, politiques ou environnementales.", "Les migrations peuvent être motivées par la recherche d'emploi, la fuite de conflits ou de catastrophes environnementales. Elles créent des liens économiques et culturels entre pays d'origine et pays d'accueil, tout en posant des enjeux d'intégration.", "les migrations internationales sont motivées par des raisons économiques, politiques ou environnementales et créent des liens entre pays.", ["les migrations internationales n'ont jamais de cause économique", "les migrations n'affectent en rien les pays d'accueil", "aucune migration n'est liée à des conflits ou catastrophes"]),
      ] },
      { title: "Les activités économiques mondiales", domain: "Activités économiques", competency: "Géographie", lessons: [
        G("L'agriculture et la mondialisation", "Activités économiques", "L'agriculture mondiale s'inscrit désormais dans des circuits commerciaux mondialisés qui relient producteurs et consommateurs à grande distance.", "Certains produits agricoles, comme les céréales ou les produits tropicaux, sont échangés à l'échelle mondiale. Cette mondialisation agricole crée des interdépendances entre régions productrices et marchés consommateurs, avec des effets variables sur les producteurs locaux.", "l'agriculture mondiale s'inscrit dans des circuits commerciaux mondialisés reliant producteurs et consommateurs.", ["l'agriculture mondiale reste totalement isolée de tout échange international", "aucun produit agricole n'est échangé à l'échelle mondiale", "la mondialisation agricole n'a aucun effet sur les producteurs locaux"]),
        G("L'industrie et les services dans le monde", "Activités économiques", "La répartition mondiale de l'industrie et des services reflète des choix de localisation liés aux coûts, aux infrastructures et aux marchés.", "Certaines régions du monde concentrent des activités industrielles en raison de coûts de production avantageux ou d'infrastructures développées, tandis que les services, notamment financiers ou numériques, se concentrent souvent dans de grandes métropoles mondiales.", "la localisation de l'industrie et des services dépend des coûts, des infrastructures et de la proximité des marchés.", ["l'industrie mondiale est répartie de façon parfaitement uniforme sur tous les continents", "les services ne se concentrent jamais dans les grandes métropoles", "les coûts de production n'ont aucune influence sur la localisation industrielle"]),
      ] },
      { title: "La mondialisation", domain: "Mondialisation", competency: "Géographie", lessons: [
        G("Acteurs et flux de la mondialisation", "Mondialisation", "La mondialisation repose sur des acteurs variés (États, entreprises, organisations internationales) et sur des flux de marchandises, de capitaux et d'informations.", "Les entreprises multinationales, les États et les organisations internationales participent à l'intensification des échanges mondiaux. Les flux de marchandises, de capitaux, de personnes et d'informations circulent à un rythme et une échelle sans précédent.", "la mondialisation repose sur des acteurs variés et sur des flux intenses de marchandises, de capitaux et d'informations.", ["la mondialisation ne concerne que les échanges de marchandises, jamais les capitaux ou l'information", "aucun état ne participe aux flux de la mondialisation", "les entreprises multinationales n'ont aucun rôle dans la mondialisation"]),
        G("Inégalités de développement", "Mondialisation", "La mondialisation s'accompagne d'inégalités de développement importantes entre et au sein des territoires.", "Certains territoires bénéficient davantage des effets de la mondialisation, notamment à travers les investissements et les infrastructures, tandis que d'autres restent marginalisés. Ces écarts se mesurent par des indicateurs comme le niveau de vie ou l'accès aux services essentiels.", "la mondialisation s'accompagne d'inégalités de développement mesurables entre et au sein des territoires.", ["la mondialisation profite de façon strictement identique à tous les territoires", "aucun indicateur ne permet de mesurer les inégalités de développement", "les inégalités de développement ont totalement disparu avec la mondialisation"]),
      ] },
      { title: "L'intégration régionale", domain: "Intégration régionale", competency: "Géographie", lessons: [
        G("La CEDEAO et l'intégration ouest-africaine", "Intégration régionale", "La CEDEAO regroupe des États d'Afrique de l'Ouest afin de favoriser l'intégration économique et la libre circulation régionale.", "La Communauté économique des États de l'Afrique de l'Ouest vise à faciliter les échanges commerciaux, la circulation des personnes et la coopération entre ses États membres, dont le Sénégal, afin de renforcer le développement économique régional.", "la CEDEAO regroupe des États d'Afrique de l'Ouest pour favoriser l'intégration économique et la libre circulation.", ["la cedeao ne regroupe aucun état d'afrique de l'ouest", "la cedeao interdit tout échange commercial entre ses membres", "le sénégal n'est pas membre de la cedeao"]),
      ] },
    ]
  }
];

function toQuestion(q: RawQuestion, index: number) {
  if (q.kind === "tf") {
    const answer = Boolean(q.answer);
    return { type: "true_false" as const, prompt: q.prompt, explanation: q.explanation, points: 10, difficulty_score: index < 4 ? 30 : index < 8 ? 55 : 75,
      options: [{ label: "Vrai", is_correct: answer, order: 1 }, { label: "Faux", is_correct: !answer, order: 2 }] };
  }
  const wrongs = q.wrongs ?? [];
  const labels = unique([String(q.answer), ...wrongs]);
  if (wrongs.length !== 3 || labels.length !== 4) throw new Error(`Question MC invalide: ${q.prompt}`);
  return { type: "single_choice" as const, prompt: q.prompt, explanation: q.explanation, points: 10, difficulty_score: index < 4 ? 30 : index < 8 ? 55 : 75,
    options: labels.map((label, i) => ({ label, is_correct: i === 0, order: i + 1 })) };
}

async function checked(r: { data: any; error: PostgrestError | null }, op: string): Promise<any> {
  if (r.error) throw new Error(`${op}: ${r.error.message}`);
  if (r.data === null) throw new Error(`${op}: aucune donnée.`);
  return r.data;
}

async function getCycle() {
  const q = await supabase.from("school_cycles").select("*").eq("code", "moyen").maybeSingle();
  if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("school_cycles").insert({ code: "moyen", name: "Moyen", order: 2 }).select().single(), "Création cycle");
}
async function getLevel(cycleId: string) {
  const q = await supabase.from("school_levels").select("*").eq("cycle_id", cycleId).eq("code", "3e").maybeSingle();
  if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("school_levels").insert({ cycle_id: cycleId, code: "3e", name: "3e", order: 4 }).select().single(), "Création niveau 3e");
}
async function getSubject(name: string) {
  const aliases: Record<string, string[]> = { "Histoire": ["histoire", "his"], "Géographie": ["geographie", "géographie", "geo"] };
  const codes = aliases[name] ?? [name.toLowerCase()];
  const q = await supabase.from("subjects").select("*").in("code", codes).limit(1).maybeSingle();
  if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("subjects").insert({ code: codes[0], name, icon: name === "Histoire" ? "Landmark" : "Globe" }).select().single(), `Création matière ${name}`);
}
async function ensureLevelSubject(levelId: string, subjectId: string) {
  const q = await supabase.from("level_subjects").select("id").eq("level_id", levelId).eq("subject_id", subjectId).is("series_id", null).maybeSingle();
  if (q.error) throw q.error; if (q.data) return;
  const r = await supabase.from("level_subjects").insert({ level_id: levelId, subject_id: subjectId, series_id: null, is_optional: false }); if (r.error) throw r.error;
}
async function getCurriculum(levelId: string, subjectId: string, p: RawProgram) {
  const title = `${p.subject} 3e – Programme sénégalais`;
  const q = await supabase.from("curriculums").select("*").eq("level_id", levelId).eq("subject_id", subjectId).eq("title", title).eq("version", p.version).maybeSingle();
  if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("curriculums").insert({ level_id: levelId, series_id: null, subject_id: subjectId, title, description: `Lot C 3e ${p.subject}. Contenu original EdTech Sénégal.`, version: p.version, status: STATUS, source: "Ressources pédagogiques sénégalaises; rédaction originale EdTech Sénégal.", source_url: p.source, source_document: "Cadrage pédagogique; ne pas présenter comme reproduction intégrale du référentiel officiel.", is_demo: false, validated: false, published_at: STATUS === "published" ? new Date().toISOString() : null }).select().single(), `Création curriculum ${p.subject}`);
}
async function getDomain(curriculumId: string, name: string, order: number) {
  const q = await supabase.from("domains").select("*").eq("curriculum_id", curriculumId).eq("name", name).maybeSingle(); if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("domains").insert({ curriculum_id: curriculumId, name, order }).select().single(), `Création domaine ${name}`);
}
async function getCompetency(domainId: string, name: string) {
  const q = await supabase.from("competencies").select("*").eq("domain_id", domainId).eq("name", name).maybeSingle(); if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("competencies").insert({ domain_id: domainId, name, description: name, order: 1 }).select().single(), `Création compétence ${name}`);
}
async function getChapter(curriculumId: string, domainId: string, c: RawChapter, order: number) {
  const q = await supabase.from("chapters").select("*").eq("curriculum_id", curriculumId).eq("title", c.title).is("deleted_at", null).maybeSingle(); if (q.error) throw q.error;
  if (q.data) { const u = await supabase.from("chapters").update({ domain_id: domainId, order, status: STATUS }).eq("id", q.data.id); if (u.error) throw u.error; return { data: q.data, created: false }; }
  return { data: await checked(await supabase.from("chapters").insert({ curriculum_id: curriculumId, domain_id: domainId, title: c.title, order, status: STATUS, source: "Ressources sénégalaises; structuration originale EdTech Sénégal.", source_url: SOURCE_URL }).select().single(), `Création chapitre ${c.title}`), created: true };
}
async function getLesson(chapterId: string, competencyId: string, l: RawLesson, order: number, sourceUrl: string) {
  const payload = { chapter_id: chapterId, competency_id: competencyId, title: l.title, content_md: l.content, objectives: l.objectives, summary: l.summary, order, status: STATUS, source: "Contenu original EdTech Sénégal.", source_url: sourceUrl };
  const q = await supabase.from("lessons").select("*").eq("chapter_id", chapterId).eq("title", l.title).is("deleted_at", null).maybeSingle(); if (q.error) throw q.error;
  if (q.data) return { data: await checked(await supabase.from("lessons").update(payload).eq("id", q.data.id).select().single(), `Mise à jour leçon ${l.title}`), created: false };
  return { data: await checked(await supabase.from("lessons").insert(payload).select().single(), `Création leçon ${l.title}`), created: true };
}
async function getExercise(lessonId: string, competencyId: string, title: string, instructions: string, difficulty: "easy" | "medium" | "hard", score: number) {
  const payload = { lesson_id: lessonId, competency_id: competencyId, title, instructions, difficulty, difficulty_score: score, status: STATUS };
  const q = await supabase.from("exercises").select("*").eq("lesson_id", lessonId).eq("title", title).is("deleted_at", null).maybeSingle(); if (q.error) throw q.error;
  if (q.data) return { data: await checked(await supabase.from("exercises").update(payload).eq("id", q.data.id).select().single(), `Mise à jour exercice ${title}`), created: false };
  return { data: await checked(await supabase.from("exercises").insert(payload).select().single(), `Création exercice ${title}`), created: true };
}
async function syncOptions(questionId: string, options: QuestionRow["options"]) {
  const q = await supabase.from("question_options").select("id,label,is_correct,order").eq("question_id", questionId); if (q.error) throw q.error;
  const sig = (x: any[]) => x.map(o => `${o.order}|${o.label}|${o.is_correct}`).sort().join("||");
  if (sig(q.data ?? []) === sig(options)) return false;
  if ((q.data ?? []).length) { const d = await supabase.from("question_options").delete().eq("question_id", questionId); if (d.error) throw d.error; }
  const i = await supabase.from("question_options").insert(options.map(o => ({ ...o, question_id: questionId }))); if (i.error) throw i.error; return true;
}
async function addQuestion(exerciseId: string, competencyId: string, chapterId: string, q: QuestionRow) {
  const payload = { exercise_id: exerciseId, competency_id: competencyId, chapter_id: chapterId, type: q.type, prompt: q.prompt, explanation: q.explanation, points: q.points, difficulty_score: q.difficulty_score, status: STATUS };
  const f = await supabase.from("questions").select("id").eq("exercise_id", exerciseId).eq("prompt", q.prompt).is("deleted_at", null).maybeSingle(); if (f.error) throw f.error;
  let id: string, created = false;
  if (f.data) { id = f.data.id; const u = await supabase.from("questions").update(payload).eq("id", id); if (u.error) throw u.error; }
  else { id = await checked(await supabase.from("questions").insert(payload).select("id").single(), "Création question").then(x => x.id); created = true; }
  const optionsChanged = await syncOptions(id, q.options); return { created, optionsChanged };
}

function auditLocal() {
  for (const p of programs) { let lessons = 0; let questions = 0; for (const c of p.chapters) for (const l of c.lessons) { lessons++; questions += l.questions.length; if (l.questions.length !== 12) throw new Error(`[AUDIT] ${p.subject}/${l.title}: ${l.questions.length}/12`); } if (!lessons || questions !== lessons * 12) throw new Error(`[AUDIT] ${p.subject}: incohérence leçons/questions`); console.log(`  ✅ ${p.subject}: ${p.chapters.length} chapitres, ${lessons} leçons, ${questions} questions`); }
}

async function runProgram(levelId: string, p: RawProgram) {
  const subject = await getSubject(p.subject); await ensureLevelSubject(levelId, subject.id); const curriculum = await getCurriculum(levelId, subject.id, p);
  const stats = { chapters: 0, lessons: 0, exercises: 0, questions: 0, updatedQuestions: 0 };
  for (let ci = 0; ci < p.chapters.length; ci++) {
    const c = p.chapters[ci]; if (!c) throw new Error(`[${p.subject}] chapitre ${ci + 1} absent`);
    const d = await getDomain(curriculum.id, c.domain, ci + 1); const comp = await getCompetency(d.id, c.competency); const ch = await getChapter(curriculum.id, d.id, c, ci + 1); if (ch.created) stats.chapters++;
    for (let li = 0; li < c.lessons.length; li++) {
      const l = c.lessons[li]; if (!l) throw new Error(`[${p.subject}] leçon ${ci + 1}.${li + 1} absente`); if (l.questions.length !== 12) throw new Error(`[${p.subject}] ${l.title}: 12 questions attendues`);
      const le = await getLesson(ch.data.id, comp.id, l, li + 1, p.source); if (le.created) stats.lessons++;
      const groups = [{ title: `${l.title} — notions essentielles`, difficulty: "easy" as const, score: 30, start: 0, end: 4, instructions: "Maîtrise les repères essentiels." }, { title: `${l.title} — application`, difficulty: "medium" as const, score: 55, start: 4, end: 8, instructions: "Applique le repère à une situation nouvelle." }, { title: `${l.title} — raisonnement`, difficulty: "hard" as const, score: 75, start: 8, end: 12, instructions: "Analyse, justifie et vérifie ton raisonnement." }];
      for (const g of groups) { const ex = await getExercise(le.data.id, comp.id, g.title, g.instructions, g.difficulty, g.score); if (ex.created) stats.exercises++; for (let qi = g.start; qi < g.end; qi++) { const rawQuestion = l.questions[qi]; if (!rawQuestion) throw new Error(`[${p.subject}] ${l.title}: question ${qi + 1} absente`); const r = await addQuestion(ex.data.id, comp.id, ch.data.id, toQuestion(rawQuestion, qi)); if (r.created) stats.questions++; else if (r.optionsChanged) stats.updatedQuestions++; } }
    }
  }
  return stats;
}

async function main() {
  console.log("=============================================="); console.log(" IMPORT LOT C — 3e — HISTOIRE + GÉOGRAPHIE"); console.log("=============================================="); console.log(`Statut : ${STATUS}`);
  auditLocal();
  const cycle = await getCycle(); const level = await getLevel(cycle.id); if (level.code !== "3e") throw new Error(`Niveau inattendu: ${level.code}`); console.log(`Niveau : ${level.name}`);
  const totals = { chapters: 0, lessons: 0, exercises: 0, questions: 0, updatedQuestions: 0 };
  for (const p of programs) { const s = await runProgram(level.id, p); for (const k of Object.keys(totals) as (keyof typeof totals)[]) totals[k] += s[k]; console.log(`\n=== ${p.subject.toUpperCase()} 3e ===`); console.log(s); }
  console.log("\n=============================================="); console.log("IMPORT LOT C 3e TERMINÉ"); console.log("=============================================="); console.log(totals); console.log(STATUS === "review" ? "Contenu en review par défaut." : "Contenu publié car EDTECH_PUBLISH_ENRICHMENT=true.");
}
main().catch(e => { console.error("❌ Import Lot C 3e échoué"); console.error(e); process.exit(1); });
