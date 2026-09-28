import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE,
  PAGES,
  personSchema,
  websiteSchema,
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
const { renderRoute } = await import(ssrModuleUrl)

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const rootMarker = '<div id="root"></div>'
if (!template.includes(rootMarker)) {
  throw new Error('dist/index.html me <div id="root"> nahi mila')
}

function headFor(route) {
  const page = PAGES[route] ?? PAGES['/']
  const url = `${SITE_URL}${route === '/' ? '/' : route}`
  const schemas = [
    personSchema(url),
    ...(route === '/' ? [websiteSchema(url)] : []),
  ]
  const ld = schemas.map((s) => JSON.stringify(s, null, 0))

  return [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${page.description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${page.title}" />`,
    `<meta property="og:description" content="${page.description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Rachit Sharma — Digital Marketer" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${page.title}" />`,
    `<meta name="twitter:description" content="${page.description}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...ld.map((json) => `<script type="application/ld+json">${json}</script>`),
  ].join('\n    ')
}

const routes = Object.keys(PAGES)
for (const route of routes) {
  const markup = renderRoute(route)
  let html = template.replace(
    rootMarker,
    `<div id="root">${markup}</div>`,
  )
  // Replace the generic default head values with the per-route ones, then
  // append the route-specific extras just before </head>.
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, headFor(route).split('\n')[0])
    .replace(
      /<meta[^>]*name="description"[^>]*\/>/,
      headFor(route).split('\n')[1],
    )
  const extras = headFor(route)
    .split('\n')
    .slice(2)
    .join('\n    ')
  html = html.replace('</head>', `    ${extras}\n  </head>`)

  const outPath = route === '/' ? 'index.html' : path.join('resume', 'index.html')
  const file = path.join(distDir, outPath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`Prerendered ${route} -> dist/${outPath} (${html.length} bytes)`)
}

// robots.txt — allow everything, point at the sitemap.
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

// sitemap.xml — every pre-rendered route, extensible for /blog later.
const today = new Date().toISOString().slice(0, 10)
const urlset = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => {
    const loc = `${SITE_URL}${route === '/' ? '/' : route}`
    const priority = route === '/' ? '1.0' : '0.6'
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  }),
  '</urlset>',
  '',
].join('\n')
await writeFile(path.join(distDir, 'sitemap.xml'), urlset)
console.log('Wrote dist/sitemap.xml')