"use client";

import { useActionState } from "react";
import { inviteCommercial } from "./actions";
import type { InviteState } from "./types";

const initial: InviteState = {};

export default function InviteForm() {
  const [state, action, pending] = useActionState(inviteCommercial, initial);

  return (
    <form action={action} className="rounded-xl border border-black/10 bg-white p-4">
      <label htmlFor="email" className="block text-sm font-medium text-[#1c1d1f]">
        Inviter un commercial
      </label>
      <p className="mt-0.5 text-xs text-[#848689]">
        Il recevra un e-mail pour créer son propre mot de passe (rôle commercial).
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@exemple.com"
          className="flex-1 rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#1c1d1f] focus:border-[#C71121] focus:outline-none focus:ring-2 focus:ring-[#C71121]/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#C71121] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Inviter"}
        </button>
      </div>
      {state.error && (
        <p className="mt-2 text-sm font-medium text-[#C71121]">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-2 text-sm font-medium text-green-700">{state.success}</p>
      )}
    </form>
  );
}
