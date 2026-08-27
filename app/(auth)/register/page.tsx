import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <>
      <h2 className="mb-6 text-lg font-semibold text-foreground">Créer un compte</h2>
      <RegisterForm />
    </>
  );
}
