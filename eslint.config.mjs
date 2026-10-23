import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// ESLint 9 (flat config) : `next lint` est supprimé dans Next.js 16,
// on appelle donc ESLint directement (script "lint").
export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Nouvelle règle (React Compiler / eslint-plugin-react-hooks 6+) :
      // 6 occurrences historiques (thème, recherche, cloche, formulaires).
      // Laissée en avertissement le temps de les refactorer une par une,
      // pour ne pas mélanger montée de version et réécriture de composants.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "public/sw.js", "public/swe-worker-*.js", "next-env.d.ts"]),
]);
