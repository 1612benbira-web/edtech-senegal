import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Award, BookOpen, CheckCircle2, Flame, GraduationCap, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyProgramme } from "@/lib/queries/programme";
import { getStreak } from "@/lib/queries/gamification";
import { Card } from "@/components/ui/card";
import { formatNiveauLabel } from "@/lib/utils/niveau";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, xp_total, level_id, series_id, school_levels(name), school_series(name)")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const [programmes, streak] = await Promise.all([
    getMyProgramme(user.id, profile.level_id, profile.series_id),
    getStreak(user.id),
  ]);

  const totalLessons = programmes.reduce((n, p) => n + p.totalLessons, 0);
  const completedLessons = programmes.reduce((n, p) => n + p.completedLessons, 0);
  const totalChapters = programmes.reduce((n, p) => n + p.totalChapters, 0);
  const completedChapters = programmes.reduce((n, p) => n + p.chapters.filter((c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons).length, 0);
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const stats = [
    { label: "Progression globale", value: `${progress}%`, icon: Sparkles },
    { label: "Leçons terminées", value: `${completedLessons}/${totalLessons}`, icon: CheckCircle2 },
    { label: "Chapitres terminés", value: `${completedChapters}/${totalChapters}`, icon: BookOpen },
    { label: "XP", value: `${profile.xp_total ?? 0}`, icon: Award },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-primary-foreground">
            {(profile.first_name?.[0] ?? "É").toUpperCase()}{(profile.last_name?.[0] ?? "").toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Profil élève</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">{profile.first_name} {profile.last_name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              {(profile as any).school_levels?.name
                ? formatNiveauLabel((profile as any).school_levels.name, (profile as any).school_series?.name)
                : "Niveau non renseigné"}
            </p>
          </div>
          <div className="sm:ml-auto rounded-2xl bg-muted px-4 py-3 text-center">
            <Flame className="mx-auto h-5 w-5 text-orange-500" />
            <p className="mt-1 text-lg font-bold text-foreground">{streak.current_streak} j</p>
            <p className="text-[11px] text-muted-foreground">Série actuelle</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <stat.icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold text-foreground">Progression globale</h2><p className="mt-1 text-sm text-muted-foreground">Ta progression est calculée à partir des leçons réellement terminées.</p></div>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </Card>
    </div>
  );
}
