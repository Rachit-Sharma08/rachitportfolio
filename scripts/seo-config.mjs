// Single source of truth for SEO values used by the pre-renderer.
// Everything referencing the canonical origin reads from here so a future
// custom domain change is a one-line edit (or a `SITE_URL` env var on Vercel).
export const SITE_URL = (process.env.SITE_URL || 'https://rachitportfolio-fawn.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'Rachit Sharma — Digital Marketer'

export const OG_IMAGE = `${SITE_URL}/og-image.png`

export const PAGES = {
  '/': {
    title: 'Rachit Sharma — Digital Marketer Building With AI',
    description:
      'Rachit Sharma is a Haryana-based digital marketer pairing campaign strategy with 25+ AI tools to build brands, campaigns and his own AI products.',
  },
  '/resume': {
    title: 'Rachit Sharma — Resume',
    description:
      "Rachit Sharma's resume — a self-taught digital marketer pairing campaign strategy with 25+ AI tools. Education, skills and projects.",
  },
}

export function personSchema(url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rachit Sharma',
    url,
    image: OG_IMAGE,
    jobTitle: 'Digital Marketer',
    description:
      'Self-taught digital marketer pairing campaign strategy with 25+ AI tools. Building brands, campaigns and AI products.',
    sameAs: [
      'https://github.com/digitalguru99908-dev',
      'https://www.linkedin.com/in/rachit-sharma',
      'https://www.instagram.com/rachitsharma',
    ],
    knowsAbout: [
      'Digital Marketing',
      'AI Tools',
      'AI Prompting',
      'SEO',
      'Content Marketing',
      'Copywriting',
      'Campaign Planning',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kaithal',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
    },
  }
}

export function websiteSchema(url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
  }
}