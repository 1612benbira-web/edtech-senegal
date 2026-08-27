"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/schemas";

export type AuthActionState = { error?: string; success?: string; next?: "phone"; phone?: string; fieldErrors?: Record<string, string> } | null;

function normalizePhone(value: string) {
  const digits = value.replace(/[^0-9+]/g, "");
  if (/^7[05678]\d{7}$/.test(digits)) return `+221${digits}`;
  if (/^2217[05678]\d{7}$/.test(digits)) return `+${digits}`;
  if (/^\+2217[05678]\d{7}$/.test(digits)) return digits;
  return null;
}

export async function registerAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), firstName: formData.get("firstName"), lastName: formData.get("lastName"), phone: formData.get("phone") || "" });
  if (!parsed.success) { const fieldErrors: Record<string,string> = {}; for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message; return { fieldErrors }; }
  const { email, password, firstName, lastName } = parsed.data;
  const rawPhone = String(parsed.data.phone || "").trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  if (rawPhone && !phone) return { fieldErrors: { phone: "Numéro invalide. Exemple : +221 77 123 45 67." } };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } });
  if (error) return { error: translateAuthError(error.message) };
  if (data.user) {
    await supabase.from("profiles").update({ first_name: firstName, last_name: lastName, phone }).eq("id", data.user.id);
    if (phone && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createServiceRoleClient();
      const { error: phoneError } = await admin.auth.admin.updateUserById(data.user.id, { phone });
      if (phoneError) return { error: "Le compte a été créé, mais le numéro de téléphone n'a pas pu être associé. Tu peux récupérer le compte par email." };
    }
  }
  redirect("/dashboard");
}

export async function loginAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: translateAuthError(error.message) };

  /*
   * Certains anciens comptes élèves peuvent exister dans Supabase Auth
   * sans ligne correspondante dans `profiles` (par exemple si le trigger
   * de création du profil a échoué lors de l'inscription).
   *
   * L'administrateur possède déjà un profil, ce qui explique le symptôme
   * "l'admin peut se connecter mais pas les élèves" lorsque le Dashboard
   * attend cette ligne. Après une authentification réussie, on répare donc
   * automatiquement le profil manquant côté serveur avec service_role.
   * Cela ne modifie jamais le rôle d'un utilisateur existant.
   */
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      try {
        const admin = createServiceRoleClient();
        const { error: profileError } = await admin
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              email: data.user.email ?? parsed.data.email,
              first_name: String(data.user.user_metadata?.first_name ?? "").trim() || null,
              last_name: String(data.user.user_metadata?.last_name ?? "").trim() || null,
            },
            { onConflict: "id" },
          );

        if (profileError) {
          console.error("Impossible de réparer le profil élève:", profileError.message);
          return { error: "Connexion réussie, mais ton profil n'a pas pu être initialisé. Réessaie dans un instant." };
        }
      } catch (profileRepairError) {
        console.error("Service role indisponible pour réparer le profil:", profileRepairError);
        return { error: "Connexion réussie, mais la configuration de ton profil est incomplète. Vérifie la configuration Supabase puis réessaie." };
      }
    }
  }

  const rawRedirectTo = String(formData.get("redirectTo") ?? "");
  const redirectTo = rawRedirectTo.startsWith("/") && !rawRedirectTo.startsWith("//") && !rawRedirectTo.includes("\\")
    ? rawRedirectTo
    : "/dashboard";

  redirect(redirectTo);
}

export async function forgotPasswordAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const identifier = String(formData.get("identifier") || "").trim();
  if (!identifier) return { fieldErrors: { identifier: "Email ou numéro de téléphone requis." } };
  const supabase = await createClient();
  if (identifier.includes("@")) {
    const siteUrl = await getSiteUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
      redirectTo: `${siteUrl}/auth/callback?next=%2Freset-password`,
    });
    if (error) return { error: "Impossible d'envoyer le lien. Vérifie l'adresse puis réessaie." };
    return { success: "Si un compte correspond à cet email, un lien de récupération a été envoyé." };
  }
  const phone = normalizePhone(identifier);
  if (!phone) return { fieldErrors: { identifier: "Email ou numéro invalide. Exemple : +221 77 123 45 67." } };
  try {
    const admin = createServiceRoleClient();
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const exists = users.users.some((u) => u.phone === phone);
    if (!exists) return { success: "Si un compte correspond à ce numéro, un code SMS a été envoyé." };
  } catch {
    return { error: "La récupération par téléphone nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local." };
  }
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });
  if (error) return { error: "Impossible d'envoyer le code SMS. Vérifie que Phone Auth et ton fournisseur SMS sont activés dans Supabase." };
  return { success: "Un code de récupération a été envoyé par SMS.", next: "phone", phone };
}

export async function verifyPhoneRecoveryAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const token = String(formData.get("token") || "").trim();
  if (!phone || !/^\d{6}$/.test(token)) return { error: "Numéro ou code invalide." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (error) return { error: "Code incorrect ou expiré." };
  redirect(`/reset-password?method=phone`);
}

export async function resetPasswordAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  if (password.length < 8) return { fieldErrors: { password: "8 caractères minimum." } };
  if (password !== confirm) return { fieldErrors: { confirmPassword: "Les mots de passe ne correspondent pas." } };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "La session de récupération est invalide ou expirée." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Impossible de modifier le mot de passe. Réessaie." };
  await supabase.auth.signOut();
  redirect("/login?reset=success");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?loggedout=1");
}

async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "http";
  if (forwardedHost) return `${(forwardedProto.split(",")[0] ?? "http").trim()}://${forwardedHost}`;
  return "http://localhost:3000";
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (message.includes("User already registered")) return "Un compte existe déjà avec cet email.";
  if (message.includes("Password should be at least")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (message.includes("Email not confirmed")) return "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et les spams).";
  return "Une erreur est survenue. Réessaie dans un instant.";
}
