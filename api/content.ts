/**
 * GET /api/content
 *
 * The public read for everything the site renders from the database:
 * `site_settings`, `site_story`, `projects`, and published `blog_posts`.
 *
 * The first two have no anon RLS policy on purpose — the browser must not be
 * able to read or write them. The latter two do have anon read policies, but
 * reading them here as well is what lets the client drop `@supabase/supabase-js`
 * entirely: without this function the public bundle would download the SDK
 * (~214 kB) on every page view just to run four queries, and only the admin
 * ever needs it.
 *
 * This function runs on Vercel's Node runtime, holds the service-role key in a
 * server-only env var, and returns only the fields the public site renders. The
 * service-role key bypasses RLS, which is exactly why `blog_posts` is filtered
 * to `published = true` here rather than trusting a policy — a draft must not
 * leak through the one path that skips RLS. The key is read via `process.env`,
 * never `import.meta.env`, and this file is not imported by anything in `src/`.
 *
 * Rows are returned in their raw snake_case form and mapped by the client with
 * the same `toProject`/`toPost` helpers the admin uses, so the shape is defined
 * in exactly one place.
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

  const [projects, posts, settings, story] = await Promise.all([
    supabase.from('projects').select('*').order('display_order', { ascending: true }),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false }),
    supabase.from('site_settings').select('key, value'),
    supabase.from('site_story').select('section_key, content'),
  ])

  // One upstream failure returns nothing rather than a half-populated payload:
  // the client treats a non-200 as "no answer" and keeps the bundled copy, so a
  // flaky table can't mix live settings with stale projects on the same page.
  if (projects.error || posts.error || settings.error || story.error) {
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
    resume: values.resume ?? null,
    projects: projects.data ?? [],
    posts: posts.data ?? [],
  })
}
