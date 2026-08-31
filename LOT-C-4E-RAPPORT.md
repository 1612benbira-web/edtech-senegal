# LOT C — 4e Histoire + Géographie

## Cadrage
Contenu original EdTech Sénégal, structuré à partir du catalogue PROMET du Ministère de l'Éducation nationale et de repères pédagogiques sénégalais. Ce lot ne constitue pas une reproduction intégrale d'un référentiel officiel.

## Contenu
### Histoire 4e
- 12 chapitres
- 12 leçons
- 36 exercices
- 144 questions

### Géographie 4e
- 12 chapitres
- 12 leçons
- 36 exercices
- 144 questions

## Commandes
```powershell
npm install
npx tsc --noEmit
npm run db:check-env
npm run db:import:4e-lotC
npm run db:audit:4e-lotC
```

Le contenu reste en `review` par défaut. Ne pas activer `EDTECH_PUBLISH_ENRICHMENT=true` avant validation pédagogique.
