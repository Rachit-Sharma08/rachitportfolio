// Proxy: browser -> Vercel (same-origin) -> Render backend.
// Origin header forward NAHI hota, isliye backend CORS check me koi dikkat nahi.
const BACKEND = "https://rachit-api.onrender.com";

export const config = { maxDuration: 60 };

interface Req {
  method?: string;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  setHeader: (k: string, v: string) => void;
  send: (b: unknown) => void;
  json: (o: unknown) => void;
}

export default async function handler(req: Req, res: Res) {
  if ((req.method || "GET").toUpperCase() !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  try {
    const up = await fetch(`${BACKEND}/api/send-email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}),
    });
    const text = await up.text();
    res.status(up.status);
    res.setHeader("content-type", up.headers.get("content-type") || "application/json");
    res.send(text);
  } catch {
    res.status(502).json({ error: "backend unreachable" });
  }
}
