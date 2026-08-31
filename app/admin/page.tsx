import { redirect } from "next/navigation";
import { Layers, GitBranch, BookMarked, FileText, Users, ClipboardList, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAnyAdminAccess } from "@/lib/services/adminGuard";

async function count(table: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  // Un school_admin n'a pas de vue globale : sa page d'accueil est
  // directement le tableau de bord de sa propre école.
  const access = await requireAnyAdminAccess();
  if (access.role === "school_admin") {
    redirect(`/admin/schools/${access.schoolId}`);
  }

  const [cycles, levels, series, subjects, curriculums, students, schools] = await Promise.all([
    count("school_cycles"),
    count("school_levels"),
    count("school_series"),
    count("subjects"),
    count("curriculums"),
    count("profiles"),
    count("schools"),
  ]);

  const stats = [
    { label: "Établissements", value: schools, icon: Building2 },
    { label: "Cycles", value: cycles, icon: Layers },
    { label: "Niveaux", value: levels, icon: GitBranch },
    { label: "Séries", value: series, icon: ClipboardList },
    { label: "Matières", value: subjects, icon: BookMarked },
    { label: "Programmes", value: curriculums, icon: FileText },
    { label: "Élèves", value: students, icon: Users },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-foreground">Vue d&apos;ensemble</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Aperçu global du contenu et des élèves de la plateforme.
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-sm"
          >
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <s.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
