# Lot 5 — V3

Cette version corrige un cas d’import interrompu : une question déjà présente mais dépourvue d’options n’était pas réparée, car l’importeur la considérait comme un doublon.

`import-5e-all.ts` vérifie maintenant les options d’une question existante et les reconstruit si elles sont absentes ou incohérentes avec la source du Lot 5.

L’audit vérifie également le nombre attendu d’options : 4 pour `single_choice`, 2 pour `true_false`.

Après remplacement des scripts, relancer `npx tsc --noEmit`, puis `npm run db:import:5e-all`, puis `npm run db:audit:5e`.
