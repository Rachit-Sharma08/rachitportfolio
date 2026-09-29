import { Marked } from 'marked'

/**
 * Markdown rendering for the two places user-authored text reaches the page:
 * blog post bodies and the About section's "My Story".
 *
 * Content is admin-authored, but it is still injected as HTML, so the renderer
 * is locked down rather than trusted:
 *   - raw HTML in the markdown is escaped and printed as literal text, so a
 *     <script> or an onclick= in a post can never execute;
 *   - link and image URLs are scheme-checked, which kills `javascript:` and
 *     `data:` payloads;
 *   - everything else marked emits (headings, lists, tables, code) is escaped
 *     text inside a known-good tag.
 *
 * `marked` is used rather than a React markdown library because it is
 * synchronous: the pre-renderer in scripts/prerender.mjs runs
 * `renderToStaticMarkup`, which cannot await a suspended component.
 */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char)
}

/** Only schemes that can't execute script. Everything else renders as plain text. */
function safeUrl(raw: string | undefined): string | null {
  const url = (raw ?? '').trim()
  if (!url) return null
  if (url.startsWith('/') || url.startsWith('#')) return url
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  return null
}

const md = new Marked({ gfm: true, breaks: false })

md.use({
  renderer: {
    html({ text }) {
      return escapeHtml(text)
    },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens)
      const url = safeUrl(href)
      if (!url) return label
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      const external = /^(https?:)?\/\//i.test(url)
        ? ' target="_blank" rel="noopener noreferrer"'
        : ''
      return `<a href="${escapeHtml(url)}"${titleAttr}${external}>${label}</a>`
    },
    image({ href, title, tokens }) {
      const alt = escapeHtml(this.parser.parseInline(tokens))
      const url = safeUrl(href)
      if (!url) return alt
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${escapeHtml(url)}" alt="${alt}"${titleAttr} loading="lazy" decoding="async" />`
    },
  },
})

/** Block-level markdown -> HTML. Used for blog post bodies and the admin preview. */
export function renderMarkdown(source: string): string {
  if (!source.trim()) return ''
  return md.parse(source) as string
}

/**
 * Inline-only markdown -> HTML, for text that must stay inside a single <p>.
 * Story paragraphs go through this so an accidental heading or list can't break
 * the About layout.
 */
export function renderInline(source: string): string {
  if (!source.trim()) return ''
  return md.parseInline(source) as string
}

/** Blank-line separated chunks — the unit the About section lays out. */
export function splitParagraphs(source: string): string[] {
  return source
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
}
