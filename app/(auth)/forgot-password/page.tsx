import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  const errorMessage = searchParams.error === "recovery"
    ? "Le lien de récupération est expiré ou a déjà été utilisé. Demande un nouveau lien pour continuer."
    : searchParams.error === "missing-code"
      ? "Le lien de récupération est incomplet. Demande un nouveau lien pour continuer."
      : null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">Mot de passe oublié ?</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Entre ton email ou ton numéro de téléphone pour récupérer ton compte.</p>
      {errorMessage && <p role="alert" className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>}
      <ForgotPasswordForm />
    </div>
  );
}
