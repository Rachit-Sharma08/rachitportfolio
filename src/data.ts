export const PERSONAL = {
  name: 'Rachit Sharma',
  email: 'rachitsharma999088@gmail.com',
  phone: '+91 83071 51186',
  phoneHref: 'tel:+918307151186',
}

export const SOCIALS = {
  github: 'https://github.com/digitalguru99908-dev',
  linkedin: 'https://www.linkedin.com/in/rachit-sharma', // TODO: link your real LinkedIn profile
  instagram: 'https://www.instagram.com/rachitsharma', // TODO: link your real Instagram profile
}

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: SOCIALS.linkedin },
  { label: 'GitHub', href: SOCIALS.github },
  { label: 'Instagram', href: SOCIALS.instagram },
]

// Both cut-outs are 1086x1448 (exactly 3:4) and pixel-aligned with each
// other. `reveal` sits on the bottom layer, `base` on top with a radial
// mask hole that follows the cursor. Lossless-quality WebP (q92, alpha
// bit-identical to the source PNGs) — originals kept at D:\Pictures.
export const HERO_IMAGES = {
  base: '/assets/hero-base.webp',
  reveal: '/assets/hero-reveal.webp',
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
  { label: 'Resume', target: 'resume', route: '/resume' },
]

export interface Project {
  title: string
  tag: string
  href?: string
  image?: string
  aspect: string
  span: string
  comingSoon?: boolean
  accent?: string
  tagline?: string
  description?: string
  tech?: string[]
}

export const PROJECTS: Project[] = [
  {
    title: 'Fitness Website',
    tag: 'Web · Fitness',
    href: 'https://github.com/digitalguru99908-dev/Fitness-website',
    image:
      'https://socialify.git.ci/digitalguru99908-dev/Fitness-website/png?theme=Dark&font=Rokkitt&pattern=Circuit%20Board',
    aspect: 'aspect-[4/3] md:aspect-auto',
    span: 'md:col-span-7',
    accent: '#d62e4a',
    tagline: 'A fitness-focused site built to practice clean UI and real brand messaging.',
    description:
      'A fitness-focused website built to practice clean UI, responsive layout, and brand messaging. Designed to feel energetic, trustworthy, and conversion-friendly across every screen size.',
    tech: ['UI Design', 'Responsive', 'Branding'],
  },
  {
    title: 'Neon Car Racing',
    tag: 'Web · Game',
    href: 'https://github.com/digitalguru99908-dev/neon-car-racing-game-',
    image:
      'https://socialify.git.ci/digitalguru99908-dev/neon-car-racing-game-/png?theme=Dark&font=Rokkitt&pattern=Floating%20Cogs',
    aspect: 'aspect-[4/3] md:aspect-auto',
    span: 'md:col-span-5',
    accent: '#a11f3c',
    tagline: 'A neon-soaked browser racer — built for fun, kept for the speed.',
    description:
      'A browser racing game built for fun and practice with JavaScript game loops. Fast, flashy, and built to feel arcade-smooth under the hood.',
    tech: ['JavaScript', 'Game Loops', 'Canvas'],
  },
  {
    title: 'Upcoming Game',
    tag: 'Work in progress',
    aspect: 'aspect-[4/3] md:aspect-auto',
    span: 'md:col-span-5',
    comingSoon: true,
    accent: '#7d6a70',
    tagline: 'Currently in the workshop — shipping soon.',
    description:
      'A new project is in the works. Details coming soon.',
    tech: ['Coming Soon'],
  },
  {
    title: 'Video Edit Reel',
    tag: 'Creative · Editing',
    aspect: 'aspect-[4/3] md:aspect-auto',
    span: 'md:col-span-7',
    comingSoon: true,
    accent: '#7d6a70',
    tagline: 'A reel in progress — cut, graded, nearly ready.',
    description:
      'Creative editing work currently being crafted. More details soon.',
    tech: ['Editing', 'Coming Soon'],
  },
]

// Static copy of the About section's story, used until Supabase answers and
// baked into the pre-rendered HTML. Same text as the `my_story` /
// `my_story_card` rows in supabase/seed.sql — edit them in Admin -> Story.
export const STORY = {
  card:
    "I'm not from a big city or a coding background — I'm a self-taught builder who chose to follow what actually interests me, even when the easier path was right there. I got into AI in 2025, and once I started, I didn't stop. Today I work with 25+ AI tools, I'm doing Digital Marketing with AI, and I'm building my own AI products on the side.",
  body: `I got interested in AI in 2025, and that's when I started exploring it seriously.

I wanted to do a "Digital Marketing with AI" course early on, but I couldn't start right away — I had my 12th CBSE boards going on, and some family situations made it hard to begin. After I finished 12th, my family wanted me to take a different course. But I decided to follow what I was actually interested in, so I went ahead and completed the Digital Marketing with AI course anyway.

Now I'm working on real projects — you can check them out on my [GitHub](https://github.com/digitalguru99908-dev) and [LinkedIn](https://www.linkedin.com/in/rachit-sharma).

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