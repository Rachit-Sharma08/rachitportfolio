// Single source of truth for SEO values used by the pre-renderer.
// Everything referencing the canonical origin reads from here so a future
// custom domain change is a one-line edit (or a `SITE_URL` env var on Vercel).
export const SITE_URL = (process.env.SITE_URL || 'https://rachitportfolio-fawn.vercel.app').replace(/\/$/, '')
export const SITE_NAME = 'Rachit Sharma — Digital Marketer'

export const OG_IMAGE = `${SITE_URL}/og-image.png`

// Shared by the Person schema's `sameAs` and /llms.txt, so a profile URL only
// ever has to be corrected in one place.
export const SOCIALS = {
  github: 'https://github.com/digitalguru99908-dev',
  linkedin: 'https://www.linkedin.com/in/rachit-sharma',
  instagram: 'https://www.instagram.com/rachitsharma',
}
export const CONTACT_EMAIL = 'rachitsharma999088@gmail.com'

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

// Individual posts get their title/description from the database at build time,
// so only the index page needs a fixed description here.
export const BLOG_DESCRIPTION =
  "Notes on digital marketing, AI tooling, SEO and building with AI from Rachit Sharma — a self-taught digital marketer learning in public."

// The 404 document. Kept out of PAGES on purpose: PAGES doubles as the list of
// routes that get their own static HTML file (see the `Object.keys(PAGES)`
// fallback in prerender.mjs), and `/404` is served for every unmatched path
// rather than being a page anyone can navigate to.
//
// `title` must stay identical to PAGE_TITLES['*'] in src/lib/seo.ts, because
// PublicRoutes rewrites document.title on client-side navigation and would
// otherwise show one title to a crawler and another to a visitor.
export const NOT_FOUND = {
  title: 'Rachit Sharma — Page Not Found',
  description:
    "That page doesn't exist. It may have been a journal post that is no longer published — everything currently published is on the Journal page.",
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
    sameAs: [SOCIALS.github, SOCIALS.linkedin, SOCIALS.instagram],
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
    name: PAGES['/'].title,
    url,
  }
}