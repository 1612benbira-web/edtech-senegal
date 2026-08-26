import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeAuthenticatedClient, makeServiceRoleClient } from "@/lib/test-utils/supabase-mocks";

// requireAdmin() n'est PAS mocké : on exécute sa vraie logique
// (auth.getUser + lecture de profiles.role) via un client Supabase
// factice, pour vérifier que la garde admin fonctionne réellement,
// pas seulement qu'elle est appelée.
const { createClientMock, createServiceRoleClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  createServiceRoleClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  createServiceRoleClient: createServiceRoleClientMock,
}));

const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

function formDataWith(studentId: string) {
  const fd = new FormData();
  fd.set("studentId", studentId);
  return fd;
}

describe("forceLogoutStudentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejette un utilisateur non-admin (NotAdminError) sans appeler le service_role", async () => {
    createClientMock.mockResolvedValue(
      makeAuthenticatedClient({ userId: "student-1", profileResult: { data: { role: "student" }, error: null } })
    );
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    await expect(forceLogoutStudentAction(null, formDataWith("student-2"))).rejects.toThrow(
      "réservée aux administrateurs"
    );
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("rejette un visiteur non connecté", async () => {
    createClientMock.mockResolvedValue(makeAuthenticatedClient({ userId: null }));
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    await expect(forceLogoutStudentAction(null, formDataWith("student-2"))).rejects.toThrow(
      "réservée aux administrateurs"
    );
  });

  it("refuse un studentId manquant", async () => {
    createClientMock.mockResolvedValue(
      makeAuthenticatedClient({ userId: "admin-1", profileResult: { data: { role: "admin" }, error: null } })
    );
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    const result = await forceLogoutStudentAction(null, new FormData());
    expect(result?.error).toBeTruthy();
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("empêche un admin de se déconnecter lui-même via cet écran", async () => {
    createClientMock.mockResolvedValue(
      makeAuthenticatedClient({ userId: "admin-1", profileResult: { data: { role: "admin" }, error: null } })
    );
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    const result = await forceLogoutStudentAction(null, formDataWith("admin-1"));
    expect(result?.error).toBeTruthy();
    expect(createServiceRoleClientMock).not.toHaveBeenCalled();
  });

  it("renvoie une erreur si la fonction RPC échoue", async () => {
    createClientMock.mockResolvedValue(
      makeAuthenticatedClient({ userId: "admin-1", profileResult: { data: { role: "admin" }, error: null } })
    );
    createServiceRoleClientMock.mockReturnValue(makeServiceRoleClient({ rpcError: { message: "boom" } }));
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    const result = await forceLogoutStudentAction(null, formDataWith("student-2"));
    expect(result?.error).toBeTruthy();
  });

  it("appelle admin_force_logout_user avec le bon id et confirme le succès", async () => {
    createClientMock.mockResolvedValue(
      makeAuthenticatedClient({ userId: "admin-1", profileResult: { data: { role: "admin" }, error: null } })
    );
    const serviceClient = makeServiceRoleClient();
    createServiceRoleClientMock.mockReturnValue(serviceClient);
    const { forceLogoutStudentAction } = await import("@/app/admin/students/actions");

    const result = await forceLogoutStudentAction(null, formDataWith("student-2"));

    expect(serviceClient.rpc).toHaveBeenCalledWith("admin_force_logout_user", {
      target_user_id: "student-2",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/students");
    expect(result?.success).toBeTruthy();
  });
});
