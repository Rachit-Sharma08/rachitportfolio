export const PERSONAL = {
  name: 'Rachit Sharma',
  email: 'rachitsharma999088@gmail.com',
  phone: '+91 83071 51186',
  phoneHref: 'tel:+918307151186',
}

/**
 * The site's one-line answer to "who is this": what he does, in the words an
 * answer engine can lift without editing. Repeated verbatim as the visible line
 * at the top of About, as the Person schema description and as the llms.txt
 * summary — if those three ever disagree, a generated answer is a contradiction.
 *
 * Mirrored by `DEFINITION` in scripts/seo-config.mjs (the build half); `npm run
 * verify` asserts the two strings are byte-identical.
 */
export const DEFINITION =
  'Rachit Sharma is a digital marketer from Kaithal, Haryana, India who uses AI tools to build brands, campaigns and creative projects.'

export const SOCIALS = {
  github: 'https://github.com/Rachit-Sharma08',
  linkedin: 'https://www.linkedin.com/in/rachit-sharma-ab199443a/',
  instagram: 'https://www.instagram.com/rachit.08_',
}

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: SOCIALS.linkedin },
  { label: 'GitHub', href: SOCIALS.github },
  { label: 'Instagram', href: SOCIALS.instagram },
]

// Both cut-outs are 1086x1448 (exactly 3:4) and pixel-aligned with each
// other. `base` is the bottom layer, always visible; `reveal` is masked on top
// and only shows through the circle that follows the cursor.
//
// Served responsively. The figure's height is viewport-relative (46/54/74/80vh
// at `sm`/`lg`/`xl`) and its aspect is 3:4, so a phone was downloading a
// 1086px-wide file to fill a 291px-wide box. Every width below is the same
// source resampled onto an identical grid for both layers, which the reveal
// effect depends on: layers on different grids would let the reveal's edge
// escape the base silhouette (that was the v19 sunglasses-bleed bug).
//
// WebP q88, alpha bit-identical to the source PNGs, which is the highest
// quality that still measures SSIM >= 0.98 / PSNR >= 40 dB composited over the
// page background. Regenerate with tools/generate-hero-assets.py; originals
// stay at D:\Pictures.
export const HERO_IMAGES = {
  base: '/assets/hero-base.webp',
  reveal: '/assets/hero-reveal.webp',
}

const heroSrcset = (name: string) =>
  `/assets/hero-${name}-480.webp 480w, ` +
  `/assets/hero-${name}-512.webp 512w, ` +
  `/assets/hero-${name}-600.webp 600w, ` +
  `/assets/hero-${name}-720.webp 720w, ` +
  `/assets/hero-${name}-896.webp 896w, ` +
  `/assets/hero-${name}.webp 1086w`

/**
 * Mirrors the `h-[46vh] sm:h-[54vh] lg:h-[74vh] xl:h-[80vh]` and `aspect-[3/4]`
 * on .hero-figure, with width = 0.75 x height. index.html repeats this
 * verbatim in `imagesizes` so the preload and the <img> resolve to the same
 * candidate — if they disagree the browser downloads two copies of the picture.
 */
export const HERO_SIZES =
  '(min-width: 1280px) calc(0.75 * 80vh), (min-width: 1024px) calc(0.75 * 74vh), (min-width: 640px) calc(0.75 * 54vh), calc(0.75 * 46vh)'

export const HERO_SRCSET = {
  base: heroSrcset('base'),
  reveal: heroSrcset('reveal'),
}

export const HERO_INTRO =
  'Blending digital marketing strategy with AI tools to build brands, campaigns, and creative projects that actually connect.'

export const NAV_LINKS = [
  { label: 'Home', target: 'home' },
  { label: 'About', target: 'about' },
  { label: 'Capabilities', target: 'capabilities' },
  { label: 'Work', target: 'work' },
  { label: 'Vision', target: 'vision' },
  { label: 'Contact', target: 'contact' },
  { label: 'Journal', target: 'blog', route: '/blog' },
  { label: 'Resume', target: 'resume', route: '/resume' },
]

export interface Project {
  title: string
  tag: string
  href?: string
  image?: string
  comingSoon?: boolean
  accent?: string
  tagline?: string
  description?: string
  tech?: string[]
}

// Mirror of the `projects` rows in Supabase, in display_order. This is only the
// fallback for when the CMS is unreachable (and what the pre-renderer starts
// from) — Admin -> Projects is the source of truth once Supabase answers.
// Keep it in sync with supabase/seed.sql.
export const PROJECTS: Project[] = [
  {
    title: 'Fitness Website',
    tag: 'Web · Fitness',
    href: 'https://github.com/Rachit-Sharma08/Fitness-website',
    image:
      'https://tbcfezkedxliqnajvgjy.supabase.co/storage/v1/object/public/site-media/projects/Infinity%20Fitness%20Neon%20Showcase.webp',
    accent: '#d62e4a',
    tagline: 'A fitness-focused site built to practice clean UI and real brand messaging.',
    description:
      'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging. Designed to feel energetic, trustworthy, and conversion-friendly across every screen size.',
    tech: ['UI Design', 'Responsive', 'Branding'],
  },
  {
    title: 'Neon Car Racing',
    tag: 'Web · Game',
    href: 'https://github.com/Rachit-Sharma08/neon-car-racing-game-',
    image:
      'https://tbcfezkedxliqnajvgjy.supabase.co/storage/v1/object/public/site-media/projects/Neon%20Rush%20Cyberpunk%20Racing%20Laptop.webp',
    accent: '#a11f3c',
    tagline: 'A neon-soaked browser racer — built for fun, kept for the speed.',
    description:
      'A browser racing game built for fun and practice with JavaScript game loops. Fast, flashy, and built to feel arcade-smooth under the hood.',
    tech: ['JavaScript', 'Game Loops', 'Canvas'],
  },
  {
    title: 'AI Assistant Chatbot',
    tag: 'AI · Chatbot',
    href: 'https://github.com/Rachit-Sharma08/ai-assistant',
    image:
      'https://tbcfezkedxliqnajvgjy.supabase.co/storage/v1/object/public/site-media/projects/Cinematic%20Laptop%20AI%20Assistant%20Showcase.webp',
    accent: '#d62e4a',
    tagline: 'A chatbot that answers questions and helps users get things done',
    description:
      'An AI assistant chatbot designed to be added to any business website. It greets visitors, answers common questions about the business, and helps them find what they need without waiting for a human reply. I built it with OpenCode and Replit, handling the idea, prompts and testing myself.',
    tech: ['OpenCode', 'replit'],
  },
]

// Static copy of the About section's story, used until Supabase answers and
// baked into the pre-rendered HTML. Same text as the `my_story` /
// `my_story_card` rows in supabase/seed.sql — edit them in Admin -> Story.
export const STORY = {
  card:
    "I'm Rachit Sharma, a digital marketer from Kaithal, Haryana. I'm studying digital marketing at Zedking Group of Institution and I learn by building with AI tools hands-on. I started exploring AI seriously in 2025, and today I work with 25+ AI tools and build my own AI products on the side.",
  body: `I started exploring AI seriously in 2025. I knew early on that I wanted to study Digital Marketing with AI, and after finishing my 12th (CBSE) I made it my path, even though it wasn't the most conventional choice. Since then I've been learning it at Zedking Group of Institution and applying it by building real projects.

Today I'm working on real projects, and you can see them on my [GitHub](https://github.com/Rachit-Sharma08) and [LinkedIn](https://www.linkedin.com/in/rachit-sharma-ab199443a/). I use 25+ AI tools. The ones I use most are OpenCode (a coding agent), OpenAI's GPT, ElevenLabs, Cartesia AI and Claude.

I'm also building my own AI products. One of them is VoiceMemories AI. With a real voice sample, a person could have a warm, supportive conversation with a loved one's cloned voice, even on live calls and not just in text. It is meant for people who have lost someone and want to feel close to them again. The project is paused for now because of funding, but I care about it and plan to return to it.`,
}

export interface ResumeEducation {
  title: string
  period: string
}

export interface ResumeProject {
  title: string
  desc: string
}

/**
 * Everything the /resume page renders. Stored as a single JSON blob under the
 * `resume` key in site_settings — "no row" and "blank field" both fall back to
 * these bundled values, but an empty skills/projects *array* is honoured (the
 * admin cleared them on purpose). Mirror of the `resume` row in
 * supabase/seed.sql; Admin -> Resume is the source of truth once Supabase
 * answers.
 */
export interface ResumeData {
  subtitle: string
  education: ResumeEducation
  skills: string[]
  projects: ResumeProject[]
}

export const RESUME: ResumeData = {
  subtitle:
    'Digital Marketing Specialist (in training) · Digital Marketing with AI course, in progress.',
  education: {
    title: 'Digital Marketing with AI',
    period: 'Currently completing · 2026',
  },
  skills: [
    'Social Media Marketing',
    'SEO & Content',
    'AI Prompting',
    'Copywriting',
    'Campaign Planning',
    'Canva',
    'Ad Design Basics',
  ],
  projects: [
    {
      title: 'Fitness Website',
      desc: 'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging.',
    },
    {
      title: 'Neon Car Racing Game',
      desc: 'A browser racing game built for fun and practice with JavaScript game loops.',
    },
  ],
}

export interface JournalEntry {
  title: string
  tag: string
}

export const JOURNAL: JournalEntry[] = [
  {
    title:
      'Learning how ChatGPT can turn one sharp brief into a full campaign sprint.',
    tag: 'AI · Prompting',
  },
  {
    title: "SEO isn't dead — it's just learning to speak AI to search engines.",
    tag: 'SEO',
  },
  {
    title:
      'Rebuilt the landing page twice. The third pass finally felt like a brand.',
    tag: 'Branding',
  },
  {
    title:
      'Content that converts starts with one strong hook, not a wall of text.',
    tag: 'Copywriting',
  },
]

export interface Stat {
  value: string
  label: string
}

export const STATS: Stat[] = [
  { value: '1', label: 'Portfolio Site Built' },
  { value: '2+', label: 'Projects Shipped' },
  { value: '100%', label: 'Committed to Learning' },
]