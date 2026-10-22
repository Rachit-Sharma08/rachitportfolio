/**
 * POST /api/rebuild
 *
 * Triggers a fresh Vercel deploy so a newly published post gets pre-rendered
 * into `dist/blog/<slug>/index.html` and appended to `sitemap.xml`. Those files
 * are written at build time by scripts/prerender.mjs, so without this a new
 * post would be reachable in the SPA but invisible to crawlers.
 *
 * Two things protect the deploy hook:
 *   1. the URL lives in a server-only env var, so a visitor can never read it
 *      out of the bundle and spam deploys;
 *   2. the caller must present a Supabase access token, and that token's email
 *      has to match ADMIN_EMAIL. The token is verified against Supabase's auth
 *      server, not decoded locally, so a forged JWT won't pass.
 *
 * RLS is the real write gate — this endpoint is only about the rebuild.
 */

import { createClient } from '@supabase/supabase-js'

// The hook call below is capped at 10s; give the platform room for the token
// check that happens first.
export const config = { maxDuration: 30 }

interface Req {
  method?: string
  headers: Record<string, string | string[] | undefined>
}

interface Res {
  status(code: number): Res
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

function bearer(req: Req): string | null {
  const raw = req.headers.authorization
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const match = /^Bearer\s+(.+)$/i.exec(value.trim())
  return match ? match[1].trim() : null
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const hook = process.env.SITE_REBUILD_HOOK

  if (!url || !anonKey || !adminEmail) {
    res.status(503).json({ error: 'not_configured' })
    return
  }

  const token = bearer(req)
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' })
    return
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(token)
  const email = (data?.user?.email ?? '').trim().toLowerCase()

  if (error || !email || email !== adminEmail) {
    res.status(403).json({ error: 'forbidden' })
    return
  }

  if (!hook) {
    // Not fatal: the post is already live in the SPA, it just won't be
    // pre-rendered until the next deploy for any other reason.
    res.status(202).json({ triggered: false, reason: 'no_hook_configured' })
    return
  }

  let ping: Response
  try {
    ping = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(10000) })
  } catch {
    // The hook never answered. The admin can press publish again; the post is
    // already saved, only the rebuild did not start.
    res.status(504).json({ error: 'hook_timeout' })
    return
  }
  if (!ping.ok) {
    res.status(502).json({ error: 'hook_failed', status: ping.status })
    return
  }

  res.status(202).json({ triggered: true })
}
