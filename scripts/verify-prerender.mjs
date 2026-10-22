// Exercises the real pre-render pipeline with a synthetic Supabase snapshot, so
// the post page + sitemap path is verified without a live project. Run with:
//   node scripts/verify-prerender.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import {
  SITE_URL,
  SITE_NAME,
  PAGES,
  NOT_FOUND,
  DEFINITION,
  HOME_DESCRIPTION,
  BLOG_DESCRIPTION,
  SOCIALS,
  TITLE_SEPARATOR,
  TITLE_MAX,
  UPDATE_THRESHOLD_MS,
  PERSON_ID,
  GA_MEASUREMENT_ID,
  PRODUCTION_HOST,
  analyticsEnabled,
  RESUME_MODIFIED,
  KNOWS_ABOUT,
  QUICK_FACTS,
  postTitle,
  isMeaningfullyUpdated,
} from './seo-config.mjs'
import {
  headFor,
  escapeAttr,
  isoYearMonth,
  isoDate,
  comparisonTime,
  newestRealDate,
} from './head.mjs'

const ssr = await import(
  pathToFileURL(path.join(process.cwd(), 'dist-ssr', 'prerender.js')).href
)
const { mapBuildContent, routesFor, renderRoute } = ssr

let failures = 0
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got ${JSON.stringify(actual)}\n        want ${JSON.stringify(expected)}`}`)
}

const RAW = {
  projects: [
    {
      id: 'p2',
      title: 'Neon Car Racing',
      category: 'Game · AI',
      tagline: 'Drift physics',
      description: 'Built with AI',
      tech: ['Three.js'],
      image_url: 'https://x.supabase.co/storage/v1/object/public/site-media/projects/neon.webp',
      project_url: 'https://github.com/x/neon',
      accent: '#a11f3c',
      display_order: 2,
    },
    {
      id: 'p1',
      title: 'Fitness Website',
      category: 'Web · Fitness',
      tagline: 'Landing page',
      description: 'Conversion focused',
      tech: ['UI Design'],
      image_url: null,
      project_url: null,
      accent: '#d62e4a',
      display_order: 1,
    },
  ],
  posts: [
    {
      id: 'b1',
      title: 'One Brief, One Campaign Sprint',
      slug: 'one-brief-one-campaign-sprint',
      excerpt: 'How a single prompt can replace a week of campaign planning.',
      content: '## The brief\n\nStart with **one** page.\n\n- Prompt it\n- Review it',
      category: 'AI · Prompting',
      cover_image_url: null,
      published: true,
      published_at: '2026-01-05T10:00:00Z',
      updated_at: '2026-02-02T10:00:00Z',
    },
    {
      id: 'b2',
      title: 'A Draft',
      slug: 'a-draft',
      excerpt: '',
      content: 'secret',
      category: 'SEO',
      cover_image_url: null,
      published: false,
      published_at: null,
      updated_at: '2026-03-03T10:00:00Z',
    },
    {
      id: 'b3',
      title: 'SEO Is Not Dead',
      slug: 'seo-is-not-dead',
      excerpt: 'Search changed. Writing did not.',
      content: 'Plain paragraph.',
      category: 'SEO',
      cover_image_url: null,
      published: true,
      published_at: '2025-12-01T10:00:00Z',
      updated_at: '2025-12-01T10:00:00Z',
    },
  ],
  settings: [
    { key: 'hero_base_url', value: 'https://x.supabase.co/hero/new.webp' },
    { key: 'hero_reveal_url', value: '' },
    { key: 'og_image_url', value: 'https://x.supabase.co/og.webp' },
  ],
  story: [
    { section_key: 'my_story_card', content: 'A **new** card.' },
    { section_key: 'my_story', content: 'First para.\n\nSecond para.' },
  ],
}

const content = mapBuildContent(RAW)

check('projects sorted by display_order', content.projects.map((p) => p.title), [
  'Fitness Website',
  'Neon Car Racing',
])
check('drafts excluded from posts', content.posts.map((p) => p.slug), [
  'one-brief-one-campaign-sprint',
  'seo-is-not-dead',
])
check('posts newest first', content.posts.map((p) => p.publishedAt), [
  '2026-01-05T10:00:00Z',
  '2025-12-01T10:00:00Z',
])
check('empty setting falls back to the bundled file', content.settings.heroRevealUrl, '/assets/hero-reveal.webp')
check('setting applied', content.settings.heroBaseUrl, 'https://x.supabase.co/hero/new.webp')
check('story card from db', content.storyCard, 'A **new** card.')
check('missing project_url becomes comingSoon', content.projects[0].comingSoon, true)
check('routes include every published post', routesFor(content), [
  '/',
  '/resume',
  '/digital-marketer-kaithal',
  '/blog',
  '/blog/one-brief-one-campaign-sprint',
  '/blog/seo-is-not-dead',
])

const post = renderRoute('/blog/one-brief-one-campaign-sprint', content)
check('post title in html', post.includes('One Brief, One Campaign Sprint'), true)
check('draft title absent from every page', post.includes('>A Draft<'), false)
check('markdown heading rendered', /<h2[^>]*>The brief<\/h2>/.test(post), true)
check('markdown bold rendered', post.includes('<strong>one</strong>'), true)
check('markdown list rendered', post.includes('<li>Prompt it</li>'), true)
check('markdown link scheme check drops javascript:', !post.includes('javascript:'), true)
check('excerpt rendered', post.includes('How a single prompt'), true)

// The byline is the one place a reader is told who wrote the post and given a
// way to find out, and it has to be a real link with a real target in the HTML —
// not something the client appends after hydration.
check('post names its author', post.includes('Rachit Sharma'), true)
check('post byline links to About', post.includes('href="/#about"'), true)
check('post shows its publish date', post.includes('<time'), true)
check('a month-later edit shows as Updated', post.includes('Updated <time'), true)

const sameDatePost = renderRoute('/blog/seo-is-not-dead', content)
check('a same-instant save shows no Updated line', sameDatePost.includes('Updated <time'), false)
check('a same-instant save still shows the author', sameDatePost.includes('Rachit Sharma'), true)

const home = renderRoute('/', content)
check('home uses the uploaded hero image', home.includes('https://x.supabase.co/hero/new.webp'), true)
check('home falls back for the unset hero layer', home.includes('/assets/hero-reveal.webp'), true)
check('home story card from db', home.includes('A <strong>new</strong> card.'), true)
check('home project from db', home.includes('Neon Car Racing'), true)
check('journal rows link to real slugs', home.includes('/blog/one-brief-one-campaign-sprint'), true)
check('unpublished draft never appears on home', home.includes('>A Draft<'), false)

const blog = renderRoute('/blog', content)
check('blog lists only published posts', (blog.match(/\/blog\//g) || []).length >= 2, true)

// Malicious markdown must not execute.
const evil = mapBuildContent({
  posts: [
    {
      id: 'x',
      title: 'XSS',
      slug: 'xss',
      excerpt: '',
      content:
        '<script>alert(1)</script>\n\n<img src=x onerror=alert(3)>\n\n# Real heading',
      category: 'x',
      cover_image_url: null,
      published: true,
      published_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ],
})
const evilHtml = renderRoute('/blog/xss', evil)
check('script tag escaped, not emitted', !evilHtml.includes('<script>alert(1)</script>'), true)
check('raw html tag escaped, not emitted', !evilHtml.includes('<img src=x'), true)
check('raw html printed as literal text', evilHtml.includes('&lt;img src=x onerror=alert(3)&gt;'), true)
check('javascript: link neutralised', !evilHtml.includes('href="javascript:'), true)

// "undefined" means the query failed — the pre-render script bails out before
// calling the mapper in that case, so a missing key must fall back to the copy.
const failed = mapBuildContent({})
check('failed query keeps bundled projects', failed.projects.length, 3)
check('failed query keeps bundled story', failed.storyCard.length > 0, true)
check('failed query keeps bundled hero', failed.settings.heroBaseUrl, '/assets/hero-base.webp')
check('failed query still lists the 4 static routes', routesFor(failed), ['/', '/resume', '/digital-marketer-kaithal', '/blog'])

// An empty array means "the admin deleted everything" and must be honoured,
// otherwise deleting the last row would silently resurrect the seeded content.
// An empty `story` array means no row was ever saved, which is different from a
// row that was saved and deliberately blanked.
const emptied = mapBuildContent({
  projects: [],
  posts: [],
  settings: [],
  story: [
    { section_key: 'my_story_card', content: '' },
    { section_key: 'my_story', content: '' },
  ],
})
check('empty project table is honoured', emptied.projects, [])
check('empty post table is honoured', emptied.posts, [])
check('cleared story card is honoured', emptied.storyCard, '')
check('routes for an emptied site', routesFor(emptied), ['/', '/resume', '/digital-marketer-kaithal', '/blog'])

const emptiedHome = renderRoute('/', emptied)
check('emptied home has no seeded project', emptiedHome.includes('Neon Car Racing'), false)
check('emptied home has no seeded story', emptiedHome.includes('First para.'), false)
check('emptied home still renders', emptiedHome.includes('hero-base.webp'), true)

const emptiedBlog = renderRoute('/blog', emptied)
check('emptied blog shows the empty state', emptiedBlog.includes('No posts published yet'), true)

/* -------------------------------------------------------------------------- */
/*  Head: titles, canonical, social cards, structured data                   */
/* -------------------------------------------------------------------------- */

// The head used to be assembled inside prerender.mjs, where the only way to
// check it was to build the site and read dist/. headFor() is now a pure
// function, so every tag below is asserted directly — including the cases that
// are easy to regress and impossible to spot in a screenshot: a post title that
// overflows, a social card that disagrees with the <title>, a dateModified that
// appears for a post that was never really edited.

function metaContent(head, key, value) {
  const match = head.match(new RegExp(`<meta ${key}="${value}" content="([^"]*)" \\/>`))
  return match ? match[1] : null
}

function jsonLd(head) {
  return [
    ...head.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g),
  ].map((m) => JSON.parse(m[1]))
}

function types(head) {
  return jsonLd(head).map((s) => s['@type'])
}

const homeHead = headFor('/', content)
const resumeHead = headFor('/resume', content)
const blogHead = headFor('/blog', content)
const localHead = headFor('/digital-marketer-kaithal', content)
const postHead = headFor('/blog/one-brief-one-campaign-sprint', content)
const sameDateHead = headFor('/blog/seo-is-not-dead', content)

// --- one definition, stated the same way everywhere -------------------------

const homePerson = jsonLd(homeHead).find((s) => s['@type'] === 'Person')
check('home Person schema carries the definition', homePerson?.description, DEFINITION)
check('home Person schema url is the site root', homePerson?.url, SITE_URL)
check('home Person schema has a stable @id', homePerson?.['@id'], PERSON_ID)
check('home Person schema has @context', homePerson?.['@context'], 'https://schema.org')
check('home Person schema alternateNames', homePerson?.alternateName, ['Rachit', 'RachitSharma'])
check('home Person schema studied at RKSD College', homePerson?.alumniOf?.name, 'RKSD College, Kaithal')
check('home Person schema knowsAbout is the site topic list', homePerson?.knowsAbout, KNOWS_ABOUT)
// The social card is the og card; schema:image is "what does this person look
// like", so it points at the cut-out rather than the 1200x630 banner.
check('home Person schema image is the portrait, not the og card', homePerson?.image, `${SITE_URL}/assets/hero-base.webp`)
check('home Person schema keeps the postal address', homePerson?.address?.addressCountry, 'IN')
check(
  'home Person schema sameAs is the current profiles',
  homePerson?.sameAs,
  [SOCIALS.github, SOCIALS.linkedin, SOCIALS.instagram],
)
check('home meta description leads with the definition', metaContent(homeHead, 'name', 'description')?.startsWith(DEFINITION), true)
check('llms summary is the definition, not a second wording', HOME_DESCRIPTION.startsWith(DEFINITION), true)
check('home page itself states the definition', home.includes(DEFINITION), true)

// The location has to be stated where a searcher and an answer engine each look:
// the home title, the Person schema's postal address, and the footer's own line.
check('the home title names the town', PAGES['/'].title.includes('Kaithal'), true)
check(
  'the Person schema address is the town and state',
  [homePerson?.address?.addressLocality, homePerson?.address?.addressRegion],
  ['Kaithal', 'Haryana'],
)

// --- Person everywhere, WebSite only on the home page -----------------------

check('home emits Person + WebSite + ProfilePage', types(homeHead), ['Person', 'WebSite', 'ProfilePage'])
check('resume emits Person + BreadcrumbList + ProfilePage', types(resumeHead), ['Person', 'BreadcrumbList', 'ProfilePage'])
check('blog index emits Person + BreadcrumbList', types(blogHead), ['Person', 'BreadcrumbList'])
check(
  'the Kaithal page emits Person + BreadcrumbList + WebPage',
  types(localHead),
  ['Person', 'BreadcrumbList', 'WebPage'],
)
check('post emits Person + Article', types(postHead), ['Person', 'Article'])
check(
  'Person url is the site root on every page',
  [
    jsonLd(homeHead).find((s) => s['@type'] === 'Person')?.url,
    jsonLd(resumeHead).find((s) => s['@type'] === 'Person')?.url,
    jsonLd(blogHead).find((s) => s['@type'] === 'Person')?.url,
    jsonLd(localHead).find((s) => s['@type'] === 'Person')?.url,
    jsonLd(postHead).find((s) => s['@type'] === 'Person')?.url,
  ],
  [SITE_URL, SITE_URL, SITE_URL, SITE_URL, SITE_URL],
)
check(
  'Person @id is identical on every page',
  [
    jsonLd(homeHead).find((s) => s['@type'] === 'Person')?.['@id'],
    jsonLd(resumeHead).find((s) => s['@type'] === 'Person')?.['@id'],
    jsonLd(blogHead).find((s) => s['@type'] === 'Person')?.['@id'],
    jsonLd(localHead).find((s) => s['@type'] === 'Person')?.['@id'],
    jsonLd(postHead).find((s) => s['@type'] === 'Person')?.['@id'],
  ],
  [PERSON_ID, PERSON_ID, PERSON_ID, PERSON_ID, PERSON_ID],
)
check(
  'WebSite url is the site root',
  jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.url,
  `${SITE_URL}/`,
)
check(
  'WebSite has a stable @id for other pages to point at',
  jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.['@id'],
  `${SITE_URL}/#website`,
)

// --- the local page: one Person, one site, one breadcrumb -------------------

const localPage = jsonLd(localHead).find((s) => s['@type'] === 'WebPage')
check('the Kaithal WebPage is about the same Person', localPage?.mainEntity, { '@id': PERSON_ID })
check('the Kaithal WebPage about is the same Person', localPage?.about, { '@id': PERSON_ID })
check('the Kaithal WebPage is part of this site', localPage?.isPartOf, { '@id': `${SITE_URL}/#website` })
check(
  'the Kaithal WebPage names the area it covers',
  localPage?.spatialCoverage?.name,
  'Kaithal, Haryana, India',
)
check(
  'the Kaithal WebPage url is its own URL',
  localPage?.url,
  `${SITE_URL}/digital-marketer-kaithal`,
)
const localCrumbs = jsonLd(localHead).find((s) => s['@type'] === 'BreadcrumbList')?.itemListElement
check('the Kaithal breadcrumb has two steps', localCrumbs?.map((c) => c.name), ['Home', 'Digital Marketer in Kaithal'])
check(
  'the Kaithal breadcrumb ends on its own URL',
  localCrumbs?.[1]?.item,
  `${SITE_URL}/digital-marketer-kaithal`,
)

// --- ProfilePage ties the home page to the Person the home page is about ------

check(
  'ProfilePage points at the Person @id',
  jsonLd(homeHead).find((s) => s['@type'] === 'ProfilePage')?.mainEntity,
  { '@id': PERSON_ID },
)
check(
  'ProfilePage url is the site root',
  jsonLd(homeHead).find((s) => s['@type'] === 'ProfilePage')?.url,
  `${SITE_URL}/`,
)

// --- every JSON-LD date is a full ISO calendar date, never invented (T8) ------
//
// The profile dates used to ship as year-months ("2026-10") taken from the
// resume's display label, and Search Console reported the ProfilePage's
// dateModified as an invalid datetime. Now the day comes from a real source —
// RESUME_MODIFIED, the commit that last wrote the resume — the home page takes
// the newest date on the site, and a post claims its own publication and, when
// the edit was real, its update. Nothing with no real day is emitted at all.

const homeProfile = jsonLd(homeHead).find((s) => s['@type'] === 'ProfilePage')
const resumeProfiles = jsonLd(resumeHead).filter((s) => s['@type'] === 'ProfilePage')

// The resume date is the newest among the fixture content: the commit that last
// wrote the resume (2026-10-10) beats one-brief's edit (2026-02-02) and the
// same-instant post.
check('home dateModified is the newest real site date', homeProfile?.dateModified, '2026-10-10')
check('home dateModified is not in the future', comparisonTime(homeProfile?.dateModified) <= Date.now(), true)

// The home page never invents a date when nothing real exists.
const emptyHome = jsonLd(headFor('/', { resume: null, posts: [] })).find((s) => s['@type'] === 'ProfilePage')
check('home emits no dateModified when nothing is dated', emptyHome?.dateModified, undefined)

// The resume page has exactly one ProfilePage, tied to the same Person, on the
// resume URL, carrying the real day the resume was last written.
check('resume emits exactly one ProfilePage', resumeProfiles.length, 1)
check('resume ProfilePage points at the Person @id', resumeProfiles[0]?.mainEntity, { '@id': PERSON_ID })
check('resume ProfilePage url is the resume page', resumeProfiles[0]?.url, `${SITE_URL}/resume`)
check('resume dateModified is the day the resume data last changed', resumeProfiles[0]?.dateModified, '2026-10-10')
check('resume dateModified is not in the future', comparisonTime(resumeProfiles[0]?.dateModified) <= Date.now(), true)
check('resume emits no ProfilePage dateModified when unlabelled', jsonLd(headFor('/resume', { resume: null })).find((s) => s['@type'] === 'ProfilePage')?.dateModified, undefined)

// The date itself, and the one thing it has to agree with: the visible "October
// 2026" label. The label is what a visitor reads, the schema date is what a
// validator reads — if the resume is refreshed the label moves and this fails,
// which is the point: updating the resume has to update both.
check('the resume schema date is a full ISO date', /^\d{4}-\d{2}-\d{2}$/.test(RESUME_MODIFIED), true)
check('the resume schema date is not in the future', comparisonTime(RESUME_MODIFIED) <= Date.now(), true)
check(
  'the resume schema date is in the month the visible label claims',
  isoYearMonth(content.resume?.lastUpdated),
  RESUME_MODIFIED.slice(0, 7),
)
check('the visible resume label is unchanged display text', content.resume?.lastUpdated, 'October 2026')

// The exact-same helpers the build uses, including the one that decides what a
// stored date is allowed to become.
check('isoYearMonth parses "October 2026"', isoYearMonth('October 2026'), '2026-10')
check('isoYearMonth parses "March 2026"', isoYearMonth('March 2026'), '2026-03')
check('isoYearMonth rejects an unparseable label', isoYearMonth('sometime in 2026'), null)
check('isoYearMonth rejects a missing label', isoYearMonth(undefined), null)
check('comparisonTime treats a year-month as the first of that month', comparisonTime('2026-10'), Date.parse('2026-10-01T00:00:00Z'))

// isoDate is the gate that keeps an invalid datetime out of the schemas: a
// year-month has no day to give and is rejected rather than padded with a
// fabricated one, an unparseable value is rejected, and nothing after today is
// ever emitted.
check('isoDate keeps only the calendar date of a datetime', isoDate('2026-02-02T10:00:00Z'), '2026-02-02')
check('isoDate accepts a date that is already a date', isoDate('2026-02-02'), '2026-02-02')
check('isoDate refuses to invent a day for a year-month', isoDate('2026-02'), null)
check('isoDate rejects an unparseable value', isoDate('soon'), null)
check('isoDate rejects a missing value', isoDate(undefined), null)
check('isoDate rejects a future date', isoDate('2999-01-01'), null)
check('isoDate rejects today plus a day', isoDate(new Date(Date.now() + 86400000).toISOString()), null)

check(
  'newestRealDate picks the resume date over an older post edit',
  newestRealDate(['2026-02-02', '2026-10-10']),
  '2026-10-10',
)
check(
  'newestRealDate leaves the winning value in its original form',
  newestRealDate(['2026-10-15', '2026-10-10']),
  '2026-10-15',
)
check('newestRealDate has nothing to pick from when no value is a real date', newestRealDate(['soon', '', null]), null)

// --- Breadcrumbs say plainly which pages are ours -----------------------------

check(
  'resume breadcrumb starts at Home',
  jsonLd(resumeHead).find((s) => s['@type'] === 'BreadcrumbList')?.itemListElement?.[0],
  { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
)
check(
  'resume breadcrumb names the Resume page',
  jsonLd(resumeHead).find((s) => s['@type'] === 'BreadcrumbList')?.itemListElement?.[1],
  { '@type': 'ListItem', position: 2, name: 'Resume', item: `${SITE_URL}/resume` },
)
check(
  'blog breadcrumb starts at Home',
  jsonLd(blogHead).find((s) => s['@type'] === 'BreadcrumbList')?.itemListElement?.[0],
  { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
)
check(
  'blog breadcrumb names the Blog page',
  jsonLd(blogHead).find((s) => s['@type'] === 'BreadcrumbList')?.itemListElement?.[1],
  { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
)

// --- every shipped JSON-LD block is valid and carries @context + @type -------
//
// A single malformed block is silently dropped by a crawler, so the page is
// left advertising nothing. Parse each block the way a consumer would and
// require the two fields that make it addressable.
for (const [label, head] of [
  ['home', homeHead],
  ['/resume', resumeHead],
  ['/blog', blogHead],
  ['Kaithal page', localHead],
  ['a post', postHead],
]) {
  const blocks = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  const parsed = blocks.map((raw) => {
    try {
      return { ok: true, value: JSON.parse(raw) }
    } catch {
      return { ok: false, value: null }
    }
  })
  check(`${label} has a JSON-LD block`, blocks.length > 0, true)
  check(`${label} JSON-LD blocks all parse`, parsed.every((p) => p.ok), true)
  check(
    `${label} JSON-LD blocks declare @context + @type`,
    parsed.filter((p) => p.ok).every(
      (p) => p.value['@context'] === 'https://schema.org' && typeof p.value['@type'] === 'string' && p.value['@type'].length > 0,
    ),
    true,
  )
}

// --- titles: one string, reused by every tag that repeats it ----------------

check('home <title>', homeHead.includes(`<title>${escapeAttr(PAGES['/'].title)}</title>`), true)
check('blog index <title>', blogHead.includes(`<title>${PAGES['/blog'].title}</title>`), true)
check('post <title> carries the brand', postHead.includes(`<title>${postTitle('One Brief, One Campaign Sprint')}</title>`), true)
check(
  'post og:title matches the post <title>',
  metaContent(postHead, 'property', 'og:title'),
  postTitle('One Brief, One Campaign Sprint'),
)
check(
  'post twitter:title matches the post <title>',
  metaContent(postHead, 'name', 'twitter:title'),
  postTitle('One Brief, One Campaign Sprint'),
)
check(
  'home og:title matches the home <title>',
  metaContent(homeHead, 'property', 'og:title'),
  escapeAttr(PAGES['/'].title),
)
check('post canonical is its own URL', postHead.includes(`<link rel="canonical" href="${SITE_URL}/blog/one-brief-one-campaign-sprint" />`), true)
check('post og:type is article', metaContent(postHead, 'property', 'og:type'), 'article')
check('home og:type is website', metaContent(homeHead, 'property', 'og:type'), 'website')
check(
  'post og:url matches the canonical',
  metaContent(postHead, 'property', 'og:url'),
  `${SITE_URL}/blog/one-brief-one-campaign-sprint`,
)

// A suffix that pushes the title past the result line is dropped rather than
// truncated, so the post title is never cut mid-word.
const LONG_TITLE =
  "SEO isn't dead — it's just learning to speak AI to search engines"
check('long post title is not truncated', postTitle(LONG_TITLE), LONG_TITLE)
check('short post title keeps the brand', postTitle('One Brief'), `One Brief${TITLE_SEPARATOR}Rachit Sharma`)
check('the branded title stays inside the budget', postTitle('One Brief').length <= TITLE_MAX, true)

// Every fixed route has to fit the budget and say something no other route says.
// Two pages with the same title are read by a search engine as one page, and a
// title past the budget is cut off in the result, so whatever is being hidden
// past the cut stops existing.
const fixedTitles = { ...Object.fromEntries(Object.entries(PAGES).map(([route, p]) => [route, p.title])), '*': NOT_FOUND.title }
for (const [route, title] of Object.entries(fixedTitles)) {
  check(`title for ${route} fits the budget`, title.length <= TITLE_MAX, true)
  check(`title for ${route} is not padded with stray whitespace`, title.trim(), title)
}
check('every route title is distinct', new Set(Object.values(fixedTitles)).size, Object.values(fixedTitles).length)
check('the home title leads with the name', PAGES['/'].title.startsWith('Rachit Sharma'), true)
check('the not-found title leads with the name', NOT_FOUND.title.startsWith('Rachit Sharma'), true)
// The home page is the only name-first title, and deliberately so: it is the
// brand page. The rest are brand-last, which is the shape a result is read in.
check('the brand-last routes carry the brand', ['/resume', '/blog', '/digital-marketer-kaithal'].every((route) => PAGES[route].title.includes('Rachit Sharma')), true)

// The site name and the home title are two different things, and each has to
// reach every consumer unchanged: og:site_name names the site, og:title names
// the page.
check('home og:site_name is the site name', metaContent(homeHead, 'property', 'og:site_name'), SITE_NAME)
check('the site name is not the home title', SITE_NAME === PAGES['/'].title, false)
check('the Person schema names the person, not the page', jsonLd(homeHead).find((s) => s['@type'] === 'Person')?.name, 'Rachit Sharma')
check('the WebSite schema is named for the site', jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.name, 'Rachit Sharma')
check('the WebSite schema has an alternateName', jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.alternateName, 'Rachit Sharma Portfolio')
check('home twitter:title matches the home <title>', metaContent(homeHead, 'name', 'twitter:title'), escapeAttr(PAGES['/'].title))
check('blog twitter:title matches the blog <title>', metaContent(blogHead, 'name', 'twitter:title'), PAGES['/blog'].title)
check('blog og:title matches the blog <title>', metaContent(blogHead, 'property', 'og:title'), PAGES['/blog'].title)

// --- dateModified only when the edit is real --------------------------------

const articleSchema = (head) => jsonLd(head).find((s) => s['@type'] === 'Article')
check('a month-later edit is claimed as a full date', articleSchema(postHead)?.dateModified, '2026-02-02')
check('a same-instant save is not claimed', articleSchema(sameDateHead)?.dateModified, undefined)
check('dateModified still absent for a same-instant save', JSON.stringify(articleSchema(sameDateHead)).includes('dateModified'), false)
check('datePublished is always claimed as a full date', articleSchema(sameDateHead)?.datePublished, '2025-12-01')
check('datePublished keeps the calendar date of the stored datetime', articleSchema(postHead)?.datePublished, '2026-01-05')

// A post is no exception to the rule: a stored value with no day never gets one
// invented for it, and a date that has not happened yet is left out of the
// schema rather than published.
const bareMonthPost = headFor('/blog/dated', {
  posts: [{ ...content.posts[0], slug: 'dated', publishedAt: '2026-02', updatedAt: '2026-02' }],
})
check('a post page with no day to give still emits its schemas', types(bareMonthPost), ['Person', 'Article'])
check('a post stored as a year-month claims no publication date', articleSchema(bareMonthPost)?.datePublished, undefined)
check('a post stored as a year-month claims no modified date', articleSchema(bareMonthPost)?.dateModified, undefined)
const futurePost = headFor('/blog/future', {
  posts: [
    { ...content.posts[0], slug: 'future', publishedAt: '2999-01-01T00:00:00Z', updatedAt: '2999-01-02T00:00:00Z' },
  ],
})
check('a post dated in the future claims no publication date', articleSchema(futurePost)?.datePublished, undefined)
check('a post dated in the future claims no modified date', articleSchema(futurePost)?.dateModified, undefined)

// The gate is Supabase stamping updated_at on every save, so the boundary is the
// whole feature: a minute-old edit must read as "never edited".
const edited = (ms) => isMeaningfullyUpdated('2026-01-05T10:00:00Z', new Date(Date.parse('2026-01-05T10:00:00Z') + ms).toISOString())
check('an edit under the threshold is ignored', edited(60 * 1000), false)
check('an edit past the threshold counts', edited(UPDATE_THRESHOLD_MS + 1000), true)
check('an edit exactly on the threshold counts', edited(UPDATE_THRESHOLD_MS), true)
check('a missing update date is ignored', isMeaningfullyUpdated('2026-01-05T10:00:00Z', null), false)
check('a missing publish date is ignored', isMeaningfullyUpdated(null, '2026-02-02T10:00:00Z'), false)
check('an unparseable update date is ignored', isMeaningfullyUpdated('2026-01-05T10:00:00Z', 'soon'), false)

// Exactly one Article per post: hydration removes the pre-rendered node
// before appending its own, and the tag it looks for is what keeps that true.
check('post head tags its single Article script', (postHead.match(/data-seo="blog-post"/g) || []).length, 1)

// The Article schema mirrors the Person identity and drops the image when the
// post has no cover of its own, so the structured data says no more than the
// post does.
check(
  'Article author is the Person @id',
  articleSchema(postHead)?.author,
  { '@type': 'Person', '@id': PERSON_ID, name: 'Rachit Sharma' },
)
check(
  'Article publisher is the Person @id',
  articleSchema(postHead)?.publisher,
  { '@type': 'Person', '@id': PERSON_ID, name: 'Rachit Sharma' },
)
check('Article has no image when the post has no cover', JSON.stringify(articleSchema(postHead)).includes('"image"'), false)
check('Article keeps a headline', articleSchema(postHead)?.headline, 'One Brief, One Campaign Sprint')

// A post that does have a cover image gets one in the schema — nothing more.
const covered = headFor('/blog/one-brief-one-campaign-sprint', {
  ...content,
  posts: [{ ...content.posts[0], coverImageUrl: 'https://x.supabase.co/covers/b1.webp' }],
})
check(
  'Article carries the image when the post has a cover',
  articleSchema(covered)?.image,
  'https://x.supabase.co/covers/b1.webp',
)

// --- client-side copy of the same rules cannot drift ------------------------
//
// src/lib/seo.ts is TypeScript, so it cannot be imported here. Reading the
// literals out of the source is the next best thing: the behaviour is covered by
// the app's own tests, and what matters here is that the numbers and the strings
// are literally the same on both sides of the build.
const seoTs = await readFile(path.join(process.cwd(), 'src', 'lib', 'seo.ts'), 'utf8')
for (const [route, page] of Object.entries(PAGES)) {
  check(
    `client title for ${route} matches the build`,
    seoTs.includes(`'${route}': '${page.title}'`),
    true,
  )
}
check('client not-found title matches the build', seoTs.includes(`'*': '${NOT_FOUND.title}'`), true)
check('client title separator matches the build', seoTs.includes(`const TITLE_SEPARATOR = '${TITLE_SEPARATOR}'`), true)
check('client title budget matches the build', seoTs.includes(`const TITLE_MAX = ${TITLE_MAX}`), true)

// The descriptions used to be retyped per page, which is how `/blog` reached a
// visitor as "Journal — Rachit Sharma" after a click and "Blog | Rachit Sharma"
// on a direct load. One table on each side, compared here.
//
// The build half writes single quotes; the client half uses whichever quote the
// sentence needs (an apostrophe forces double quotes), so the comparison is on
// the sentence itself inside the route's own entry rather than on the delimiter.
const descBlock = seoTs.match(/PAGE_DESCRIPTIONS: Record<string, string> = \{([\s\S]*?)\n\}/)?.[1] ?? ''
check('the client declares one description table', descBlock.length > 0, true)
for (const [route, page] of Object.entries({ ...PAGES, '*': NOT_FOUND })) {
  const at = descBlock.indexOf(`'${route}':`)
  check(
    `client description for ${route} matches the build`,
    at !== -1 && descBlock.slice(at + route.length + 3, at + route.length + 243).includes(page.description),
    true,
  )
}
check('client site name matches the build', seoTs.includes(`const SITE_NAME = '${SITE_NAME}'`), true)
check(
  'client og:site_name is written from the mirror, not a literal',
  /upsert\(doc, 'meta', 'property', 'og:site_name', SITE_NAME\)/.test(seoTs),
  true,
)

// The threshold is written as `24 * 60 * 60 * 1000` on both sides, so compare the
// evaluated numbers rather than the text — a different spelling of the same
// duration is not a drift, a different duration is.
const clientThreshold = Number(
  (seoTs.match(/UPDATE_THRESHOLD_MS = ([\d_]+(?:\s*\*\s*[\d_]+)*)/)?.[1] ?? '')
    .replace(/\s/g, '')
    .split('*')
    .reduce((total, factor) => total * Number(factor), 1),
)
check('client update threshold matches the build', clientThreshold, UPDATE_THRESHOLD_MS)

// The date the hydrated page writes into an Article has to be the same shape the
// pre-rendered head writes, or a crawler reads one date from the shipped HTML and
// a different one from the DOM it hydrates into. The client is TypeScript and
// cannot be imported here, so the call sites are read out of the source.
check('the client carries the same isoDate helper', /export function isoDate\(/.test(seoTs), true)
check(
  'the client writes datePublished through isoDate',
  /datePublished: isoDate\(post\.publishedAt\) \?\? undefined/.test(seoTs),
  true,
)
check('the client writes dateModified through isoDate', /\? isoDate\(post\.updatedAt\)/.test(seoTs), true)

const dataTs = await readFile(path.join(process.cwd(), 'src', 'data.ts'), 'utf8')
const indexHtml = await readFile(path.join(process.cwd(), 'index.html'), 'utf8')
const aboutTsx = await readFile(path.join(process.cwd(), 'src', 'components', 'About.tsx'), 'utf8')
const blogPostTsx = await readFile(path.join(process.cwd(), 'src', 'pages', 'BlogPost.tsx'), 'utf8')
const blogTsx = await readFile(path.join(process.cwd(), 'src', 'pages', 'Blog.tsx'), 'utf8')
const heroTsx = await readFile(path.join(process.cwd(), 'src', 'components', 'Hero.tsx'), 'utf8')

check('the visible definition is DEFINITION, not a retyped copy', dataTs.includes(DEFINITION), true)
check('About renders DEFINITION itself', aboutTsx.includes('{DEFINITION}'), true)
check('index.html states the home description the build writes', indexHtml.includes(HOME_DESCRIPTION), true)
check(
  'the footer states the base location',
  (await readFile(path.join(process.cwd(), 'src', 'components', 'Footer.tsx'), 'utf8')).includes(
    'Based in Kaithal, Haryana, India',
  ),
  true,
)
check('BlogPost builds its title through postTitle()', !blogPostTsx.includes('`${post.title} — Rachit Sharma`'), true)
check('BlogPost gates the visible Updated line on the same rule', blogPostTsx.includes('isMeaningfullyUpdated'), true)

// The blog index retyped its own head, which meant `/blog` had two titles: the one
// in the served HTML and the one document.title showed after a click. It has to
// read both of them from the mirror tables instead of writing them out again.
check('Blog reads its title from the mirror', /title: PAGE_TITLES\['\/blog'\]/.test(blogTsx), true)
check('Blog reads its description from the mirror', /description: PAGE_DESCRIPTIONS\['\/blog'\]/.test(blogTsx), true)
check('Blog carries no title literal of its own', /'Journal — Rachit Sharma'/.test(blogTsx), false)

// --- the home page's own words carry the same two keywords -------------------
//
// The title promises "Digital Marketer" and "AI". A heading that only said one
// of them would leave the page disagreeing with its own title, and the fix has
// to stay cheap: each keyword appears once, in the sentence it belongs in, and
// nothing is repeated to chase a score.
const homeH1 = heroTsx.match(/aria-label="([^"]+)"/)?.[1] ?? ''
check('the home h1 names the role', /Digital Marketer/i.test(homeH1), true)
check('the h1 carries one role phrase, not a keyword list', homeH1.split('AI').length - 1 <= 0, true)
check('the hero intro carries the AI keyword', /AI tools/i.test(dataTs), true)
check('the visible definition carries both keywords', /digital marketer/i.test(DEFINITION) && /AI tools/i.test(DEFINITION), true)
check('BlogPost byline points at the About section', blogPostTsx.includes('href="/#about"'), true)

// --- the h1's words survive text extraction ----------------------------------
//
// The three hero spans are block-level, so JSX drops the whitespace between
// them and the rendered text came out as "I'mRachitDigital Marketer". The
// aria-label papered over it for screen readers, but anything that reads the
// text of the page — a crawler, a reader-mode extension, `innerText` on a
// `<title>`-less extraction, a human hitting "select all" and copying — got
// the run-on. Explicit {' '} text nodes fix it, and because they are
// collapsible spaces between block-level boxes in a block container they
// generate no anonymous line box, so nothing moves.
//
// Checked against the built HTML rather than the JSX: this is about what a
// crawler receives, so the assertion belongs on the artefact.
const builtHomeHtml = await readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8').catch(() => '')
const builtH1 = builtHomeHtml.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? ''
const h1Text = builtH1
  .replace(/<[^>]+>/g, '')
  .replace(/&#x27;/g, "'")
  .replace(/&amp;/g, '&')
check('the h1 keeps its aria-label', builtH1.includes('aria-label="I&#x27;m Rachit Digital Marketer"'), true)
check('the h1 text is not run together', !h1Text.includes("I'mRachit"), true)
check('the h1 text reads with real spaces', h1Text === "I'm Rachit Digital Marketer", true)
check(
  'the h1 word breaks are real text nodes, not the label',
  (heroTsx.match(/\{\s*'\s'\s*\}\s*<span/g) || []).length === 2 &&
    (builtH1.match(/<\/span>\s+<span/g) || []).length === 2,
  true,
)

// --- the reveal headings keep their inter-word spaces ------------------------
//
// Every word in a masked heading sits in its own `inline-block overflow-hidden`
// wrapper. A trailing space rendered inside that wrapper is trimmed by the
// browser, so the words came out jammed — "WhoisRachitSharma?" on screen — while
// the aria-label, which joined the raw segments, doubled the space at each
// boundary. The words now share one flat list for both the render and the label,
// and the single space between them is a text node BETWEEN the wrappers, where
// it survives. This is a CSS-rendering bug, so the check reads the built HTML:
// it proves the space is a real sibling text node rather than a space inside a
// mask (which would be trimmed), and that no label space leaked before a mark.
const builtAboutHeading = builtHomeHtml.match(/<h2[^>]*id="about-heading"[\s\S]*?<\/h2>/)?.[0] ?? ''
check('the About heading reads with single spaces', builtAboutHeading.includes('aria-label="Who is Rachit Sharma?"'), true)
check(
  'the About heading puts each space between the masked words',
  (builtAboutHeading.match(/<\/span><\/span> <span/g) || []).length === 3,
  true,
)
check('the About heading keeps no space inside a mask', /\S <\/span>/.test(builtAboutHeading), false)
const revealHeadingLabels = (
  await Promise.all(
    ['dist/index.html', 'dist/resume/index.html', 'dist/blog/index.html'].map((f) =>
      readFile(path.join(process.cwd(), f), 'utf8'),
    ),
  )
).flatMap((html) => [...html.matchAll(/<h[1-6][^>]*aria-label="([^"]*)"/g)].map((m) => m[1]))
check('no reveal heading carries a double space', revealHeadingLabels.some((l) => l.includes('  ')), false)
check('no reveal heading carries a space before punctuation', revealHeadingLabels.some((l) => /\s[?!.,;:]/.test(l)), false)

// --- no section heading hardcodes a count the database can contradict ---------
//
// The Work heading read "Four builds, zero templates" while the counter next to
// it derives from projects.length, so deleting a project in Admin made the two
// disagree. The heading is count-free now; this keeps it that way.
const COUNT_WORDS = /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i
const selectedWorkTsx = await readFile(
  path.join(process.cwd(), 'src', 'components', 'SelectedWork.tsx'),
  'utf8',
)
const workHeadingSrc = selectedWorkTsx.match(/segments=\{\[([\s\S]*?)\]\}/)?.[1] ?? ''
check('the work heading states no project count', COUNT_WORDS.test(workHeadingSrc), false)
check(
  'the work counter still reflects the real total',
  /const total = projects\.length/.test(selectedWorkTsx),
  true,
)

// --- the About copy answers the obvious questions, in plain text -------------
//
// Seven self-contained answers sit in a small visible "Quick facts" list, and
// the brief was explicit that this is page text, not an FAQPage block: an
// answer engine should read the same words a visitor does, and the page should
// add no schema it would then have to keep true. The canonical copy lives in
// src/data.ts (About renders it); the build mirror in seo-config.mjs drives
// /llms-full.txt and must never drift from it.
// src/data.ts lives on the client, so the verifier can't import it — it
// compares the build mirror against the source text instead, after undoing the
// two things that legitimately differ: the `\u2019` escape (single-quoted
// strings) and the markdown link that the page renders as an anchor.
// `[^\]\n]` in the link-bracket class: the answers only carry single-line
// inline links like `[Resume page](/resume)`. A newline in the class makes a
// stray `[` (e.g. the `[` that opens the QUICK_FACTS array itself) unable to
// start a match, so the whole-array text is never swallowed as one fake link.
const INLINE_LINK = /\[([^\]\n]+)\]\([^)]*\)/g
const stripInline = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
const dataTsNorm = dataTs
  .replace(/\\u2019/g, '\u2019')
  .replace(INLINE_LINK, '$1')
const dataTsIncludesQuickFact = (q, a) =>
  dataTsNorm.includes(`q: '${q}'`) && dataTsNorm.includes(stripInline(a))

const QUICK_FACT_QUESTIONS = QUICK_FACTS.map((f) => f.q)
check('Quick facts is exactly seven items', QUICK_FACTS.length, 7)
check(
  'the quick-fact questions live in the shared data source',
  QUICK_FACT_QUESTIONS.every((q) => dataTs.includes(q)),
  true,
)
check(
  'every Quick facts answer names Rachit Sharma',
  QUICK_FACTS.every((f) => f.a.includes('Rachit Sharma') || f.a.startsWith('Yes. Rachit Sharma')),
  true,
)
check(
  'every Quick facts answer is at most two sentences',
  QUICK_FACTS.every((f) => f.a.split(/[.!?](?=\s|$)/).filter(Boolean).length <= 2),
  true,
)
check(
  'the Quick facts mirrors are byte-identical',
  QUICK_FACTS.every((f) => dataTsIncludesQuickFact(f.q, f.a)),
  true,
)
check(
  'the Quick facts answers are in the served home HTML',
  QUICK_FACT_QUESTIONS.every((q) => builtHomeHtml.includes(q)),
  true,
)
// The page renders markdown through markdown-it: ASCII apostrophes become
// `&#39;`, `[Resume page](/resume)` becomes an anchor, and the Q7 bare email is
// linkified into a mailto anchor. So "in the served HTML" is checked against
// the tag-stripped, entity-unescaped text — visually the same sentence.
const builtHomePlain = builtHomeHtml
  .replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/&#x27;/g, "'")
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
check(
  'all seven quick-fact answers render in the served home HTML',
  QUICK_FACTS.every((f) => builtHomePlain.includes(stripInline(f.a))),
  true,
)
check('the Quick facts copy adds no FAQPage schema', builtHomeHtml.includes('FAQPage'), false)

// --- portrait alt text names the person, not a slogan ------------------------
//
// The hero portrait and the About portrait both carried the slogan "Rachit
// Sharma, AI Powered Marketer", and the decorative reveal layer underneath the
// hero (the same photo, masked by the cursor) had an empty alt. The two visible
// portraits now describe who is in the picture, and the decorative layer names
// itself while staying aria-hidden so it is never announced twice.
const PORTRAIT_ALT = 'Rachit Sharma, digital marketer and AI builder from Kaithal'
const REVEAL_ALT = 'Rachit Sharma, portrait with reveal effect'
check(
  'both portraits carry the descriptive alt',
  (builtHomeHtml.match(new RegExp(`alt="${PORTRAIT_ALT}"`, 'g')) || []).length,
  2,
)
check('the old portrait alt is gone', builtHomeHtml.includes('AI Powered Marketer'), false)
const revealImgTag = (builtHomeHtml.match(new RegExp(`<img[^>]*alt="${REVEAL_ALT}"[^>]*>`)) || [''])[0]
check('the reveal layer names itself', revealImgTag.length > 0, true)
check('the reveal layer stays decorative', revealImgTag.includes('aria-hidden="true"'), true)

// --- the second 2025 journey item reads as a decision ------------------------
//
// "Wanted to start ..., but 12th CBSE boards and some family circumstances meant
// it had to wait." is replaced by a plain decision line. The journey list lives
// only in the About component, but the seed is checked too so a copy/paste of the
// old sentence can never arrive through the database first.
for (const file of ['src/components/About.tsx', 'supabase/seed.sql']) {
  const src = await readFile(path.join(process.cwd(), file), 'utf8')
  check(`${file} keeps no old journey sentence`, src.includes('family circumstances'), false)
}
check(
  'the journey item is the decision line',
  builtHomeHtml.includes('Decided to study Digital Marketing with AI.'),
  true,
)

// --- the resume is one shape, authored once ----------------------------------
//
// The resume used to live as a one-off subtitle + flat skill list hand-copied
// between the page, the admin form and the seed row, and a copy change left
// them disagreeing. Now the page, the admin editor and the seed all share the
// same ResumeData shape (summary / skill groups / education / projects /
// lastUpdated), and a database row from the pre-rebuild shape is dropped
// wholesale so its old wording can never resurface. The PDF download is
// optional: the file ships with a user handoff, so a checkout without it only
// warns.

const RESUME_SUMMARY =
  'Digital marketer from Kaithal, Haryana, who uses AI tools to build brands, campaigns and creative projects. Works hands-on with 25+ AI tools for content, voice, search optimisation and product building, and develops his own AI products alongside his studies. Seeking an entry-level digital marketing role where AI-driven work can support real campaigns.'

const resumePage = renderRoute('/resume', content)
check('resume renders the single-source summary', resumePage.includes(RESUME_SUMMARY), true)
check('resume writes the education list', resumePage.includes('RKSD College, Kaithal'), true)
check('resume keeps the skills as group headings', resumePage.includes('Search Optimisation'), true)
check('resume has exactly one h1', (resumePage.match(/<h1/g) || []).length, 1)
check('resume carries no phone number', resumePage.includes('83071'), false)
check('resume offers the PDF download', resumePage.includes('Download resume (PDF)'), true)
check('resume points at the PDF path', resumePage.includes('/Rachit-Sharma-Resume.pdf'), true)
check('resume says when it was last updated', resumePage.includes('Last updated ·'), true)

// A pre-rebuild row stored `subtitle` + a single `education` object and no
// `summary`. Matching that signature restores the bundled copy whole rather
// than mixing old wording into a new layout.
const legacyResume = mapBuildContent({
  ...RAW,
  settings: [
    ...RAW.settings,
    {
      key: 'resume',
      value: JSON.stringify({
        subtitle: 'Digital Marketing Specialist (in training) old row.',
        education: { title: 'Digital Marketing with AI', period: '2025' },
        skills: ['An old skill'],
        projects: [{ title: 'Old project', desc: 'old' }],
      }),
    },
  ],
}).resume
check('a legacy resume row is dropped wholesale', legacyResume.summary, RESUME_SUMMARY)
check(
  'no old group survives the legacy-drop',
  legacyResume.skills.some((g) => g.heading === 'Search Optimisation'),
  true,
)

const editedResume = mapBuildContent({
  ...RAW,
  settings: [
    ...RAW.settings,
    {
      key: 'resume',
      value: JSON.stringify({
        summary: 'A shorter, admin-authored summary.',
        skills: [
          { heading: 'One', items: ['a', 'b'] },
          { heading: '', items: [] },
        ],
        education: [{ title: 'Class XII (CBSE)', institution: '', period: '2026' }],
        projects: [{ title: 'P', desc: 'd', url: 'https://example.com/' }],
        lastUpdated: 'October 2026',
      }),
    },
  ],
}).resume
check('a new-shape resume row is honoured', editedResume.summary, 'A shorter, admin-authored summary.')
check('an empty group in the new shape is dropped', editedResume.skills.length, 1)
check('the admin project url survives', editedResume.projects[0].url, 'https://example.com/')
check('a blank summary falls back per-field', mapBuildContent({
  ...RAW,
  settings: [...RAW.settings, { key: 'resume', value: JSON.stringify({ summary: '', lastUpdated: '' }) }],
}).resume.summary, RESUME_SUMMARY)

// --- profile links are the current ones, everywhere they are written ---------

const LINK_SOURCES = [
  'src/data.ts',
  'scripts/seo-config.mjs',
  'scripts/head.mjs',
  'supabase/seed.sql',
  'src/pages/BlogPost.tsx',
  'index.html',
  'public/site.webmanifest',
]
const linkSources = Object.fromEntries(
  await Promise.all(
    LINK_SOURCES.map(async (file) => [file, await readFile(path.join(process.cwd(), file), 'utf8')]),
  ),
)

const OLD_OWNER = /digitalguru99908-dev|rachithunyawrr/
const OLD_LINKEDIN = /rachit-sharma-ab199443a|linkedin\.com\/in\/rachit-sharma(?!08)/
const OLD_INSTAGRAM = /instagram\.com\/rachitsharma/
for (const [file, src] of Object.entries(linkSources)) {
  check(`${file} has no stale GitHub owner`, OLD_OWNER.test(src), false)
  check(`${file} has no stale LinkedIn handle`, OLD_LINKEDIN.test(src), false)
  check(`${file} has no stale Instagram handle`, OLD_INSTAGRAM.test(src), false)
}
check('GitHub profile is written down', dataTs.includes(SOCIALS.github) && Object.values(linkSources).some((s) => s.includes(SOCIALS.github)), true)
check('LinkedIn profile is written down', dataTs.includes(SOCIALS.linkedin), true)
check('Instagram profile is written down', dataTs.includes(SOCIALS.instagram), true)

// The story body is authored once in the admin panel and mirrored in two files
// for builds that run without the database. All three have to agree, or the
// fallback advertises someone else's GitHub.
check('story fallback links the current GitHub', dataTs.includes(`[GitHub](${SOCIALS.github})`), true)
check('seed story links the current GitHub', linkSources['supabase/seed.sql'].includes(`[GitHub](${SOCIALS.github})`), true)
check('seed story links the current LinkedIn', linkSources['supabase/seed.sql'].includes(`[LinkedIn](${SOCIALS.linkedin})`), true)
check('story fallback links the current LinkedIn', dataTs.includes(`[LinkedIn](${SOCIALS.linkedin})`), true)
// The handle itself is pinned: `SOCIALS.linkedin` feeds the footer, the About
// chips and the Person `sameAs`, so a silent edit here would move the identity
// Google reads without any other file disagreeing.
check('the LinkedIn profile is the new handle', SOCIALS.linkedin, 'https://www.linkedin.com/in/rachit-sharma08/')
check('every project href uses the current owner', (dataTs.match(/href: 'https:\/\/github\.com\/Rachit-Sharma08\//g) || []).length, 3)

/* -------------------------------------------------------------------------- */
/*  One "how he learned to" claim, and it is not "self-taught"                 */
/* -------------------------------------------------------------------------- */

// He studies digital marketing at an institute and picks AI tools up by using
// them. "Self-taught" was a claim about how he learned that the site could no
// longer defend, and it reached the browser three different ways: a route meta
// description, the About story card (baked into every document as visible copy
// *and* inside the inline content snapshot), and the web manifest. So the guard
// is on the shipped strings and the files that hold them, not on one line.

const SELF_TAUGHT = /self[-\s]?taught/i

for (const [label, value] of [
  ['DEFINITION', DEFINITION],
  ['HOME_DESCRIPTION', HOME_DESCRIPTION],
  ['BLOG_DESCRIPTION', BLOG_DESCRIPTION],
  ['SITE_NAME', SITE_NAME],
  ...Object.entries(PAGES).map(([route, page]) => [`the ${route} description`, page.description]),
  ['the not-found description', NOT_FOUND.description],
]) {
  check(`${label} makes no self-taught claim`, SELF_TAUGHT.test(value), false)
}

/** Comments explain the removal, so they have to go before the text is scanned. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

async function collect(dir, extensions, found = []) {
  for (const entry of await readdir(path.join(process.cwd(), dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) await collect(rel, extensions, found)
    else if (extensions.some((ext) => entry.name.endsWith(ext))) found.push(rel)
  }
  return found
}

// Every file that can put a sentence in front of a visitor or a crawler. Docs
// are excluded: AGENTS.md quotes the old wording on purpose, to record that it
// was removed.
const COPY_FILES = [
  'scripts/seo-config.mjs',
  'scripts/head.mjs',
  'index.html',
  'supabase/seed.sql',
  'public/site.webmanifest',
  ...(await collect('src', ['.ts', '.tsx'])),
]
for (const file of COPY_FILES) {
  const src = await readFile(path.join(process.cwd(), file), 'utf8')
  check(`${file} makes no self-taught claim`, SELF_TAUGHT.test(stripComments(src)), false)
}

// The same sentence has to be in the generated head, not only in the source of
// it, so a future edit to the writer cannot reintroduce the claim silently.
for (const [label, head] of [
  ['home', homeHead],
  ['/resume', resumeHead],
  ['/blog', blogHead],
  ['Kaithal page', localHead],
  ['a post', postHead],
]) {
  check(`the ${label} head makes no self-taught claim`, SELF_TAUGHT.test(head), false)
}

// --- no "learning status" words in anything that ships ------------------------
//
// The resume once called the position "in training", and a status word reads
// as a stage of a career. "Self-taught" got a guard above for the same reason;
// these four can each leak in a sentence a visitor skips but a crawler obeys,
// so they get the same treatment: source files (comments stripped), built
// documents, generated heads, and the resume summary itself.

const STATUS_WORDS = /\b(training|trainee|fresher|intern|internship)\b/i

for (const [label, value] of [
  ['DEFINITION', DEFINITION],
  ['HOME_DESCRIPTION', HOME_DESCRIPTION],
  ['BLOG_DESCRIPTION', BLOG_DESCRIPTION],
  ['SITE_NAME', SITE_NAME],
  ...Object.entries(PAGES).map(([route, page]) => [`the ${route} description`, page.description]),
  ['the not-found description', NOT_FOUND.description],
  ['RESUME_SUMMARY', RESUME_SUMMARY],
]) {
  check(`${label} carries no status word`, STATUS_WORDS.test(value), false)
}

for (const file of COPY_FILES) {
  const src = await readFile(path.join(process.cwd(), file), 'utf8')
  check(`${file} carries no status word`, STATUS_WORDS.test(stripComments(src)), false)
}

for (const [label, head] of [
  ['home', homeHead],
  ['/resume', resumeHead],
  ['/blog', blogHead],
  ['Kaithal page', localHead],
  ['a post', postHead],
]) {
  check(`the ${label} head carries no status word`, STATUS_WORDS.test(head), false)
}

const distTextDocs = (await collectDistDocs(path.join(process.cwd(), 'dist'))).filter((f) =>
  /\.(html|txt|xml|webmanifest|json)$/.test(f),
)
for (const doc of await Promise.all(distTextDocs.map((f) => readFile(f, 'utf8')))) {
  check('no built document carries a status word', STATUS_WORDS.test(doc), false)
}

// The PDF is a handoff artifact, so its absence is a warning, not a failure:
// the resume page links /Rachit-Sharma-Resume.pdf and exists in the repo only
// when the user drops the file into public/.
try {
  await readFile(path.join(process.cwd(), 'public', 'Rachit-Sharma-Resume.pdf'))
  check('the resume PDF ships with the site', true, true)
  check(
    'the resume PDF is copied into dist',
    await readFile(path.join(process.cwd(), 'dist', 'Rachit-Sharma-Resume.pdf'))
      .then(() => true)
      .catch(() => false),
    true,
  )
} catch {
  console.log('WARN  no public/Rachit-Sharma-Resume.pdf yet — the page link is correct, the file comes with the handoff')
}

// The story card is authored in the admin panel and mirrored into two files so
// builds that run without a database still show the real thing. Two of the three
// can be compared here; the third is a Supabase row and needs the user's hands
// (the exact field and replacement text are in AGENTS.md).
const storyCard = dataTs.match(/^\s*card:\s*\n?\s*"([^"]+)",?$/m)?.[1] ?? ''
const seededCard = (linkSources['supabase/seed.sql']
  .match(/'my_story_card',\s*\n\s*(E'[\s\S]*?')\n\)/)?.[1] ?? '')
  .replace(/^E'/, '')
  .replace(/'$/, '')
  .replace(/''/g, "'")
check('the story card is written down', storyCard.length > 0, true)
check('the seeded story card is the fallback story card, word for word', seededCard, storyCard)
// And the same card is what actually ships: this build has no service key, so the
// pre-rendered homepage carries the bundled fallback.
const builtHome = await readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8').catch(() => null)
if (builtHome !== null) {
  check('the built homepage shows the story card', builtHome.includes(storyCard), true)
}

/* -------------------------------------------------------------------------- */
/*  404                                                                       */
/* -------------------------------------------------------------------------- */

// A deleted post used to be answered by the catch-all rewrite with the
// homepage's HTML and a 200 status. Search engines read that as "still here,
// duplicate of /", so the URL they had already indexed never dropped out.
// dist/404.html plus a narrowed catch-all is what turns it into a real 404.
const notFoundPath = path.join(process.cwd(), 'dist', '404.html')
const notFound = await readFile(notFoundPath, 'utf8').catch(() => null)
check('dist/404.html written', notFound !== null, true)

if (notFound !== null) {
  check('404 tells the visitor the page is gone', notFound.includes('Page not found'), true)
  check('404 covers the unpublished-post case', notFound.includes('unpublished'), true)
  check('404 is noindex', notFound.includes('content="noindex, nofollow"'), true)
  // index.html ships `index, follow` site-wide, so a leftover copy would leave
  // the error page indexable — the exact failure being fixed.
  check('404 carries no leftover index, follow', notFound.includes('index, follow'), false)
  check(
    '404 has exactly one robots meta',
    (notFound.match(/<meta name="robots"/g) || []).length,
    1,
  )
  check('404 has no canonical to hand authority to another URL', notFound.includes('rel="canonical"'), false)
  check('404 is not the homepage in disguise', notFound.includes('>Who is Rachit'), false)
  check('404 is not a Suspense placeholder', notFound.includes('>Loading'), false)
  // Same snapshot as every other route, so hydrating the error page does not
  // fall back to a /api/content round trip.
  check('404 embeds the content snapshot', notFound.includes('id="site-content"'), true)
  check('404 ships a real 404 document title', notFound.includes(`<title>${NOT_FOUND.title}</title>`), true)
  check('404 has no JSON-LD', notFound.includes('application/ld+json'), false)
  // U+FFFD means a byte sequence was decoded as the wrong charset somewhere in
  // the write path. The em dashes in this page's own copy are the canary.
  check('404 has no mojibake', notFound.includes('\uFFFD'), false)

  // There is exactly one 404 document, but two different routes reach it: an
  // arbitrary unknown path (the `*` route) and a blog slug that is missing or
  // still a draft (the `/blog/:slug` route). The first render shipped a 404 page
  // for the first and let the second keep its own copy, so the pre-rendered HTML
  // said one thing and the hydrated page said another — and the runtime copy never
  // set noindex, because only the 404 page owns that. Compare both routes against
  // the same document so the two can never quietly diverge again.
  const missingPost = renderRoute('/blog/no-such-slug', content)
  check(
    'a missing blog post renders the same 404 page as any unknown URL',
    missingPost.includes('Page not found'),
    true,
  )
  check(
    'a missing blog post left no rival not-found copy behind',
    missingPost.includes('That post isn'),
    false,
  )
}

// The catch-all is the other half of the fix, and it is the half that silently
// comes back: adding one line back to vercel.json restores the soft-404 with no
// other file changing. Assert the shape of the config so that is caught here.
const vercelConfig = JSON.parse(
  await readFile(path.join(process.cwd(), 'vercel.json'), 'utf8'),
)
const rewrites = vercelConfig.rewrites ?? []
const shellRewrites = rewrites.filter(
  (r) => r.destination === '/index.html' && !r.source.startsWith('/admin'),
)
check(
  'only /admin falls back to the SPA shell',
  shellRewrites.map((r) => r.source),
  [],
)
check(
  'the admin panel still gets the shell',
  rewrites.some((r) => r.source.startsWith('/admin') && r.destination === '/index.html'),
  true,
)
check('a post route is not prerendered as /404', routesFor(content).includes('/404'), false)

/* -------------------------------------------------------------------------- */
/*  llms.txt                                                                  */
/* -------------------------------------------------------------------------- */

const llmsPath = path.join(process.cwd(), 'dist', 'llms.txt')
const llms = await readFile(llmsPath, 'utf8').catch(() => null)
check('llms.txt written', llms !== null, true)
if (llms !== null) {
  check('llms.txt opens with the H1', llms.startsWith('# Rachit Sharma\n'), true)
  check(
    'llms.txt links Home from SITE_URL',
    llms.includes(`[Home](${SITE_URL}/)`),
    true,
  )
  check(
    'llms.txt links Resume',
    llms.includes(`[Resume](${SITE_URL}/resume)`),
    true,
  )
  check('llms.txt links Journal', llms.includes(`[Journal](${SITE_URL}/blog)`), true)
  // The summary is the answer an agent lifts first, so it is the same sentence
  // the page and the Person schema use rather than a third wording of it.
  check('llms.txt leads with the definition', llms.includes(`> ${DEFINITION}\n`), true)
  check('llms.txt lists GitHub', llms.includes(SOCIALS.github), true)
  check('llms.txt lists LinkedIn', llms.includes(SOCIALS.linkedin), true)
  check('llms.txt lists the contact address', llms.includes('rachitsharma9990888@gmail.com'), true)
  check(
    'llms.txt points at the sitemap',
    llms.includes(`Sitemap: ${SITE_URL}/sitemap.xml`),
    true,
  )
  // A half-built template leaks as a literal "undefined" somewhere.
  check('llms.txt has no unrendered placeholder', llms.includes('undefined'), false)
  // Same-origin only: an llms.txt that hands over a localhost or preview host is
  // worse than none.
  check('llms.txt contains only SITE_URL links', /https?:\/\/(?!rachitportfolio-rouge\.vercel\.app|github\.com|www\.linkedin\.com|www\.instagram\.com)/.test(llms), false)

  // The three sections an answer engine looks for: who he is, what he has built,
  // and what he builds with. Plain text, so it can be lifted and quoted as-is.
  check('llms.txt has an About section', llms.includes('## About'), true)
  check('llms.txt has a Projects section', llms.includes('## Projects'), true)
  check('llms.txt has a Tools section', llms.includes('## Tools'), true)
  const projectsBlock = llms.split('## Projects')[1]?.split('\n## ')[0] ?? ''
  check(
    'llms.txt Projects section lists at least one project',
    /- \[.+\]\(.+\)/.test(projectsBlock),
    true,
  )
  check(
    'llms.txt names the core tools',
    ['OpenCode', 'ElevenLabs', 'Cartesia AI', 'Claude'].every((tool) => llms.includes(tool)),
    true,
  )
}

/* -------------------------------------------------------------------------- */
/*  robots.txt: every AI crawler gets its own complete group                  */
/* -------------------------------------------------------------------------- */

// Each answer-engine bot is governed by its own User-agent block (a bot that
// matches a named group ignores the `*` group entirely), and every block repeats
// the same posture: allow the whole site, keep the admin panel and the API out.
// A single missing line in a single group is a real leak, so each group is
// asserted as a unit rather than by grepping the file once.
const AI_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
]
const robotsTxt = await readFile(path.join(process.cwd(), 'dist', 'robots.txt'), 'utf8').catch(() => null)
check('robots.txt written', robotsTxt !== null, true)
if (robotsTxt !== null) {
  check('robots.txt opens with the wildcard group', robotsTxt.startsWith('User-agent: *\n'), true)
  const groupOf = (ua) =>
    robotsTxt.split(`User-agent: ${ua}\n`)[1]?.split(/\n\n|\nUser-agent: /)[0] ?? ''
  const postureOk = (ua) => {
    const g = groupOf(ua)
    return g.includes('Allow: /') && g.includes('Disallow: /admin') && g.includes('Disallow: /api')
  }
  check(
    'every AI crawler group exists',
    AI_CRAWLERS.every((ua) => robotsTxt.includes(`User-agent: ${ua}`)),
    true,
  )
  check(
    'every AI group allows the site and keeps admin and API out',
    AI_CRAWLERS.every(postureOk),
    true,
  )
  check('robots.txt advertises the sitemap', robotsTxt.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), true)
}

/* -------------------------------------------------------------------------- */
/*  llms-full.txt: the long-form index stays clean and complete               */
/* -------------------------------------------------------------------------- */

// The full plain-text index is generated from the same data the pages render
// with, so it must carry the exact Quick facts questions, and — being an
// index for AI agents — must itself obey the two hard copy rules the rest of
// the site obeys: no phone number, no status words.
const llmsFull = await readFile(path.join(process.cwd(), 'dist', 'llms-full.txt'), 'utf8').catch(() => null)
check('llms-full.txt written', llmsFull !== null, true)
if (llmsFull !== null) {
  check('llms-full.txt opens with the H1', llmsFull.startsWith('# Rachit Sharma\n'), true)
  check('llms-full.txt carries no phone number', llmsFull.includes('83071'), false)
  check('llms-full.txt is free of status words', STATUS_WORDS.test(llmsFull), false)
  check(
    'llms-full.txt asks every Quick facts question',
    QUICK_FACTS.every((f) => llmsFull.includes(`Q: ${f.q}`)),
    true,
  )
  check(
    'llms-full.txt lists the Kaithal page',
    llmsFull.includes(`${SITE_URL}/digital-marketer-kaithal`),
    true,
  )
}

/* -------------------------------------------------------------------------- */
/*  dist: no retired host baked into any served document                      */
/* -------------------------------------------------------------------------- */

// The pre-rendered files ARE the SEO surface, so one leftover `fawn` URL in any
// of them advertises a host that is not the live site. Walk every text document
// dist ships and fail if the retired preview host appears anywhere.
const distDir = path.join(process.cwd(), 'dist')
async function collectDistDocs(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await collectDistDocs(full)))
    else if (/\.(html|txt|xml|json|webmanifest|js|css)$/.test(entry.name)) out.push(full)
  }
  return out
}
const staleHostFiles = []
for (const file of await collectDistDocs(distDir)) {
  const src = await readFile(file, 'utf8')
  if (/fawn/i.test(src)) staleHostFiles.push(path.relative(process.cwd(), file))
}
check('no retired host baked into any dist document', staleHostFiles, [])

// The LinkedIn handle moved from `rachit-sharma-ab199443a` to
// `rachit-sharma08`. The footer link, the About chips and the Person `sameAs`
// are all read from `SOCIALS.linkedin`, but the story body carries its own
// markdown copy — so the shipped files are swept for the retired slug rather
// than trusting that every writer went through the constant.
const staleLinkedinFiles = []
for (const file of await collectDistDocs(distDir)) {
  const src = await readFile(file, 'utf8')
  if (/rachit-sharma-ab199443a/.test(src)) staleLinkedinFiles.push(path.relative(process.cwd(), file))
}
check('no retired LinkedIn slug baked into any dist document', staleLinkedinFiles, [])

/* -------------------------------------------------------------------------- */
/*  dist surface: one h1, budgeted head, valid JSON-LD, no phone              */
/* -------------------------------------------------------------------------- */

// These are the exact bytes a crawler reads, so the invariants are asserted on
// the shipped files rather than on the renderer's output. `escapeAttr` writes
// entities, so titles/descriptions are decoded before the length is measured —
// the budget is on what a reader (and a search-engine snippet) actually sees.
const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")

const distAll = await collectDistDocs(distDir)
// A search-console verification file is a bare token served verbatim, not a
// rendered page, so the page invariants below do not apply to it.
const distHtml = distAll.filter(
  (f) => f.endsWith('.html') && !/[/\\]google[\da-f]+\.html$/i.test(f),
)
const distText = distAll.filter((f) => /\.(html|txt|xml|json|webmanifest)$/.test(f))

const pagesWithWrongH1 = []
const longTitles = []
const longDescriptions = []
const badSchema = []
const phoneHits = []
for (const file of distHtml) {
  const rel = path.relative(process.cwd(), file)
  const doc = await readFile(file, 'utf8')
  if ((doc.match(/<h1[\s>]/g) || []).length !== 1) pagesWithWrongH1.push(rel)
  const title = decodeEntities(doc.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
  if (title.length === 0 || title.length > 60) longTitles.push(`${rel} (${title.length})`)
  const description = decodeEntities(doc.match(/<meta name="description" content="([^"]*)" \/>/)?.[1] ?? '')
  if (description.length === 0 || description.length > 160) longDescriptions.push(`${rel} (${description.length})`)
  for (const raw of doc.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let parsed = null
    try {
      parsed = JSON.parse(raw[1])
    } catch {
      // falls through to the assertion below
    }
    if (!parsed || parsed['@context'] !== 'https://schema.org' || typeof parsed['@type'] !== 'string' || !parsed['@type']) {
      badSchema.push(rel)
      break
    }
  }
}
check('every dist HTML page has exactly one h1', pagesWithWrongH1, [])
check('every dist HTML title stays under 60 chars', longTitles, [])
check('every dist HTML description stays under 160 chars', longDescriptions, [])
check('every dist JSON-LD block parses with @context + @type', badSchema, [])

// A structured data date has to be a complete ISO 8601 date. The ProfilePage
// shipped `"dateModified":"2026-10"` — a month with no day — and Search Console
// reported it as "Invalid datetime value for dateModified", so the invariant is
// asserted on the bytes rather than on the renderer: every date key in every
// built head and every served text file must match ^\d{4}-\d{2}-\d{2} and must
// not be in the future.
//
// The heads come first because a build without a database bakes no posts and no
// dates at all, which would leave the dist half of this sweep vacuous. The count
// is asserted so neither half can pass by finding nothing.
const badDates = []
const dateValues = []
const sweepDates = (where, text) => {
  for (const match of text.matchAll(/"(dateModified|datePublished)":\s*"([^"]*)"/g)) {
    dateValues.push(match[2])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[2]) || comparisonTime(match[2]) > Date.now()) {
      badDates.push(`${where} ${match[1]}=${match[2]}`)
    }
  }
}
for (const [label, head] of [
  ['home head', homeHead],
  ['resume head', resumeHead],
  ['blog head', blogHead],
  ['post head', postHead],
]) {
  sweepDates(label, head)
}
for (const file of distText) {
  sweepDates(path.relative(process.cwd(), file), await readFile(file, 'utf8'))
}
check('every JSON-LD date is a full ISO date and is not in the future', badDates, [])
check('the built heads carry JSON-LD dates to check', dateValues.length >= 4, true)

// The phone number lives only inside the resume PDF, so no served text file
// (HTML, JSON-LD, llms.txt, sitemap, manifest) may carry it.
for (const file of distText) {
  const doc = await readFile(file, 'utf8')
  if (doc.includes('83071')) phoneHits.push(path.relative(process.cwd(), file))
}
check('the phone number is absent from every dist document', phoneHits, [])

// The Quick facts are deliberately page text, not an FAQPage block, and T9 asks
// for that to hold site-wide — the l.791 check covers the baked home HTML and
// the JSON-LD readers above cover the schemas, so this sweeps every served text
// file as the last net.
const faqHits = []
for (const file of distText) {
  const doc = await readFile(file, 'utf8')
  if (doc.includes('FAQPage')) faqHits.push(path.relative(process.cwd(), file))
}
check('no FAQPage block in any dist document', faqHits, [])

/* -------------------------------------------------------------------------- */
/*  Google Analytics 4: production only, once per page, never on /admin        */
/* -------------------------------------------------------------------------- */

// The tag is written by `headFor`, so what matters is the head each route would
// get in a real production build. `analyticsEnabled()` reads the environment
// when called rather than when the module loads, so both branches can be
// exercised here — and the verifier itself runs with no VERCEL_ENV, which is
// exactly the "local build" case.
const withAnalyticsEnv = (value, run) => {
  const previous = process.env.VERCEL_ENV
  if (value === undefined) delete process.env.VERCEL_ENV
  else process.env.VERCEL_ENV = value
  try {
    return run()
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = previous
  }
}

const gaScriptTags = (head) => head.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>/g) ?? []
const gaConfigCalls = (head) => head.match(/gtag\('config','[^']+'\)/g) ?? []

const routesUnderTest = [
  ['home', '/'],
  ['resume', '/resume'],
  ['blog index', '/blog'],
  ['the Kaithal page', '/digital-marketer-kaithal'],
  ['a post', '/blog/one-brief-one-campaign-sprint'],
]

// Off everywhere unless this really is a Vercel production build.
check('analytics is off outside a production build', analyticsEnabled(), false)
for (const [label, route] of routesUnderTest) {
  check(
    `no analytics tag on the ${label} head outside a production build`,
    gaScriptTags(headFor(route, content)).length,
    0,
  )
}
check(
  'no analytics tag on a Vercel preview build',
  withAnalyticsEnv('preview', () => gaScriptTags(headFor('/', content)).length),
  0,
)
check('analytics is on for a production build', withAnalyticsEnv('production', () => analyticsEnabled()), true)

// On for a production build: exactly once per page, with one measurement ID.
const productionHeads = withAnalyticsEnv('production', () =>
  Object.fromEntries(routesUnderTest.map(([label, route]) => [label, headFor(route, content)])),
)
for (const [label] of routesUnderTest) {
  check(`the ${label} head carries the analytics script exactly once`, gaScriptTags(productionHeads[label]).length, 1)
  check(`the ${label} head configures analytics exactly once`, gaConfigCalls(productionHeads[label]).length, 1)
  check(
    `the ${label} head loads gtag from googletagmanager`,
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+"><\/script>/.test(
      productionHeads[label],
    ),
    true,
  )
}
// Both halves have to name the same property, or the page loads one and reports
// to another.
const headIds = Object.values(productionHeads).map(
  (head) => head.match(/gtag\/js\?id=([^"]+)"/)?.[1] + '|' + head.match(/gtag\('config','([^']+)'\)/)?.[1],
)
check('every page names the same measurement ID, in both halves', [...new Set(headIds)], [
  `${GA_MEASUREMENT_ID}|${GA_MEASUREMENT_ID}`,
])
check('the measurement ID is a GA4 measurement ID', /^G-[A-Z0-9]{4,}$/.test(GA_MEASUREMENT_ID), true)

// The 404 document is written with a hand-built head (no canonical, no JSON-LD)
// and the brief for this tag listed the real pages only, so it stays untagged.
check(
  'the 404 document carries no analytics tag',
  /googletagmanager\.com/.test(notFound ?? ''),
  false,
)

// The exclusion itself: pull the guard straight out of the shipped head and run
// it, rather than asserting on a copy of the expression written here.
const guard = productionHeads.home.match(/if\(([\s\S]*?)\)\{gtag\('config'/)?.[1] ?? ''
check('the analytics guard is present in the head', guard.length > 0, true)
const reportsFor = (host, pathname) => {
  try {
    return Boolean(new Function('location', `return ${guard}`)({ host, pathname }))
  } catch {
    return false
  }
}
check('analytics reports the production home page', reportsFor(PRODUCTION_HOST, '/'), true)
check('analytics reports a production post page', reportsFor(PRODUCTION_HOST, '/blog/one-brief-one-campaign-sprint'), true)
check('analytics never reports /admin', reportsFor(PRODUCTION_HOST, '/admin'), false)
check('analytics never reports an admin sub-route', reportsFor(PRODUCTION_HOST, '/admin/blog'), false)
check('analytics never reports the admin login', reportsFor(PRODUCTION_HOST, '/admin/login'), false)
check('analytics never reports from localhost', reportsFor('localhost:4173', '/'), false)
check('analytics never reports from a preview host', reportsFor('rachitportfolio-abc123.vercel.app', '/'), false)
// The router has to agree with the guard, or the panel would be excluded by one
// rule and rendered by another.
const appTs = await readFile(path.join(process.cwd(), 'src', 'App.tsx'), 'utf8')
check(
  'the router treats /admin and /admin/* as the admin panel',
  /pathname === '\/admin' \|\| pathname\.startsWith\('\/admin\/'\)/.test(appTs),
  true,
)

// Nothing personal may be handed to Google. The tag carries no user id, no
// dimensions and no contact details — only the page URL.
const analyticsSnippet = productionHeads.home.match(/<script>window\.dataLayer[\s\S]*?<\/script>/)?.[0] ?? ''
check('the analytics snippet writes no email address', /@/.test(analyticsSnippet), false)
check('the analytics snippet writes no phone number', analyticsSnippet.includes('83071'), false)
check('the analytics snippet sets no user id', /user_id|userId/.test(analyticsSnippet), false)

// "Never twice" is structural: the tag is only ever written by headFor, so the
// client bundle must contain no analytics reference to inject a second copy.
const clientGaHits = []
for (const file of await readdir(path.join(process.cwd(), 'dist', 'assets'))) {
  if (!file.endsWith('.js')) continue
  const src = await readFile(path.join(process.cwd(), 'dist', 'assets', file), 'utf8')
  if (/googletagmanager\.com|gtag\(|dataLayer|G-[A-Z0-9]{6,}/.test(src)) clientGaHits.push(file)
}
check('no client chunk injects or references analytics', clientGaHits, [])
check('the client seo module holds no analytics code', /gtag|googletagmanager|GA_MEASUREMENT_ID/.test(seoTs), false)
check(
  'the analytics ID is written in one place',
  (seoTs + dataTs).includes(GA_MEASUREMENT_ID),
  false,
)

// And a build that is not a production deploy must not carry the tag at all,
// which is the case this verifier is running in.
const gaInDist = []
for (const file of distText) {
  const doc = await readFile(file, 'utf8')
  if (/googletagmanager\.com/.test(doc)) gaInDist.push(path.relative(process.cwd(), file))
}
check('no document built outside production carries the analytics tag', gaInDist, [])

// GA4 is the only tracker on this site, and that is a decision rather than an
// accident: every other analytics vendor's loader would have to be added
// deliberately. Sweeping the shipped files for the common ones means an
// accidental paste cannot quietly become a second tracker.
const OTHER_TRACKERS =
  /connect\.facebook\.net|facebook\.com\/tr\?|_hsq|hotjar|clarity\.ms|mixpanel|segment\.(io|com)|plausible\.io|umami|matomo|fullstory|posthog/i
const otherTrackerHits = []
for (const file of distText) {
  const doc = await readFile(file, 'utf8')
  if (OTHER_TRACKERS.test(doc)) otherTrackerHits.push(path.relative(process.cwd(), file))
}
check('no other analytics or tracking vendor is present', otherTrackerHits, [])

/* -------------------------------------------------------------------------- */
/*  Google Search Console verification file                                   */
/* -------------------------------------------------------------------------- */

// A search-console token file must ship byte-for-byte as downloaded — a stray
// newline or a line-ending rewrite breaks ownership verification. It is public
// by design (never a secret) and must never leak into sitemap/llms/robots.
const GSC_FILE = 'google8296cc44e5c4188b.html'
const GSC_CONTENT = `google-site-verification: ${GSC_FILE}`
const gscPublic = await readFile(path.join(process.cwd(), 'public', GSC_FILE))
let gscDist = null
try {
  gscDist = await readFile(path.join(distDir, GSC_FILE))
} catch {
  // falls through to the FAIL below
}
check('GSC verification file is copied into dist', gscDist !== null, true)
check(
  'GSC verification file is byte-identical to public/',
  gscDist === null ? -1 : Buffer.compare(gscPublic, gscDist),
  0,
)
check(
  'GSC verification file has exactly the expected content',
  gscDist === null ? null : gscDist.toString('utf8'),
  GSC_CONTENT,
)
const gscLeaks = []
for (const name of ['sitemap.xml', 'llms.txt', 'llms-full.txt', 'robots.txt']) {
  const doc = await readFile(path.join(distDir, name), 'utf8')
  if (doc.includes(GSC_FILE)) gscLeaks.push(name)
}
check('GSC verification file is not advertised in sitemap/llms/robots', gscLeaks, [])

/* -------------------------------------------------------------------------- */
/*  Bundle: the Supabase SDK must stay admin-only                             */
/* -------------------------------------------------------------------------- */

// `content.tsx` used to pull the browser client in through a dynamic import, so
// every public page downloaded ~214 kB to run four reads. It now goes through
// /api/content. `GoTrue` only occurs inside the SDK itself, which makes it a
// reliable way to find the code-split chunk and confirm the public entry has no
// reference to it.
const assetsDir = path.join(process.cwd(), 'dist', 'assets')
const chunks = (await readdir(assetsDir)).filter((f) => f.endsWith('.js'))
const entryFile = chunks.find((f) => /^index-[\w-]+\.js$/.test(f))
check('public entry chunk present', entryFile !== undefined, true)

const sdkChunks = []
for (const file of chunks) {
  const src = await readFile(path.join(assetsDir, file), 'utf8')
  if (src.includes('GoTrue')) sdkChunks.push(file)
}
check('Supabase SDK is code-split into one chunk', sdkChunks.length, 1)

if (entryFile && sdkChunks.length === 1) {
  const entry = await readFile(path.join(assetsDir, entryFile), 'utf8')
  check('SDK chunk is not statically imported by the public entry', entry.includes(sdkChunks[0]), false)
  check('public entry contains no SDK code', entry.includes('GoTrue'), false)
}

console.log(`\n${failures === 0 ? 'All checks passed' : `${failures} check(s) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)
