import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpcMock, createServiceRoleClientMock, headersMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  createServiceRoleClientMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createServiceRoleClient: createServiceRoleClientMock }));
vi.mock("next/headers", () => ({ headers: headersMock }));

import { rateLimit, enforce, fingerprint, getClientIp, tooManyMessage, LIMITS } from "./rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  createServiceRoleClientMock.mockReturnValue({ rpc: rpcMock });
});

describe("fingerprint", () => {
  it("est stable, insensible à la casse/espaces, et ne contient pas la donnée brute", () => {
    expect(fingerprint(" Test@Mail.com ")).toBe(fingerprint("test@mail.com"));
    expect(fingerprint("test@mail.com")).not.toContain("test");
    expect(fingerprint("a")).not.toBe(fingerprint("b"));
  });
});

describe("rateLimit", () => {
  it("autorise tant que la base répond allowed=true", async () => {
    rpcMock.mockResolvedValue({ data: { allowed: true, retry_after: 0 }, error: null });
    expect(await rateLimit("login:ip", "1.2.3.4", LIMITS.loginIp)).toEqual({ allowed: true, retryAfter: 0 });
    const args = rpcMock.mock.calls[0]![1];
    expect(args.p_key.startsWith("login:ip:")).toBe(true);
    expect(args.p_key).not.toContain("1.2.3.4");
    expect(args.p_max).toBe(LIMITS.loginIp.max);
  });

  it("bloque et renvoie le délai quand la base répond allowed=false", async () => {
    rpcMock.mockResolvedValue({ data: { allowed: false, retry_after: 540 }, error: null });
    expect(await rateLimit("login:ip", "x", LIMITS.loginIp)).toEqual({ allowed: false, retryAfter: 540 });
  });

  it("échec ouvert si la RPC renvoie une erreur", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect((await rateLimit("s", "x", LIMITS.loginIp)).allowed).toBe(true);
  });

  it("échec ouvert si le client service_role est indisponible", async () => {
    createServiceRoleClientMock.mockImplementation(() => { throw new Error("clé absente"); });
    expect((await rateLimit("s", "x", LIMITS.loginIp)).allowed).toBe(true);
  });
});

describe("enforce", () => {
  it("s'arrête à la première règle qui bloque", async () => {
    rpcMock
      .mockResolvedValueOnce({ data: { allowed: true, retry_after: 0 }, error: null })
      .mockResolvedValueOnce({ data: { allowed: false, retry_after: 60 }, error: null });
    const r = await enforce([
      { scope: "a", identifier: "1", rule: LIMITS.loginIp },
      { scope: "b", identifier: "2", rule: LIMITS.loginAccount },
      { scope: "c", identifier: "3", rule: LIMITS.loginAccount },
    ]);
    expect(r.allowed).toBe(false);
    expect(rpcMock).toHaveBeenCalledTimes(2);
  });

  it("ignore les règles sans identifiant (IP inconnue en local)", async () => {
    const r = await enforce([{ scope: "a", identifier: null, rule: LIMITS.loginIp }]);
    expect(r.allowed).toBe(true);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

describe("getClientIp / tooManyMessage", () => {
  it("prend la première adresse de x-forwarded-for", async () => {
    headersMock.mockResolvedValue(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }));
    expect(await getClientIp()).toBe("9.9.9.9");
  });
  it("renvoie null sans en-tête", async () => {
    headersMock.mockResolvedValue(new Headers());
    expect(await getClientIp()).toBeNull();
  });
  it("arrondit les minutes à l'entier supérieur, minimum 1", () => {
    expect(tooManyMessage(10)).toContain("1 minute.");
    expect(tooManyMessage(61)).toContain("2 minutes");
  });
});
