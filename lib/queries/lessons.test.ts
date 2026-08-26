import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.hoisted(() =>
  vi.fn<(query: string) => any>()
);

function createChainMock(): any {
  const chain: any = {
    select: selectMock,

    eq: vi.fn(() => chain),

    is: vi.fn(() => chain),

    order: vi.fn(() => chain),

    limit: vi.fn(() => chain),

    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: null,
        error: null,
      })
    ),
  };

  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => createChainMock()),
    })
  ),
}));

describe("getPublishedLessonById", () => {
  beforeEach(() => {
    selectMock.mockReset();

    // Important :
    // .select() doit retourner la chaîne Supabase
    // pour permettre .eq().eq().maybeSingle().
    selectMock.mockImplementation(() => createChainMock());
  });

  it("sélectionne curriculums.level_id, indispensable au contrôle de niveau de la page leçon", async () => {
    const { getPublishedLessonById } = await import("./lessons");

    await getPublishedLessonById("lesson-1");

    expect(selectMock).toHaveBeenCalledTimes(1);

    const firstCall = selectMock.mock.calls[0];

    const selectArg =
      firstCall?.[0] ?? "";

    expect(selectArg).toContain("level_id");
    expect(selectArg).toContain("curriculums");
  });
});