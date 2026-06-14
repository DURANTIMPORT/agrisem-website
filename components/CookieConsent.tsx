"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

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

function getServerSnapshot() {
  return "pending";
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!showDetails) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowDetails(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDetails]);

  // The banner is fixed to the bottom of the viewport, which can cover
  // (and intercept clicks on) content at the bottom of the page. Push the
  // page content up while the banner is visible.
  useEffect(() => {
    if (consent !== null) return;

    document.body.classList.add("pb-40", "sm:pb-24");
    return () => {
      document.body.classList.remove("pb-40", "sm:pb-24");
    };
  }, [consent]);

  function choose(value: "accepted" | "rejected") {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setShowDetails(false);
  }

  // "pending" during SSR/first paint, "accepted"/"rejected" once the
  // visitor has made a choice: only show the banner when nothing is stored.
  if (consent !== null) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy-dark text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/80">
            Nous utilisons des cookies pour assurer le bon fonctionnement de
            ce site et, avec votre accord, pour mesurer son audience.{" "}
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="font-medium text-white underline hover:text-gold"
            >
              En savoir plus
            </button>
          </p>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-navy-dark transition-transform duration-300 hover:scale-105"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 text-sm text-navy-dark/80 shadow-xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h3
                id="cookie-title"
                className="text-lg font-semibold text-navy-dark"
              >
                Gestion des cookies
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                aria-label="Fermer"
                className="shrink-0 text-2xl leading-none text-navy-dark/50 transition-colors hover:text-navy-dark"
              >
                ×
              </button>
            </div>

            <p className="mt-4">
              Ce site utilise des cookies strictement nécessaires à son bon
              fonctionnement, notamment pour mémoriser le choix que vous
              effectuez ici. Ces cookies ne nécessitent pas votre
              consentement.
            </p>
            <p className="mt-2">
              Avec votre accord, nous pourrions également déposer des cookies
              de mesure d&apos;audience afin de mieux comprendre comment ce
              site est utilisé et d&apos;améliorer votre expérience. Ces
              données restent anonymes et ne sont jamais utilisées à des fins
              publicitaires, ni transmises à des tiers.
            </p>
            <p className="mt-2">
              Vous pouvez modifier votre choix à tout moment en effaçant les
              données de navigation de ce site dans votre navigateur. Pour
              toute question, contactez-nous à{" "}
              <a
                href="mailto:info@agrisem.be"
                className="font-medium text-navy-dark underline hover:text-gold"
              >
                info@agrisem.be
              </a>
              .
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => choose("rejected")}
                className="rounded-full border border-black/15 px-6 py-2.5 text-sm font-medium text-navy-dark transition-colors hover:bg-black/5"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-navy-dark transition-transform duration-300 hover:scale-105"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
