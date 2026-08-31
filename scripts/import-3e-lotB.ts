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
// Pas de référentiel officiel unique et stable identifié pour le Français/Anglais 3e sénégalais
// au moment de la rédaction : contenu ORIGINAL EdTech Sénégal, jamais présenté comme reproduction
// d'un programme officiel (cf. source_document ci-dessous, conforme à la convention import-3e-lotA.ts).
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
    { kind: "tf", prompt: `L'affirmation « ${s.answer} » est correcte pour « ${s.title} ».`, answer: true, explanation: `Vrai : l'affirmation correspond à la notion étudiée.` },
    { kind: "mc", prompt: `Quel énoncé décrit le mieux « ${s.title} » ?`, answer: s.answer, wrongs: [b, c, a], explanation: `Cette formulation reprend l'idée centrale de la leçon.` },
    { kind: "mc", prompt: `Quelle idée essentielle faut-il retenir de « ${s.title} » ?`, answer: s.answer, wrongs: [c, a, b], explanation: `Il faut retenir que ${s.answer}` },
    { kind: "mc", prompt: `Quelle réponse applique correctement « ${s.title} » ?`, answer: s.answer, wrongs: [a, c, b], explanation: `L'application correcte repose sur la notion étudiée.` },
    { kind: "tf", prompt: `Pour réussir un exercice sur « ${s.title} », il faut mobiliser les notions étudiées.`, answer: true, explanation: `Vrai. Une réponse rigoureuse s'appuie sur les notions pertinentes.` },
    { kind: "mc", prompt: `Quel choix permet d'éviter une erreur fréquente sur « ${s.title} » ?`, answer: s.answer, wrongs: [b, a, c], explanation: `Le choix correct respecte la règle étudiée dans la leçon.` },
    { kind: "tf", prompt: `« ${a} » est une description correcte de « ${s.title} ».`, answer: false, explanation: `Faux. Cette proposition ne correspond pas à la notion étudiée.` },
    { kind: "mc", prompt: `Quel raisonnement est le plus rigoureux pour « ${s.title} » ?`, answer: s.answer, wrongs: [c, b, a], explanation: `Le raisonnement correct s'appuie sur la règle et les exemples étudiés.` },
    { kind: "mc", prompt: `Quelle formulation correspond à l'objectif principal de « ${s.title} » ?`, answer: s.answer, wrongs: [a, b, c], explanation: `Cette formulation correspond au contenu et à l'objectif de la leçon.` },
    { kind: "tf", prompt: `Une justification à partir des exemples étudiés améliore une réponse sur « ${s.title} ».`, answer: true, explanation: `Vrai. La justification permet de vérifier le raisonnement.` },
    { kind: "mc", prompt: `Quelle réponse résume le mieux « ${s.title} » ?`, answer: s.answer, wrongs: [b, c, a], explanation: `C'est la formulation qui résume le mieux l'idée essentielle.` },
  ];
}

function lesson(s: LessonSpec): RawLesson {
  return { title: s.title, objectives: [`Comprendre ${s.title.toLowerCase()}.`, `Identifier les règles essentielles de ${s.title.toLowerCase()}.`, `Mobiliser ces connaissances dans une situation d'étude.`, `Justifier et vérifier une réponse.`], summary: s.summary, content: s.content, questions: buildQuestions(s) };
}

const F = (title: string, domain: string, summary: string, content: string, answer: string, wrongs: string[]): RawLesson => lesson({ title, domain, competency: "Français", summary, content, answer, wrongs });
const A = (title: string, domain: string, summary: string, content: string, answer: string, wrongs: string[]): RawLesson => lesson({ title, domain, competency: "Anglais", summary, content, answer, wrongs });

const programs: RawProgram[] = [
  {
    subject: "Français", source: SOURCE_URL, version: "3e-francais-lotB-v1",
    chapters: [
      { title: "Grammaire et syntaxe", domain: "Grammaire", competency: "Français", lessons: [
        F("La subordination", "Grammaire", "Une proposition subordonnée dépend d'une proposition principale et ne peut généralement pas fonctionner seule.", "Une phrase complexe associe une proposition principale et une ou plusieurs propositions subordonnées, reliées par une conjonction de subordination, un pronom relatif ou un mot interrogatif. La subordonnée précise, complète ou restreint le sens de la principale.", "une proposition subordonnée dépend d'une proposition principale et précise son sens.", ["une proposition subordonnée peut toujours être supprimée sans changer le sens de la phrase", "la proposition principale dépend nécessairement de la subordonnée", "une phrase complexe ne peut contenir qu'une seule proposition"]),
        F("Le discours direct et indirect", "Grammaire", "Le discours direct rapporte des paroles telles qu'elles ont été prononcées, le discours indirect les intègre dans le récit.", "Le discours direct utilise des guillemets et conserve les paroles exactes. Le discours indirect supprime les guillemets, introduit la parole par un verbe déclaratif suivi d'une subordonnée, et adapte les pronoms, les temps et les indicateurs de temps ou de lieu.", "le discours indirect intègre les paroles rapportées dans une subordonnée, en adaptant pronoms et temps.", ["le discours direct et indirect utilisent toujours exactement les mêmes pronoms", "le discours indirect conserve systématiquement les guillemets", "le discours direct interdit tout verbe déclaratif"]),
      ] },
      { title: "Lecture et compréhension de textes", domain: "Lecture", competency: "Français", lessons: [
        F("Le schéma narratif et le point de vue", "Lecture", "Un récit s'organise généralement en plusieurs étapes et peut être raconté selon différents points de vue.", "Le schéma narratif comprend une situation initiale, un élément perturbateur, des péripéties, un dénouement et une situation finale. Le point de vue (interne, externe ou omniscient) détermine ce que le lecteur sait par rapport aux personnages.", "le schéma narratif organise le récit en étapes, et le point de vue détermine ce que le lecteur perçoit de l'histoire.", ["un récit ne peut jamais comporter de péripéties", "le point de vue omniscient limite le lecteur aux pensées d'un seul personnage", "la situation finale doit toujours précéder la situation initiale"]),
        F("L'argumentation et les types de discours", "Lecture", "Un texte argumentatif défend une thèse à l'aide d'arguments et d'exemples, en s'appuyant sur différents types de discours.", "L'argumentation repose sur une thèse, des arguments qui la soutiennent et des exemples qui les illustrent. Elle peut mobiliser un discours explicatif, un discours polémique ou des connecteurs logiques pour organiser le raisonnement.", "un texte argumentatif défend une thèse à l'aide d'arguments soutenus par des exemples.", ["un texte argumentatif se limite toujours à une description neutre", "les connecteurs logiques n'ont aucun rôle dans l'argumentation", "une thèse ne peut jamais être soutenue par des exemples"]),
      ] },
      { title: "Expression écrite", domain: "Écriture", competency: "Français", lessons: [
        F("Le résumé de texte", "Écriture", "Résumer un texte consiste à en restituer l'essentiel de façon condensée, sans reprendre les mots de l'auteur ni ajouter d'opinion personnelle.", "Un bon résumé respecte l'ordre des idées du texte source, réduit significativement sa longueur, reformule avec ses propres mots et ne trahit pas la pensée de l'auteur en ajoutant un jugement personnel.", "un résumé restitue l'essentiel du texte, avec ses propres mots, sans ajouter d'opinion personnelle.", ["un résumé doit reprendre mot pour mot les phrases du texte source", "un résumé peut librement ajouter des opinions absentes du texte", "un résumé doit être plus long que le texte d'origine"]),
        F("La dissertation et l'essai argumentatif", "Écriture", "Une dissertation développe une réflexion organisée autour d'une problématique, en s'appuyant sur un plan structuré.", "La dissertation exige une introduction qui pose la problématique, un développement organisé en parties argumentées avec des exemples, et une conclusion qui répond à la problématique posée. La cohérence entre les parties est essentielle.", "une dissertation développe une problématique à travers un plan structuré en introduction, développement et conclusion.", ["une dissertation n'a pas besoin de conclusion", "le développement peut se limiter à une liste d'exemples sans argument", "la problématique n'a aucune influence sur le plan choisi"]),
      ] },
      { title: "Ressources lexicales et stylistiques", domain: "Lexique et style", competency: "Français", lessons: [
        F("Les figures de style", "Lexique et style", "Les figures de style permettent d'enrichir un texte en créant des effets d'expression et de sens.", "La comparaison rapproche deux éléments à l'aide d'un outil de comparaison, la métaphore les rapproche sans outil de comparaison, et la personnification attribue des caractéristiques humaines à une chose ou une idée. Ces figures renforcent l'expressivité d'un texte.", "les figures de style comme la comparaison, la métaphore ou la personnification enrichissent l'expressivité d'un texte.", ["une métaphore utilise toujours un outil de comparaison explicite", "la personnification ne concerne que les êtres humains", "les figures de style rendent un texte uniquement plus difficile à comprendre, sans effet stylistique"]),
      ] },
    ]
  },
  {
    subject: "Anglais", source: SOURCE_URL, version: "3e-anglais-lotB-v1",
    chapters: [
      { title: "Grammar fundamentals", domain: "Grammar", competency: "Anglais", lessons: [
        A("Reported speech", "Grammar", "Reported speech restates what someone said without quoting their exact words, usually shifting tenses backward.", "When we report speech, present tense often shifts to past tense, and pronouns and time expressions are adapted to the new context. For example, direct speech 'I am tired' becomes reported speech 'She said she was tired'.", "reported speech restates what was said, usually shifting the tense backward and adapting pronouns.", ["reported speech always keeps the exact same tense as direct speech", "reported speech never changes pronouns", "direct speech and reported speech are always identical sentences"]),
        A("The passive voice", "Grammar", "The passive voice puts the focus on the action or the receiver of the action rather than on who performs it.", "The passive voice is formed with the verb 'to be' followed by the past participle. It is often used when the person performing the action is unknown, unimportant, or already clear from context, for example 'The letter was written yesterday'.", "the passive voice is formed with 'to be' plus the past participle, focusing on the receiver of the action.", ["the passive voice is formed with 'to have' plus the infinitive", "the passive voice always requires naming the person who performs the action", "the passive voice cannot be used in the past tense"]),
      ] },
      { title: "Verb tenses and modality", domain: "Tenses and modals", competency: "Anglais", lessons: [
        A("Conditional sentences", "Tenses and modals", "Conditional sentences express a condition and its consequence, using different structures depending on how likely the condition is.", "The first conditional (if + present, will + base verb) expresses a likely future condition. The second conditional (if + past, would + base verb) expresses a hypothetical or unlikely present situation. Choosing the right conditional depends on the probability expressed.", "conditional sentences link a condition to a consequence, and the structure used depends on how likely that condition is.", ["all conditional sentences use exactly the same verb structure", "the second conditional always describes a real, certain future event", "conditional sentences never involve the word 'if'"]),
        A("Modal verbs of obligation and permission", "Tenses and modals", "Modal verbs such as 'must', 'have to', 'can' and 'may' express obligation, necessity or permission.", "'Must' and 'have to' express obligation, though 'must' often reflects the speaker's own judgement while 'have to' often reflects an external rule. 'Can' and 'may' express permission or possibility, with 'may' being more formal.", "modal verbs like 'must', 'have to', 'can' and 'may' express obligation, necessity or permission depending on context.", ["'can' can never express permission, only ability", "'must' and 'have to' can never express obligation", "modal verbs are always followed by the infinitive with 'to'"]),
      ] },
      { title: "Vocabulary and communication", domain: "Vocabulary", competency: "Anglais", lessons: [
        A("Prepositions of time and place", "Vocabulary", "Prepositions of time and place indicate when and where something happens, and their correct use depends on precise rules.", "'At' is used for precise times and specific points, 'in' for longer periods and enclosed spaces, and 'on' for days, dates and surfaces. Choosing the right preposition depends on the type of time or place being described.", "'at', 'in' and 'on' are prepositions of time and place whose use depends on precise, specific rules.", ["'at', 'in' and 'on' can always be used interchangeably without any difference in meaning", "prepositions of time never apply to specific clock times", "'on' is only used for enclosed spaces, never for days or dates"]),
        A("Phrasal verbs", "Vocabulary", "A phrasal verb combines a verb with a particle to create a meaning that is often different from the individual words.", "Phrasal verbs such as 'give up' (to stop trying) or 'look after' (to take care of) have meanings that cannot always be guessed from their separate parts. They are very common in everyday spoken and written English.", "a phrasal verb combines a verb and a particle to form a meaning often different from its individual words.", ["a phrasal verb's meaning can always be guessed literally from each separate word", "phrasal verbs are rarely used in everyday English", "a phrasal verb never includes a preposition or particle"]),
      ] },
      { title: "Reading and writing skills", domain: "Writing", competency: "Anglais", lessons: [
        A("Letter and email writing", "Writing", "Formal and informal letters or emails follow different conventions of greeting, tone and closing.", "A formal letter or email uses a polite greeting such as 'Dear Sir/Madam', a clear and courteous tone, and a formal closing such as 'Yours faithfully'. An informal message allows a casual greeting, relaxed tone, and a friendly closing such as 'Best wishes'.", "formal and informal letters or emails differ in their greeting, tone and closing conventions.", ["formal and informal letters always use exactly the same greeting", "an informal email must always end with 'Yours faithfully'", "tone has no importance in letter or email writing"]),
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
  const aliases: Record<string, string[]> = { "Français": ["francais", "français", "fr"], "Anglais": ["anglais", "ang", "english"] };
  const codes = aliases[name] ?? [name.toLowerCase()];
  const q = await supabase.from("subjects").select("*").in("code", codes).limit(1).maybeSingle();
  if (q.error) throw q.error; if (q.data) return q.data;
  return checked(await supabase.from("subjects").insert({ code: codes[0], name, icon: name === "Français" ? "BookOpen" : "Languages" }).select().single(), `Création matière ${name}`);
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
  return checked(await supabase.from("curriculums").insert({ level_id: levelId, series_id: null, subject_id: subjectId, title, description: `Lot B 3e ${p.subject}. Contenu original EdTech Sénégal.`, version: p.version, status: STATUS, source: "Ressources pédagogiques sénégalaises; rédaction originale EdTech Sénégal.", source_url: p.source, source_document: "Cadrage pédagogique; ne pas présenter comme reproduction intégrale du référentiel officiel.", is_demo: false, validated: false, published_at: STATUS === "published" ? new Date().toISOString() : null }).select().single(), `Création curriculum ${p.subject}`);
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
      const groups = [{ title: `${l.title} — notions essentielles`, difficulty: "easy" as const, score: 30, start: 0, end: 4, instructions: "Maîtrise les notions essentielles." }, { title: `${l.title} — application`, difficulty: "medium" as const, score: 55, start: 4, end: 8, instructions: "Applique la notion à une situation nouvelle." }, { title: `${l.title} — raisonnement`, difficulty: "hard" as const, score: 75, start: 8, end: 12, instructions: "Analyse, justifie et vérifie ton raisonnement." }];
      for (const g of groups) { const ex = await getExercise(le.data.id, comp.id, g.title, g.instructions, g.difficulty, g.score); if (ex.created) stats.exercises++; for (let qi = g.start; qi < g.end; qi++) { const rawQuestion = l.questions[qi]; if (!rawQuestion) throw new Error(`[${p.subject}] ${l.title}: question ${qi + 1} absente`); const r = await addQuestion(ex.data.id, comp.id, ch.data.id, toQuestion(rawQuestion, qi)); if (r.created) stats.questions++; else if (r.optionsChanged) stats.updatedQuestions++; } }
    }
  }
  return stats;
}

async function main() {
  console.log("=============================================="); console.log(" IMPORT LOT B — 3e — FRANÇAIS + ANGLAIS"); console.log("=============================================="); console.log(`Statut : ${STATUS}`);
  auditLocal();
  const cycle = await getCycle(); const level = await getLevel(cycle.id); if (level.code !== "3e") throw new Error(`Niveau inattendu: ${level.code}`); console.log(`Niveau : ${level.name}`);
  const totals = { chapters: 0, lessons: 0, exercises: 0, questions: 0, updatedQuestions: 0 };
  for (const p of programs) { const s = await runProgram(level.id, p); for (const k of Object.keys(totals) as (keyof typeof totals)[]) totals[k] += s[k]; console.log(`\n=== ${p.subject.toUpperCase()} 3e ===`); console.log(s); }
  console.log("\n=============================================="); console.log("IMPORT LOT B 3e TERMINÉ"); console.log("=============================================="); console.log(totals); console.log(STATUS === "review" ? "Contenu en review par défaut." : "Contenu publié car EDTECH_PUBLISH_ENRICHMENT=true.");
}
main().catch(e => { console.error("❌ Import Lot B 3e échoué"); console.error(e); process.exit(1); });
