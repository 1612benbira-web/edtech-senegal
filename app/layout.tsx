import type { Metadata } from "next";
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
