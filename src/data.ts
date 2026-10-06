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
  'Rachit Sharma is a digital marketer who uses AI tools to build brands, campaigns and creative projects.'

export const SOCIALS = {
  github: 'https://github.com/rachithunyawrr',
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
    href: 'https://github.com/rachithunyawrr/Fitness-website',
    image:
      'https://socialify.git.ci/rachithunyawrr/Fitness-website/png?theme=Dark&font=Rokkitt&pattern=Circuit%20Board',
    accent: '#d62e4a',
    tagline: 'A fitness-focused site built to practice clean UI and real brand messaging.',
    description:
      'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging. Designed to feel energetic, trustworthy, and conversion-friendly across every screen size.',
    tech: ['UI Design', 'Responsive', 'Branding'],
  },
  {
    title: 'Neon Car Racing',
    tag: 'Web · Game',
    href: 'https://github.com/rachithunyawrr/neon-car-racing-game-',
    image:
      'https://socialify.git.ci/rachithunyawrr/neon-car-racing-game-/png?theme=Dark&font=Rokkitt&pattern=Floating%20Cogs',
    accent: '#a11f3c',
    tagline: 'A neon-soaked browser racer — built for fun, kept for the speed.',
    description:
      'A browser racing game built for fun and practice with JavaScript game loops. Fast, flashy, and built to feel arcade-smooth under the hood.',
    tech: ['JavaScript', 'Game Loops', 'Canvas'],
  },
  {
    title: 'AI Assistant Chatbot',
    tag: 'AI · Chatbot',
    href: 'https://github.com/rachithunyawrr/ai-assistant',
    image:
      'https://rynizhsmvxmvwqvldwkt.supabase.co/storage/v1/object/public/site-media/projects/Cinematic%20Laptop%20AI%20Assistant%20Showcase.webp',
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
    "I'm not from a big city or a coding background — I'm studying digital marketing at an institute and I learn by building with AI tools hands-on. I chose to follow what actually interests me, even when the easier path was right there. I got into AI in 2025, and once I started, I didn't stop. Today I work with 25+ AI tools, I'm doing Digital Marketing with AI, and I'm building my own AI products on the side.",
  body: `I got interested in AI in 2025, and that's when I started exploring it seriously.

I wanted to do a "Digital Marketing with AI" course early on, but I couldn't start right away — I had my 12th CBSE boards going on, and some family situations made it hard to begin. After I finished 12th, my family wanted me to take a different course. But I decided to follow what I was actually interested in, so I went ahead and completed the Digital Marketing with AI course anyway.

Now I'm working on real projects — you can check them out on my [GitHub](https://github.com/rachithunyawrr) and [LinkedIn](https://www.linkedin.com/in/rachit-sharma-ab199443a/).

I currently know how to use 25+ AI tools. The ones I use the most are OpenCode (a coding agent), OpenAI's GPT, ElevenLabs, Cartesia AI, and Claude.

I'm also starting to build my own AI products. One of them is called **VoiceMemories AI** — the idea is that someone can clone a loved one's voice (if they have a voice sample) and have a real, emotionally supportive conversation with that voice — even live calls, not just text. It's meant for people who've lost someone and want a way to feel close to them again. The project isn't finished yet — I've paused it for now because of funding — but it's something I really care about and plan to come back to.`,
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