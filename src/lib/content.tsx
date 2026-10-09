import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { JOURNAL, PROJECTS, RESUME, STORY } from '../data'
import type { ResumeData } from '../data'

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
  resume: ResumeData
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
    ogImageUrl: '/og-image.webp',
  },
  storyCard: STORY.card,
  storyBody: STORY.body,
  resume: RESUME,
}

/* -------------------------------------------------------------------------- */
/*  Resume                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Turn the `resume` site_settings value into a ResumeData shape. The stored
 * value is a JSON string; anything that is missing, empty or unparsable falls
 * back field by field to the bundled copy. A *present but empty* skills /
 * education / projects array is honoured — the admin cleared it on purpose, and
 * the page hides the section instead of resurrecting the bundled list.
 *
 * Rows created before the resume rebuild (which stored `subtitle` + a single
 * `education` object) fall back to the bundled copy wholesale: their shape
 * can't express the new sections, and the old subtitle carried words the site
 * no longer uses. The admin can resave once, which stores the new shape.
 */
export function parseResume(
  value: string | null | undefined,
  fallback: ResumeData,
): ResumeData {
  if (!value) return fallback
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    return fallback
  }
  if (!raw || typeof raw !== 'object') return fallback
  const v = raw as Record<string, unknown>
  const blank = (field: unknown): field is string =>
    typeof field === 'string' && field.trim().length > 0
  // Legacy rows are identified by their old `subtitle` field and no `summary`.
  if (blank(v.subtitle) && !blank(v.summary)) return fallback

  const asObject = (entry: unknown): Record<string, unknown> | null =>
    entry && typeof entry === 'object'
      ? (entry as Record<string, unknown>)
      : null
  const skills = Array.isArray(v.skills)
    ? v.skills
        .map(asObject)
        .filter((group): group is Record<string, unknown> => Boolean(group))
        .map((group) => ({
          heading: blank(group.heading) ? group.heading : '',
          items: Array.isArray(group.items)
            ? group.items.filter(
                (item): item is string => typeof item === 'string',
              )
            : [],
        }))
        .filter((group) => group.heading || group.items.length > 0)
    : fallback.skills
  const education = Array.isArray(v.education)
    ? v.education
        .map(asObject)
        .filter((entry): entry is Record<string, unknown> => Boolean(entry))
        .map((entry) => ({
          title: blank(entry.title) ? entry.title : '',
          institution: blank(entry.institution) ? entry.institution : '',
          period: blank(entry.period) ? entry.period : '',
        }))
        .filter((entry) => entry.title || entry.institution || entry.period)
    : fallback.education
  const projects = Array.isArray(v.projects)
    ? v.projects
        .map(asObject)
        .filter((project): project is Record<string, unknown> => Boolean(project))
        .map((project) => ({
          title: typeof project.title === 'string' ? project.title : '',
          url: typeof project.url === 'string' ? project.url : undefined,
          desc: typeof project.desc === 'string' ? project.desc : '',
        }))
    : fallback.projects

  return {
    summary: blank(v.summary) ? v.summary : fallback.summary,
    skills: Array.isArray(v.skills) ? skills : fallback.skills,
    education: Array.isArray(v.education) ? education : fallback.education,
    projects: Array.isArray(v.projects) ? projects : fallback.projects,
    lastUpdated: blank(v.lastUpdated) ? v.lastUpdated : fallback.lastUpdated,
  }
}

/* -------------------------------------------------------------------------- */
/*  Live content                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The id of the JSON snapshot scripts/prerender.mjs embeds in every HTML page.
 * When it is present the provider hydrates from it and makes no request at
 * all — the homepage then renders entirely from baked data, with no `/api/content`
 * call on the critical path. Freshness comes from the admin's rebuild hook
 * (any save -> /api/rebuild -> deploy -> new baked snapshot), the same pattern
 * the blog already used.
 */
const INLINE_ID = 'site-content'

function readInlineContent(): SiteContent | null {
  if (typeof document === 'undefined') return null
  const el = document.getElementById(INLINE_ID)
  if (!el) return null
  try {
    const parsed = JSON.parse(el.textContent ?? 'null')
    return parsed && typeof parsed === 'object' ? (parsed as SiteContent) : null
  } catch {
    return null
  }
}

/**
 * One request to `api/content.ts` for every table this page renders.
 *
 * This exists only for builds without an embedded snapshot — i.e. `npm run dev`,
 * where scripts/prerender.mjs never ran. Production HTML always carries the
 * baked JSON above, so a live visitor never fetches this.
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
  resume?: string | null
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
   * content into the static HTML. On the client this is omitted and the provider
   * reads the embedded `#site-content` JSON instead, which is the same snapshot;
   * only a page with neither (vite dev) falls back to the live fetch.
   */
  initial?: SiteContent
  children: ReactNode
}

export function SiteContentProvider({ initial, children }: ProviderProps) {
  const [content, setContent] = useState<SiteContent>(
    initial ?? readInlineContent() ?? FALLBACK,
  )
  const staticRef = useRef<boolean>(
    initial !== undefined || readInlineContent() !== null,
  )

  useEffect(() => {
    if (staticRef.current) return
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
        resume:
          remote?.resume != null
            ? parseResume(remote.resume, prev.resume)
            : prev.resume,
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
