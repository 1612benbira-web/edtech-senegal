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
type LessonSpec = { title: string; domain: string; competency: string; summary: string; content: string; answer: string; wrongs: string[]; context?: string };
type RawLesson = { title: string; objectives: string[]; summary: string; content: string; questions: RawQuestion[] };
type RawChapter = { title: string; domain: string; competency: string; lessons: RawLesson[] };
type RawProgram = { subject: string; source: string; version: string; chapters: RawChapter[] };

type QuestionRow = ReturnType<typeof toQuestion>;

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
const unique = <T,>(a: T[]) => [...new Set(a)];

function buildQuestions(s: LessonSpec): RawQuestion[] {
  if (s.wrongs.length < 3) throw new Error(`[${s.title}] 3 mauvaises réponses requises.`);
  if (s.wrongs.map(norm).includes(norm(s.answer))) throw new Error(`[${s.title}] answer présente dans wrongs.`);
  const [a,b,c] = s.wrongs as [string,string,string];
  return [
    { kind:"mc", prompt:`Dans « ${s.title} », quelle proposition est correcte ?`, answer:s.answer, wrongs:[a,b,c], explanation:`La bonne réponse est : ${s.answer}` },
    { kind:"tf", prompt:`L'affirmation « ${s.answer} » est correcte pour « ${s.title} ».`, answer:true, explanation:`Vrai : l'affirmation correspond à la notion étudiée.` },
    { kind:"mc", prompt:`Quel énoncé décrit le mieux « ${s.title} » ?`, answer:s.answer, wrongs:[b,c,a], explanation:`Cette formulation reprend l'idée centrale de la leçon.` },
    { kind:"mc", prompt:`Quelle idée essentielle faut-il retenir de « ${s.title} » ?`, answer:s.answer, wrongs:[c,a,b], explanation:`Il faut retenir que ${s.answer}` },
    { kind:"mc", prompt:`Quelle réponse applique correctement « ${s.title} » ?`, answer:s.answer, wrongs:[a,c,b], explanation:`L'application correcte repose sur la notion étudiée.` },
    { kind:"tf", prompt:`Pour réussir un exercice sur « ${s.title} », il faut mobiliser les notions étudiées.`, answer:true, explanation:`Vrai. Une réponse rigoureuse s'appuie sur les notions pertinentes.` },
    { kind:"mc", prompt:`Quel choix permet d'éviter une erreur fréquente sur « ${s.title} » ?`, answer:s.answer, wrongs:[b,a,c], explanation:`Le choix correct respecte la définition et les propriétés étudiées.` },
    { kind:"tf", prompt:`« ${a} » est une description correcte de « ${s.title} ».`, answer:false, explanation:`Faux. Cette proposition ne correspond pas à la notion étudiée.` },
    { kind:"mc", prompt:`Quel raisonnement est le plus rigoureux pour « ${s.title} » ?`, answer:s.answer, wrongs:[c,b,a], explanation:`Le raisonnement correct s'appuie sur les caractéristiques essentielles.` },
    { kind:"mc", prompt:`Quelle formulation correspond à l'objectif principal de « ${s.title} » ?`, answer:s.answer, wrongs:[a,b,c], explanation:`Cette formulation correspond au contenu et à l'objectif de la leçon.` },
    { kind:"tf", prompt:`Une justification à partir des propriétés étudiées améliore une réponse sur « ${s.title} ».`, answer:true, explanation:`Vrai. La justification permet de vérifier le raisonnement.` },
    { kind:"mc", prompt:`Quelle réponse résume le mieux « ${s.title} » ?`, answer:s.answer, wrongs:[b,c,a], explanation:`C'est la formulation qui résume le mieux l'idée essentielle.` },
  ];
}

function lesson(s: LessonSpec): RawLesson {
  return { title:s.title, objectives:[`Comprendre ${s.title.toLowerCase()}.`,`Identifier les notions essentielles de ${s.title.toLowerCase()}.`,`Mobiliser ces connaissances dans une situation d'étude.`,`Justifier et vérifier une réponse.`], summary:s.summary, content:s.content, questions:buildQuestions(s) };
}

const M = (title:string, domain:string, summary:string, content:string, answer:string, wrongs:string[]):RawLesson => lesson({title,domain,competency:"Mathématiques",summary,content,answer,wrongs});
const S = (title:string, domain:string, summary:string, content:string, answer:string, wrongs:string[]):RawLesson => lesson({title,domain,competency:"SVT",summary,content,answer,wrongs});

const programs: RawProgram[] = [
  {
    subject:"Mathématiques", source:SOURCE_URL, version:"3e-mathematiques-lotA-v1",
    chapters:[
      { title:"Arithmétique", domain:"Nombres et calculs", competency:"Mathématiques", lessons:[
        M("Divisibilité et nombres premiers","Nombres et calculs","La divisibilité permet d'étudier les multiples, diviseurs et nombres premiers.","Un entier a est divisible par b lorsqu'il existe un entier k tel que a=b×k. Un nombre premier possède exactement deux diviseurs positifs : 1 et lui-même. Les critères de divisibilité permettent de vérifier rapidement certaines propriétés.","un nombre premier possède exactement deux diviseurs positifs : 1 et lui-même.",["tout nombre pair est premier","un nombre premier possède toujours trois diviseurs positifs","la divisibilité ne concerne que les nombres décimaux"]),
        M("PGCD et simplification des fractions","Nombres et calculs","Le PGCD est le plus grand diviseur commun de deux entiers.","Le PGCD peut être calculé par l'algorithme d'Euclide ou par décomposition en facteurs premiers. Il permet notamment de simplifier une fraction en divisant numérateur et dénominateur par un même diviseur commun.","le PGCD est le plus grand entier positif qui divise simultanément deux entiers.",["le PGCD est toujours leur somme","le PGCD est leur plus petit multiple commun","une fraction se simplifie en divisant seulement son numérateur"]),
      ]},
      { title:"Calcul littéral et nombres réels", domain:"Calcul littéral", competency:"Mathématiques", lessons:[
        M("Développement et factorisation","Calcul littéral","Développer transforme un produit en somme et factoriser transforme une somme en produit.","La distributivité permet de développer. Factoriser consiste à reconnaître un facteur commun ou une identité remarquable afin d'obtenir un produit. Ces transformations servent à simplifier et résoudre des expressions.","développer transforme un produit en somme et factoriser transforme une somme en produit.",["factoriser consiste seulement à supprimer les parenthèses","développer interdit la distributivité","développer et factoriser signifient toujours additionner"]),
        M("Racines carrées","Nombres réels","La racine carrée d'un nombre positif est le nombre positif dont le carré donne ce nombre.","Pour a≥0, √a est l'unique réel positif dont le carré vaut a. Les propriétés des racines permettent de simplifier certaines expressions en respectant leurs conditions de validité.","√a est le nombre réel positif dont le carré vaut a pour a≥0.",["√a est toujours a/2","la racine carrée positive est négative","√a est réel pour tout a strictement négatif"]),
      ]},
      { title:"Géométrie", domain:"Configurations planes", competency:"Mathématiques", lessons:[
        M("Théorème de Thalès","Configurations planes","Le théorème de Thalès relie des longueurs proportionnelles dans une configuration de droites parallèles.","Lorsque deux droites sécantes sont coupées par deux droites parallèles, les longueurs correspondantes sont proportionnelles. Le théorème permet de calculer une longueur et sa réciproque peut servir à démontrer un parallélisme.","dans une configuration de Thalès, les longueurs correspondantes sont proportionnelles lorsque les droites sont parallèles.",["toutes les longueurs sont égales","Thalès concerne uniquement les cercles","le parallélisme n'a aucun rôle dans Thalès"]),
        M("Trigonométrie dans le triangle rectangle","Trigonométrie","Sinus, cosinus et tangente relient un angle aigu aux côtés d'un triangle rectangle.","Pour un angle aigu, le cosinus est le rapport du côté adjacent à l'hypoténuse, le sinus celui du côté opposé à l'hypoténuse et la tangente celui du côté opposé au côté adjacent.","dans un triangle rectangle, le cosinus d'un angle aigu est le rapport du côté adjacent à l'hypoténuse.",["le cosinus est l'hypoténuse divisée par le côté adjacent","la tangente utilise toujours l'hypoténuse comme dénominateur","la trigonométrie ne permet pas de calculer une longueur"]),
      ]},
      { title:"Vecteurs", domain:"Vecteurs et géométrie analytique", competency:"Mathématiques", lessons:[
        M("Vecteurs dans le plan","Vecteurs et géométrie analytique","Un vecteur décrit un déplacement par une direction, un sens et une longueur.","Dans un repère, les coordonnées du vecteur AB s'obtiennent en soustrayant les coordonnées de A à celles de B. Les vecteurs servent à représenter des déplacements et à étudier des configurations géométriques.","les coordonnées du vecteur AB s'obtiennent en soustrayant les coordonnées de A à celles de B.",["les coordonnées de AB sont toujours celles de A","un vecteur n'a ni direction ni sens","les vecteurs ne représentent jamais de déplacement"]),
      ]},
    ]
  },
  {
    subject:"SVT", source:SOURCE_URL, version:"3e-svt-lotA-v1",
    chapters:[
      { title:"Fonction de relation", domain:"Sciences de la vie", competency:"SVT", lessons:[
        S("Fonctionnement du système nerveux","Fonction de relation","Le système nerveux reçoit, traite et transmet des informations pour produire des réponses adaptées.","Un stimulus est détecté par un récepteur sensoriel. L'information est transmise par les nerfs vers les centres nerveux, puis une réponse peut être envoyée vers un muscle. Les réflexes illustrent des réponses rapides organisées par des circuits nerveux.","le système nerveux reçoit, traite et transmet des informations afin de produire des réponses adaptées.",["le système nerveux fonctionne uniquement grâce aux os","les muscles produisent seuls les informations sensorielles","les nerfs ne transmettent aucune information"]),
        S("Vision et perception des images","Fonction de relation","La vision résulte de la réception de la lumière par l'œil puis du traitement des informations visuelles par le cerveau.","La lumière atteint la rétine. Des cellules sensibles transforment l'information lumineuse en messages nerveux transmis par le nerf optique vers le cerveau, où l'information est interprétée.","la rétine transforme les informations lumineuses en messages nerveux transmis au cerveau.",["le cerveau reçoit directement la lumière","le nerf optique produit la lumière","la vision ne dépend pas du système nerveux"]),
      ]},
      { title:"Fonction de nutrition", domain:"Sciences de la vie", competency:"SVT", lessons:[
        S("Respiration cellulaire","Fonction de nutrition","La respiration cellulaire permet aux cellules d'utiliser notamment le dioxygène et des nutriments pour libérer de l'énergie.","En présence de dioxygène, les cellules utilisent notamment du glucose et produisent du dioxyde de carbone et de l'eau avec libération d'énergie utilisable.","la respiration cellulaire utilise notamment du dioxygène et des nutriments pour libérer de l'énergie.",["la respiration cellulaire produit de l'énergie sans matière","le dioxygène est toujours inutile aux cellules","elle transforme seulement l'eau en dioxygène"]),
        S("Fermentation","Fonction de nutrition","Certaines cellules peuvent produire de l'énergie par fermentation en absence de dioxygène.","En absence de dioxygène, certaines cellules utilisent des voies fermentaires. Selon le type de fermentation, de l'éthanol ou de l'acide lactique peut être produit. Le rendement énergétique est généralement inférieur à celui de la respiration aérobie.","certaines fermentations permettent de produire de l'énergie en absence de dioxygène.",["toute fermentation exige beaucoup de dioxygène","la fermentation ne transforme jamais les nutriments","elle produit toujours plus d'énergie que la respiration"]),
      ]},
      { title:"Milieu intérieur", domain:"Fonction de nutrition", competency:"SVT", lessons:[
        S("Excrétion urinaire et reins","Fonction de nutrition","Les reins filtrent le sang et participent à l'élimination de déchets par l'urine.","Les reins reçoivent du sang, le filtrent et participent à la formation de l'urine. Cette fonction contribue à maintenir relativement stable la composition du milieu intérieur.","les reins filtrent le sang et participent à l'élimination de déchets par l'urine.",["les reins produisent le dioxygène des muscles","l'urine est fabriquée par les poumons","les reins n'ont aucun rôle dans le milieu intérieur"]),
      ]},
      { title:"Génétique et hérédité", domain:"Diversité et unité du vivant", competency:"SVT", lessons:[
        S("Information génétique et chromosomes","Génétique et hérédité","Les chromosomes sont constitués d'ADN qui porte l'information génétique organisée en gènes.","Les chromosomes sont constitués d'ADN. L'ADN porte une information génétique organisée en gènes. Les cellules d'un même organisme possèdent généralement la même information génétique, mais n'expriment pas nécessairement les mêmes gènes.","les chromosomes sont constitués d'ADN qui porte l'information génétique organisée en gènes.",["les chromosomes sont constitués uniquement d'eau","l'ADN ne contient aucune information héréditaire","chaque cellule possède nécessairement un génome totalement différent"]),
        S("Transmission et diversité des caractères","Génétique et hérédité","La reproduction sexuée combine des informations génétiques provenant des deux parents et contribue à la diversité des individus.","La reproduction sexuée associe du matériel génétique provenant des deux parents. Des allèles différents d'un même gène peuvent contribuer à la diversité des caractères observés entre individus d'une même espèce.","la reproduction sexuée combine des informations génétiques provenant des deux parents et contribue à la diversité des individus.",["un descendant reçoit toute son information d'un seul parent","tous les individus ont exactement les mêmes allèles","la reproduction sexuée supprime toute diversité génétique"]),
      ]},
    ]
  }
];

function toQuestion(q: RawQuestion, index: number) {
  if (q.kind === "tf") {
    const answer = Boolean(q.answer);
    return { type:"true_false" as const, prompt:q.prompt, explanation:q.explanation, points:10, difficulty_score:index < 4 ? 30 : index < 8 ? 55 : 75,
      options:[{label:"Vrai",is_correct:answer,order:1},{label:"Faux",is_correct:!answer,order:2}] };
  }
  const wrongs = q.wrongs ?? [];
  const labels = unique([String(q.answer), ...wrongs]);
  if (wrongs.length !== 3 || labels.length !== 4) throw new Error(`Question MC invalide: ${q.prompt}`);
  return { type:"single_choice" as const, prompt:q.prompt, explanation:q.explanation, points:10, difficulty_score:index < 4 ? 30 : index < 8 ? 55 : 75,
    options:labels.map((label,i)=>({label,is_correct:i===0,order:i+1})) };
}

async function checked(r:{data:any;error:PostgrestError|null}, op:string):Promise<any>{
  if(r.error) throw new Error(`${op}: ${r.error.message}`);
  if(r.data===null) throw new Error(`${op}: aucune donnée.`);
  return r.data;
}

async function getCycle(){
  const q=await supabase.from("school_cycles").select("*").eq("code","moyen").maybeSingle();
  if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("school_cycles").insert({code:"moyen",name:"Moyen",order:2}).select().single(),"Création cycle");
}
async function getLevel(cycleId:string){
  const q=await supabase.from("school_levels").select("*").eq("cycle_id",cycleId).eq("code","3e").maybeSingle();
  if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("school_levels").insert({cycle_id:cycleId,code:"3e",name:"3e",order:4}).select().single(),"Création niveau 3e");
}
async function getSubject(name:string){
  const aliases:Record<string,string[]>={"Mathématiques":["math","maths","mathematiques","mathématiques"],SVT:["svt"]};
  const codes=aliases[name]??[name.toLowerCase()];
  const q=await supabase.from("subjects").select("*").in("code",codes).limit(1).maybeSingle();
  if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("subjects").insert({code:codes[0],name,icon:name==="Mathématiques"?"Calculator":"Dna"}).select().single(),`Création matière ${name}`);
}
async function ensureLevelSubject(levelId:string,subjectId:string){
  const q=await supabase.from("level_subjects").select("id").eq("level_id",levelId).eq("subject_id",subjectId).is("series_id",null).maybeSingle();
  if(q.error) throw q.error; if(q.data) return;
  const r=await supabase.from("level_subjects").insert({level_id:levelId,subject_id:subjectId,series_id:null,is_optional:false}); if(r.error) throw r.error;
}
async function getCurriculum(levelId:string,subjectId:string,p:RawProgram){
  const title=`${p.subject} 3e – Programme sénégalais`;
  const q=await supabase.from("curriculums").select("*").eq("level_id",levelId).eq("subject_id",subjectId).eq("title",title).eq("version",p.version).maybeSingle();
  if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("curriculums").insert({level_id:levelId,series_id:null,subject_id:subjectId,title,description:`Lot A 3e ${p.subject}. Contenu original EdTech Sénégal.`,version:p.version,status:STATUS,source:"Ressources pédagogiques sénégalaises; rédaction originale EdTech Sénégal.",source_url:p.source,source_document:"Cadrage pédagogique; ne pas présenter comme reproduction intégrale du référentiel officiel.",is_demo:false,validated:false,published_at:STATUS==="published"?new Date().toISOString():null}).select().single(),`Création curriculum ${p.subject}`);
}
async function getDomain(curriculumId:string,name:string,order:number){
  const q=await supabase.from("domains").select("*").eq("curriculum_id",curriculumId).eq("name",name).maybeSingle(); if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("domains").insert({curriculum_id:curriculumId,name,order}).select().single(),`Création domaine ${name}`);
}
async function getCompetency(domainId:string,name:string){
  const q=await supabase.from("competencies").select("*").eq("domain_id",domainId).eq("name",name).maybeSingle(); if(q.error) throw q.error; if(q.data) return q.data;
  return checked(await supabase.from("competencies").insert({domain_id:domainId,name,description:name,order:1}).select().single(),`Création compétence ${name}`);
}
async function getChapter(curriculumId:string,domainId:string,c:RawChapter,order:number){
  const q=await supabase.from("chapters").select("*").eq("curriculum_id",curriculumId).eq("title",c.title).is("deleted_at",null).maybeSingle(); if(q.error) throw q.error;
  if(q.data){ const u=await supabase.from("chapters").update({domain_id:domainId,order,status:STATUS}).eq("id",q.data.id); if(u.error) throw u.error; return {data:q.data,created:false}; }
  return {data:await checked(await supabase.from("chapters").insert({curriculum_id:curriculumId,domain_id:domainId,title:c.title,order,status:STATUS,source:"Ressources sénégalaises; structuration originale EdTech Sénégal.",source_url:SOURCE_URL}).select().single(),`Création chapitre ${c.title}`),created:true};
}
async function getLesson(chapterId:string,competencyId:string,l:RawLesson,order:number,sourceUrl:string){
  const payload={chapter_id:chapterId,competency_id:competencyId,title:l.title,content_md:l.content,objectives:l.objectives,summary:l.summary,order,status:STATUS,source:"Contenu original EdTech Sénégal.",source_url:sourceUrl};
  const q=await supabase.from("lessons").select("*").eq("chapter_id",chapterId).eq("title",l.title).is("deleted_at",null).maybeSingle(); if(q.error) throw q.error;
  if(q.data) return {data:await checked(await supabase.from("lessons").update(payload).eq("id",q.data.id).select().single(),`Mise à jour leçon ${l.title}`),created:false};
  return {data:await checked(await supabase.from("lessons").insert(payload).select().single(),`Création leçon ${l.title}`),created:true};
}
async function getExercise(lessonId:string,competencyId:string,title:string,instructions:string,difficulty:"easy"|"medium"|"hard",score:number){
  const payload={lesson_id:lessonId,competency_id:competencyId,title,instructions,difficulty,difficulty_score:score,status:STATUS};
  const q=await supabase.from("exercises").select("*").eq("lesson_id",lessonId).eq("title",title).is("deleted_at",null).maybeSingle(); if(q.error) throw q.error;
  if(q.data) return {data:await checked(await supabase.from("exercises").update(payload).eq("id",q.data.id).select().single(),`Mise à jour exercice ${title}`),created:false};
  return {data:await checked(await supabase.from("exercises").insert(payload).select().single(),`Création exercice ${title}`),created:true};
}
async function syncOptions(questionId:string,options:QuestionRow["options"]){
  const q=await supabase.from("question_options").select("id,label,is_correct,order").eq("question_id",questionId); if(q.error) throw q.error;
  const sig=(x:any[])=>x.map(o=>`${o.order}|${o.label}|${o.is_correct}`).sort().join("||");
  if(sig(q.data??[])===sig(options)) return false;
  if((q.data??[]).length){const d=await supabase.from("question_options").delete().eq("question_id",questionId);if(d.error)throw d.error;}
  const i=await supabase.from("question_options").insert(options.map(o=>({...o,question_id:questionId}))); if(i.error)throw i.error; return true;
}
async function addQuestion(exerciseId:string,competencyId:string,chapterId:string,q:QuestionRow){
  const payload={exercise_id:exerciseId,competency_id:competencyId,chapter_id:chapterId,type:q.type,prompt:q.prompt,explanation:q.explanation,points:q.points,difficulty_score:q.difficulty_score,status:STATUS};
  const f=await supabase.from("questions").select("id").eq("exercise_id",exerciseId).eq("prompt",q.prompt).is("deleted_at",null).maybeSingle(); if(f.error)throw f.error;
  let id:string,created=false;
  if(f.data){id=f.data.id;const u=await supabase.from("questions").update(payload).eq("id",id);if(u.error)throw u.error;}
  else{id=await checked(await supabase.from("questions").insert(payload).select("id").single(),"Création question").then(x=>x.id);created=true;}
  const optionsChanged=await syncOptions(id,q.options); return {created,optionsChanged};
}

function auditLocal(){
  for(const p of programs){let lessons=0;let questions=0;for(const c of p.chapters)for(const l of c.lessons){lessons++;questions+=l.questions.length;if(l.questions.length!==12)throw new Error(`[AUDIT] ${p.subject}/${l.title}: ${l.questions.length}/12`);}if(!lessons||questions!==lessons*12)throw new Error(`[AUDIT] ${p.subject}: incohérence leçons/questions`);console.log(`  ✅ ${p.subject}: ${p.chapters.length} chapitres, ${lessons} leçons, ${questions} questions`);}
}

async function runProgram(levelId:string,p:RawProgram){
  const subject=await getSubject(p.subject); await ensureLevelSubject(levelId,subject.id); const curriculum=await getCurriculum(levelId,subject.id,p);
  const stats={chapters:0,lessons:0,exercises:0,questions:0,updatedQuestions:0};
  for(let ci=0;ci<p.chapters.length;ci++){
    const c=p.chapters[ci]; if(!c)throw new Error(`[${p.subject}] chapitre ${ci+1} absent`);
    const d=await getDomain(curriculum.id,c.domain,ci+1); const comp=await getCompetency(d.id,c.competency); const ch=await getChapter(curriculum.id,d.id,c,ci+1); if(ch.created)stats.chapters++;
    for(let li=0;li<c.lessons.length;li++){
      const l=c.lessons[li]; if(!l)throw new Error(`[${p.subject}] leçon ${ci+1}.${li+1} absente`); if(l.questions.length!==12)throw new Error(`[${p.subject}] ${l.title}: 12 questions attendues`);
      const le=await getLesson(ch.data.id,comp.id,l,li+1,p.source); if(le.created)stats.lessons++;
      const groups=[{title:`${l.title} — notions essentielles`,difficulty:"easy" as const,score:30,start:0,end:4,instructions:"Maîtrise les notions essentielles."},{title:`${l.title} — application`,difficulty:"medium" as const,score:55,start:4,end:8,instructions:"Applique la notion à une situation nouvelle."},{title:`${l.title} — raisonnement`,difficulty:"hard" as const,score:75,start:8,end:12,instructions:"Analyse, justifie et vérifie ton raisonnement."}];
      for(const g of groups){const ex=await getExercise(le.data.id,comp.id,g.title,g.instructions,g.difficulty,g.score);if(ex.created)stats.exercises++;for(let qi=g.start;qi<g.end;qi++){const rawQuestion=l.questions[qi];if(!rawQuestion)throw new Error(`[${p.subject}] ${l.title}: question ${qi+1} absente`);const r=await addQuestion(ex.data.id,comp.id,ch.data.id,toQuestion(rawQuestion,qi));if(r.created)stats.questions++;else if(r.optionsChanged)stats.updatedQuestions++;}}
    }
  }
  return stats;
}

async function main(){
  console.log("==============================================");console.log(" IMPORT LOT A — 3e — MATHÉMATIQUES + SVT");console.log("==============================================");console.log(`Statut : ${STATUS}`);
  auditLocal();
  const cycle=await getCycle(); const level=await getLevel(cycle.id); if(level.code!=="3e")throw new Error(`Niveau inattendu: ${level.code}`); console.log(`Niveau : ${level.name}`);
  const totals={chapters:0,lessons:0,exercises:0,questions:0,updatedQuestions:0};
  for(const p of programs){const s=await runProgram(level.id,p);for(const k of Object.keys(totals) as (keyof typeof totals)[])totals[k]+=s[k];console.log(`\n=== ${p.subject.toUpperCase()} 3e ===`);console.log(s);}
  console.log("\n==============================================");console.log("IMPORT LOT A 3e TERMINÉ");console.log("==============================================");console.log(totals);console.log(STATUS==="review"?"Contenu en review par défaut.":"Contenu publié car EDTECH_PUBLISH_ENRICHMENT=true.");
}
main().catch(e=>{console.error("❌ Import Lot A 3e échoué");console.error(e);process.exit(1);});
