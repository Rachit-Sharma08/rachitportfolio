/** Values shared across the admin screens. */

/** What "Restore default" writes back — matches supabase/seed.sql exactly. */
export const DEFAULT_SETTINGS: Record<string, string> = {
  hero_base_url: '/assets/hero-base.webp',
  hero_reveal_url: '/assets/hero-reveal.webp',
  og_image_url: '/og-image.webp',
}

export const IMAGE_FIELDS = [
  {
    key: 'hero_base_url',
    label: 'Hero base photo',
    folder: 'hero',
    file: 'hero-base',
    hint: 'The always-visible layer. This is the one the cursor reveal sits on top of.',
  },
  {
    key: 'hero_reveal_url',
    label: 'Hero reveal photo',
    folder: 'hero',
    file: 'hero-reveal',
    hint: 'Revealed under the cursor. Must match the base photo exactly.',
  },
  {
    key: 'og_image_url',
    label: 'Social preview image',
    folder: 'hero',
    file: 'og-image',
    hint: 'Shown when the site is shared on WhatsApp, X or LinkedIn. 1200 x 630 works best.',
  },
] as const

export const STORY_FIELDS = [
  {
    key: 'my_story_card',
    label: 'My Story card',
    hint: 'the short paragraph',
    rows: 6,
  },
  {
    key: 'my_story',
    label: 'Story body',
    hint: 'blank line = new paragraph',
    rows: 18,
  },
] as const

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Title -> URL slug, matching the shape the seed posts already use. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
