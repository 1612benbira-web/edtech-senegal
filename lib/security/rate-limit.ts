import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface RateLimitRule {
  /** Nombre maximum de requêtes dans la fenêtre. */
  max: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Secondes avant la fin de la fenêtre (0 si autorisé). */
  retryAfter: number;
}

/** Règles centralisées : un seul endroit à ajuster. */
export const LIMITS = {
  loginIp: { max: 30, windowSeconds: 15 * 60 },
  loginAccount: { max: 8, windowSeconds: 15 * 60 },
  registerIp: { max: 10, windowSeconds: 60 * 60 },
  recoveryIp: { max: 10, windowSeconds: 60 * 60 },
  recoveryTarget: { max: 5, windowSeconds: 60 * 60 },
  otpVerifyTarget: { max: 10, windowSeconds: 15 * 60 },
  otpVerifyIp: { max: 30, windowSeconds: 15 * 60 },
  searchUser: { max: 60, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitRule>;

/** Empreinte stable : aucune donnée personnelle en clair dans la table. */
export function fingerprint(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex").slice(0, 40);
}

/** IP du client. Sur Vercel, x-forwarded-for est positionné par la plateforme. */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || null;
}

/**
 * Incrémente le compteur `scope:identifier` et dit si la requête passe.
 * Échec ouvert : si la base de limitation est indisponible, on laisse passer
 * (et on journalise) plutôt que de bloquer toute la connexion du site.
 */
export async function rateLimit(
  scope: string,
  identifier: string,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: `${scope}:${fingerprint(identifier)}`,
      p_max: rule.max,
      p_window_seconds: rule.windowSeconds,
    });
    if (error || !data) {
      console.error("[rate-limit] indisponible, requête autorisée:", error?.message);
      return { allowed: true, retryAfter: 0 };
    }
    const row = data as { allowed: boolean; retry_after: number };
    return { allowed: row.allowed, retryAfter: row.allowed ? 0 : row.retry_after };
  } catch (e) {
    console.error("[rate-limit] erreur, requête autorisée:", (e as Error).message);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Remet un compteur à zéro (ex. après une connexion réussie). */
export async function resetRateLimit(scope: string, identifier: string): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    await admin.rpc("reset_rate_limit", { p_key: `${scope}:${fingerprint(identifier)}` });
  } catch {
    /* sans importance : la fenêtre expirera d'elle-même */
  }
}

/**
 * Applique plusieurs règles dans l'ordre et s'arrête à la première qui bloque.
 * Une IP inconnue (développement local, pas de proxy) saute les règles par IP.
 */
export async function enforce(
  checks: Array<{ scope: string; identifier: string | null; rule: RateLimitRule }>
): Promise<RateLimitResult> {
  for (const c of checks) {
    if (!c.identifier) continue;
    const r = await rateLimit(c.scope, c.identifier, c.rule);
    if (!r.allowed) return r;
  }
  return { allowed: true, retryAfter: 0 };
}

export function tooManyMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Trop de tentatives. Réessaie dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;
}
