# Lot B — 4e Français + Anglais

## Cadrage
- Français : ressources PROMET, notamment `Quatrieme_Francais_S22_2.0` et `S22_1.0`, classe de 4e.
- Anglais : cadrage via le catalogue PROMET du MEN, qui référence la 4e et la discipline Anglais.
- Le contenu inséré est une rédaction originale EdTech Sénégal ; il ne doit pas être présenté comme une reproduction ou une validation officielle du MEN.

## Volume
- Français : 12 chapitres, 12 leçons, 36 exercices, 144 questions.
- Anglais : 12 chapitres, 12 leçons, 36 exercices, 144 questions.
- Total : 24 chapitres, 24 leçons, 72 exercices, 288 questions.

## Statut
`review` par défaut.

## Commandes
```powershell
npm install
npx tsc --noEmit
npm run db:check-env
npm run db:import:4e-lotB
npm run db:audit:4e-lotB
```
Ne pas activer `EDTECH_PUBLISH_ENRICHMENT=true` avant validation pédagogique.
