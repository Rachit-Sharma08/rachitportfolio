// keepalive ping ka proxy: page /health -> yeh function -> Render backend /health
const BACKEND = "https://rachit-api.onrender.com";

export const config = { maxDuration: 60 };

interface Res {
  status: (code: number) => Res;
  setHeader: (k: string, v: string) => void;
  send: (b: unknown) => void;
  json: (o: unknown) => void;
}

export default async function handler(_req: unknown, res: Res) {
  try {
    const up = await fetch(`${BACKEND}/health`, { method: "GET" });
    const text = await up.text();
    res.status(up.status);
    res.setHeader("content-type", up.headers.get("content-type") || "application/json");
    res.send(text);
  } catch {
    res.status(502).json({ error: "backend unreachable" });
  }
}
