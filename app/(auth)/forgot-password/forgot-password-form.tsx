"use client";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction, verifyPhoneRecoveryAction, type AuthActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [state, formAction] = useFormState<AuthActionState, FormData>(forgotPasswordAction, null);
  const [verifyState, verifyAction] = useFormState<AuthActionState, FormData>(verifyPhoneRecoveryAction, null);
  const phoneStep = state?.next === "phone" && !!state.phone;
  useEffect(() => { if (state?.success && !phoneStep) setIdentifier(""); }, [state?.success, phoneStep]);
  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        {state?.error && <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
        {state?.success && !phoneStep && <div role="status" className="space-y-2 rounded-md bg-success/10 px-3 py-3 text-sm text-success"><p>{state.success}</p><p className="text-xs opacity-80">Vérifie aussi le dossier des spams.</p></div>}
        <div>
          <Label htmlFor="identifier">Email ou téléphone</Label>
          <Input id="identifier" name="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="email@example.com ou +221 77 123 45 67" required autoComplete="email" error={state?.fieldErrors?.identifier} />
        </div>
        <SubmitButton>Envoyer / continuer</SubmitButton>
      </form>

      {phoneStep && (
        <form action={verifyAction} className="space-y-4 rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">{state?.success}</p>
          {verifyState?.error && <p role="alert" className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{verifyState.error}</p>}
          <input type="hidden" name="phone" value={state.phone} />
          <div>
            <Label htmlFor="token">Code SMS</Label>
            <Input id="token" name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required />
          </div>
          <SubmitButton>Vérifier le code</SubmitButton>
        </form>
      )}

      <p className="text-center text-sm"><Link href="/login" className="font-medium text-primary hover:underline">← Retour à la connexion</Link></p>
    </div>
  );
}
