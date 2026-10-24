import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateUserById: vi.fn(),
  deleteUser: vi.fn(),
  rpc: vi.fn(),
  phoneLookup: vi.fn(),
  getSchoolByCode: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signUp: h.signUp, signOut: h.signOut } })),
  createServiceRoleClient: h.createServiceRoleClient,
}));
vi.mock("@/lib/services/schoolService", () => ({ getSchoolByCode: h.getSchoolByCode }));
vi.mock("@/lib/security/rate-limit", async (orig) => ({
  ...(await orig<typeof import("@/lib/security/rate-limit")>()),
  enforce: vi.fn(async () => ({ allowed: true, retryAfter: 0 })),
  getClientIp: vi.fn(async () => "1.2.3.4"),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }) }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const base = { email: "eleve@test.com", password: "motdepasse1", firstName: "Awa", lastName: "Diop" };
const freshUser = () => ({ id: "u1", created_at: new Date().toISOString(), identities: [{ id: "i" }] });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  h.createServiceRoleClient.mockReturnValue({
    auth: { admin: { updateUserById: h.updateUserById, deleteUser: h.deleteUser } },
    rpc: h.rpc,
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: h.phoneLookup }) }) }),
  });
  h.phoneLookup.mockResolvedValue({ data: null });
  h.signUp.mockResolvedValue({ data: { user: freshUser() }, error: null });
  h.updateUserById.mockResolvedValue({ error: null });
  h.deleteUser.mockResolvedValue({ error: null });
  h.rpc.mockResolvedValue({ error: null });
  h.signOut.mockResolvedValue({});
  h.getSchoolByCode.mockResolvedValue({ id: "s1", name: "Ecole", code: "ABC", status: "active" });
});

describe("registerAction — inscription atomique", () => {
  it("cas nominal : profil + école finalisés par UNE fonction SQL, puis redirection", async () => {
    const { registerAction } = await import("./actions");
    await expect(registerAction(null, fd({ ...base, phone: "+221771234567", schoolCode: "abc" }))).rejects.toThrow("REDIRECT:/dashboard");
    expect(h.updateUserById).toHaveBeenCalledWith("u1", { phone: "+221771234567" });
    expect(h.rpc).toHaveBeenCalledTimes(1);
    expect(h.rpc).toHaveBeenCalledWith("complete_registration", {
      p_user_id: "u1", p_first_name: "Awa", p_last_name: "Diop", p_phone: "+221771234567", p_school_code: "abc",
    });
    expect(h.deleteUser).not.toHaveBeenCalled();
  });

  it("sans téléphone ni école : une seule finalisation, aucun appel Auth admin", async () => {
    const { registerAction } = await import("./actions");
    await expect(registerAction(null, fd(base))).rejects.toThrow("REDIRECT:/dashboard");
    expect(h.updateUserById).not.toHaveBeenCalled();
    expect(h.rpc).toHaveBeenCalledWith("complete_registration", expect.objectContaining({ p_phone: "", p_school_code: "" }));
  });

  it("téléphone déjà pris en base (course) : le compte est ANNULÉ, message sur le champ, pas de redirection", async () => {
    const { registerAction } = await import("./actions");
    h.rpc.mockResolvedValue({ error: { message: "PHONE_TAKEN" } });
    const r = await registerAction(null, fd({ ...base, phone: "+221771234567" }));
    expect(r?.fieldErrors?.phone).toContain("déjà utilisé");
    expect(h.deleteUser).toHaveBeenCalledWith("u1");
    expect(h.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("école devenue inactive entre-temps : compte annulé, erreur sur le code", async () => {
    const { registerAction } = await import("./actions");
    h.rpc.mockResolvedValue({ error: { message: "SCHOOL_NOT_FOUND" } });
    const r = await registerAction(null, fd({ ...base, schoolCode: "abc" }));
    expect(r?.fieldErrors?.schoolCode).toBeTruthy();
    expect(h.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("échec de l'association du téléphone Auth : compte annulé, la finalisation SQL n'est pas tentée", async () => {
    const { registerAction } = await import("./actions");
    h.updateUserById.mockResolvedValue({ error: { message: "phone exists" } });
    const r = await registerAction(null, fd({ ...base, phone: "+221771234567" }));
    expect(r?.fieldErrors?.phone).toBeTruthy();
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("erreur SQL inattendue : compte annulé, message honnête", async () => {
    const { registerAction } = await import("./actions");
    h.rpc.mockResolvedValue({ error: { message: "connection reset" } });
    const r = await registerAction(null, fd(base));
    expect(r?.error).toContain("Aucun compte n'a été créé");
    expect(h.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("si l'annulation elle-même échoue, le message ne prétend PAS qu'aucun compte n'existe", async () => {
    const { registerAction } = await import("./actions");
    h.rpc.mockResolvedValue({ error: { message: "connection reset" } });
    h.deleteUser.mockResolvedValue({ error: { message: "boom" } });
    const r = await registerAction(null, fd(base));
    expect(r?.error).toContain("incomplète");
    expect(r?.error).not.toContain("Aucun compte n'a été créé");
  });

  it("n'annule JAMAIS un compte ancien (garde-fou de 5 minutes)", async () => {
    const { registerAction } = await import("./actions");
    h.signUp.mockResolvedValue({ data: { user: { ...freshUser(), created_at: new Date(Date.now() - 3_600_000).toISOString() } }, error: null });
    h.rpc.mockResolvedValue({ error: { message: "connection reset" } });
    await registerAction(null, fd(base));
    expect(h.deleteUser).not.toHaveBeenCalled();
  });

  it("email déjà inscrit (confirmation activée → faux utilisateur sans identités) : on ne touche à rien", async () => {
    const { registerAction } = await import("./actions");
    h.signUp.mockResolvedValue({ data: { user: { id: "fake", created_at: new Date().toISOString(), identities: [] } }, error: null });
    const r = await registerAction(null, fd(base));
    expect(r?.error).toContain("existe déjà");
    expect(h.rpc).not.toHaveBeenCalled();
    expect(h.deleteUser).not.toHaveBeenCalled();
  });

  it("service_role indisponible : aucun compte n'est ouvert", async () => {
    const { registerAction } = await import("./actions");
    h.createServiceRoleClient.mockImplementation(() => { throw new Error("clé absente"); });
    const r = await registerAction(null, fd(base));
    expect(r?.error).toContain("momentanément indisponible");
    expect(h.signUp).not.toHaveBeenCalled();
  });

  it("téléphone déjà utilisé détecté AVANT la création du compte", async () => {
    const { registerAction } = await import("./actions");
    h.phoneLookup.mockResolvedValue({ data: { id: "autre" } });
    const r = await registerAction(null, fd({ ...base, phone: "+221771234567" }));
    expect(r?.fieldErrors?.phone).toContain("déjà utilisé");
    expect(h.signUp).not.toHaveBeenCalled();
  });

  it("code établissement invalide : aucun compte créé", async () => {
    const { registerAction } = await import("./actions");
    h.getSchoolByCode.mockResolvedValue(null);
    const r = await registerAction(null, fd({ ...base, schoolCode: "zzz" }));
    expect(r?.fieldErrors?.schoolCode).toBeTruthy();
    expect(h.signUp).not.toHaveBeenCalled();
  });
});
