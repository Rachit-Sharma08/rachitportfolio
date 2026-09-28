import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

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

const routes = ['/', '/resume']
for (const route of routes) {
  const markup = renderRoute(route)
  const html = template.replace(
    rootMarker,
    `<div id="root">${markup}</div>`,
  )
  const outPath = route === '/' ? 'index.html' : path.join('resume', 'index.html')
  const file = path.join(distDir, outPath)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, html)
  console.log(`Prerendered ${route} -> dist/${outPath} (${html.length} bytes)`)
}