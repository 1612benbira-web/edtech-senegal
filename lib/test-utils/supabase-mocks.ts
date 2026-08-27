import { vi } from "vitest";

/**
 * Stubs légers pour tester la LOGIQUE des Server Actions (validation,
 * enchaînement d'appels, gestion d'erreurs) sans base de données réelle.
 *
 * ⚠️ Limite assumée : ceci ne remplace pas un test d'intégration contre un
 * vrai projet Supabase. Ça ne vérifie ni les policies RLS, ni le
 * comportement réel de `auth.admin.deleteUser` / de la fonction SQL
 * `admin_force_logout_user`, ni les contraintes de clé étrangère en
 * cascade. Ce que ça vérifie : que le code appelle les bonnes méthodes,
 * avec les bons arguments, dans le bon ordre, et réagit correctement aux
 * cas d'erreur — la partie testable sans dépendance externe.
 */

/** Chaînable façon PostgREST : chaque méthode de filtre renvoie `this`,
 * et l'objet est lui-même "thenable" pour supporter `await query`. */
export function makeQueryChain(result: { data: unknown; error: unknown }) {
  const chain: any = {
    select: vi.fn(() => chain),
    update: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    is: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

export function makeAuthenticatedClient(options: {
  userId?: string | null;
  profileResult?: { data: unknown; error: unknown };
  signOutError?: unknown;
} = {}) {
  const { userId = "user-1", profileResult = { data: null, error: null }, signOutError = null } = options;

  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: userId ? { id: userId } : null },
        })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: signOutError })),
    },
    from: vi.fn(() => makeQueryChain(profileResult)),
  };
}

export function makeServiceRoleClient(options: {
  deleteUserError?: unknown;
  rpcError?: unknown;
} = {}) {
  const { deleteUserError = null, rpcError = null } = options;

  return {
    auth: {
      admin: {
        deleteUser: vi.fn(() => Promise.resolve({ error: deleteUserError })),
      },
    },
    rpc: vi.fn(() => Promise.resolve({ error: rpcError })),
  };
}
