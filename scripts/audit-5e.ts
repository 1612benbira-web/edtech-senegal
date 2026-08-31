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

async function main() {
  console.log("==============================================");
  console.log(" AUDIT POST-IMPORT — 5e — EDTECH SÉNÉGAL");
  console.log("==============================================");

  const levels = await all<{id:string; code:string; name:string}>("school_levels", "id,code,name");
  const level = levels.find(x => x.name.toLowerCase() === "5e" || x.code.toLowerCase() === "5e" || x.code.toLowerCase() === "5eme");
  if (!level) throw new Error("Niveau 5e introuvable dans school_levels.");

  const subjects = await all<{id:string; code:string; name:string}>("subjects", "id,code,name");
  const wanted = ["Mathématiques","SVT","Français","Anglais","Histoire","Géographie"];
  // Audit uniquement les programmes créés par le Lot 5, jamais les anciens programmes publiés.
  const targetTitle = (subject: string) => `${subject} 5e – Programme sénégalais`;
  const byName = new Map(subjects.map(s => [s.name.toLowerCase(), s]));

  const curricula = await all<any>("curriculums", "*");
  const five = wanted.map(subject => curricula.find(c => c.level_id === level.id && c.title === targetTitle(subject))).filter(Boolean);
  if (five.length !== 6) {
    const missing = wanted.filter(subject => !five.some(c => c.title === targetTitle(subject)));
    console.log("Programmes Lot 5 manquants:", missing.join(", ") || "aucun");
  }
  const domains = await all<any>("domains", "*");
  const competencies = await all<any>("competencies", "*");
  const chapters = await all<any>("chapters", "*");
  const lessons = await all<any>("lessons", "*");
  const exercises = await all<any>("exercises", "*");
  const questions = await all<any>("questions", "*");
  const options = await all<any>("question_options", "*");

  const cid = new Set(five.map(c => c.id));
  const c5 = chapters.filter(c => cid.has(c.curriculum_id) && !c.deleted_at);
  const ch5 = new Set(c5.map(c => c.id));
  const l5 = lessons.filter(l => ch5.has(l.chapter_id) && !l.deleted_at);
  const lid = new Set(l5.map(l => l.id));
  const e5 = exercises.filter(e => lid.has(e.lesson_id) && !e.deleted_at);
  const eid = new Set(e5.map(e => e.id));
  const q5 = questions.filter(q => eid.has(q.exercise_id) && !q.deleted_at);
  const qid = new Set(q5.map(q => q.id));
  const o5 = options.filter(o => qid.has(o.question_id));

  const failures: string[] = [];
  const warnings: string[] = [];
  if (five.length !== 6) failures.push(`Programmes 5e trouvés: ${five.length}/6.`);
  for (const w of wanted) {
    const c = five.find(x => x.title.toLowerCase().includes(w.toLowerCase()));
    if (!c) { failures.push(`Programme manquant: ${w}`); continue; }
    const cs = c5.filter(x => x.curriculum_id === c.id);
    const ls = l5.filter(l => cs.some(x => x.id === l.chapter_id));
    const es = e5.filter(e => ls.some(x => x.id === e.lesson_id));
    const qs = q5.filter(q => es.some(x => x.id === q.exercise_id));
    console.log(`\n=== ${w.toUpperCase()} 5e ===`);
    console.log({ chapters: cs.length, lessons: ls.length, exercises: es.length, questions: qs.length });
    if (!cs.length || !ls.length) failures.push(`${w}: structure vide.`);
    for (const l of ls) {
      if (!l.content_md?.trim()) failures.push(`${w}: leçon sans contenu: ${l.title}`);
      if (!l.objectives?.length) warnings.push(`${w}: leçon sans objectifs: ${l.title}`);
      const ex = es.filter(e => e.lesson_id === l.id);
      if (ex.length !== 3) failures.push(`${w}: ${l.title}: ${ex.length}/3 exercices.`);
      for (const e of ex) {
        const q = qs.filter(x => x.exercise_id === e.id);
        if (!q.length) failures.push(`${w}: exercice vide: ${e.title}`);
        if (q.length !== 4) failures.push(`${w}: ${e.title}: ${q.length}/4 questions.`);
        for (const qq of q) {
          const oo = o5.filter(o => o.question_id === qq.id);
          const expectedOptions = qq.type === "true_false" ? 2 : 4;
          if (!oo.length) failures.push(`${w}: question sans option: ${qq.prompt.slice(0,80)}`);
          if (oo.length !== expectedOptions) failures.push(`${w}: nombre d'options incorrect (${oo.length}/${expectedOptions}): ${qq.prompt.slice(0,80)}`);
          if ((qq.type === "single_choice" || qq.type === "true_false") && oo.filter(o => o.is_correct).length !== 1) failures.push(`${w}: question avec nombre de bonnes réponses incorrect: ${qq.prompt.slice(0,80)}`);
          if (!qq.explanation?.trim()) warnings.push(`${w}: question sans explication: ${qq.prompt.slice(0,80)}`);
        }
      }
    }
  }

  const duplicateMap = new Map<string, any[]>();
  for (const q of q5) { const k = `${q.exercise_id}::${q.prompt.trim().toLowerCase()}`; duplicateMap.set(k, [...(duplicateMap.get(k) ?? []), q]); }
  const dupQ = [...duplicateMap.values()].filter(v => v.length > 1);
  if (dupQ.length) failures.push(`${dupQ.length} doublon(s) de question dans un même exercice.`);

  const orphanOptions = options.filter(o => !o.question_id || !questions.some(q => q.id === o.question_id && !q.deleted_at));
  // Les questions/options orphelines historiques hors du périmètre 5e ne bloquent pas le Lot 5.
  if (orphanOptions.length) warnings.push(`${orphanOptions.length} option(s) sans question valide détectée(s) dans la base.`);

  console.log("\n==============================================");
  console.log("RÉSUMÉ");
  console.log({ curricula: five.length, chapters: c5.length, lessons: l5.length, exercises: e5.length, questions: q5.length, options: o5.length, failures: failures.length, warnings: warnings.length });
  if (failures.length) { console.log("\n❌ BLOQUANTS"); failures.forEach(x => console.log("- " + x)); process.exitCode = 2; }
  else console.log("\n✅ Aucun bloquant structurel détecté.");
  if (warnings.length) { console.log("\n⚠️ AVERTISSEMENTS"); warnings.slice(0,100).forEach(x => console.log("- " + x)); }
  console.log("\nStatut des programmes:", five.map(c => `${c.title}=${c.status}`).join(" | "));
  console.log("Publication: ne pas activer avant validation pédagogique.");
}
main().catch(e => { console.error("❌ Audit échoué", e); process.exit(1); });
