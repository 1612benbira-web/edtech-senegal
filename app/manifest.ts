import type { MetadataRoute } from "next";

// Convention Next.js App Router : ce fichier est automatiquement servi à
// /manifest.webmanifest et référencé dans le <head>, sans rien à ajouter
// manuellement à app/layout.tsx. C'est ce fichier qui permet au
// navigateur de proposer "Ajouter à l'écran d'accueil" / "Installer
// l'application".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EdTech Sénégal",
    short_name: "EdTech Sénégal",
    description: "Apprendre selon le programme sénégalais. Réviser chaque jour. Progresser à son rythme.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#063f2d",
    theme_color: "#063f2d",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Icône "maskable" : fond plein, contenu recentré dans la zone de
      // sécurité, pour que les OS (Android notamment) puissent appliquer
      // leur propre découpe (cercle, carré arrondi...) sans rogner le motif.
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
