/**
 * Every site-wide SEO string, in one file, so `npm run verify` has a single
 * source to assert against.
 *
 * None of this is bundled into the client: this module is imported only by the
 * pre-render step and the verifier. Anything the browser also needs has a
 * mirror in `src/data.ts` or `src/lib/seo.ts`, and the verifier asserts the
 * mirrors still match — one fact, one place it is written, one place it can rot.
 */
export const SITE_URL = (
  process.env.SITE_URL || 'https://rachitportfolio-rouge.vercel.app'
).replace(/\/$/, '')

/**
 * The site name for `og:site_name` — the site as a whole, not the home page's
 * title, which is a different string on purpose. Mirrored as `SITE_NAME` in
 * src/lib/seo.ts, which used to write the bare name and drift from this.
 */
export const SITE_NAME = 'Rachit Sharma — Digital Marketer'
export const OG_IMAGE = `${SITE_URL}/og-image.webp`
export const CONTACT_EMAIL = 'rachitsharma9990888@gmail.com'

/**
 * Identity profiles. These have to match what the visitor can actually click
 * open — a `sameAs` pointing at a stranger's profile is worse than no `sameAs`,
 * because it hands a knowledge panel someone else's history.
 *
 * Mirrored by `SOCIALS` in src/data.ts (the verifier compares the two). Kept as
 * bare profile URLs: the tracking query strings LinkedIn and Instagram append
 * in a shared profile link (`?isSelfProfile=true`, `?stkn=…`) identify the
 * session that clicked, not the profile, and have no business in a canonical.
 */
export const SOCIALS = {
  github: 'https://github.com/Rachit-Sharma08',
  linkedin: 'https://www.linkedin.com/in/rachit-sharma-ab199443a/',
  instagram: 'https://www.instagram.com/rachit.08_',
}

/**
 * The visible "Quick facts" cards — the canonical copy lives in src/data.ts and
 * this must stay byte-identical to it (the verifier compares the two). The
 * build half reads it to generate /llms-full.txt; the "Resume page" markdown
 * link inside the Q6 answer is stripped there so the text file gets plain text.
 */
export const QUICK_FACTS = [
  {
    q: 'Who is Rachit Sharma?',
    a: 'Rachit Sharma is a digital marketer who uses AI tools to build brands, campaigns and creative projects.',
  },
  {
    q: 'What does Rachit Sharma do?',
    a: "Rachit Sharma works in digital marketing with AI: Google Ads, Meta Ads, SEO, AEO and GEO (getting found on Google and in AI answers), plus web development. He uses 25+ AI tools, including OpenCode, OpenAI's GPT, ElevenLabs, Cartesia AI and Claude.",
  },
  {
    q: 'Where is Rachit Sharma based?',
    a: 'Rachit Sharma is based in Kaithal, Haryana, India.',
  },
  {
    q: 'What is Rachit Sharma studying?',
    a: 'Rachit Sharma is doing a BBA at RKSD College (Kurukshetra University) and is building his career in digital marketing with AI. He learns by building real projects with AI tools.',
  },
  {
    q: 'What is Rachit Sharma building?',
    a: "Rachit Sharma is building his own AI products, including VoiceMemories AI, which is designed to let a person have a warm, supportive conversation with a loved one's cloned voice, even on live calls. It is paused for now.",
  },
  {
    q: 'Does Rachit Sharma have a resume?',
    a: 'Yes. Rachit Sharma\u2019s resume is available to read on the [Resume page](/resume) and to download as a PDF.',
  },
  {
    q: 'How can I contact Rachit Sharma?',
    a: 'Rachit Sharma can be contacted by email at rachitsharma9990888@gmail.com or through the Contact section of this website.',
  },
]

/**
 * One sentence that answers "who is this and what do they do".
 *
 * This is the site's single definitional claim and it is repeated verbatim in
 * the three places an answer engine is most likely to read: the visible line at
 * the top of About, the Person schema description, and the llms.txt summary.
 * They have to agree — a quoted answer assembled from two of them is a
 * contradiction, not a summary.
 *
 * Wording note: it says what he does, not how he learned to. Every qualifier
 * here has to be one the site can defend on its own pages — which is why the
 * "how he learned to" claim ("self-taught") was dropped from every other string
 * on the site too. He is studying digital marketing at an institute and picks AI
 * tools up hands-on; `verify` keeps the word out of the shipped copy.
 *
 * Mirrored by `DEFINITION` in src/data.ts (the verifier compares the two).
 */
export const DEFINITION =
  'Rachit Sharma is a digital marketer from Kaithal, Haryana, India who uses AI tools to build brands, campaigns and creative projects.'

// The home snippet is the same claim plus a nudge to browse. It still leads with
// the definition (the verifier asserts `startsWith(DEFINITION)`), so the two can
// never disagree about who the page is about.
export const HOME_DESCRIPTION = `${DEFINITION} See his work.`

// Individual posts get their title/description from the database at build time,
// so only the index page needs a fixed description here.
//
// Mirrored in PAGE_DESCRIPTIONS in src/lib/seo.ts (the verifier compares the
// two). These used to try on a status word in a search snippet; neither
// belongs there: the home title already says "Digital Marketer", and the
// resume page states his status on its own line. A snippet is not the place
// to re-litigate it.
export const BLOG_DESCRIPTION =
  'Notes on digital marketing, AI tooling, SEO and building with AI from Rachit Sharma — a digital marketer, learning in public.'

/** Brand-last, the shape search results are read in. Mirrored in src/lib/seo.ts. */
export const TITLE_SEPARATOR = ' | '

/**
 * How long a `<title>` may get before the brand suffix is dropped. Google
 * truncates around 60 characters on a desktop result; past that the suffix is
 * the part that gets cut, and a post title that ends in "… | Rachit Sharma"
 * with the tail chopped reads worse than one with no suffix at all.
 */
export const TITLE_MAX = 60

/**
 * `<title>` for a post: `<post title> | Rachit Sharma`, matching the shape of
 * the fixed routes. Mirrored by `postTitle` in src/lib/seo.ts.
 */
export function postTitle(title) {
  const withBrand = `${title}${TITLE_SEPARATOR}Rachit Sharma`
  return withBrand.length <= TITLE_MAX ? withBrand : title
}

/**
 * Supabase stamps `updated_at` on every save, so a typo fixed ninety seconds
 * after publishing makes the post look revised — and a site where every post
 * claims to have been updated is exactly the "dates look mass-generated"
 * fingerprint structured-data spam is written to look like. Only a real edit
 * counts, so `dateModified` and the visible "Updated" line are gated on this.
 *
 * Mirrored by `isMeaningfullyUpdated` in src/lib/seo.ts.
 */
export const UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000

export function isMeaningfullyUpdated(publishedAt, updatedAt) {
  if (!publishedAt || !updatedAt) return false
  const published = Date.parse(publishedAt)
  const updated = Date.parse(updatedAt)
  if (Number.isNaN(published) || Number.isNaN(updated)) return false
  return updated - published >= UPDATE_THRESHOLD_MS
}

/**
 * The day the resume was last really changed — the commit date of the most recent
 * commit that touched the resume data (`git log -1 --format=%cs -- src/data.ts
 * supabase/seed.sql` → `2026-10-10`).
 *
 * The resume's own `lastUpdated` is display text ("October 2026") and a month
 * without a day is not a date a validator accepts: the ProfilePage shipped
 * `dateModified: "2026-10"` and Search Console reported it as an invalid
 * datetime. A day has to come from somewhere real, and this is the only real one
 * there is — the commit that last wrote the resume. Nothing here is invented and
 * nothing here is generated at build time, so it is the same value in every build.
 *
 * Update it together with the resume itself; `npm run verify` asserts its month
 * still matches the visible label so the two cannot drift apart unnoticed.
 */
export const RESUME_MODIFIED = '2026-10-10'

/**
 * The fixed routes. Each title is the same brand-last shape as `postTitle`,
 * each is asserted to fit `TITLE_MAX`, and `/blog` lives here rather than
 * being special-cased at the call site so the pre-renderer cannot serve a
 * route whose head was never defined.
 */
export const PAGES = {
  '/': {
    title: 'Rachit Sharma — Digital Marketer & AI Builder, Kaithal',
    description: HOME_DESCRIPTION,
  },
  '/resume': {
    title: 'Resume | Rachit Sharma, Digital Marketer',
    description:
      "Rachit Sharma's resume — a digital marketer pairing campaign strategy with 25+ AI tools. Education, skills and projects.",
  },
  '/blog': {
    title: 'Blog | Rachit Sharma',
    description: BLOG_DESCRIPTION,
  },
}

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

/**
 * The Person node's stable id. Every page emits the same Person, so the id is
 * the site root, not the page: an answer engine that sees `…/#person` on the
 * home page and again inside a post's Article author resolves one entity, not
 * one anonymous person per URL. `verify` asserts it is identical everywhere.
 */
export const PERSON_ID = `${SITE_URL}/#person`

/**
 * Every entry is a topic the site publishes or teaches on its own pages — the
 * Capabilities grid, the resume skills, or the blog. `knowsAbout` is a claim,
 * not a keyword list: an entry the site never supports is a topic its author
 * does not have. (The resume also lists social media marketing, Canva and ad
 * design; those are reported rather than added here.)
 *
 * `SEO`/`AI Tools` were spelled out to `Search Engine Optimisation`/`Artificial
 * Intelligence Tools`, and the AEO/GEO pair added, so the list states the
 * broader search work the site actually does rather than only the acronyms.
 * `Google Ads`/`Meta Ads` joined after resume task T2 wrote them into the
 * resume skills line.
 */
export const KNOWS_ABOUT = [
  'Digital Marketing',
  'Google Ads',
  'Meta Ads',
  'Search Engine Optimisation',
  'Answer Engine Optimisation',
  'Generative Engine Optimisation',
  'Web Development',
  'Artificial Intelligence Tools',
  'Content Marketing',
  'AI Prompting',
  'Copywriting',
  'Campaign Planning',
]

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Rachit Sharma',
    alternateName: ['Rachit', 'RachitSharma'],
    // The identity's home, not the page: this is where the person lives, and it
    // is the same on every route so no page claims to be a different person.
    url: SITE_URL,
    // The cut-out, not the social card: this is the schema's answer to "what
    // does this person look like", and og:image already covers the card.
    image: `${SITE_URL}/assets/hero-base.webp`,
    jobTitle: 'Digital Marketer',
    // The same sentence About shows and llms.txt repeats. An answer engine
    // quoting this has to be able to find the claim on the page itself.
    description: DEFINITION,
    sameAs: [SOCIALS.github, SOCIALS.linkedin, SOCIALS.instagram],
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'RKSD College, Kaithal',
    },
    knowsAbout: KNOWS_ABOUT,
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
    name: 'Rachit Sharma',
    alternateName: 'Rachit Sharma Portfolio',
    url,
  }
}