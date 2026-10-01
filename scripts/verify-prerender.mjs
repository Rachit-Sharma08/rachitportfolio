// Exercises the real pre-render pipeline with a synthetic Supabase snapshot, so
// the post page + sitemap path is verified without a live project. Run with:
//   node scripts/verify-prerender.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { SITE_URL, NOT_FOUND } from './seo-config.mjs'

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
check('failed query keeps bundled projects', failed.projects.length, 4)
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
  check('llms.txt lists GitHub', llms.includes('github.com/digitalguru99908-dev'), true)
  check('llms.txt lists LinkedIn', llms.includes('linkedin.com/in/rachit-sharma'), true)
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
  check('llms.txt contains only SITE_URL links', /https?:\/\/(?!rachitportfolio-fawn\.vercel\.app|github\.com|www\.linkedin\.com|www\.instagram\.com)/.test(llms), false)
}

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
