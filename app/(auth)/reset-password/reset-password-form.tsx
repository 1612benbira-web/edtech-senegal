"use client";

import { useState, useActionState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { resetPasswordAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthActionState, FormData>(resetPasswordAction, null);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const strength = passwordStrength(password);
  const strengthLabel = strength <= 2 ? "Faible" : strength === 3 ? "Moyen" : strength === 4 ? "Bon" : "Excellent";

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
      <div>
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <div className="relative mt-1">
          <Input id="password" name="password" type={visible ? "text" : "password"} minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={state?.fieldErrors?.password} className="pr-11" />
          <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        {password && <div className="mt-2"><div className="flex gap-1" aria-label={`Robustesse : ${strengthLabel}`}>{[1,2,3,4,5].map((level) => <span key={level} className={`h-1.5 flex-1 rounded-full ${level <= strength ? "bg-primary" : "bg-muted"}`} />)}</div><p className="mt-1 text-xs text-muted-foreground">{strengthLabel} · 8 caractères minimum, avec idéalement majuscule, chiffre et symbole.</p></div>}
        <FieldError id="password-error" message={state?.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input id="confirmPassword" name="confirmPassword" type={visible ? "text" : "password"} minLength={8} required autoComplete="new-password" error={state?.fieldErrors?.confirmPassword} />
        <FieldError id="confirmPassword-error" message={state?.fieldErrors?.confirmPassword} />
      </div>
      <SubmitButton>Modifier mon mot de passe</SubmitButton>
    </form>
  );
}
