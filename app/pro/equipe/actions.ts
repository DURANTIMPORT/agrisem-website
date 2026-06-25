"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/pro/roles";
import type { InviteState } from "./types";

// Chaque action vérifie le rôle admin CÔTÉ SERVEUR (jamais seulement masqué à l'écran).
async function guard() {
  if (!(await isAdmin())) {
    throw new Error("Accès réservé aux administrateurs.");
  }
}

async function signUpUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const local = host.startsWith("localhost") || host.startsWith("127.");
  return `${local ? "http" : "https"}://${host}/sign-up`;
}

export async function inviteCommercial(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  await guard();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Adresse e-mail requise." };

  try {
    const cc = await clerkClient();
    await cc.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role: "commercial" },
      redirectUrl: await signUpUrl(),
      ignoreExisting: true,
    });
    revalidatePath("/pro/equipe");
    return { success: `Invitation envoyée à ${email}.` };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Échec de l'envoi de l'invitation.",
    };
  }
}

export async function setRole(userId: string, role: "admin" | "commercial") {
  await guard();
  const cc = await clerkClient();
  await cc.users.updateUserMetadata(userId, { publicMetadata: { role } });
  revalidatePath("/pro/equipe");
}

export async function removeUser(userId: string) {
  await guard();
  const cc = await clerkClient();
  await cc.users.deleteUser(userId);
  revalidatePath("/pro/equipe");
}

export async function revokeInvitation(invitationId: string) {
  await guard();
  const cc = await clerkClient();
  await cc.invitations.revokeInvitation(invitationId);
  revalidatePath("/pro/equipe");
}
