"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/schemas";
import { getSchoolByCode } from "@/lib/services/schoolService";
import { LIMITS, enforce, getClientIp, resetRateLimit, tooManyMessage } from "@/lib/security/rate-limit";

export type AuthActionState = { error?: string; success?: string; next?: "phone"; phone?: string; fieldErrors?: Record<string, string> } | null;

function normalizePhone(value: string) {
  const digits = value.replace(/[^0-9+]/g, "");
  if (/^7[05678]\d{7}$/.test(digits)) return `+221${digits}`;
  if (/^2217[05678]\d{7}$/.test(digits)) return `+${digits}`;
  if (/^\+2217[05678]\d{7}$/.test(digits)) return digits;
  return null;
}

type AdminClient = ReturnType<typeof createServiceRoleClient>;
type CreatedUser = { id: string; created_at?: string };

export async function registerAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const ip = await getClientIp();
  const limited = await enforce([{ scope: "register:ip", identifier: ip, rule: LIMITS.registerIp }]);
  if (!limited.allowed) return { error: tooManyMessage(limited.retryAfter) };

  const parsed = registerSchema.safeParse({ email: formData.get("email"), password: formData.get("password"), firstName: formData.get("firstName"), lastName: formData.get("lastName"), phone: formData.get("phone") || "", schoolCode: formData.get("schoolCode") || "" });
  if (!parsed.success) { const fieldErrors: Record<string,string> = {}; for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message; return { fieldErrors }; }
  const { email, password, firstName, lastName } = parsed.data;
  const rawPhone = String(parsed.data.phone || "").trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;
  if (rawPhone && !phone) return { fieldErrors: { phone: "Numéro invalide. Exemple : +221 77 123 45 67." } };

  // Le code établissement est optionnel : un compte peut être créé sans
  // école et rattaché plus tard. S'il est fourni, on le valide AVANT de créer
  // le compte pour ne jamais laisser un utilisateur "orphelin" d'une erreur de saisie.
  const rawSchoolCode = String(parsed.data.schoolCode || "").trim();
  if (rawSchoolCode) {
    const school = await getSchoolByCode(rawSchoolCode);
    if (!school || school.status !== "active") {
      return { fieldErrors: { schoolCode: "Code établissement introuvable ou inactif. Vérifie-le auprès de ton école, ou laisse ce champ vide." } };
    }
  }

  // Inscription ATOMIQUE du point de vue de l'élève : tout ou rien.
  // Le client service_role est indispensable pour finaliser le compte ; on le
  // crée AVANT d'ouvrir quoi que ce soit, pour échouer proprement s'il manque.
  let admin: AdminClient;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    console.error("[register] service_role indisponible:", (e as Error).message);
    return { error: "Inscription momentanément indisponible. Réessaie plus tard." };
  }

  // Contrôle anticipé du téléphone (message clair avant de créer le compte).
  // La contrainte d'unicité en base reste l'arbitre en cas de course.
  if (phone) {
    const { data: taken } = await admin.from("profiles").select("id").eq("phone", phone).maybeSingle();
    if (taken) return { fieldErrors: { phone: "Ce numéro est déjà utilisé par un autre compte." } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName } } });
  if (error) return { error: translateAuthError(error.message) };

  const user = data.user;
  // Avec la confirmation d'email activée, un email déjà inscrit renvoie un
  // faux utilisateur sans identités : on ne le touche surtout pas.
  if (!user || (user.identities && user.identities.length === 0)) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const failure = await finalizeRegistration(admin, user, { firstName, lastName, phone, schoolCode: rawSchoolCode });
  if (failure) {
    const cleaned = await rollbackRegistration(admin, supabase, user);
    if (!cleaned && !failure.fieldErrors) {
      return { error: "L'inscription est incomplète. Essaie de te connecter, ou contacte ton école si le problème continue." };
    }
    return failure;
  }

  redirect("/dashboard");
}

/** Termine le compte : téléphone Auth, puis profil + école en UNE transaction SQL. */
async function finalizeRegistration(
  admin: AdminClient,
  user: CreatedUser,
  d: { firstName: string; lastName: string; phone: string | null; schoolCode: string }
): Promise<NonNullable<AuthActionState> | null> {
  if (d.phone) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { phone: d.phone });
    if (error) {
      console.error("[register] association du téléphone impossible:", error.message);
      return { fieldErrors: { phone: "Ce numéro n'a pas pu être associé au compte. Vérifie-le, ou laisse le champ vide." } };
    }
  }

  const { error } = await admin.rpc("complete_registration", {
    p_user_id: user.id,
    p_first_name: d.firstName,
    p_last_name: d.lastName,
    p_phone: d.phone ?? "",
    p_school_code: d.schoolCode,
  });
  if (!error) return null;

  const message = error.message ?? "";
  if (message.includes("PHONE_TAKEN")) return { fieldErrors: { phone: "Ce numéro est déjà utilisé par un autre compte." } };
  if (message.includes("SCHOOL_NOT_FOUND")) {
    return { fieldErrors: { schoolCode: "Code établissement introuvable ou inactif. Vérifie-le auprès de ton école, ou laisse ce champ vide." } };
  }
  console.error("[register] finalisation impossible:", message);
  return { error: "L'inscription n'a pas pu être finalisée. Aucun compte n'a été créé : réessaie dans un instant." };
}

/**
 * Annule un compte créé quelques secondes plus tôt par CETTE requête.
 * Garde-fou : on ne supprime jamais un compte de plus de 5 minutes.
 * La suppression cascade sur le profil et les rattachements.
 */
async function rollbackRegistration(
  admin: AdminClient,
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: CreatedUser
): Promise<boolean> {
  let cleaned = false;
  const ageMs = Date.now() - Date.parse(user.created_at ?? "");
  if (Number.isFinite(ageMs) && ageMs < 5 * 60 * 1000) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) console.error("[register] ANNULATION ÉCHOUÉE, compte à nettoyer à la main:", user.id, error.message);
    else cleaned = true;
  } else {
    console.error("[register] annulation refusée (compte trop ancien):", user.id);
  }
  try { await supabase.auth.signOut({ scope: "local" }); } catch { /* session déjà invalide */ }
  return cleaned;
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

  const ip = await getClientIp();
  const accountKey = `${parsed.data.email}|${ip ?? "?"}`;
  const limited = await enforce([
    { scope: "login:ip", identifier: ip, rule: LIMITS.loginIp },
    { scope: "login:account", identifier: accountKey, rule: LIMITS.loginAccount },
  ]);
  if (!limited.allowed) return { error: tooManyMessage(limited.retryAfter) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: translateAuthError(error.message) };
  await resetRateLimit("login:account", accountKey);

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

  // Les compteurs s'appliquent AVANT toute recherche de compte et que le
  // compte existe ou non : la limite elle-même ne révèle donc rien.
  const ip = await getClientIp();
  const limited = await enforce([
    { scope: "recovery:ip", identifier: ip, rule: LIMITS.recoveryIp },
    { scope: "recovery:target", identifier, rule: LIMITS.recoveryTarget },
  ]);
  if (!limited.allowed) return { error: tooManyMessage(limited.retryAfter) };

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

  // Pas de listUsers() : (1) il ne passait pas l'échelle (1000 comptes max) et
  // (2) la réponse différait selon l'existence du compte. On demande l'envoi
  // directement (shouldCreateUser: false) et on répond TOUJOURS de la même
  // façon, que le numéro existe ou non. Les échecs du fournisseur SMS sont
  // journalisés côté serveur (sans le numéro) au lieu d'être montrés.
  const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });
  if (error) console.error("[forgot-password] envoi SMS non effectué:", error.code ?? error.status ?? "inconnu");
  return {
    success: "Si un compte correspond à ce numéro, un code a été envoyé par SMS.",
    next: "phone",
    phone,
  };
}

export async function verifyPhoneRecoveryAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const phone = normalizePhone(String(formData.get("phone") || ""));
  const token = String(formData.get("token") || "").trim();
  if (!phone || !/^\d{6}$/.test(token)) return { error: "Numéro ou code invalide." };

  // Un code à 6 chiffres se devine par force brute : on plafonne les essais.
  const ip = await getClientIp();
  const limited = await enforce([
    { scope: "otp:target", identifier: phone, rule: LIMITS.otpVerifyTarget },
    { scope: "otp:ip", identifier: ip, rule: LIMITS.otpVerifyIp },
  ]);
  if (!limited.allowed) return { error: tooManyMessage(limited.retryAfter) };

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
