"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

// Déconnexion automatique de l'Espace Pro après une période d'inactivité
// (souris/clavier/scroll). Le compte à rebours repart à chaque activité ;
// il ne déclenche la déconnexion qu'après un vrai temps mort.
const TIMEOUT_MS = 60 * 60 * 1000; // 1 heure
// On ne ré-arme pas le minuteur à chaque micro-mouvement : au plus une fois
// par 30 s (largement assez précis pour un délai d'une heure).
const THROTTLE_MS = 30 * 1000;

export default function IdleLogout() {
  const { signOut } = useClerk();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef(0);

  useEffect(() => {
    const arm = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void signOut({ redirectUrl: "/sign-in" });
      }, TIMEOUT_MS);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastResetRef.current < THROTTLE_MS) return;
      lastResetRef.current = now;
      arm();
    };

    arm();
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
    ];
    events.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", onActivity);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onActivity);
    };
  }, [signOut]);

  return null;
}
