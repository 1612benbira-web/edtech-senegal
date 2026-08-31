import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("EDTECH SÉNÉGAL — vérification de l'environnement");
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${url ? "OK" : "MANQUANTE"}`);
console.log(`SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY: ${secret ? "OK" : "MANQUANTE"}`);

if (!url || !secret) {
  console.error("\n❌ Ajoute les variables manquantes dans .env.local à la racine du projet.");
  process.exit(1);
}

console.log("\n✅ Variables Supabase disponibles. Les secrets ne sont pas affichés.");
