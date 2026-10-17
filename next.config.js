const withSerwist = require("@serwist/next").default({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
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
