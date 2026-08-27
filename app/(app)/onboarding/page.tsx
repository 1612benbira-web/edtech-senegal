
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
  title: "Configuration de ton profil",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: levels, error: levelsError } = await supabase
    .from("school_levels")
    .select("id, name, cycle_id")
    .order("name");

  if (levelsError) {
    throw new Error(
      "Impossible de récupérer les niveaux scolaires : " +
        levelsError.message
    );
  }

  const { data: series, error: seriesError } = await supabase
    .from("school_series")
    .select("id, name, level_id")
    .order("name");

  if (seriesError) {
    throw new Error(
      "Impossible de récupérer les séries : " +
        seriesError.message
    );
  }

  const { data: levelSubjects, error: levelSubjectsError } =
    await supabase
      .from("level_subjects")
      .select(`
        level_id,
        series_id,
        subject_id,
        subjects (
          id,
          name
        )
      `);

  if (levelSubjectsError) {
    throw new Error(
      "Impossible de récupérer les matières : " +
        levelSubjectsError.message
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, level_id, series_id")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error(
      "Impossible de récupérer le profil : " +
        profileError.message
    );
  }

  // L'onboarding reste accessible même si le profil est déjà configuré.
  // C'est volontaire : le Dashboard peut rediriger ici lorsqu'il ne parvient
  // pas à lire le profil (RLS/cache/session) et une redirection inverse ici
  // provoquerait une boucle /dashboard <-> /onboarding.

  const normalizedLevelSubjects = (levelSubjects ?? []).map(
    (item: any) => ({
      level_id: item.level_id,
      series_id: item.series_id,
      subject_id: item.subject_id,
      subjects: Array.isArray(item.subjects)
        ? item.subjects[0] ?? null
        : item.subjects,
    })
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#064c35] text-2xl shadow-lg">
            🇸🇳
          </div>

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Configure ton espace élève
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Quelques informations suffisent pour personnaliser ton
            apprentissage et te proposer les bons programmes scolaires.
          </p>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">

          <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-5 py-6 sm:px-8">
            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#064c35] text-white shadow-sm">
                🎓
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  Ton parcours scolaire
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Sélectionne ton niveau, ta série si nécessaire et les
                  matières que tu souhaites étudier.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5 sm:p-8">
            <OnboardingForm
              levels={levels ?? []}
              series={series ?? []}
              levelSubjects={normalizedLevelSubjects}
            />
          </div>

        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Tu pourras modifier ton parcours et tes matières plus tard depuis
          ton espace élève.
        </p>

      </div>
    </main>
  );
}