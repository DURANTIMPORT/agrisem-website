import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { roleFromUser } from "@/lib/pro/roles";
import ImportForm from "./ImportForm";

export const metadata = { title: "Import des grilles" };

export default async function ImportPage() {
  const me = await currentUser();
  // Garde d'accès CÔTÉ SERVEUR : admin uniquement.
  if (roleFromUser(me) !== "admin") redirect("/pro");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1c1d1f]">Import des grilles</h1>
        <p className="mt-1 text-sm text-[#848689]">
          Dépose un PDF Massey Ferguson : l&apos;IA en extrait les données, tu
          vérifies, puis tu publies.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
