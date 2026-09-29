// Client-side head management. Two jobs:
//   1. keep <title> correct across client-side navigation (the pre-rendered HTML
//      only carries the title of the initially loaded route), and
//   2. write per-post meta for blog pages, which are data-driven and therefore
//      cannot live in the static table that scripts/seo-config.mjs reads.
//
// Everything here is additive: tags that already exist in the pre-rendered head
// are reused and rewritten, so the initial tags are never duplicated.
export const PAGE_TITLES: Record<string, string> = {
  '/': 'Rachit Sharma — Digital Marketer Building With AI',
  '/resume': 'Rachit Sharma — Resume',
  '/blog': 'Journal — Rachit Sharma',
  '*': 'Rachit Sharma — Page Not Found',
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
  upsert(doc, 'meta', 'property', 'og:site_name', 'Rachit Sharma')

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
  image?: string | null
}): void {
  const doc = document
  doc.querySelector('script[data-seo="blog-post"]')?.remove()

  const origin = doc.location.origin
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
