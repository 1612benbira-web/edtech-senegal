import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY sont requis.");
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function all<T>(table: string, columns = "*") {
  const page = 1000; let from = 0; const out: T[] = [];
  while (true) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + page - 1);
    if (error) throw error; if (!data?.length) break;
    out.push(...(data as T[])); if (data.length < page) break; from += page;
  }
  return out;
}

// Cibles précises par ID (pas par titre) : ce sont les 3 programmes 6e
// encore en "review" au moment de l'audit (Anglais, Géographie,
// Histoire), créés par scripts/import-6e-anglais-histoire-geographie.ts.
// Contrairement au Lot 5/4e/3e, ce script a une structure LIBRE
// (nombre d'exercices par leçon et de questions par exercice
// variable) : on ne vérifie donc pas un format fixe (3 exercices/4
// questions), seulement l'intégrité structurelle.
const TARGET_IDS = [
  "d9a60213-1e33-472e-9a2b-4760f0b2a185", // Anglais 6e
  "8314c5e3-a4ed-441a-8de6-474657837f7c", // Géographie 6e
  "eb93113d-8f4f-44ea-bfee-75f61abcfe7a", // Histoire 6e
];

async function main() {
  console.log("==============================================");
  console.log(" AUDIT POST-IMPORT — 6e — ANGLAIS / GÉOGRAPHIE / HISTOIRE");
  console.log("==============================================");

  const curricula = await all<any>("curriculums", "*");
  const targets = TARGET_IDS.map(id => curricula.find(c => c.id === id)).filter(Boolean);
  if (targets.length !== TARGET_IDS.length) {
    console.log(`⚠️ ${TARGET_IDS.length - targets.length} programme(s) ciblé(s) introuvable(s).`);
  }

  const chapters = await all<any>("chapters", "*");
  const lessons = await all<any>("lessons", "*");
  const exercises = await all<any>("exercises", "*");
  const questions = await all<any>("questions", "*");
  const options = await all<any>("question_options", "*");

  const failures: string[] = [];
  const warnings: string[] = [];
  let totalChapters = 0, totalLessons = 0, totalExercises = 0, totalQuestions = 0, totalOptions = 0;

  for (const c of targets) {
    const cs = chapters.filter(x => x.curriculum_id === c.id && !x.deleted_at);
    const chIds = new Set(cs.map(x => x.id));
    const ls = lessons.filter(l => chIds.has(l.chapter_id) && !l.deleted_at);
    const lIds = new Set(ls.map(l => l.id));
    const es = exercises.filter(e => lIds.has(e.lesson_id) && !e.deleted_at);
    const eIds = new Set(es.map(e => e.id));
    const qs = questions.filter(q => eIds.has(q.exercise_id) && !q.deleted_at);
    const qIds = new Set(qs.map(q => q.id));
    const os = options.filter(o => qIds.has(o.question_id));

    totalChapters += cs.length; totalLessons += ls.length; totalExercises += es.length; totalQuestions += qs.length; totalOptions += os.length;
    console.log(`\n=== ${c.title} ===`);
    console.log({ chapters: cs.length, lessons: ls.length, exercises: es.length, questions: qs.length, options: os.length, status: c.status });

    if (!cs.length) { failures.push(`${c.title}: aucun chapitre.`); continue; }
    for (const l of ls) {
      if (!l.content_md?.trim()) failures.push(`${c.title}: leçon sans contenu: ${l.title}`);
      if (!l.objectives?.length) warnings.push(`${c.title}: leçon sans objectifs: ${l.title}`);
      const ex = es.filter(e => e.lesson_id === l.id);
      if (!ex.length) failures.push(`${c.title}: leçon sans exercice: ${l.title}`);
      for (const e of ex) {
        const q = qs.filter(x => x.exercise_id === e.id);
        if (!q.length) failures.push(`${c.title}: exercice vide: ${e.title}`);
        for (const qq of q) {
          const oo = os.filter(o => o.question_id === qq.id);
          const expectedOptions = qq.type === "true_false" ? 2 : 4;
          if (!oo.length) failures.push(`${c.title}: question sans option: ${qq.prompt.slice(0, 80)}`);
          else if (oo.length !== expectedOptions) failures.push(`${c.title}: nombre d'options incorrect (${oo.length}/${expectedOptions}): ${qq.prompt.slice(0, 80)}`);
          if ((qq.type === "single_choice" || qq.type === "true_false") && oo.filter(o => o.is_correct).length !== 1) failures.push(`${c.title}: question avec nombre de bonnes réponses incorrect: ${qq.prompt.slice(0, 80)}`);
          if (!qq.explanation?.trim()) warnings.push(`${c.title}: question sans explication: ${qq.prompt.slice(0, 80)}`);
        }
      }
    }

    const dupMap = new Map<string, any[]>();
    for (const q of qs) { const k = `${q.exercise_id}::${q.prompt.trim().toLowerCase()}`; dupMap.set(k, [...(dupMap.get(k) ?? []), q]); }
    const dup = [...dupMap.values()].filter(v => v.length > 1);
    if (dup.length) failures.push(`${c.title}: ${dup.length} doublon(s) de question dans un même exercice.`);
  }

  console.log("\n==============================================");
  console.log("RÉSUMÉ");
  console.log({ curricula: targets.length, chapters: totalChapters, lessons: totalLessons, exercises: totalExercises, questions: totalQuestions, options: totalOptions, failures: failures.length, warnings: warnings.length });
  if (failures.length) { console.log("\n❌ BLOQUANTS"); failures.forEach(x => console.log("- " + x)); process.exitCode = 2; }
  else console.log("\n✅ Aucun bloquant structurel détecté.");
  if (warnings.length) { console.log("\n⚠️ AVERTISSEMENTS"); warnings.slice(0, 100).forEach(x => console.log("- " + x)); }
  console.log("\nStatut des programmes:", targets.map(c => `${c.title}=${c.status}`).join(" | "));
  console.log("Publication: ne pas activer avant validation pédagogique.");
}
main().catch(e => { console.error("❌ Audit échoué", e); process.exit(1); });
