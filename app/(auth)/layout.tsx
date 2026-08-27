import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Plateforme éducative
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apprendre selon le programme sénégalais.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
