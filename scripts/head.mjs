// The pre-rendered `<head>` for one route, as a pure function of (route,
// content).
//
// Split out of prerender.mjs so `npm run verify` can assert the head a route
// *would* get — titles, canonical, OG/Twitter mirroring, the Person, WebSite,
// ProfilePage, BreadcrumbList and Article schemas, the `dateModified` gate, and
// the production-only analytics tag —
// against a synthetic snapshot.
// Those were previously only checkable by grepping a local build that has no
// database in it, which is how the last few titles on this site drifted apart
// without anything going red.
import {
  GA_MEASUREMENT_ID,
  OG_IMAGE,
  PAGES,
  PERSON_ID,
  PRODUCTION_HOST,
  RESUME_MODIFIED,
  SITE_NAME,
  SITE_URL,
  analyticsEnabled,
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
// 2026"). It used to be the source of the schema date, as a year-month — which is
// not a date a validator accepts, and is exactly what Search Console flagged. It
// no longer ships: `RESUME_MODIFIED` carries the real day and `isoDate` is what
// writes it. This stays as the reader for that label, used by the verifier to
// check the two still agree about which month the resume claims.
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
 * not a real date. Used to pick the newest date on the site and to test "is this
 * in the future"; a year-month counts as the first of that month, so a value
 * that only ever had a month still compares correctly.
 */
export function comparisonTime(value) {
  if (typeof value !== 'string' || !value) return null
  const time = Date.parse(/^\d{4}-\d{2}$/.test(value) ? `${value}-01T00:00:00Z` : value)
  return Number.isNaN(time) ? null : time
}

/**
 * A stored date as a full ISO calendar date (`YYYY-MM-DD`), or null when there is
 * no real day to give.
 *
 * Structured data dates have to be a complete ISO 8601 date: a bare `2026-10`
 * made Search Console report the ProfilePage's `dateModified` as an invalid
 * datetime. Everything that reaches JSON-LD goes through here — the resume's
 * commit date, a post's publication and update — so the three shapes a stored
 * value can have are handled in one place.
 *
 *   - a full ISO datetime → its calendar date, no time invented
 *   - a full date already  → itself
 *   - a year-month         → null. The day is not known, and picking one
 *                            (e.g. the 1st) would be a fabricated date
 *   - anything else, or a date in the future → null
 *
 * A null means the field is left out of the schema entirely rather than filled
 * with a guess, which is what the date validators want to see.
 */
export function isoDate(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  const match = /^(\d{4}-\d{2}-\d{2})(?:[T ].*)?$/.exec(trimmed)
  if (!match) return null
  const time = Date.parse(`${match[1]}T00:00:00Z`)
  if (Number.isNaN(time)) return null
  return time <= Date.now() ? match[1] : null
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
 * Both go through {@link isoDate}, so the home page compares real calendar days.
 */
function postEffectiveDate(post) {
  const value = isMeaningfullyUpdated(post.publishedAt, post.updatedAt)
    ? post.updatedAt
    : post.publishedAt
  return isoDate(value)
}

/**
 * The fixed routes come from PAGES, which is also what gets a static HTML file
 * behind it — so a route cannot have a page here and no document to serve it.
 * `/blog/:slug` has no entry and is resolved from the snapshot below.
 */
function pageFor(route) {
  return PAGES[route] ?? null
}

/**
 * Google Analytics 4 — the standard gtag.js snippet, written once per page into
 * the pre-rendered head.
 *
 * Three things this deliberately is not:
 *
 * - **Not in local or preview builds.** `analyticsEnabled()` is the gate, so a
 *   developer's own refreshes never reach the reports.
 * - **Not twice.** It lives only in this string. Nothing in the app injects it,
 *   and the client never touches it, so a page cannot end up with two — the one
 *   way a "never twice" requirement usually breaks. `npm run verify` asserts the
 *   shipped bundle contains no analytics reference at all, which is what keeps
 *   that true.
 * - **Not on /admin.** The admin panel has no document of its own: Vercel serves
 *   it the pre-rendered homepage (see vercel.json), so the snippet is already in
 *   the HTML it loads and only the browser knows which URL it is on. Hence the
 *   guard around the config call — see the comment there.
 *
 * The inline half has to stay on one line: `composeHtml` splits the head on
 * newlines and re-indents each line, so a multi-line snippet would be reflowed
 * into the document.
 *
 * A config call sends exactly one page_view per document load. Nothing here
 * listens for history changes, so a client-side route change reports nothing
 * rather than reporting twice.
 */
function analyticsTags() {
  if (!analyticsEnabled()) return []
  return [
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>`,
    // Standard snippet (dataLayer, gtag, `js`, `config`) with two guards on the
    // config call, which is the call that reports:
    //   1. the host must be the one this build targets — a production document
    //      opened over a preview or localhost URL stays silent;
    //   2. never under /admin — the same rule `isAdminPath` applies to the router
    //      in src/App.tsx, and it has to be spelled the same way, because the
    //      alternative is tracking the login screen.
    // Nothing personal is passed: no user id, no email, no phone, no custom
    // dimensions — only the page URL the browser already had.
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());if(location.host==='${PRODUCTION_HOST}'&&location.pathname!=='/admin'&&location.pathname.indexOf('/admin/')!==0){gtag('config','${GA_MEASUREMENT_ID}')}</script>`,
  ]
}

export function headFor(route, content) {
  const url = `${SITE_URL}${route}`
  let page = pageFor(route)
  // Person is emitted on every page: it is the author of a post and the owner
  // of the site, and search engines use it to tie the two together.
  const schemas = [{ json: personSchema() }]

  // Every date that reaches JSON-LD is a full ISO calendar date (`isoDate`).
  // The resume's own last-updated field is display text with no day in it, so
  // the day comes from RESUME_MODIFIED — the commit that last wrote the resume —
  // and the label is only what says a resume exists to be dated at all. The home
  // page claims the newest date on the whole site: the resume's, or the newest
  // post edit/publication, whichever is later. Nothing is invented and nothing in
  // the future is emitted; a value with no real day is left out.
  const resumeModified = content?.resume?.lastUpdated ? RESUME_MODIFIED : null
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
        ? isoDate(post.updatedAt)
        : null
      schemas.push({
        json: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description,
          mainEntityOfPage: url,
          datePublished: isoDate(post.publishedAt) ?? undefined,
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
    // url that says which page this profile describes, and the day the resume
    // was last really written — a full ISO date, never the display label's
    // month.
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
    ...analyticsTags(),
  ].join('\n    ')
}