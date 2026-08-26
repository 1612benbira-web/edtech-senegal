import { Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateDailyQuizConfigAction } from "../daily-quiz-actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";

export default async function DailyQuizConfigPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("daily_quiz_config").select("*").eq("id", 1).single();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Settings2}
        title="Configuration du quiz du jour"
        description="Contrôle combien de questions composent le quiz quotidien de chaque élève, et comment elles se répartissent entre notions récentes, révision et défi."
      />

      <AdminSection title="Paramètres" contentClassName="max-w-md">
        <AdminForm
          action={updateDailyQuizConfigAction}
          submitLabel="Enregistrer"
          fields={[
            {
              name: "questionsCount",
              label: "Nombre total de questions",
              type: "number",
              defaultValue: String(config?.questions_count ?? 8),
            },
            {
              name: "ratioRecent",
              label: "Questions sur notions récentes",
              type: "number",
              defaultValue: String(config?.ratio_recent ?? 5),
            },
            {
              name: "ratioReview",
              label: "Questions de révision",
              type: "number",
              defaultValue: String(config?.ratio_review ?? 2),
            },
            {
              name: "ratioChallenge",
              label: "Questions défi (difficulté supérieure)",
              type: "number",
              defaultValue: String(config?.ratio_challenge ?? 1),
            },
            {
              name: "excludeRecentDays",
              label: "Éviter les questions vues dans les N derniers jours",
              type: "number",
              defaultValue: String(config?.exclude_recent_days ?? 3),
            },
          ]}
        />
      </AdminSection>
    </div>
  );
}
