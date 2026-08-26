import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle, User, GraduationCap, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, daily_goal, school_levels(name), school_series(name)")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gère tes informations et ton compte.
        </p>
      </div>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="font-display font-semibold text-foreground">Profil</h2>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Nom</dt>
            <dd className="text-foreground">
              {profile?.first_name} {profile?.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="text-foreground">{profile?.email}</dd>
          </div>
          {profile?.phone && (
            <div>
              <dt className="text-xs text-muted-foreground">Téléphone</dt>
              <dd className="text-foreground">{profile.phone}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="font-display font-semibold text-foreground">Scolarité</h2>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Niveau</dt>
            <dd className="text-foreground">{(profile as any)?.school_levels?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Série</dt>
            <dd className="text-foreground">{(profile as any)?.school_series?.name ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <Bell className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="font-display font-semibold text-foreground">Objectif quotidien</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {profile?.daily_goal ?? 8} minutes par jour.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">🌗</span>
          <div>
            <h2 className="font-display font-semibold text-foreground">Apparence</h2>
            <p className="text-xs text-muted-foreground">Choisis le thème le plus confortable pour apprendre.</p>
          </div>
        </div>
        <ThemeToggle />
      </Card>

      <Card className="border-danger/30 bg-danger/5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-lg bg-danger/10 p-2 text-danger">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="font-display font-semibold text-danger">Zone dangereuse</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Cette action est irréversible. Toutes vos données, votre progression et vos programmes
          associés à ce compte seront supprimés.
        </p>
        <DeleteAccountDialog />
      </Card>
    </div>
  );
}
