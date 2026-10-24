import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted() est exécuté AVANT les `const` du module : les identifiants
// utilisés dans les mocks doivent donc être déclarés dans le même bloc.
const {
  LEVEL_ID,
  ALLOWED_SUBJECT_ID,
  FOREIGN_SUBJECT_ID, // n'appartient PAS à ce niveau
  USER_ID,
} = vi.hoisted(() => ({
  LEVEL_ID: "11111111-1111-1111-1111-111111111111",
  ALLOWED_SUBJECT_ID: "22222222-2222-2222-2222-222222222222",
  FOREIGN_SUBJECT_ID: "33333333-3333-3333-3333-333333333333",
  USER_ID: "44444444-4444-4444-4444-444444444444",
}));

const profilesUpdateMock = vi.hoisted(() => vi.fn());
const levelSubjectsSelectResult = vi.hoisted(() => ({
  // Seul ALLOWED_SUBJECT_ID est proposé pour ce niveau/cette série.
  data: [{ subject_id: ALLOWED_SUBJECT_ID }],
  error: null,
}));

function createChainMock(table: string): any {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => Promise.resolve(levelSubjectsSelectResult)),
    delete: vi.fn(() => chain),
    update: vi.fn((payload: any) => {
      if (table === "profiles") profilesUpdateMock(payload);
      return chain;
    }),
    insert: vi.fn(() => Promise.resolve({ error: null })),
  };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: USER_ID } } })) },
      from: vi.fn((table: string) => createChainMock(table)),
    })
  ),
}));

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("completeOnboardingAction — validation croisée niveau/série ↔ matières", () => {
  beforeEach(() => {
    profilesUpdateMock.mockReset();
  });

  it("rejette une matière qui n'appartient pas au niveau/à la série choisis, sans mettre à jour le profil", async () => {
    const { completeOnboardingAction } = await import("./actions");

    const formData = new FormData();
    formData.set("firstName", "Aïssatou");
    formData.set("lastName", "Diop");
    formData.set("levelId", LEVEL_ID);
    // L'élève (ou un client altéré) essaie de s'inscrire à une matière
    // hors-niveau en plus de la matière autorisée.
    formData.append("subjectIds", ALLOWED_SUBJECT_ID);
    formData.append("subjectIds", FOREIGN_SUBJECT_ID);

    const result = await completeOnboardingAction({}, formData);

    expect(result?.fieldErrors?.subjectIds).toBeDefined();
    expect(profilesUpdateMock).not.toHaveBeenCalled();
  });

  it("accepte des matières qui appartiennent toutes au niveau/à la série choisis", async () => {
    const { completeOnboardingAction } = await import("./actions");

    const formData = new FormData();
    formData.set("firstName", "Aïssatou");
    formData.set("lastName", "Diop");
    formData.set("levelId", LEVEL_ID);
    formData.append("subjectIds", ALLOWED_SUBJECT_ID);

    const result = await completeOnboardingAction({}, formData);

    expect(result?.fieldErrors?.subjectIds).toBeUndefined();
    expect(profilesUpdateMock).toHaveBeenCalledTimes(1);
  });
});
