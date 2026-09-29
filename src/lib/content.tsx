import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { JOURNAL, PROJECTS, STORY } from '../data'

/* -------------------------------------------------------------------------- */
/*  Shapes                                                                    */
/* -------------------------------------------------------------------------- */

export interface Project {
  id: string
  title: string
  category: string
  tagline: string
  description: string
  tech: string[]
  imageUrl: string | null
  projectUrl: string | null
  accent: string
  displayOrder: number
  comingSoon: boolean
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  coverImageUrl: string | null
  published: boolean
  publishedAt: string | null
  updatedAt: string | null
}

export interface SiteSettings {
  heroBaseUrl: string
  heroRevealUrl: string
  ogImageUrl: string
}

export interface SiteContent {
  projects: Project[]
  posts: Post[]
  settings: SiteSettings
  storyCard: string
  storyBody: string
}

/* -------------------------------------------------------------------------- */
/*  Row -> shape mappers. Supabase columns are snake_case; the app is camel.    */
/* -------------------------------------------------------------------------- */

type Row = Record<string, unknown>

export function toProject(row: Row): Project {
  const projectUrl = (row.project_url as string | null) || null
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    category: String(row.category ?? ''),
    tagline: String(row.tagline ?? ''),
    description: String(row.description ?? ''),
    tech: Array.isArray(row.tech) ? (row.tech as string[]) : [],
    imageUrl: (row.image_url as string | null) || null,
    projectUrl,
    accent: String(row.accent ?? '#d62e4a'),
    displayOrder: Number(row.display_order ?? 0),
    comingSoon: !projectUrl,
  }
}

export function toPost(row: Row): Post {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    excerpt: String(row.excerpt ?? ''),
    content: String(row.content ?? ''),
    category: String(row.category ?? ''),
    coverImageUrl: (row.cover_image_url as string | null) || null,
    published: Boolean(row.published),
    publishedAt: (row.published_at as string | null) || null,
    updatedAt: (row.updated_at as string | null) || null,
  }
}

/* -------------------------------------------------------------------------- */
/*  Static fallback                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Everything renders from src/data.ts until Supabase answers. The seed file
 * contains the same values, so a successful live load is a no-op visually — but
 * if the project is unconfigured, unreachable, or empty, the site is never
 * blank. It is also what the pre-renderer bakes in, which is why every string
 * below still has to exist.
 */
export const FALLBACK: SiteContent = {
  projects: PROJECTS.map((project, index) => ({
    id: `local-${index}`,
    title: project.title,
    category: project.tag,
    tagline: project.tagline ?? '',
    description: project.description ?? '',
    tech: project.tech ?? [],
    imageUrl: project.image ?? null,
    projectUrl: project.href ?? null,
    accent: project.accent ?? '#d62e4a',
    displayOrder: index,
    comingSoon: Boolean(project.comingSoon),
  })),
  posts: JOURNAL.map((entry, index) => ({
    id: `local-${index}`,
    // The homepage only needs title + category. The slug is only ever navigated
    // to when the row came from the database.
    title: entry.title,
    slug: '',
    excerpt: '',
    content: '',
    category: entry.tag,
    coverImageUrl: null,
    published: true,
    publishedAt: null,
    updatedAt: null,
  })),
  settings: {
    heroBaseUrl: '/assets/hero-base.webp',
    heroRevealUrl: '/assets/hero-reveal.webp',
    ogImageUrl: '/og-image.png',
  },
  storyCard: STORY.card,
  storyBody: STORY.body,
}

/* -------------------------------------------------------------------------- */
/*  Live content                                                              */
/* -------------------------------------------------------------------------- */

/**
 * One request to `api/content.ts` for every table this page renders.
 *
 * This used to be three queries run straight from the browser through
 * `@supabase/supabase-js`. Four requests can't justify ~214 kB of SDK on a
 * public page view when the data is plain reads, and the service-role side is
 * the only place drafts and the admin-only tables are handled anyway. The SDK
 * is now reached only from the admin, which is where auth and writes live.
 *
 * Returns null when the endpoint is unreachable, unconfigured, or upstream —
 * i.e. whenever there is genuinely "no answer". An empty `projects`/`posts`
 * array that comes back inside a 200 is a deliberate answer and is honoured, so
 * deleting the last project still empties the section instead of resurrecting
 * the bundled copy.
 */
async function loadRemoteContent(): Promise<{
  settings?: Partial<SiteSettings>
  storyCard?: string
  storyBody?: string
  projects?: Row[]
  posts?: Row[]
} | null> {
  try {
    const response = await fetch('/api/content', { headers: { accept: 'application/json' } })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

const SiteContentContext = createContext<SiteContent>(FALLBACK)

interface ProviderProps {
  /**
   * Build-time snapshot. When present the provider renders exactly this and
   * never fetches — that is what lets scripts/prerender.mjs bake real Supabase
   * content into the static HTML. On the client this is omitted, so the app
   * starts from the static fallback and swaps in live data once it arrives.
   */
  initial?: SiteContent
  children: ReactNode
}

export function SiteContentProvider({ initial, children }: ProviderProps) {
  const [content, setContent] = useState<SiteContent>(initial ?? FALLBACK)
  const initialRef = useRef(initial)

  useEffect(() => {
    if (initialRef.current) return
    let cancelled = false

    void (async () => {
      const remote = await loadRemoteContent()
      if (cancelled) return
      setContent((prev) => ({
        // `null` (endpoint unreachable, unconfigured, or upstream failure) means
        // "no answer" and keeps whatever is already on screen. An empty array
        // inside a 200 is a deliberate answer from the admin and is honoured, so
        // deleting the last project actually empties the section. Image URLs are
        // the exception: blanking one falls back to the bundled asset, because an
        // empty src would render a broken image.
        //
        // Projects and posts are filtered and sorted here exactly as
        // mapBuildContent does for the static HTML, so the content a crawler reads
        // and the content this effect paints cannot drift apart.
        projects:
          remote?.projects?.map(toProject).sort((a, b) => a.displayOrder - b.displayOrder) ??
          prev.projects,
        posts:
          remote?.posts
            ?.map(toPost)
            .filter((post) => post.published)
            .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')) ??
          prev.posts,
        settings: {
          heroBaseUrl: remote?.settings?.heroBaseUrl || prev.settings.heroBaseUrl,
          heroRevealUrl:
            remote?.settings?.heroRevealUrl || prev.settings.heroRevealUrl,
          ogImageUrl: remote?.settings?.ogImageUrl || prev.settings.ogImageUrl,
        },
        storyCard: remote?.storyCard ?? prev.storyCard,
        storyBody: remote?.storyBody ?? prev.storyBody,
      }))
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return <SiteContentContext value={content}>{children}</SiteContentContext>
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext)
}
