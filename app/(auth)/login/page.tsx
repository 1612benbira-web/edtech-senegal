import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

const STATUS_MESSAGES: Record<string, string> = {
  loggedout: "Vous avez été déconnecté.",
  "force-logout": "Votre session a été fermée par un administrateur. Reconnecte-toi.",
  deleted: "Ton compte a bien été supprimé.",
  reset: "Ton mot de passe a été mis à jour. Connecte-toi avec le nouveau.",
  "reset-error": "La récupération a échoué. Demande un nouveau lien.",
};

export default async function LoginPage(
  props: {
    searchParams: Promise<{ loggedout?: string; "force-logout"?: string; deleted?: string; reset?: string; "reset-error"?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const statusKey = Object.keys(STATUS_MESSAGES).find(
    (key) => (searchParams as Record<string, string | undefined>)[key]
  );
  const message = statusKey ? STATUS_MESSAGES[statusKey] : null;

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold text-foreground">Connexion</h2>
      {message && (
        <div role="status" className="mb-4 rounded-lg bg-info/10 px-3 py-2 text-sm text-info">
          {message}
        </div>
      )}
      <LoginForm />
    </>
  );
}
