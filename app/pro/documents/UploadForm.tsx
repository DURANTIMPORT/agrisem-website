"use client";

import { useActionState } from "react";
import { uploadDocument, type UploadState } from "./actions";

const initial: UploadState = {};

export default function UploadForm() {
  const [state, action, pending] = useActionState(uploadDocument, initial);

  return (
    <form action={action} className="rounded-xl border border-black/10 bg-white p-4">
      <h2 className="text-sm font-semibold text-[#000002]">Ajouter un document</h2>

      <label htmlFor="titre" className="mt-3 block text-sm font-medium text-[#000002]">
        Titre
      </label>
      <input
        id="titre"
        name="titre"
        type="text"
        required
        placeholder="ex. Tarif pièces 2026"
        className="mt-1 w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#000002] focus:border-[#C71121] focus:outline-none focus:ring-2 focus:ring-[#C71121]/20"
      />

      <label htmlFor="fichier" className="mt-3 block text-sm font-medium text-[#000002]">
        Fichier PDF
      </label>
      <input
        id="fichier"
        name="fichier"
        type="file"
        accept="application/pdf"
        required
        className="mt-1 block w-full text-sm text-[#5F6062] file:mr-4 file:rounded-lg file:border-0 file:bg-[#C71121] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-[#000002] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Ajouter le document"}
      </button>

      {state.error && <p className="mt-2 text-sm font-medium text-[#C71121]">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm font-medium text-[#1a8a3f]">{state.success}</p>}
    </form>
  );
}
