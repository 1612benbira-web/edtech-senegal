import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// `self.__SW_MANIFEST` est injecté automatiquement au build par le plugin
// webpack de @serwist/next (voir withSerwist dans next.config.js) : il
// contient la liste des fichiers statiques du build (JS, CSS...) à mettre
// en cache lors de l'installation du service worker. Ce fichier n'est pas
// exécuté tel quel — @serwist/next le compile séparément vers
// public/sw.js au build.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Une nouvelle version du service worker prend immédiatement le relais
  // (plutôt que d'attendre la fermeture de tous les onglets ouverts) :
  // important pour que les élèves aient la dernière version du contenu
  // après un déploiement, sans devoir fermer complètement l'appli.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Stratégies de cache par défaut recommandées par Serwist pour Next.js
  // (pages, assets statiques, images...) : réseau en priorité avec repli
  // sur le cache en cas de perte de connexion, plutôt que "cache only",
  // pour ne jamais servir une leçon ou un quiz périmé par erreur.
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
