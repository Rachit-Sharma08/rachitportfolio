import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AppContent } from './App'
import { FALLBACK, toPost, toProject } from './lib/content'
import type { Post, Project, SiteContent } from './lib/content'

/**
 * Raw rows as they come out of Supabase, grouped by table. scripts/prerender.mjs
 * fetches these in Node with the service-role key and hands them over, so the
 * service role never has to be visible to the browser bundle.
 */
export interface BuildContentRaw {
  projects?: Record<string, unknown>[] | null
  posts?: Record<string, unknown>[] | null
  settings?: Record<string, unknown>[] | null
  story?: Record<string, unknown>[] | null
}

/**
 * Turn raw rows into a SiteContent snapshot, falling back field by field. A
 * build with no Supabase credentials or an unreachable project still produces a
 * complete site — it just ships the static copy instead.
 *
 * An array that is present but empty is a real answer, not a failure: the admin
 * is allowed to delete every project or post. `undefined` is what a failed query
 * looks like, and only that falls back.
 */
export function mapBuildContent(raw: BuildContentRaw): SiteContent {
  const projects: Project[] | null = raw.projects
    ? (raw.projects.map(toProject) as Project[]).sort(
        (a, b) => a.displayOrder - b.displayOrder,
      )
    : null

  const posts: Post[] | null = raw.posts
    ? (raw.posts.map(toPost) as Post[])
        .filter((post) => post.published)
        .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    : null

  const settings: Record<string, string> = {}
  for (const row of raw.settings ?? []) {
    settings[String(row.key)] = String(row.value ?? '')
  }
  const story: Record<string, string> = {}
  for (const row of raw.story ?? []) {
    story[String(row.section_key)] = String(row.content ?? '')
  }

  // Distinguishes "no row saved yet" from "row saved and deliberately blank".
  const storyValue = (key: string, fallback: string): string =>
    key in story ? story[key] : fallback

  return {
    projects: projects ?? FALLBACK.projects,
    posts: posts ?? FALLBACK.posts,
    // Image URLs keep the `||`: a blanked URL would render a broken image, so
    // falling back to the bundled asset is the safer reading of "cleared".
    settings: {
      heroBaseUrl:
        settings.hero_base_url || FALLBACK.settings.heroBaseUrl,
      heroRevealUrl:
        settings.hero_reveal_url || FALLBACK.settings.heroRevealUrl,
      ogImageUrl: settings.og_image_url || FALLBACK.settings.ogImageUrl,
    },
    storyCard: storyValue('my_story_card', FALLBACK.storyCard),
    storyBody: storyValue('my_story', FALLBACK.storyBody),
  }
}

/** Every path that gets its own static HTML file. */
export function routesFor(content: SiteContent): string[] {
  return [
    '/',
    '/resume',
    '/blog',
    // The bundled sample posts have no slug, so they are deliberately not
    // routable. Without this filter each one would emit a duplicate /blog/ file
    // and a duplicate sitemap entry.
    ...content.posts
      .filter((post) => post.slug)
      .map((post) => `/blog/${post.slug}`),
  ]
}

export function renderRoute(path: string, initial?: SiteContent): string {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppContent initialContent={initial} />
    </MemoryRouter>,
  )
}
