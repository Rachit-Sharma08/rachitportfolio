// The pre-rendered `<head>` for one route, as a pure function of (route,
// content).
//
// Split out of prerender.mjs so `npm run verify` can assert the head a route
// *would* get — titles, canonical, OG/Twitter mirroring, the Person and
// BlogPosting schema, the `dateModified` gate — against a synthetic snapshot.
// Those were previously only checkable by grepping a local build that has no
// database in it, which is how the last few titles on this site drifted apart
// without anything going red.
import {
  OG_IMAGE,
  PAGES,
  SITE_NAME,
  SITE_URL,
  isMeaningfullyUpdated,
  personSchema,
  postTitle,
  websiteSchema,
} from './seo-config.mjs'

export function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Absolute URL for a stored media path. Covers uploaded images already being a
 * full Supabase URL — prefixing those with SITE_URL would produce nonsense like
 * "https://site.comhttps://…", which no crawler can fetch.
 */
function absoluteUrl(value) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

/**
 * JSON-LD is embedded in a <script> element, and JSON.stringify does not escape
 * "<". A post title containing "</script>" would therefore close the tag early
 * and let anything after it run as script. Escaping "<" as "<" is valid JSON,
 * parses identically, and cannot terminate the element.
 */
export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * The fixed routes come from PAGES, which is also what gets a static HTML file
 * behind it — so a route cannot have a page here and no document to serve it.
 * `/blog/:slug` has no entry and is resolved from the snapshot below.
 */
function pageFor(route) {
  return PAGES[route] ?? null
}

export function headFor(route, content) {
  const url = `${SITE_URL}${route}`
  let page = pageFor(route)
  // Person is emitted on every page: it is the author of a post and the owner
  // of the site, and search engines use it to tie the two together.
  const schemas = [{ json: personSchema(url) }]

  // Social preview image. A post with its own cover uses it, so the card that
  // shows up in a feed matches the post; everything else uses the site image.
  let socialImage = absoluteUrl(OG_IMAGE)
  let socialImageAlt = 'Rachit Sharma — Digital Marketer'
  let isArticle = false

  if (!page && route.startsWith('/blog/')) {
    const slug = route.slice('/blog/'.length)
    const post = content?.posts.find((p) => p.slug === slug)
    if (post) {
      const title = postTitle(post.title)
      const description =
        post.excerpt ||
        `${post.title}. Notes on digital marketing and AI by Rachit Sharma.`
      const image = post.coverImageUrl
        ? absoluteUrl(post.coverImageUrl)
        : socialImage
      if (post.coverImageUrl) {
        socialImage = image
        socialImageAlt = post.title
      }
      isArticle = true
      page = { title, description }
      // `dateModified` only for an edit that was real. Supabase stamps
      // `updated_at` on every save, so an unconditional one makes every post
      // look routinely revised — see UPDATE_THRESHOLD_MS.
      const updated = isMeaningfullyUpdated(post.publishedAt, post.updatedAt)
        ? post.updatedAt
        : null
      schemas.push({
        json: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description,
          mainEntityOfPage: url,
          datePublished: post.publishedAt ?? undefined,
          ...(updated ? { dateModified: updated } : {}),
          author: { '@type': 'Person', name: 'Rachit Sharma' },
          publisher: { '@type': 'Person', name: 'Rachit Sharma' },
          image,
        },
        // Tagged so the hydrated page finds and replaces this exact node instead
        // of appending a second BlogPosting beside it.
        seo: 'blog-post',
      })
    }
  }

  page = page ?? PAGES['/']
  if (route === '/') schemas.push({ json: websiteSchema(url) })

  const t = escapeAttr(page.title)
  const d = escapeAttr(page.description)
  const social = escapeAttr(socialImage)
  const socialAlt = escapeAttr(socialImageAlt)

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${isArticle ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${social}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${socialAlt}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${social}" />`,
    ...schemas.map(
      ({ json, seo }) =>
        `<script type="application/ld+json"${seo ? ` data-seo="${seo}"` : ''}>${safeJson(json)}</script>`,
    ),
  ].join('\n    ')
}