const { randomUUID } = require("crypto");

// Change à chaque déploiement : le service worker remet alors en cache la
// page hors connexion ci-dessous avec la nouvelle version de l'appli.
const buildRevision = process.env.VERCEL_GIT_COMMIT_SHA || randomUUID();

const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Lecteur des leçons téléchargées, affiché quand une page ne peut pas être
  // chargée faute de connexion (voir fallbacks dans app/sw.ts).
  additionalPrecacheEntries: [{ url: "/hors-ligne", revision: buildRevision }],
  // Désactivé en développement : le service worker mettrait en cache des
  // fichiers qui changent à chaque rechargement (`next dev`), ce qui rend
  // le debug local confus. Actif uniquement sur le build de production
  // (donc sur Vercel).
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = withSerwist(nextConfig);
