// The pre-rendered `<head>` for one route, as a pure function of (route,
// content).
//
// Split out of prerender.mjs so `npm run verify` can assert the head a route
// *would* get — titles, canonical, OG/Twitter mirroring, the Person, WebSite,
// ProfilePage, BreadcrumbList and Article schemas, the `dateModified` gate —
// against a synthetic snapshot.
// Those were previously only checkable by grepping a local build that has no
// database in it, which is how the last few titles on this site drifted apart
// without anything going red.
import {
  OG_IMAGE,
  PAGES,
  PERSON_ID,
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

// The resume's "last updated" value is authored as display text ("October
// 2026"). JSON-LD needs a real date, so turn the label into a year-month.
// Nothing is invented: an unrecognised label yields null and no date is emitted
// for it at all, and no day is ever added to a value that was only ever a month.
const ISO_MONTHS = {
  January: '01',
  February: '02',
  March: '03',
  April: '04',
  May: '05',
  June: '06',
  July: '07',
  August: '08',
  September: '09',
  October: '10',
  November: '11',
  December: '12',
}

export function isoYearMonth(label) {
  if (typeof label !== 'string') return null
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(label.trim())
  if (!match) return null
  const month = ISO_MONTHS[match[1]]
  return month ? `${match[2]}-${month}` : null
}

/**
 * A calendar value expressed as a comparable point in time, or null when it is
 * not a real date. A year-month ("2026-10") has no day, so for the comparison
 * it counts as the first of that month — while the value that ships stays the
 * original below, never the expanded form.
 */
export function comparisonTime(value) {
  if (typeof value !== 'string' || !value) return null
  const time = Date.parse(/^\d{4}-\d{2}$/.test(value) ? `${value}-01T00:00:00Z` : value)
  return Number.isNaN(time) ? null : time
}

/** The newest of the given real dates, returned as its original value unchanged. */
export function newestRealDate(values) {
  let newest = null
  let newestTime = null
  for (const value of values) {
    const time = comparisonTime(value)
    if (time != null && (newestTime == null || time > newestTime)) {
      newest = value
      newestTime = time
    }
  }
  return newest
}

/**
 * The date a post stands for on the home page: the update when the edit was a
 * real one, the publication otherwise — the same rule the Article schema uses.
 */
function postEffectiveDate(post) {
  return isMeaningfullyUpdated(post.publishedAt, post.updatedAt) ? post.updatedAt : post.publishedAt
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
  const schemas = [{ json: personSchema() }]

  // T8 — a real date only. The resume entry is a display label ("October 2026")
  // with no day, so it becomes a year-month and nothing is invented. The home
  // page claims the newest date on the whole site: the resume's own, or the
  // newest post edit/publication, whichever is later. Comparisons treat a
  // year-month as the first of that month, while the value that ships stays the
  // original (the resume stays "2026-10", a post stays its full datetime).
  const resumeModified = isoYearMonth(content?.resume?.lastUpdated)
  const homeModified = newestRealDate([
    resumeModified,
    ...(content?.posts ?? []).map(postEffectiveDate),
  ])

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
          '@type': 'Article',
          headline: post.title,
          description,
          mainEntityOfPage: url,
          datePublished: post.publishedAt ?? undefined,
          ...(updated ? { dateModified: updated } : {}),
          author: { '@type': 'Person', '@id': PERSON_ID, name: 'Rachit Sharma' },
          publisher: { '@type': 'Person', '@id': PERSON_ID, name: 'Rachit Sharma' },
          // The brief asks for the image only when the post actually has one;
          // the og:image that falls back to the site card stays a feed concern.
          ...(post.coverImageUrl ? { image: absoluteUrl(post.coverImageUrl) } : {}),
        },
        // Tagged so the hydrated page finds and replaces this exact node instead
        // of appending a second Article beside it.
        seo: 'blog-post',
      })
    }
  }

  page = page ?? PAGES['/']
  if (route === '/') {
    schemas.push({ json: websiteSchema(url) })
    // The home page is the profile page: mainEntity points back at the Person
    // @id, so the entity a search engine reads for "who is Rachit Sharma" is
    // the same one the answer engines assemble answers from.
    schemas.push({
      json: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: { '@id': PERSON_ID },
        url,
        // The newest real date on the site, or nothing at all when none exists.
        ...(homeModified ? { dateModified: homeModified } : {}),
      },
    })
  }
  if (route === '/resume' || route === '/blog') {
    // A breadcrumb ties the page into site structure for both search engines
    // and answer engines, and says plainly that these are our own pages.
    schemas.push({
      json: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: route === '/resume' ? 'Resume' : 'Blog',
            item: url,
          },
        ],
      },
    })
  }
  if (route === '/resume') {
    // The resume page is the person's profile too: same Person @id as home, a
    // url that says which page this profile describes, and the dateModified
    // straight from the resume data source as a year-month — no day invented.
    schemas.push({
      json: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: { '@id': PERSON_ID },
        url,
        ...(resumeModified ? { dateModified: resumeModified } : {}),
      },
    })
  }

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