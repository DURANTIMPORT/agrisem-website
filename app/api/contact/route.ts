import { Resend } from "resend";

const RECIPIENT = "info@agrisem.be";
const FROM = "Agrisem S.A. <noreply@agrisem.be>";

// Sliding-window rate limiter (in-memory — resets on cold start, fine for a
// low-traffic contact form; upgrade to Vercel KV if needed).
const rateStore = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 heure

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateStore.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

type ContactPayload = {
  prenom?: string;
  nom?: string;
  codePostal?: string;
  pays?: string;
  email?: string;
  telephone?: string;
  message?: string;
  rgpd?: boolean;
  website?: string; // honeypot — doit rester vide
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
  // Rate limiting par IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Trop d'envois. Veuillez réessayer dans une heure." },
      { status: 429 }
    );
  }

  const data = (await request.json()) as ContactPayload;

  // Honeypot : les bots remplissent ce champ caché, les humains non
  if (data.website) {
    return Response.json({ ok: true }); // Sembler réussir pour dérouter le bot
  }

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
