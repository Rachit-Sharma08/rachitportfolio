// Contact form -> Resend (direct). Purana Render proxy hata diya gaya.
export const config = { maxDuration: 30 };

const ALLOWED_ORIGINS = new Set([
  "https://rachitportfolio-rouge.vercel.app",
  "https://rachitportfolio.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
]);

interface Req {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}
interface Res {
  status: (code: number) => Res;
  setHeader: (k: string, v: string) => void;
  send: (b: unknown) => void;
  json: (o: unknown) => void;
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export default async function handler(req: Req, res: Res) {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const origin = req.headers?.origin;
  if (typeof origin === "string" && origin.length > 0 && !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ error: "origin not allowed" });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = str(body.name, 200);
  const email = str(body.email, 320);
  const reason = str(body.reason, 100) || "General";
  const message = str(body.message, 5000);
  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields: name, email, message" });
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  if (!apiKey || !to) {
    res.status(500).json({ error: "Server not configured" });
    return;
  }
  try {
    const up = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: "Rachit Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `New enquiry — ${reason} (from ${name})`,
        text: `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`,
      }),
    });
    if (!up.ok) {
      const detail = await up.text();
      console.error("resend rejected:", up.status, detail.slice(0, 300));
      res.status(502).json({ error: "email provider rejected" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: "send failed" });
  }
}
