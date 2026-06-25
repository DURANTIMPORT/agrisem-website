import { redirect } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { roleFromUser } from "@/lib/pro/roles";
import { setRole, removeUser, revokeInvitation } from "./actions";
import InviteForm from "./InviteForm";
import RowActions from "./RowActions";

export const metadata = { title: "Équipe" };

export default async function EquipePage() {
  const me = await currentUser();
  // Garde d'accès CÔTÉ SERVEUR : un commercial qui devine l'URL est renvoyé.
  if (roleFromUser(me) !== "admin") redirect("/pro");

  const cc = await clerkClient();
  const { data: users } = await cc.users.getUserList({ limit: 100 });
  const invRes = await cc.invitations.getInvitationList({ status: "pending" });
  const invitations = Array.isArray(invRes) ? invRes : invRes.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#000002]">Équipe</h1>
        <p className="mt-1 text-sm text-[#848689]">
          Gérez les accès à l&apos;espace Pro.
        </p>
      </div>

      <InviteForm />

      {invitations.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#848689]">
            Invitations en attente
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#000002]">
                    {inv.emailAddress}
                  </p>
                  <p className="text-xs text-[#848689]">En attente d&apos;acceptation</p>
                </div>
                <form action={revokeInvitation.bind(null, inv.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-[#C71121] transition-colors hover:bg-[#C71121]/10"
                  >
                    Annuler
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#848689]">
          Membres ({users.length})
        </h2>
        <div className="space-y-2">
          {users.map((u) => {
            const role = u.publicMetadata?.role === "admin" ? "admin" : "commercial";
            const email =
              u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
                ?.emailAddress ??
              u.emailAddresses[0]?.emailAddress ??
              "—";
            const nom = [u.firstName, u.lastName].filter(Boolean).join(" ");
            const isMe = u.id === me!.id;

            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#000002]">
                    {nom || email}
                  </p>
                  <p className="truncate text-xs text-[#848689]">{email}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      role === "admin"
                        ? "bg-[#C71121] text-white"
                        : "bg-black/5 text-[#5F6062]"
                    }`}
                  >
                    {role === "admin" ? "Administrateur" : "Commercial"}
                  </span>
                </div>

                {isMe ? (
                  <span className="shrink-0 text-xs font-medium text-[#848689]">
                    Vous
                  </span>
                ) : (
                  <RowActions
                    role={role}
                    toggleRole={setRole.bind(
                      null,
                      u.id,
                      role === "admin" ? "commercial" : "admin"
                    )}
                    remove={removeUser.bind(null, u.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
