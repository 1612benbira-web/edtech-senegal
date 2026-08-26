import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  Leaf,
  Languages,
  Globe2,
  Music,
  Dumbbell,
  Cpu,
  Landmark,
} from "lucide-react";

/**
 * Source unique de vérité pour l'identité visuelle d'une matière
 * (couleur ET icône — section 4 du cahier des charges). Ne pas dupliquer
 * cette logique dans les composants : tout passe par `getSubjectTheme`.
 *
 * Deux façons de trouver l'icône, dans cet ordre de priorité :
 * 1. `subjects.icon` en base (ex: "calculator", "book-open" — un nom
 *    d'icône Lucide en kebab-case, voir supabase/seed et le formulaire
 *    admin "Créer une matière") → résolu via LUCIDE_ICON_MAP.
 * 2. Mot-clé sur le nom de la matière → l'icône par défaut du thème
 *    correspondant (ex: toute matière contenant "math" → Calculator).
 * 3. Repli générique : BookOpen.
 *
 * ⚠️ `subjects.icon` n'est PAS un emoji : ne jamais l'afficher comme du
 * texte brut (`{subject.icon}`) dans un composant — ça affiche
 * littéralement "calculator" à l'écran. Toujours passer par ce module.
 */

export interface SubjectTheme {
  accent: string;
  soft: string;
  icon: string;
  Icon: LucideIcon;
}

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  calculator: Calculator,
  "book-open": BookOpen,
  "flask-conical": FlaskConical,
  leaf: Leaf,
  languages: Languages,
  "globe-2": Globe2,
  globe: Globe2,
  music: Music,
  dumbbell: Dumbbell,
  cpu: Cpu,
  landmark: Landmark,
};

const THEMES: Array<{ matches: string[]; theme: SubjectTheme }> = [
  { matches: ["math", "mathématique", "mathematique"], theme: { accent: "text-violet-700", soft: "bg-violet-50 ring-violet-200", icon: "bg-violet-100", Icon: Calculator } },
  { matches: ["physique", "chimie"], theme: { accent: "text-orange-700", soft: "bg-orange-50 ring-orange-200", icon: "bg-orange-100", Icon: FlaskConical } },
  { matches: ["svt", "sciences de la vie", "science de la vie", "biologie"], theme: { accent: "text-emerald-700", soft: "bg-emerald-50 ring-emerald-200", icon: "bg-emerald-100", Icon: Leaf } },
  { matches: ["français", "francais", "littérature", "litterature"], theme: { accent: "text-sky-700", soft: "bg-sky-50 ring-sky-200", icon: "bg-sky-100", Icon: Languages } },
  { matches: ["histoire", "géographie", "geographie"], theme: { accent: "text-amber-700", soft: "bg-amber-50 ring-amber-200", icon: "bg-amber-100", Icon: Landmark } },
  { matches: ["anglais"], theme: { accent: "text-indigo-700", soft: "bg-indigo-50 ring-indigo-200", icon: "bg-indigo-100", Icon: Languages } },
];

const DEFAULT_THEME: SubjectTheme = {
  accent: "text-primary",
  soft: "bg-primary/5 ring-primary/20",
  icon: "bg-primary/10",
  Icon: BookOpen,
};

/**
 * @param subjectName Nom de la matière (ex: "Mathématiques")
 * @param iconKey Valeur brute de `subjects.icon` en base, si disponible
 *   (nom d'icône Lucide en kebab-case) — prioritaire sur la déduction
 *   par mot-clé quand elle correspond à une icône connue.
 */
export function getSubjectTheme(subjectName: string, iconKey?: string | null): SubjectTheme {
  const normalized = subjectName.trim().toLocaleLowerCase("fr-FR");
  const matchedTheme = THEMES.find(({ matches }) => matches.some((match) => normalized.includes(match)))?.theme ?? DEFAULT_THEME;

  const explicitIcon = iconKey ? LUCIDE_ICON_MAP[iconKey.trim().toLowerCase()] : undefined;

  return explicitIcon ? { ...matchedTheme, Icon: explicitIcon } : matchedTheme;
}
