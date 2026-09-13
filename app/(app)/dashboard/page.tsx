import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, Flame, Award, Target, BookOpen, CheckCircle2, ArrowRight, Trophy, ChevronRight, Zap, Medal, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { startReviewQuizAction, startDailyQuizAction } from "@/app/(app)/quiz/actions";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";
import { getStreak, getEarnedBadges } from "@/lib/queries/gamification";
import { getMyProgramme } from "@/lib/queries/programme";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { ProgramCard } from "@/components/curriculum/program-card";
import { AddProgramModal } from "@/components/curriculum/add-program-modal";
import { Badge } from "@/components/ui/badge";
import { getLevelLeaderboard, getMyLevelRank } from "@/lib/queries/leaderboard";
import { getTimeBasedGreeting } from "@/lib/utils/timezone";
export const metadata: Metadata = { title: "Tableau de bord" };

const rankMedals = ["🥇", "🥈", "🥉"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer le profil de base séparément des relations scolaires.
  // Cela évite qu'une relation PostgREST manquante/erronée fasse retourner
  // `profile = null` et déclenche une boucle /dashboard <-> /onboarding.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, xp_total, level_id, series_id, timezone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Erreur lors de la lecture du profil élève:", profileError.message);
  }

  if (!profile) {
    redirect("/onboarding");
  }

  if (!profile.level_id) {
    redirect("/onboarding");
  }

  // Les noms du niveau et de la série sont chargés séparément afin que
  // l'affichage du Dashboard ne dépende pas d'une jointure PostgREST.
  const [{ data: schoolLevel }, { data: schoolSeries }] = await Promise.all([
    supabase.from("school_levels").select("name").eq("id", profile.level_id).maybeSingle(),
    profile.series_id
      ? supabase.from("school_series").select("name").eq("id", profile.series_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const profileWithSchool = {
    ...profile,
    school_levels: schoolLevel,
    school_series: schoolSeries,
  };

  // "Bonjour"/"Bonsoir" selon l'heure du fuseau de l'élève (Africa/Dakar par
  // défaut, même logique que le quiz du jour — voir gamificationService.ts).
  const greeting = getTimeBasedGreeting(profile.timezone ?? "Africa/Dakar");

  const [{ data: availableLevelSubjects }, programmes, streak, earnedBadges, leaderboard, myRank, currentSchool] = await Promise.all([
    supabase.from("level_subjects").select("subject_id, series_id, is_optional, subjects(id, name, icon)").eq("level_id", profile.level_id),
    getMyProgramme(user.id, profile.level_id, profile.series_id),
    getStreak(user.id),
    getEarnedBadges(user.id),
    getLevelLeaderboard(profile.level_id),
    getMyLevelRank(profile.level_id),
    getCurrentSchool(),
  ]);

  const enrolledSubjectIds = new Set(programmes.map((p) => p.subjectId));
  const availableSubjects = (availableLevelSubjects ?? []).filter((item: any) => (item.series_id === null || item.series_id === profile.series_id) && !enrolledSubjectIds.has(item.subject_id));
  const totalLessonsDone = programmes.reduce((sum, p) => sum + p.completedLessons, 0);
  // Avant : `programmes.find((program) => program.nextLessonId)` prenait la
  // PREMIÈRE matière de la liste (ordre d'inscription de l'élève, pas
  // pertinent) qui avait une leçon en attente — n'importe quelle matière
  // jamais commencée en avait toujours une, donc le bouton "Continuer
  // l'apprentissage" pouvait renvoyer vers une matière que l'élève n'avait
  // jamais ouverte au lieu de celle où il travaillait réellement en
  // dernier. On compare maintenant `lastActivityAt` (dernière activité
  // réelle enregistrée) entre toutes les matières ayant une suite, et on
  // ne retombe sur la première de la liste que si l'élève n'a encore
  // AUCUNE activité nulle part (première visite).
  const resumableProgrammes = programmes.filter((program) => program.nextLessonId);
  const mostRecentProgramme =
    resumableProgrammes
      .filter((program) => program.lastActivityAt)
      .sort(
        (a, b) => new Date(b.lastActivityAt!).getTime() - new Date(a.lastActivityAt!).getTime()
      )[0] ?? resumableProgrammes[0];
  const nextLesson = mostRecentProgramme?.nextLessonId ?? null;
  const xp = profile.xp_total ?? 0;
  const levelName = profileWithSchool.school_levels?.name ?? "";
  const levelNumber = levelName.match(/\d+/)?.[0] ?? "—";
  const xpProgress = Math.min(99, xp % 1000 === 0 && xp > 0 ? 100 : xp % 1000 / 10);

  return (
    <div className="space-y-6 pb-8 sm:space-y-7">
      <section className="relative overflow-hidden rounded-[30px] bg-[#063f2d] px-6 py-7 text-white shadow-[0_24px_60px_-32px_rgba(4,76,53,.75)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-emerald-300/10 bg-emerald-300/5 blur-2xl" />
        <div className="pointer-events-none absolute bottom-[-90px] left-1/3 h-48 w-96 rotate-[-12deg] rounded-[50%] border border-emerald-200/10" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100"><Sparkles className="h-3 w-3" /> Espace élève</span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{greeting}, {profile.first_name ?? ""} ! 👋</h1>
            {currentSchool && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-200/80">
                🏫 {currentSchool.schoolName}
              </p>
            )}
            <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-50/70">Continue ton apprentissage là où tu t&apos;es arrêté et garde ton rythme.</p>
            {nextLesson && <Link href={`/lesson/${nextLesson}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#064c35] transition hover:bg-emerald-50 dark:bg-white dark:text-[#064c35]"><span>Continuer l&apos;apprentissage</span><ArrowRight className="h-4 w-4" /></Link>}
          </div>
          <div className="flex min-w-[270px] items-center gap-5 rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[5px] border-amber-300/90 bg-[#063f2d] shadow-[0_0_35px_-12px_rgba(245,197,66,.9)]"><span className="text-center"><span className="block text-[9px] font-bold uppercase tracking-widest text-amber-200">Niveau</span><span className="block font-display text-3xl font-bold">{levelNumber}</span></span></div>
            <div className="min-w-0 flex-1"><div className="flex items-end justify-between gap-3"><span className="text-sm font-semibold text-white/80">{xp.toLocaleString("fr-FR")} XP</span><span className="text-xs font-bold text-emerald-100">{Math.round(xpProgress)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${xpProgress}%` }} /></div><p className="mt-2 text-[11px] text-white/50">Progression XP vers le prochain niveau</p></div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Programmes", value: programmes.length, note: "En cours", icon: BookOpen, iconClass: "bg-emerald-50 text-emerald-600" },
          { label: "Leçons terminées", value: totalLessonsDone, note: "Continue comme ça !", icon: CheckCircle2, iconClass: "bg-blue-50 text-blue-600" },
          { label: "Série en cours", value: streak.current_streak > 0 ? `${streak.current_streak} j` : "—", note: "Belle régularité 🔥", icon: Flame, iconClass: "bg-violet-50 text-violet-600" },
          { label: "Points d'expérience", value: `${xp} XP`, note: "Garde le rythme !", icon: Star, iconClass: "bg-amber-50 text-amber-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-25px_rgba(15,23,42,.35)] sm:p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{item.label}</p><p className="mt-1 font-display text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{item.value}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconClass}`}><item.icon className="h-4 w-4" /></span></div>
            <p className="mt-2 text-[11px] text-slate-400">{item.note}</p>
          </div>
        ))}
      </section>


      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,.75fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-28px_rgba(15,23,42,.4)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-950"><BookOpen className="h-5 w-5 text-emerald-600" />Mes programmes</h2><p className="mt-1 text-sm text-slate-500">Retrouve tes matières et reprends là où tu t&apos;es arrêté.</p></div><div className="flex items-center gap-2"><AddProgramModal availableSubjects={availableSubjects as any} /><Link href="/programme" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:inline-flex">Voir tout</Link></div></div>
          {programmes.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">Tu n&apos;as pas encore de matière dans ton programme.</div> : <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{programmes.map((program) => <ProgramCard key={program.subjectId} program={program} />)}</div>}
        </section>

        <div className="space-y-4">
          <section className="rounded-[26px] border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm"><Target className="h-5 w-5" /></span><div><h2 className="font-display text-lg font-bold text-slate-950">Quiz du jour</h2><p className="mt-1 text-xs leading-5 text-slate-500">Un quiz personnalisé t&apos;attend, basé sur ce que tu as appris.</p></div></div><StartQuizButton action={startDailyQuizAction} arg="" label="Faire le quiz du jour  →" /></section>
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500"><BookOpen className="h-5 w-5" /></span><div><h2 className="font-display text-lg font-bold text-slate-950">Quiz de révision</h2><p className="mt-1 text-xs leading-5 text-slate-500">Reviens sur les notions à consolider.</p></div></div><StartQuizButton action={startReviewQuizAction} arg="" label="Faire un quiz de révision  →" variant="secondary" /></section>
        </div>
      </div>

      <section className="rounded-[26px] border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Reprise intelligente</p>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-950">Continuer mes cours</h2>
            <p className="mt-1 text-sm text-slate-600">Retrouve le dernier chapitre et la dernière leçon réellement enregistrés pour chaque matière.</p>
          </div>
          <Link href="/continue" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#064c35] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#075a3f]">
            Reprendre mes cours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,.75fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-950"><Trophy className="h-5 w-5 text-amber-500" />Top 10 des élèves</h2><p className="mt-1 text-sm text-slate-500">Classement XP des élèves de ton niveau.</p></div>{myRank && myRank > 10 && <Badge variant="primary">Ton classement : #{myRank}</Badge>}</div><div className="mt-5 space-y-2">{leaderboard.length === 0 ? <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Le classement sera disponible dès que des élèves auront gagné de l&apos;XP.</div> : leaderboard.map((entry) => { const isMe = entry.profileId === user!.id; return <div key={entry.profileId} className={`flex items-center gap-3 rounded-2xl px-3 py-3.5 ${isMe ? "bg-emerald-50 ring-1 ring-emerald-100" : "bg-slate-50/70"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">{entry.rank <= 3 ? rankMedals[entry.rank - 1] : entry.rank}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064c35] text-[10px] font-bold text-white">{entry.firstName?.[0] ?? "E"}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{entry.firstName}{entry.lastNameInitial ? ` ${entry.lastNameInitial}` : ""}{isMe ? " · Toi" : ""}</span><span className="font-mono text-xs font-bold text-slate-900">{entry.xpTotal} XP</span><ChevronRight className="h-4 w-4 text-slate-300" /></div> })}</div></section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="flex items-center gap-2 font-display text-xl font-bold text-slate-950"><Medal className="h-5 w-5 text-emerald-600" />Mes badges</h2><p className="mt-1 text-sm text-slate-500">Tes récompenses pour tes progrès.</p></div>{earnedBadges.length > 0 ? <div className="mt-5 grid grid-cols-2 gap-3">{earnedBadges.slice(0, 6).map((b: any) => <div key={b.badges.code} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3" title={b.badges.description ?? undefined}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500"><Award className="h-5 w-5" /></div><p className="mt-2 truncate text-xs font-bold text-slate-900">{b.badges.name}</p><p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{b.badges.description}</p></div>)}</div> : <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center"><Zap className="mx-auto h-6 w-6 text-amber-500" /><p className="mt-2 text-sm font-semibold text-slate-800">Tes premiers badges arrivent bientôt.</p><p className="mt-1 text-xs text-slate-500">Continue à apprendre pour débloquer des récompenses.</p></div>}</section>
      </div>
    </div>
  );
}
