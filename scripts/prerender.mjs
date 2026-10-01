import { mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  PAGES,
  NOT_FOUND,
  personSchema,
  websiteSchema,
  BLOG_DESCRIPTION,
  SOCIALS,
  CONTACT_EMAIL,
} from './seo-config.mjs'

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

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function pageFor(route) {
  if (PAGES[route]) return PAGES[route]
  if (route === '/blog') {
    return { title: 'Journal — Rachit Sharma', description: BLOG_DESCRIPTION }
  }
  // /blog/:slug — resolved from the snapshot below.
  return null
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
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function headFor(route) {
  const url = `${SITE_URL}${route}`
  let page = pageFor(route)
  // Person is emitted on every page: it is the author of a post and the owner
  // of the site, and search engines use it to tie the two together.
  const schemas = [personSchema(url)]

  // Social preview image. A post with its own cover uses it, so the card that
  // shows up in a feed matches the post; everything else uses the site image.
  let socialImage = absoluteUrl(OG_IMAGE)
  let socialImageAlt = 'Rachit Sharma — Digital Marketer'
  let isArticle = false

  if (!page && route.startsWith('/blog/')) {
    const slug = route.slice('/blog/'.length)
    const post = content?.posts.find((p) => p.slug === slug)
    if (post) {
      const title = `${post.title} — Rachit Sharma`
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
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description,
        mainEntityOfPage: url,
        datePublished: post.publishedAt ?? undefined,
        dateModified: post.updatedAt ?? undefined,
        author: { '@type': 'Person', name: 'Rachit Sharma' },
        publisher: { '@type': 'Person', name: 'Rachit Sharma' },
        image,
      })
    }
  }

  page = page ?? PAGES['/']
  if (route === '/') schemas.push(websiteSchema(url))

  const ld = schemas.map((s) => safeJson(s))
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
    `<meta property="og:locale" content="en_US" />`,
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
    ...ld.map((json) => `<script type="application/ld+json">${json}</script>`),
  ].join('\n    ')
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
 */
function composeHtml(markup, head) {
  const lines = head.split('\n')
  let html = template.replace(rootMarker, `<div id="root">${markup}</div>`)
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, lines[0])
    .replace(/<meta[^>]*name="description"[^>]*\/>/, lines[1])
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

const routes = content
  ? routesFor(content)
  : Object.keys(PAGES).concat(['/blog'])

// A redeploy after an unpublish must not leave the old post's HTML behind.
const blogDir = path.join(distDir, 'blog')
await rm(blogDir, { recursive: true, force: true })

for (const route of routes) {
  const head = headFor(route)
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

const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /api',
  '',
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
  `> ${PAGES['/'].description}`,
  '',
  '## Key pages',
  '',
  `- [Home](${SITE_URL}/): Portfolio landing page — about, capabilities, selected work, journal and contact.`,
  `- [Resume](${SITE_URL}/resume): Education, skills and projects.`,
  `- [Journal](${SITE_URL}/blog): Notes on digital marketing, AI tooling, SEO and building with AI.`,
  '',
]

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
