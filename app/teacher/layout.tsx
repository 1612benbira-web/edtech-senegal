import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Dumbbell, MessageSquare, LogOut } from "lucide-react";
import { getCurrentSchool } from "@/lib/services/schoolService";
import { logoutAction } from "../(auth)/actions";

// Espace enseignant (Phase 25). Un compte enseignant reste rattaché à
// UNE école (même hypothèse que getCurrentSchool, cf. schoolService.ts) :
// pas besoin d'un [id] dans l'URL comme pour /admin/schools/[id], qui
// gère plusieurs écoles à la fois pour le super_admin.
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const currentSchool = await getCurrentSchool();

  // Ni super_admin ni school_admin n'ont accès à cet espace : un
  // enseignant est une personne précise, désignée (cf. requireTeacherAccess).
  if (!currentSchool || currentSchool.role !== "teacher") {
    redirect("/dashboard");
  }

  const tabs = [
    { href: "/teacher", label: "Aperçu", icon: GraduationCap },
    { href: "/teacher/exercises", label: "Mes exercices", icon: Dumbbell },
    { href: "/teacher/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Espace enseignant</p>
          <h1 className="text-lg font-bold text-foreground">{currentSchool.schoolName}</h1>
        </div>
        {/* Un enseignant n'a pas d'espace élève à "retourner voir" : depuis
            la restriction d'accès par rôle (app/(app)/layout.tsx), /dashboard
            le renvoie de toute façon ici. L'ancien lien "Retour à
            l'application" créait donc une boucle ; une vraie déconnexion
            manquait complètement (oubli lors de la création de cet espace). */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive hover:underline"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Se déconnecter
          </button>
        </form>
      </div>

      <nav className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}