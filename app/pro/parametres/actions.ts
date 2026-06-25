"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/pro/roles";
import { setMargeVisibleCommercial } from "@/lib/pro/settings";

export async function enregistrerParametres(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Accès réservé aux administrateurs.");
  await setMargeVisibleCommercial(formData.get("marge") === "on");
  revalidatePath("/pro/parametres");
  revalidatePath("/pro/calculateur");
}
