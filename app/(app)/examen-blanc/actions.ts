"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateMockExam, getLevelInfo } from "@/lib/services/examService";
import { getMyProgramme } from "@/lib/queries/programme";
import { EXAM_HUB_PATH, examRemainingSeconds, getExamForLevel } from "@/lib/algorithms/mockExam";

/**
 * Démarre une épreuve blanche dans une matière (BFEM en 3e, Bac en
 * Terminale), ou reprend celle qui est déjà en cours dans cette matière :
 * une seule épreuve ouverte par matière, le chronomètre tourne depuis le
 * premier clic.
 */
export async function startMockExamAction(subjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, level_id, series_id")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const level = await getLevelInfo(profile.level_id);
  if (!getExamForLevel(level)) redirect(EXAM_HUB_PATH);

  const { data: openAttempts } = await supabase
    .from("quiz_attempts")
    .select("id, started_at, total_questions")
    .eq("profile_id", profile.id)
    .eq("type", "exam")
    .eq("subject_id", subjectId)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1);
  const open = openAttempts?.[0];
  if (open && examRemainingSeconds(open.started_at, open.total_questions ?? 0) > 0) {
    redirect(`${EXAM_HUB_PATH}/${open.id}`);
  }

  // Le programme est celui que l'élève suit dans « Mon programme » : celui de
  // son école s'il existe, sinon le national, et toujours celui de sa série
  // (en Terminale, les Maths S2 et L2 sont deux programmes différents).
  const programmes = await getMyProgramme(profile.id, profile.level_id, profile.series_id);
  const curriculumId = programmes.find((p) => p.subjectId === subjectId)?.curriculumId;
  if (!curriculumId) redirect(`${EXAM_HUB_PATH}?erreur=no_questions`);

  const result = await generateMockExam(profile.id, subjectId, curriculumId);
  if (!result.ok) {
    redirect(`${EXAM_HUB_PATH}?erreur=${result.reason}`);
  }
  redirect(`${EXAM_HUB_PATH}/${result.examId}`);
}
