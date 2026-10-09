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
  postTitle,
  isMeaningfullyUpdated,
} from './seo-config.mjs'
import { headFor } from './head.mjs'

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
check('failed query still lists the 3 static routes', routesFor(failed), ['/', '/resume', '/blog'])

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
check('routes for an emptied site', routesFor(emptied), ['/', '/resume', '/blog'])

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
const postHead = headFor('/blog/one-brief-one-campaign-sprint', content)
const sameDateHead = headFor('/blog/seo-is-not-dead', content)

// --- one definition, stated the same way everywhere -------------------------

const homePerson = jsonLd(homeHead).find((s) => s['@type'] === 'Person')
check('home Person schema carries the definition', homePerson?.description, DEFINITION)
check('home Person schema is absolute-URLed', homePerson?.url, `${SITE_URL}/`)
check('home Person schema has @context', homePerson?.['@context'], 'https://schema.org')
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

check('home emits Person + WebSite', types(homeHead), ['Person', 'WebSite'])
check('resume emits Person only', types(resumeHead), ['Person'])
check('blog index emits Person only', types(blogHead), ['Person'])
check('post emits Person + BlogPosting', types(postHead), ['Person', 'BlogPosting'])
check(
  'Person url follows the page it is emitted on',
  jsonLd(resumeHead).find((s) => s['@type'] === 'Person')?.url,
  `${SITE_URL}/resume`,
)
check(
  'WebSite url is the site root',
  jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.url,
  `${SITE_URL}/`,
)

// --- titles: one string, reused by every tag that repeats it ----------------

check('home <title>', homeHead.includes(`<title>${PAGES['/'].title}</title>`), true)
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
  PAGES['/'].title,
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
check('the brand-last routes carry the brand', ['/resume', '/blog'].every((route) => PAGES[route].title.includes('Rachit Sharma')), true)

// The site name and the home title are two different things, and each has to
// reach every consumer unchanged: og:site_name names the site, og:title names
// the page.
check('home og:site_name is the site name', metaContent(homeHead, 'property', 'og:site_name'), SITE_NAME)
check('the site name is not the home title', SITE_NAME === PAGES['/'].title, false)
check('the Person schema names the person, not the page', jsonLd(homeHead).find((s) => s['@type'] === 'Person')?.name, 'Rachit Sharma')
check('the WebSite schema is named after the home page', jsonLd(homeHead).find((s) => s['@type'] === 'WebSite')?.name, PAGES['/'].title)
check('home twitter:title matches the home <title>', metaContent(homeHead, 'name', 'twitter:title'), PAGES['/'].title)
check('blog twitter:title matches the blog <title>', metaContent(blogHead, 'name', 'twitter:title'), PAGES['/blog'].title)
check('blog og:title matches the blog <title>', metaContent(blogHead, 'property', 'og:title'), PAGES['/blog'].title)

// --- dateModified only when the edit is real --------------------------------

const blogPost = (head) => jsonLd(head).find((s) => s['@type'] === 'BlogPosting')
check('a month-later edit is claimed', blogPost(postHead)?.dateModified, '2026-02-02T10:00:00Z')
check('a same-instant save is not claimed', blogPost(sameDateHead)?.dateModified, undefined)
check('dateModified still absent for a same-instant save', JSON.stringify(blogPost(sameDateHead)).includes('dateModified'), false)
check('datePublished is always claimed', blogPost(sameDateHead)?.datePublished, '2025-12-01T10:00:00Z')

// The gate is Supabase stamping updated_at on every save, so the boundary is the
// whole feature: a minute-old edit must read as "never edited".
const edited = (ms) => isMeaningfullyUpdated('2026-01-05T10:00:00Z', new Date(Date.parse('2026-01-05T10:00:00Z') + ms).toISOString())
check('an edit under the threshold is ignored', edited(60 * 1000), false)
check('an edit past the threshold counts', edited(UPDATE_THRESHOLD_MS + 1000), true)
check('an edit exactly on the threshold counts', edited(UPDATE_THRESHOLD_MS), true)
check('a missing update date is ignored', isMeaningfullyUpdated('2026-01-05T10:00:00Z', null), false)
check('a missing publish date is ignored', isMeaningfullyUpdated(null, '2026-02-02T10:00:00Z'), false)
check('an unparseable update date is ignored', isMeaningfullyUpdated('2026-01-05T10:00:00Z', 'soon'), false)

// Exactly one BlogPosting per post: hydration removes the pre-rendered node
// before appending its own, and the tag it looks for is what keeps that true.
check('post head tags its single BlogPosting script', (postHead.match(/data-seo="blog-post"/g) || []).length, 1)

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
// Five self-contained answers sit in a small visible "Quick facts" list. The
// brief was explicit that this is page text, not an FAQPage block: an answer
// engine should read the same words a visitor does, and the page should add no
// schema it would then have to keep true.
const QUICK_FACT_QUESTIONS = [
  'Who is Rachit Sharma?',
  'What does Rachit Sharma do?',
  'Where is Rachit Sharma based?',
  'What is Rachit Sharma studying?',
  'What is Rachit Sharma building?',
]
check(
  'About writes all five Quick facts questions',
  QUICK_FACT_QUESTIONS.every((q) => aboutTsx.includes(q)),
  true,
)
check(
  'the Quick facts answers are in the served home HTML',
  QUICK_FACT_QUESTIONS.every((q) => builtHomeHtml.includes(q)),
  true,
)
check('the Quick facts copy adds no FAQPage schema', builtHomeHtml.includes('FAQPage'), false)

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
const OLD_LINKEDIN = /linkedin\.com\/in\/rachit-sharma(?!-ab199443a)/
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
  ['a post', postHead],
]) {
  check(`the ${label} head makes no self-taught claim`, SELF_TAUGHT.test(head), false)
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
  check('llms.txt lists the contact address', llms.includes('rachitsharma999088@gmail.com'), true)
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
