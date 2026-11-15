"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateMockExam, getLevelInfo } from "@/lib/services/examService";
import { examRemainingSeconds, isBfemLevel } from "@/lib/algorithms/mockExam";

/**
 * Démarre une épreuve blanche dans une matière, ou reprend celle qui est
 * déjà en cours dans cette matière (une seule épreuve ouverte par matière :
 * le chronomètre tourne depuis le premier clic).
 */
export async function startMockExamAction(subjectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, level_id")
    .eq("id", user.id)
    .single();
  if (!profile?.level_id) redirect("/onboarding");

  const level = await getLevelInfo(profile.level_id);
  if (!isBfemLevel(level)) redirect("/bfem");

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
    redirect(`/bfem/${open.id}`);
  }

  const result = await generateMockExam(profile.id, subjectId, profile.level_id);
  if (!result.ok) {
    redirect(`/bfem?erreur=${result.reason}`);
  }
  redirect(`/bfem/${result.examId}`);
}
