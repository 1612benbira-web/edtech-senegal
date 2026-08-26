"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { loginAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, formAction] = useFormState<AuthActionState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state?.fieldErrors?.email}
        />
        <FieldError id="email-error" message={state?.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state?.fieldErrors?.password}
        />
        <FieldError id="password-error" message={state?.fieldErrors?.password} />
      </div>

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Mot de passe oublié ?</Link>
      </div>

      <SubmitButton>Se connecter</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
