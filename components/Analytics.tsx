"use client";

import { useSyncExternalStore } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

const STORAGE_KEY = "agrisem-cookie-consent";
const CHANGE_EVENT = "agrisem-cookie-consent-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

// Pas de rendu côté serveur : GA4 ne s'injecte qu'après vérification côté client
function getServerSnapshot() {
  return null;
}

export default function Analytics() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (consent !== "accepted") return null;

  return <GoogleAnalytics gaId="G-BZFR43P2Z4" />;
}
