"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            error={state?.fieldErrors?.firstName}
          />
          <FieldError id="firstName-error" message={state?.fieldErrors?.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            error={state?.fieldErrors?.lastName}
          />
          <FieldError id="lastName-error" message={state?.fieldErrors?.lastName} />
        </div>
      </div>

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
        <Label htmlFor="phone">Téléphone (pour récupérer ton compte)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+221 77 123 45 67" error={state?.fieldErrors?.phone} />
        <FieldError id="phone-error" message={state?.fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="schoolCode">Code établissement (optionnel)</Label>
        <Input id="schoolCode" name="schoolCode" placeholder="EMD2026" error={state?.fieldErrors?.schoolCode} />
        <FieldError id="schoolCode-error" message={state?.fieldErrors?.schoolCode} />
        <p className="mt-1 text-xs text-muted-foreground">
          Ton école t&apos;a communiqué un code ? Renseigne-le pour accéder à ses programmes. Sinon, laisse ce champ vide.
        </p>
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={state?.fieldErrors?.password}
        />
        <FieldError id="password-error" message={state?.fieldErrors?.password} />
        <p className="mt-1 text-xs text-muted-foreground">8 caractères minimum.</p>
      </div>

      <SubmitButton>Créer mon compte</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
