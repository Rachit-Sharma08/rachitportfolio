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

// Single-line fields end up in the email subject, so control characters are
// flattened instead of trusted. The message body keeps its newlines.
function line(v: unknown, max: number): string {
  return str(v, max)
    // oxlint-disable-next-line no-control-regex -- flattening control chars is the point here
    .replace(/[\r\n\t\0-\x1f\x7f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Five submissions per IP per ten minutes. Enough for a person fixing a typo and
// resending; far below what a spam script wants. Kept in module memory, so it
// only covers one warm instance — see the shortcut note in the handler.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

// The form offers exactly these. Anything else becomes "General", so the value
// cannot put arbitrary text into the email subject.
const REASONS = new Set(["Hire me", "Collaborate", "Just say hi", "Other"]);

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing with every one-off IP seen on a warm instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function clientIp(headers: Req["headers"]): string {
  const real = headers?.["x-real-ip"];
  const realIp = Array.isArray(real) ? real[0] : real;
  if (realIp && realIp.trim()) return realIp.trim();
  const raw = headers?.["x-forwarded-for"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  // The left-most hop is client-supplied and spoofable; Vercel appends the
  // address it actually saw to the right, so read from there.
  const parts = (value ?? "").split(",");
  return parts[parts.length - 1].trim() || "unknown";
}

export default async function handler(req: Req, res: Res) {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const origin = req.headers?.origin;
  if (typeof origin !== "string" || !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ error: "origin not allowed" });
    return;
  }
  const contentType = req.headers?.["content-type"];
  if (typeof contentType !== "string" || !contentType.toLowerCase().includes("application/json")) {
    res.status(415).json({ error: "unsupported media type" });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Bots fill every field they can find. The trap answers 200 so the script
  // gets no signal to tune against, and no message is sent. A non-string value
  // (array/object) is a bot too: the real form only ever sends an empty string.
  if (body.hp != null && body.hp !== "") {
    console.warn("contact form honeypot hit", typeof body.hp);
    res.status(200).json({ ok: true });
    return;
  }

  const name = line(body.name, 200);
  const email = str(body.email, 320);
  const rawReason = line(body.reason, 40);
  const reason = REASONS.has(rawReason) ? rawReason : "General";
  const message = str(body.message, 5000);
  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields: name, email, message" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  // Counted after validation, so a malformed retry does not eat a real
  // visitor's budget.
  // shortcut: per-instance memory, so a burst spread over cold instances can
  // exceed 5/10min; move to Upstash/KV if the spam ever gets past the honeypot.
  if (rateLimited(clientIp(req.headers))) {
    res.status(429).json({ error: "too many messages, try again later" });
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
      // Without a deadline a hung provider holds the function until the
      // platform kills it and the visitor only sees a spinner.
      signal: AbortSignal.timeout(10000),
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
