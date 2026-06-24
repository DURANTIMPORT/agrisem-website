import { currentUser } from "@clerk/nextjs/server";

export type ProRole = "admin" | "commercial";

type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

/**
 * Rôle de l'utilisateur pour l'espace /pro, lu depuis Clerk publicMetadata.role.
 * Par défaut "commercial" (moindre privilège) si le rôle n'est pas défini.
 * Le rôle est attribué côté Clerk (dashboard ou page /pro/equipe à venir).
 */
export function roleFromUser(user: ClerkUser): ProRole {
  return user?.publicMetadata?.role === "admin" ? "admin" : "commercial";
}

export async function getProRole(): Promise<ProRole> {
  return roleFromUser(await currentUser());
}
