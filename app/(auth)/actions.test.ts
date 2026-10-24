import { describe, it, expect, vi, beforeEach } from "vitest";

const { signInWithOtp, signInWithPassword, verifyOtp, createClientMock, rateLimitModule } = vi.hoisted(() => {
  const signInWithOtp = vi.fn();
  const signInWithPassword = vi.fn();
  const verifyOtp = vi.fn();
  return {
    signInWithOtp, signInWithPassword, verifyOtp,
    createClientMock: vi.fn(),
    rateLimitModule: {
      enforce: vi.fn(),
      getClientIp: vi.fn(),
      resetRateLimit: vi.fn(),
    },
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
  createServiceRoleClient: vi.fn(() => { throw new Error("listUsers ne doit plus être utilisé"); }),
}));
vi.mock("@/lib/security/rate-limit", async (orig) => ({
  ...(await orig<typeof import("@/lib/security/rate-limit")>()),
  ...rateLimitModule,
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }) }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  createClientMock.mockResolvedValue({ auth: { signInWithOtp, signInWithPassword, verifyOtp } });
  rateLimitModule.getClientIp.mockResolvedValue("1.2.3.4");
  rateLimitModule.enforce.mockResolvedValue({ allowed: true, retryAfter: 0 });
});

describe("forgotPasswordAction (téléphone)", () => {
  it("répond de façon IDENTIQUE que l'envoi réussisse ou échoue (compte inexistant)", async () => {
    const { forgotPasswordAction } = await import("./actions");
    signInWithOtp.mockResolvedValueOnce({ error: null });
    const exists = await forgotPasswordAction(null, fd({ identifier: "+221771234567" }));
    signInWithOtp.mockResolvedValueOnce({ error: { code: "otp_disabled", status: 422 } });
    const missing = await forgotPasswordAction(null, fd({ identifier: "+221771234567" }));
    expect(missing).toEqual(exists);
    expect(exists).toMatchObject({ next: "phone", phone: "+221771234567" });
  });

  it("n'appelle jamais listUsers (service_role non sollicité)", async () => {
    const { forgotPasswordAction } = await import("./actions");
    signInWithOtp.mockResolvedValue({ error: null });
    await expect(forgotPasswordAction(null, fd({ identifier: "771234567" }))).resolves.toBeTruthy();
  });

  it("applique la limite AVANT d'envoyer un SMS", async () => {
    const { forgotPasswordAction } = await import("./actions");
    rateLimitModule.enforce.mockResolvedValue({ allowed: false, retryAfter: 1800 });
    const r = await forgotPasswordAction(null, fd({ identifier: "+221771234567" }));
    expect(r?.error).toContain("30 minutes");
    expect(signInWithOtp).not.toHaveBeenCalled();
  });
});

describe("loginAction", () => {
  it("bloque sans interroger Supabase quand la limite est atteinte", async () => {
    const { loginAction } = await import("./actions");
    rateLimitModule.enforce.mockResolvedValue({ allowed: false, retryAfter: 120 });
    const r = await loginAction(null, fd({ email: "a@b.co", password: "motdepasse1" }));
    expect(r?.error).toContain("Trop de tentatives");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("remet le compteur du compte à zéro après une connexion réussie", async () => {
    const { loginAction } = await import("./actions");
    signInWithPassword.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } }, error: null });
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "u1" } }) }) }) }),
    });
    await expect(loginAction(null, fd({ email: "a@b.co", password: "motdepasse1" }))).rejects.toThrow("REDIRECT:/dashboard");
    expect(rateLimitModule.resetRateLimit).toHaveBeenCalledWith("login:account", "a@b.co|1.2.3.4");
  });
});

describe("verifyPhoneRecoveryAction", () => {
  it("plafonne les essais de code (force brute à 6 chiffres)", async () => {
    const { verifyPhoneRecoveryAction } = await import("./actions");
    rateLimitModule.enforce.mockResolvedValue({ allowed: false, retryAfter: 300 });
    const r = await verifyPhoneRecoveryAction(null, fd({ phone: "+221771234567", token: "123456" }));
    expect(r?.error).toContain("Trop de tentatives");
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});
