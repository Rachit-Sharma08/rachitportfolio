// Exercises the real pre-render pipeline with a synthetic Supabase snapshot, so
// the post page + sitemap path is verified without a live project. Run with:
//   node scripts/verify-prerender.mjs
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { SITE_URL } from './seo-config.mjs'

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
