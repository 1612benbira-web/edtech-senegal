import { describe, it, expect } from "vitest";
import { getSubjectTheme } from "./subject-theme";

describe("getSubjectTheme", () => {
  it("résout une icône Lucide réelle à partir de subjects.icon (kebab-case), jamais une chaîne brute", () => {
    const theme = getSubjectTheme("Mathématiques", "calculator");
    // La régression corrigée : `icon` stocke un nom d'icône Lucide
    // ("calculator"), pas un emoji. Le composant retourné doit être une
    // fonction React (composant), jamais la chaîne "calculator" elle-même.
    expect(typeof theme.Icon).toBe("object"); // forwardRef component
    expect(theme.Icon).not.toBe("calculator");
  });

  it("retombe sur une icône déduite du nom quand `icon` est absent ou inconnu", () => {
    const withUnknownIcon = getSubjectTheme("Physique-Chimie", "some-unknown-icon-name");
    const withoutIcon = getSubjectTheme("Physique-Chimie", null);
    expect(withUnknownIcon.Icon).toBe(withoutIcon.Icon);
  });

  it("retourne toujours une couleur cohérente pour une matière connue", () => {
    const theme = getSubjectTheme("Français", null);
    expect(theme.accent).toContain("sky");
  });

  it("retombe sur le thème par défaut pour une matière non reconnue", () => {
    const theme = getSubjectTheme("Couture", null);
    expect(theme.accent).toBe("text-primary");
  });

  it("est insensible à la casse et aux accents pour le nom de la matière", () => {
    const upper = getSubjectTheme("HISTOIRE-GÉOGRAPHIE", null);
    const lower = getSubjectTheme("histoire-geographie", null);
    expect(upper.accent).toBe(lower.accent);
  });
});
