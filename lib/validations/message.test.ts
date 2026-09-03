import { describe, it, expect } from "vitest";
import { createMessageSchema } from "./message";

const VALID_SCHOOL_ID = "11111111-1111-1111-1111-111111111111";
const VALID_LEVEL_ID = "22222222-2222-2222-2222-222222222222";

describe("createMessageSchema", () => {
  it("accepte un message ciblant toute l'école, sans niveau", () => {
    const result = createMessageSchema.safeParse({
      schoolId: VALID_SCHOOL_ID,
      title: "Réunion des parents",
      content: "La réunion aura lieu vendredi.",
      targetType: "SCHOOL",
      targetLevelId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepte un message ciblant un niveau, avec targetLevelId renseigné", () => {
    const result = createMessageSchema.safeParse({
      schoolId: VALID_SCHOOL_ID,
      title: "Devoir de maths",
      content: "Le devoir est à rendre lundi.",
      targetType: "LEVEL",
      targetLevelId: VALID_LEVEL_ID,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un ciblage par niveau sans targetLevelId (AC-07)", () => {
    const result = createMessageSchema.safeParse({
      schoolId: VALID_SCHOOL_ID,
      title: "Devoir de maths",
      content: "Le devoir est à rendre lundi.",
      targetType: "LEVEL",
      targetLevelId: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("targetLevelId");
    }
  });

  it("rejette un schoolId qui n'est pas un UUID (jamais confiance dans une valeur brute du client)", () => {
    const result = createMessageSchema.safeParse({
      schoolId: "<script>alert(1)</script>",
      title: "Titre",
      content: "Contenu",
      targetType: "SCHOOL",
      targetLevelId: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejette un titre vide ou trop court", () => {
    const result = createMessageSchema.safeParse({
      schoolId: VALID_SCHOOL_ID,
      title: "A",
      content: "Contenu valide",
      targetType: "SCHOOL",
      targetLevelId: null,
    });
    expect(result.success).toBe(false);
  });
});
