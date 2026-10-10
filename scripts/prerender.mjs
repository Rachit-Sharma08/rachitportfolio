import { mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { SITE_URL, PAGES, NOT_FOUND, DEFINITION, SOCIALS, CONTACT_EMAIL } from './seo-config.mjs'
import { escapeAttr, headFor, safeJson } from './head.mjs'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

await build({
  configFile: path.join(root, 'vite.config.ts'),
  logLevel: 'warn',
  build: {
    ssr: path.join(root, 'src/prerender.tsx'),
    outDir: ssrDir,
    emptyOutDir: true,
    minify: false,
    target: 'node18',
  },
})

const ssrModuleUrl = pathToFileURL(path.join(ssrDir, 'prerender.js')).href
const { renderRoute, mapBuildContent, routesFor } = await import(ssrModuleUrl)

/* -------------------------------------------------------------------------- */
/*  Build-time content snapshot                                               */
/* -------------------------------------------------------------------------- */

/**
 * Pull the current content out of Supabase so the static HTML that ships to
 * crawlers is the real thing, not the src/data.ts fallback.
 *
 * This runs in Node at build time, which is the one place the service-role key
 * is used: site_settings and site_story have no anon read policy (they are
 * admin-only, by design), so without the service role the build could only ever
 * bake in the fallback for those two. The key is read from process.env here and
 * never referenced from src/, so it cannot end up in the client bundle.
 *
 * Any failure is non-fatal — the build falls back to the static copy.
 */
async function loadBuildContent() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.log('[prerender] No Supabase service-role key — using static content')
    return null
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const [projects, posts, settings, story] = await Promise.all([
      client.from('projects').select('*').order('display_order', { ascending: true }),
      client
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      client.from('site_settings').select('key, value'),
      client.from('site_story').select('section_key, content'),
    ])

    const failed = [projects, posts, settings, story].filter((r) => r.error)
    if (failed.length) {
      console.log(
        `[prerender] Supabase read failed (${failed
          .map((r) => r.error.message)
          .join('; ')}) — using static content`,
      )
      return null
    }

    const content = mapBuildContent({
      projects: projects.data,
      posts: posts.data,
      settings: settings.data,
      story: story.data,
    })
    console.log(
      `[prerender] Baked ${content.projects.length} projects, ${content.posts.length} published posts`,
    )
    return content
  } catch (error) {
    console.log(
      `[prerender] Supabase snapshot skipped (${error.message}) — using static content`,
    )
    return null
  }
}

const content = await loadBuildContent()

// The exact SiteContent the pages above were rendered with. It is embedded as a
// JSON script so the client hydrates from the same snapshot instead of making a
// `GET /api/content` round trip — and a hard rebuild hook (admin -> /api/rebuild)
// keeps this in step with every content edit, which is what lets the homepage
// render with zero required runtime API calls and still never go stale.
const snapshot = content ?? mapBuildContent({})

/* -------------------------------------------------------------------------- */
/*  Head generation                                                           */
/* -------------------------------------------------------------------------- */

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const rootMarker = '<div id="root"></div>'
if (!template.includes(rootMarker)) {
  throw new Error('dist/index.html me <div id="root"> nahi mila')
}

/* -------------------------------------------------------------------------- */
/*  Stylesheet inlining                                                        */
/* -------------------------------------------------------------------------- */

// The built sheet is the only render-blocking request left on the page, and it
// arrives early enough to cost real time before the first paint. Inlining it
// removes the request altogether: the styles are already inside the document,
// so there is no round trip to wait on — and, more importantly, there is no
// window in which the page could paint unstyled. The usual "load CSS async"
// trick buys the same number at the price of a flash of unstyled content; this
// has no such window to get wrong.
//
// The honest cost is caching. An external sheet is downloaded once and reused
// across every route and repeat visit, while inlined CSS rides along with each
// document. At this size that trade is close to byte-neutral — the sheet
// compresses to roughly what the larger HTML costs — and it wins on latency,
// but it is the reason this belongs on a small site rather than a large one.
const assetDir = path.join(distDir, 'assets')
const builtCss = (await readdir(assetDir)).filter((file) => file.endsWith('.css'))
if (builtCss.length !== 1) {
  throw new Error(`Expected exactly one built stylesheet, found ${builtCss.length}`)
}
const css = await readFile(path.join(assetDir, builtCss[0]), 'utf8')

// Every url() in the built sheet has to resolve the same way once it moves into
// the document. Root-absolute ("/fonts/…"), data and protocol-qualified URLs
// all do. A bare relative path does not — it would resolve against the document
// URL instead of the assets folder and 404 — so the build fails rather than
// shipping fonts and a noise texture that silently failed to load.
const relativeUrls = [...css.matchAll(/url\(([^)]*)\)/g)]
  .map((match) => match[1].trim().replace(/^['"]|['"]$/g, ''))
  .filter(
    (value) =>
      value !== '' &&
      !/^data:/i.test(value) &&
      !value.startsWith('/') &&
      !/^[a-z][a-z0-9+.-]*:/i.test(value),
  )
if (relativeUrls.length > 0) {
  throw new Error(
    `Built CSS has relative url() refs (${relativeUrls.join(', ')}) — inlining would break them`,
  )
}

// A "</style" sequence would close an inline tag early and dump the rest of the
// sheet into the document as text. Valid CSS cannot contain one outside a
// string, so refuse to inline instead of silently corrupting every page.
if (/<\/style/i.test(css)) {
  throw new Error('Built CSS contains "</style" — refusing to inline')
}

const STYLE_LINK = /<link[^>]*rel="stylesheet"[^>]*>/
const styleLinkCount = template.split(STYLE_LINK).length - 1
if (styleLinkCount !== 1) {
  throw new Error(`Expected exactly one stylesheet link, found ${styleLinkCount}`)
}

/* -------------------------------------------------------------------------- */
/*  Document assembly                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Splice a rendered route into the client build's index.html and swap in a
 * per-route head.
 *
 * `head` is positional by design: line 1 replaces <title>, line 2 replaces the
 * description meta, and everything after that is appended just before </head>.
 * The template ships exactly one of each, and the replaces are unanchored to
 * the first match only, so an appended canonical from a previous pass is never
 * duplicated.
 *
 * The stylesheet link is replaced by the sheet's own contents on the way
 * through, so every route it has to be applied to gets the treatment.
 */
function composeHtml(markup, head) {
  const lines = head.split('\n')
  let html = template.replace(rootMarker, `<div id="root">${markup}</div>`)
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, lines[0])
    .replace(/<meta[^>]*name="description"[^>]*\/>/, lines[1])
  html = html.replace(STYLE_LINK, `<style>${css}</style>`)
  html = html.replace('</head>', `    ${lines.slice(2).join('\n    ')}\n  </head>`)

  // Embed the snapshot every route shares. `safeJson` escapes "<" so no post
  // body or project description can terminate this script tag early. The tag is
  // type="application/json", so the browser never executes it as script.
  return html.replace(
    '</body>',
    `  <script id="site-content" type="application/json">${safeJson(snapshot)}</script>\n</body>`,
  )
}

/* -------------------------------------------------------------------------- */
/*  Prerender every route                                                     */
/* -------------------------------------------------------------------------- */

// PAGES is the list of routes that get their own static file, so the fallback
// is its keys verbatim — no extra entries, or a route would be baked twice.
const routes = content ? routesFor(content) : Object.keys(PAGES)

// A redeploy after an unpublish must not leave the old post's HTML behind.
const blogDir = path.join(distDir, 'blog')
await rm(blogDir, { recursive: true, force: true })

for (const route of routes) {
  const head = headFor(route, content ?? undefined)
  const markup = renderRoute(route, content ?? undefined)
  const html = composeHtml(markup, head)

  const outPath =
    route === '/'
      ? 'index.html'
      : path.join(route.replace(/^\//, ''), 'index.html')
  const file = path.join(distDir, outPath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`Prerendered ${route} -> dist/${outPath} (${html.length} bytes)`)
}

/* -------------------------------------------------------------------------- */
/*  404.html                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The static 404 document.
 *
 * Vercel serves `404.html` from the output directory with a real 404 status for
 * any path that matches no file and no rewrite. That status is the whole point:
 * a deleted post used to be answered by the catch-all rewrite with the
 * homepage's HTML and a 200, which is a soft-404 — the URL stays in the index
 * and is treated as a duplicate of `/`. With this file in place the same URL
 * gets 404 and `noindex` together.
 *
 * Two things are deliberately absent from the head: a canonical link (there is
 * no single correct URL for "not found", and canonicalising a 404 invites
 * Google to treat the nearest real page as its replacement) and the JSON-LD
 * block (a Person schema on an error page is a mismatch signal, not a win).
 *
 * The markup comes from the same `*` route the client uses, so the page a
 * crawler sees and the page React renders are the same component.
 */
const notFoundHead = [
  `<title>${escapeAttr(NOT_FOUND.title)}</title>`,
  `<meta name="description" content="${escapeAttr(NOT_FOUND.description)}" />`,
  `<meta name="robots" content="noindex, nofollow" />`,
].join('\n    ')

let notFoundHtml = composeHtml(renderRoute('/404', content ?? undefined), notFoundHead)

// index.html ships `index, follow` for the whole site. It has to be *removed*,
// not overwritten: `noindex, nofollow` is already in the head from notFoundHead,
// and two robots metas — even agreeing ones — is a shape crawlers are free to
// resolve in ways nobody has tested.
notFoundHtml = notFoundHtml.replace(/\s*<meta name="robots" content="index, follow" \/>/, '')

const robotsMetas = notFoundHtml.match(/<meta name="robots"/g) ?? []
if (robotsMetas.length !== 1) {
  throw new Error(`404.html me ${robotsMetas.length} robots meta hain, 1 chahiye`)
}
if (notFoundHtml.includes('index, follow')) {
  throw new Error('404.html me `index, follow` robots meta bacha gaya')
}
if (notFoundHtml.includes('rel="canonical"')) {
  throw new Error('404.html me canonical link aa gayi')
}

await writeFile(path.join(distDir, '404.html'), notFoundHtml)
console.log(`Wrote dist/404.html (${notFoundHtml.length} bytes)`)

/* -------------------------------------------------------------------------- */
/*  robots.txt + sitemap.xml                                                  */
/* -------------------------------------------------------------------------- */

/**
 * AI/answer-engine crawlers get their own group so they are not accidentally
 * governed by the `*` group. Every group repeats the same three lines because
 * a bot that matches its own group ignores the `*` group entirely.
 * Each name is verified against the vendor's official documentation
 * (OpenAI, Anthropic, Perplexity, Google, Apple).
 */
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

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /api',
  '',
  ...AI_CRAWLERS.flatMap((ua) => [
    `User-agent: ${ua}`,
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    '',
  ]),
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n')
await writeFile(path.join(distDir, 'robots.txt'), robots)
console.log('Wrote dist/robots.txt')

const today = new Date().toISOString().slice(0, 10)
const urlset = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => {
    const loc = `${SITE_URL}${route}`
    const isPost = route.startsWith('/blog/')
    const priority = route === '/' ? '1.0' : isPost ? '0.7' : '0.6'
    const freq = isPost ? 'monthly' : 'weekly'
    const post = isPost
      ? content?.posts.find((p) => route === `/blog/${p.slug}`)
      : null
    const lastmod = (post?.updatedAt ?? post?.publishedAt ?? '').slice(0, 10)
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod || today}</lastmod>`,
      `    <changefreq>${freq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  }),
  '</urlset>',
  '',
].join('\n')
await writeFile(path.join(distDir, 'sitemap.xml'), urlset)
console.log(`Wrote dist/sitemap.xml (${routes.length} urls)`)

/* -------------------------------------------------------------------------- */
/*  llms.txt                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A machine-readable index of the site for AI agents and crawlers: who runs it,
 * which URLs matter, and what each one is. Generated rather than hand-written so
 * it can never disagree with SITE_URL or with the posts that were actually
 * published at build time — an unpublish removes its line here too, exactly as
 * it leaves the sitemap.
 */
const llms = [
  '# Rachit Sharma',
  '',
  `> ${DEFINITION}`,
  '',
  '## About',
  '',
  'Rachit Sharma is a digital marketer from Kaithal, Haryana, India. He studies Digital Marketing with AI at Zedking Group of Institution, works with 25+ AI tools, and builds his own AI products on the side.',
  'Works with Google Ads, Meta Ads, SEO, AEO, GEO and web development.',
  '',
  '## Key pages',
  '',
  `- [Home](${SITE_URL}/): Portfolio landing page — about, capabilities, selected work, journal and contact.`,
  `- [Resume](${SITE_URL}/resume): Education, skills and projects.`,
  `- [Journal](${SITE_URL}/blog): Notes on digital marketing, AI tooling, SEO and building with AI.`,
  '',
]

// What he has built, from the same snapshot the pages rendered with — so a
// DB-less build still lists the bundled projects, and one deleted in the admin
// leaves here exactly as it leaves the page.
llms.push('## Projects', '')
for (const project of snapshot.projects) {
  const name = project.projectUrl
    ? `[${project.title}](${project.projectUrl})`
    : project.title
  const summary = project.tagline
    ? `: ${project.tagline.replace(/\s+/g, ' ').trim()}`
    : ''
  llms.push(`- ${name}${summary}`)
}
llms.push(
  '',
  '## Tools',
  '',
  'Rachit works with 25+ AI tools. The ones he uses most:',
  '',
  '- OpenCode — a coding agent',
  '- OpenAI (GPT)',
  '- ElevenLabs',
  '- Cartesia AI',
  '- Claude',
  '',
)

const published = (content?.posts ?? []).filter((post) => post.slug)
if (published.length) {
  llms.push('## Journal posts', '')
  for (const post of published) {
    const summary = post.excerpt ? `: ${post.excerpt.replace(/\s+/g, ' ').trim()}` : ''
    llms.push(`- [${post.title}](${SITE_URL}/blog/${post.slug})${summary}`)
  }
  llms.push('')
}

llms.push(
  '## Elsewhere',
  '',
  `- [GitHub](${SOCIALS.github})`,
  `- [LinkedIn](${SOCIALS.linkedin})`,
  `- [Instagram](${SOCIALS.instagram})`,
  '',
  '## Contact',
  '',
  `- Email: ${CONTACT_EMAIL}`,
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
)
await writeFile(path.join(distDir, 'llms.txt'), llms.join('\n'))
console.log(`Wrote dist/llms.txt (${published.length} posts listed)`)
