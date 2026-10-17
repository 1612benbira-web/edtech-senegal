import type { Metadata, Viewport } from "next";
import { Sora, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plateforme éducative — Programme sénégalais",
  description: "Apprendre selon le programme sénégalais. Réviser chaque jour. Progresser à son rythme.",
  // app/icon.png et app/apple-icon.png (convention Next.js App Router)
  // fournissent déjà le favicon et l'icône iOS automatiquement, sans rien
  // à déclarer ici. app/manifest.ts est de même auto-détecté.
  appleWebApp: {
    // "standalone" (plutôt que "default") : la barre d'adresse Safari
    // disparaît une fois l'appli ajoutée à l'écran d'accueil iOS, pour
    // un rendu vraiment "application" plutôt que "onglet épinglé".
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EdTech Sénégal",
  },
};

// Séparé de `metadata` depuis Next.js 14 : themeColor et colorScheme sont
// désormais exposés via `viewport`, pas `metadata` (l'ancien emplacement
// est déprécié mais fonctionne encore avec un avertissement).
export const viewport: Viewport = {
  themeColor: "#063f2d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${sora.variable} ${workSans.variable} ${plexMono.variable}`}>
      <body className="min-h-screen antialiased">
        <script dangerouslySetInnerHTML={{ __html: `try { if (localStorage.getItem("edtech-theme") === "dark") document.documentElement.classList.add("dark"); } catch (_) {}` }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
