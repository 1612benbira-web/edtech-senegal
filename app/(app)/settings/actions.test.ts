import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthenticatedClient, makeServiceRoleClient } from "@/lib/test-utils/supabase-mocks";

// On mocke uniquement les frontières (Supabase, navigation) — la logique
// de validation et d'enchaînement de deleteAccountAction elle-même
// s'exécute normalement.
const { createClientMock, createServiceRoleClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createServiceRoleClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  createServiceRoleClient: createServiceRoleClientMock,
}));

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

function formDataWith(confirmation: string) {
  const fd = new FormData();
  fd.set("confirmation", confirmation);
  return fd;
}

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse sans appeler Supabase si la confirmation est incorrecte", async () => {
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");
    const result = await deleteAccountAction(null, formDataWith("supprimer")); // mauvaise casse

    expect(result).toEqual({ error: expect.stringContaining("SUPPRIMER") });
    expect(createClientMock).not.toHaveBeenCalled();
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("refuse un champ de confirmation vide", async () => {
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");
    const result = await deleteAccountAction(null, new FormData());
    expect(result?.error).toBeTruthy();
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("redirige vers /login si aucune session active", async () => {
    createClientMock.mockResolvedValue(makeAuthenticatedClient({ userId: null }));
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");

    await expect(deleteAccountAction(null, formDataWith("SUPPRIMER"))).rejects.toThrow(
      "REDIRECT:/login"
    );
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("renvoie une erreur explicite si SUPABASE_SERVICE_ROLE_KEY est absente", async () => {
    createClientMock.mockResolvedValue(makeAuthenticatedClient({ userId: "user-1" }));
    createServiceRoleClientMock.mockImplementation(() => {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
    });
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");

    const result = await deleteAccountAction(null, formDataWith("SUPPRIMER"));
    expect(result?.error).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("renvoie une erreur si auth.admin.deleteUser échoue, sans rediriger", async () => {
    createClientMock.mockResolvedValue(makeAuthenticatedClient({ userId: "user-1" }));
    createServiceRoleClientMock.mockReturnValue(
      makeServiceRoleClient({ deleteUserError: { message: "boom" } })
    );
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");

    const result = await deleteAccountAction(null, formDataWith("SUPPRIMER"));
    expect(result?.error).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("supprime l'utilisateur exact, se déconnecte localement puis redirige vers /login?deleted=success", async () => {
    const authClient = makeAuthenticatedClient({ userId: "user-42" });
    const serviceClient = makeServiceRoleClient();
    createClientMock.mockResolvedValue(authClient);
    createServiceRoleClientMock.mockReturnValue(serviceClient);
    const { deleteAccountAction } = await import("@/app/(app)/settings/actions");

    await expect(deleteAccountAction(null, formDataWith("SUPPRIMER"))).rejects.toThrow(
      "REDIRECT:/login?deleted=success"
    );

    expect(serviceClient.auth.admin.deleteUser).toHaveBeenCalledWith("user-42");
    expect(authClient.auth.signOut).toHaveBeenCalled();
  });
});
