import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyProgramme } from "@/lib/queries/programme";
import { ProgrammeAccordion } from "@/components/curriculum/programme-accordion";

export const metadata = { title: "Mon programme" };

export default async function ProgrammePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("level_id, series_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.level_id) redirect("/onboarding");

  const programmes = await getMyProgramme(user!.id, profile.level_id);

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-foreground">Mon programme</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Toutes tes matières, chapitres et leçons du programme sénégalais correspondant à ton
        niveau.
      </p>

      {programmes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Tu n'as pas encore choisi de matière.{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              Ajoute un programme depuis ton tableau de bord
            </Link>
            .
          </p>
        </div>
      ) : (
        <ProgrammeAccordion programmes={programmes} />
      )}
    </div>
  );
}
