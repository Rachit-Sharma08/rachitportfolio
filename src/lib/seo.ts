// Client-side head management. Two jobs:
//   1. keep <title> correct across client-side navigation (the pre-rendered HTML
//      only carries the title of the initially loaded route), and
//   2. write per-post meta for blog pages, which are data-driven and therefore
//      cannot live in the static table that scripts/seo-config.mjs reads.
//
// Everything here is additive: tags that already exist in the pre-rendered head
// are reused and rewritten, so the initial tags are never duplicated.
// Mirrors PAGES in scripts/seo-config.mjs. `npm run verify` asserts every value
// here matches that table, because a crawler reading the pre-rendered HTML and a
// visitor reading document.title after a client-side navigation must not be told
// two different things about the same page.
/**
 * Mirrors SITE_NAME in scripts/seo-config.mjs.
 *
 * This is the site, not the home page — the home `<title>` is a different string
 * on purpose. `applyMeta` used to write the bare name here, so a client-side
 * navigation quietly replaced the pre-rendered `og:site_name` with a shorter
 * one and the two disagreed depending on how the page was reached.
 */
export const SITE_NAME = 'Rachit Sharma — Digital Marketer'

export const PAGE_TITLES: Record<string, string> = {
  '/': 'Rachit Sharma — AI-Powered Digital Marketer',
  '/resume': 'Resume | Rachit Sharma, Digital Marketer',
  '/blog': 'Blog | Rachit Sharma',
  '*': 'Rachit Sharma — Page Not Found',
}

/**
 * Mirrors the `description` of every entry in PAGES in scripts/seo-config.mjs.
 *
 * The blog index used to carry its own retyped title and description, which is
 * how `/blog` ended up showing "Journal — Rachit Sharma" to anyone who reached
 * it by clicking and "Blog | Rachit Sharma" to anyone who loaded it directly.
 * One table, asserted against the build by `npm run verify`.
 */
export const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/': 'Rachit Sharma is a digital marketer who uses AI tools to build brands, campaigns and creative projects. Explore his work, story and blog.',
  '/resume':
    "Rachit Sharma's resume — a digital marketer pairing campaign strategy with 25+ AI tools. Education, skills and projects.",
  '/blog':
    'Notes on digital marketing, AI tooling, SEO and building with AI from Rachit Sharma — a digital marketer, learning in public.',
  '*': "That page doesn't exist. It may have been a journal post that is no longer published — everything currently published is on the Journal page.",
}

/** Mirrors TITLE_SEPARATOR in scripts/seo-config.mjs. */
export const TITLE_SEPARATOR = ' | '

/** Mirrors TITLE_MAX in scripts/seo-config.mjs. */
export const TITLE_MAX = 60

/**
 * `<title>` for a post: `<post title> | Rachit Sharma`.
 *
 * The suffix is dropped when it would push the title past what a result shows,
 * because a title truncated mid-suffix reads worse than one with no suffix at
 * all. Mirrors `postTitle` in scripts/seo-config.mjs — the verifier asserts the
 * two agree on the same inputs.
 */
export function postTitle(title: string): string {
  const withBrand = `${title}${TITLE_SEPARATOR}Rachit Sharma`
  return withBrand.length <= TITLE_MAX ? withBrand : title
}

/** Mirrors UPDATE_THRESHOLD_MS in scripts/seo-config.mjs. */
export const UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000

/**
 * Whether an edit to a post is real enough to claim in metadata.
 *
 * Supabase stamps `updated_at` on every save, so without this gate a typo fixed
 * ninety seconds after publishing still emits a `dateModified` — and a blog
 * where every post looks routinely revised is the fingerprint of structured-data
 * spam. Mirrors `isMeaningfullyUpdated` in scripts/seo-config.mjs.
 */
export function isMeaningfullyUpdated(
  publishedAt: string | null | undefined,
  updatedAt: string | null | undefined,
): boolean {
  if (!publishedAt || !updatedAt) return false
  const published = Date.parse(publishedAt)
  const updated = Date.parse(updatedAt)
  if (Number.isNaN(published) || Number.isNaN(updated)) return false
  return updated - published >= UPDATE_THRESHOLD_MS
}

export function titleForPath(pathname: string): string {
  const key = normalise(pathname)
  if (key === '/blog' || key.startsWith('/blog/')) return PAGE_TITLES['/blog']
  return PAGE_TITLES[key] ?? PAGE_TITLES['*']
}

function normalise(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

type TagName = 'meta' | 'link'

/**
 * Find an existing tag by its unique attribute, or create it.
 *
 * `<link>` carries its target in `href`; `<meta>` carries it in `content`. Writing
 * `content` onto a canonical link is silently ignored by browsers, which left the
 * pre-rendered homepage URL in place on every blog page.
 */
function upsert(
  doc: Document,
  tag: TagName,
  key: 'name' | 'property' | 'rel',
  value: string,
  target: string,
): void {
  let node = doc.head.querySelector<HTMLMetaElement | HTMLLinkElement>(
    `${tag}[${key}="${value}"]`,
  )
  if (!node) {
    node = doc.createElement(tag)
    node.setAttribute(key, value)
    doc.head.appendChild(node)
  }
  node.setAttribute(tag === 'link' ? 'href' : 'content', target)
}

const OG_IMAGE = '/og-image.png'

export interface PageMeta {
  title: string
  description: string
  /** Absolute or root-relative path. */
  path: string
  image?: string | null
  type?: 'website' | 'article'
  publishedTime?: string | null
}

/**
 * Rewrite the title, description, canonical, Open Graph and Twitter tags for the
 * current route. Safe to call on every navigation — it only touches the six
 * tags it owns.
 */
export function applyMeta(meta: PageMeta): void {
  const doc = document
  doc.title = meta.title

  const origin = doc.location.origin
  const url = new URL(meta.path, origin).href
  const image = meta.image ? new URL(meta.image, origin).href : new URL(OG_IMAGE, origin).href
  const type = meta.type ?? 'website'

  upsert(doc, 'meta', 'name', 'description', meta.description)
  upsert(doc, 'link', 'rel', 'canonical', url)

  upsert(doc, 'meta', 'property', 'og:type', type)
  upsert(doc, 'meta', 'property', 'og:url', url)
  upsert(doc, 'meta', 'property', 'og:title', meta.title)
  upsert(doc, 'meta', 'property', 'og:description', meta.description)
  upsert(doc, 'meta', 'property', 'og:image', image)
  upsert(doc, 'meta', 'property', 'og:site_name', SITE_NAME)

  upsert(doc, 'meta', 'name', 'twitter:card', 'summary_large_image')
  upsert(doc, 'meta', 'name', 'twitter:title', meta.title)
  upsert(doc, 'meta', 'name', 'twitter:description', meta.description)
  upsert(doc, 'meta', 'name', 'twitter:image', image)

  if (meta.publishedTime) {
    upsert(doc, 'meta', 'property', 'article:published_time', meta.publishedTime)
  } else {
    doc.head
      .querySelector('meta[property="article:published_time"]')
      ?.remove()
  }
}

/** JSON-LD for a single blog post. Reuses one <script> tagged `blog-post`. */
export function applyArticleSchema(post: {
  title: string
  description: string
  slug: string
  publishedAt: string | null
  updatedAt?: string | null
  image?: string | null
}): void {
  const doc = document
  // The pre-rendered head already carries this node — tagged by the pre-renderer
  // for exactly this reason. Removing it here is what stops the hydrated DOM from
  // holding two BlogPosting objects for one post.
  doc.querySelector('script[data-seo="blog-post"]')?.remove()

  const origin = doc.location.origin
  const updated = isMeaningfullyUpdated(post.publishedAt, post.updatedAt)
    ? post.updatedAt
    : null
  const script = doc.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.seo = 'blog-post'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    mainEntityOfPage: `${origin}/blog/${post.slug}`,
    datePublished: post.publishedAt ?? undefined,
    ...(updated ? { dateModified: updated } : {}),
    author: { '@type': 'Person', name: 'Rachit Sharma' },
    publisher: { '@type': 'Person', name: 'Rachit Sharma' },
    image: post.image
      ? new URL(post.image, origin).href
      : new URL(OG_IMAGE, origin).href,
  })
  doc.head.appendChild(script)
}

export function clearArticleSchema(): void {
  document.querySelector('script[data-seo="blog-post"]')?.remove()
}

/**
 * Keep the admin panel out of search results.
 *
 * The admin is a client-side route, so it is served the pre-rendered homepage
 * head — it would otherwise inherit that page's title, description and
 * canonical and be indexed as a duplicate of the homepage, with the sign-in form
 * as its snippet.
 */
export function setNoIndex(): void {
  const doc = document
  upsert(doc, 'meta', 'name', 'robots', 'noindex, nofollow')
  doc.head
    .querySelector('link[rel="canonical"]')
    ?.setAttribute('href', new URL(doc.location.pathname, doc.location.origin).href)
}

/** Undo {@link setNoIndex} when the app returns to a public route. */
export function setIndexable(): void {
  upsert(document, 'meta', 'name', 'robots', 'index, follow')
}
