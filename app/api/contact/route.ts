import { Resend } from "resend";

const RECIPIENT = "info@agrisem.be";
const FROM = "Agrisem S.A. <noreply@agrisem.be>";

type ContactPayload = {
  prenom?: string;
  nom?: string;
  codePostal?: string;
  pays?: string;
  email?: string;
  telephone?: string;
  message?: string;
  rgpd?: boolean;
};

function isValid(data: ContactPayload) {
  return Boolean(
    data.prenom?.trim() &&
      data.nom?.trim() &&
      data.codePostal?.trim() &&
      data.pays?.trim() &&
      data.email?.trim() &&
      data.telephone?.trim() &&
      data.message?.trim() &&
      data.rgpd === true
  );
}

export async function POST(request: Request) {
  const data = (await request.json()) as ContactPayload;

  if (!isValid(data)) {
    return Response.json(
      { error: "Tous les champs sont obligatoires." },
      { status: 400 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      replyTo: data.email,
      subject: `Nouvelle demande de contact - ${data.prenom} ${data.nom}`,
      text: [
        `Prénom : ${data.prenom}`,
        `Nom : ${data.nom}`,
        `Code postal : ${data.codePostal}`,
        `Pays : ${data.pays}`,
        `E-mail : ${data.email}`,
        `Téléphone : ${data.telephone}`,
        "",
        "Message :",
        data.message,
      ].join("\n"),
    });

    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail de contact :", error);
    return Response.json(
      { error: "L'envoi du message a échoué." },
      { status: 500 }
    );
  }
}
