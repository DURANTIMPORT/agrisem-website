import { currentUser } from "@clerk/nextjs/server";
import { getGammes } from "@/lib/pro/catalog";
import { roleFromUser } from "@/lib/pro/roles";
import { margeVisibleCommercial } from "@/lib/pro/settings";
import Calculateur from "@/components/pro/Calculateur";

export default async function CalculateurPage() {
  const gammes = await getGammes();

  // Visibilité de la marge décidée CÔTÉ SERVEUR (jamais masquée seulement en CSS).
  const role = roleFromUser(await currentUser());
  const margeVisible = role === "admin" || (await margeVisibleCommercial());

  return <Calculateur gammes={gammes} margeVisible={margeVisible} />;
}
