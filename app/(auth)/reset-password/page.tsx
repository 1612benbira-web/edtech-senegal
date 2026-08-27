import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
export const metadata: Metadata = { title: "Nouveau mot de passe" };
export default function ResetPasswordPage() { return <div className="mx-auto max-w-md"><h1 className="text-xl font-bold">Créer un nouveau mot de passe</h1><p className="mt-1 mb-6 text-sm text-muted-foreground">Choisis un nouveau mot de passe d'au moins 8 caractères.</p><ResetPasswordForm /></div>; }
