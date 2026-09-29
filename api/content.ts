/**
 * GET /api/content
 *
 * The public read for `site_settings` and `site_story`. Those two tables have no
 * anon RLS policy on purpose — the browser must not be able to read or write
 * them. This function is the sanctioned way in: it runs on Vercel's Node
 * runtime, holds the service-role key in a server-only env var, and returns
 * only the handful of fields the public site actually renders.
 *
 * The service-role key bypasses RLS, which is exactly why it must never be
 * reachable from the browser. It is read here via `process.env`, not
 * `import.meta.env`, and the file is not imported by anything under `src/`.
 *
 * Response is cached at the edge for 5 minutes, so a cold function start and
 * the Supabase round trip are both off the critical path for repeat visitors.
 * `stale-while-revalidate` keeps the first visitor after an edit from waiting.
 */

import { createClient } from '@supabase/supabase-js'

const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'

interface Req {
  method?: string
}

interface Res {
  status(code: number): Res
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

export default async function handler(req: Req, res: Res) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    res.setHeader('Cache-Control', CACHE_CONTROL)
    res.status(503).json({ error: 'not_configured' })
    return
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const [settings, story] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('site_story').select('section_key, content'),
  ])

  if (settings.error || story.error) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).json({ error: 'upstream_failed' })
    return
  }

  const values: Record<string, string> = {}
  for (const row of settings.data ?? []) values[row.key] = row.value

  const copy: Record<string, string> = {}
  for (const row of story.data ?? []) copy[row.section_key] = row.content

  res.setHeader('Cache-Control', CACHE_CONTROL)
  res.status(200).json({
    settings: {
      heroBaseUrl: values.hero_base_url ?? '',
      heroRevealUrl: values.hero_reveal_url ?? '',
      ogImageUrl: values.og_image_url ?? '',
    },
    storyCard: copy.my_story_card ?? '',
    storyBody: copy.my_story ?? '',
  })
}
